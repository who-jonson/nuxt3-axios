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
    },
    agents: {
      https: {
        options: {
          rejectUnauthorized: false
        }
      }
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
