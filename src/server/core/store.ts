/* Redis layout, per heat day `d`:
     heat:d:abs   zset  username -> |gap|     (rank: closest first)
     heat:d:time  zset  username -> time      (median)
     heat:d:gap   hash  username -> signed gap
     heat:d:bins  hash  bin index -> count    (histogram)
     heat:d:said  hash  username -> "1"       (already commented)
   per user:
     user:name:streak, user:name:last (last day run), user:name:days hash day -> gap
   per post:
     post:id:day  the heat day a post belongs to */
import { redis } from '@devvit/web/server';
import { BIN_COUNT, binIndex, closerThan, dayInitial, round2, shiftDay, windowDays } from '../../shared/heat';
import type { DayMark, Ranked, RunResult } from '../../shared/api';

const k = {
  abs: (d: string) => `heat:${d}:abs`,
  time: (d: string) => `heat:${d}:time`,
  gap: (d: string) => `heat:${d}:gap`,
  bins: (d: string) => `heat:${d}:bins`,
  said: (d: string) => `heat:${d}:said`,
  streak: (u: string) => `user:${u}:streak`,
  last: (u: string) => `user:${u}:last`,
  days: (u: string) => `user:${u}:days`,
  post: (id: string) => `post:${id}:day`,
};

export const setPostDay = async (postId: string, day: string): Promise<void> => {
  await redis.set(k.post(postId), day);
};

export const getPostDay = async (postId: string): Promise<string | undefined> => redis.get(k.post(postId));

export const countPlayers = async (day: string): Promise<number> => redis.zCard(k.abs(day));

const readStreak = async (user: string, day: string): Promise<number> => {
  const [raw, last] = await Promise.all([redis.get(k.streak(user)), redis.get(k.last(user))]);
  const streak = raw ? parseInt(raw, 10) : 0;
  return last === day || last === shiftDay(day, -1) ? streak : 0;
};

const readDays = async (user: string, day: string): Promise<DayMark[]> => {
  const days = windowDays(day);
  const gaps = await redis.hMGet(k.days(user), days);
  return days.map((d, i) => {
    const raw = gaps[i];
    return { day: d, initial: dayInitial(d), gap: raw == null ? null : Number(raw) };
  });
};

const median = async (day: string, players: number): Promise<number> => {
  if (players === 0) return 0;
  const mid = await redis.zRange(k.time(day), Math.floor((players - 1) / 2), Math.floor((players - 1) / 2), { by: 'rank' });
  return mid[0]?.score ?? 0;
};

export const readResult = async (day: string, user: string): Promise<RunResult | null> => {
  const [time, gapRaw, rank0, said] = await Promise.all([
    redis.zScore(k.time(day), user),
    redis.hGet(k.gap(day), user),
    redis.zRank(k.abs(day), user),
    redis.hGet(k.said(day), user),
  ]);
  if (time === undefined || gapRaw === undefined || rank0 === undefined) return null;
  const players = await countPlayers(day);
  const [med, streak, days] = await Promise.all([median(day, players), readStreak(user, day), readDays(user, day)]);
  const rank = rank0 + 1;
  return { time, gap: Number(gapRaw), rank, players, closer: closerThan(rank, players), median: med, streak, days, commented: said === '1' };
};

const bumpStreak = async (user: string, day: string): Promise<void> => {
  const [raw, last] = await Promise.all([redis.get(k.streak(user)), redis.get(k.last(user))]);
  if (last === day) return;
  const prev = raw ? parseInt(raw, 10) : 0;
  const next = last === shiftDay(day, -1) ? prev + 1 : 1;
  await Promise.all([redis.set(k.streak(user), String(next)), redis.set(k.last(user), day)]);
};

/** Records a run once; a second run the same day is ignored. Returns false if already run. */
export const recordRun = async (day: string, user: string, time: number, target: number): Promise<boolean> => {
  if ((await redis.zScore(k.abs(day), user)) !== undefined) return false;
  const gap = round2(time - target);
  await Promise.all([
    redis.zAdd(k.abs(day), { member: user, score: Math.abs(gap) }),
    redis.zAdd(k.time(day), { member: user, score: round2(time) }),
    redis.hSet(k.gap(day), { [user]: String(gap) }),
    redis.hIncrBy(k.bins(day), String(binIndex(gap)), 1),
    redis.hSet(k.days(user), { [day]: String(gap) }),
  ]);
  await bumpStreak(user, day);
  return true;
};

export const markCommented = async (day: string, user: string): Promise<void> => {
  await redis.hSet(k.said(day), { [user]: '1' });
};

export const readBins = async (day: string): Promise<number[]> => {
  const raw = await redis.hGetAll(k.bins(day));
  return Array.from({ length: BIN_COUNT }, (_, i) => Number(raw[String(i)] ?? 0));
};

export const readTop = async (day: string, count: number): Promise<Ranked[]> => {
  const top = await redis.zRange(k.abs(day), 0, count - 1, { by: 'rank' });
  const gaps = await redis.hMGet(k.gap(day), top.map((t) => t.member));
  return top.map((t, i) => ({ rank: i + 1, name: t.member, gap: Number(gaps[i] ?? 0) }));
};

export const readUserStreak = readStreak;
export const readUserDays = readDays;
