import { defineNuxtConfig } from 'nuxt';
import Nuxt3Axios from '..';

export default defineNuxtConfig({
  modules: [
    Nuxt3Axios
  ],
  axios: {
    credentials: true
  }
});
