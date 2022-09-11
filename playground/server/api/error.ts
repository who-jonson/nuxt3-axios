export default defineEventHandler((event) => {
  throw createError({ statusCode: 401, statusMessage: 'Page Not Found' });
});
