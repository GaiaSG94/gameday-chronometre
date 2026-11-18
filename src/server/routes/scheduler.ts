import { Hono } from 'hono';
import { createPost } from '../core/post';

export const scheduler = new Hono();

/** Cron 00:00 UTC: a new heat poster comes off the press every day. */
scheduler.post('/daily-heat', async (c) => {
  try {
    const post = await createPost();
    return c.json({ status: 'success', postId: post.id }, 200);
  } catch (error) {
    console.error(`Daily heat failed: ${error}`);
    return c.json({ status: 'error' }, 500);
  }
});
