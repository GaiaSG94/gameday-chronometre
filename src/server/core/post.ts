import { reddit } from '@devvit/web/server';
import { dateLabel, dayKeyUTC, heatNumber } from '../../shared/heat';
import { setPostDay } from './store';

/** Creates today's heat post and binds it to today's day key. */
export const createPost = async () => {
  const day = dayKeyUTC();
  const post = await reddit.submitCustomPost({
    title: `Chronomètre · Heat Nº${heatNumber(day)} · ${dateLabel(day)} — stop the clock without a clock`,
  });
  await setPostDay(post.id, day);
  return post;
};
