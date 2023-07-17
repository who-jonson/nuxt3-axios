import { defineEventHandler, readBody } from '#imports';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return { body };
});
