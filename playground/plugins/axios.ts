import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(({ $axios }) => {
  $axios.onAuthError((error) => {
    console.log(error);
  });
});
