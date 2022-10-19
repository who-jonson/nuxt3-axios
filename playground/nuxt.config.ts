import { defineNuxtConfig } from 'nuxt/config';
import Nuxt3Axios from '../src/module';

export default defineNuxtConfig({
  modules: [
    Nuxt3Axios
  ],
  axios: {
    credentials: true,
    debug: true
  }
});
