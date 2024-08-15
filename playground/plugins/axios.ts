import { defineNuxtPlugin, useNuxtApp } from '#app';

export default defineNuxtPlugin(() => {
  useNuxtApp().$axios.onAuthError((error) => {
    console.log(error);
  });
});
