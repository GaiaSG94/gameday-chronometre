import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';
import { binIndex, dateLabel, dayKeyUTC, fmt, gapWord, heatNumber, isValidTime, targetFor } from '../../shared/heat';
import {
  countPlayers,
  getPostDay,
  markCommented,
  readBins,
  readResult,
  readTop,
  readUserDays,
  readUserStreak,
  recordRun,
} from '../core/store';
import type { Context } from 'hono';
import type {
  CommentResponse,
  ErrorResponse,
  Heat,
  InitResponse,
  StandingsResponse,
  SubmitResponse,
} from '../../shared/api';

export const api = new Hono();

const fail = (c: Context, message: string, status: 400 | 409 | 500 = 400): Response =>
  c.json<ErrorResponse>({ status: 'error', message }, status);

/** The heat a post belongs to (posts from past days show their results, read-only). */
const heatOfPost = async (): Promise<Heat> => {
  const today = dayKeyUTC();
  const day = (context.postId ? await getPostDay(context.postId) : undefined) ?? today;
  return { day, n: heatNumber(day), dateLabel: dateLabel(day), target: targetFor(day), open: day === today };
};

const currentUser = async (): Promise<string> => (await reddit.getCurrentUsername()) ?? 'anonymous';

api.get('/init', async (c) => {
  try {
    const [heat, username] = await Promise.all([heatOfPost(), currentUser()]);
    const [players, result] = await Promise.all([countPlayers(heat.day), readResult(heat.day, username)]);
    return c.json<InitResponse>({ type: 'init', heat, players, username, result });
  } catch (err) {
    return fail(c, `init failed: ${err instanceof Error ? err.message : 'unknown'}`, 500);
  }
});

api.post('/submit', async (c) => {
  const body = await c.req.json<{ time?: unknown }>().catch(() => ({ time: undefined }));
  if (!isValidTime(body.time)) return fail(c, 'time out of range');
  const [heat, username] = await Promise.all([heatOfPost(), currentUser()]);
  if (!heat.open) return fail(c, 'this heat is closed', 409);
  await recordRun(heat.day, username, body.time, heat.target);
  const result = await readResult(heat.day, username);
  if (!result) return fail(c, 'run not recorded', 500);
  return c.json<SubmitResponse>({ type: 'submit', result });
});

api.get('/standings', async (c) => {
  const [heat, username] = await Promise.all([heatOfPost(), currentUser()]);
  const [players, bins, top, result, streak, days] = await Promise.all([
    countPlayers(heat.day),
    readBins(heat.day),
    readTop(heat.day, 5),
    readResult(heat.day, username),
    readUserStreak(username, heat.day),
    readUserDays(username, heat.day),
  ]);
  const you = result ? { rank: result.rank, name: username, gap: result.gap } : null;
  const youBin = result ? binIndex(result.gap) : null;
  return c.json<StandingsResponse>({ type: 'standings', players, bins, youBin, top, you, streak, days });
});

/** Posts the pre-written result line as a comment, from the player's own account. */
api.post('/comment', async (c) => {
  const { postId } = context;
  if (!postId) return fail(c, 'postId is required');
  const [heat, username] = await Promise.all([heatOfPost(), currentUser()]);
  const result = await readResult(heat.day, username);
  if (!result) return fail(c, 'run first', 409);
  if (result.commented) return c.json<CommentResponse>({ type: 'comment', ok: true });
  const gap = Math.abs(result.gap);
  const text = `${fmt(result.time)} on heat Nº${heat.n} — ${fmt(gap)} s ${gapWord(result.gap)}.`;
  await reddit.submitComment({ id: postId, text, runAs: 'USER' });
  await markCommented(heat.day, username);
  return c.json<CommentResponse>({ type: 'comment', ok: true });
});
