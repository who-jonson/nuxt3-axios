import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  modules: [
    './../src/module'
  ],
  axios: {
    credentials: true,
    debug: true,
    autoImport: {
      enabled: true
    }
  },

  nitro: {
    routeRules: {
      '/todos/**': {
        proxy: 'https://jsonplaceholder.typicode.com/todos/**'
      }
    }
  }
});
