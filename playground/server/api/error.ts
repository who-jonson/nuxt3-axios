import { createError, defineEventHandler } from '#imports';

export default defineEventHandler(() => {
  throw createError({ statusCode: 401, statusMessage: 'Page Not Found' });
});
