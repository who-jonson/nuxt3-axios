import { addPluginTemplate, createResolver, defineNuxtModule, addImports, resolveModule } from '@nuxt/kit';
import { name, version } from '../package.json';
import type { ModuleOptions, NuxtAxiosInstance } from './options';

const CONFIG_KEY = 'axios';

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: CONFIG_KEY,
    compatibility: {
      nuxt: '^3.0.0 || >=3.0.0-rc.8'
    }
  },
  defaults: {
    credentials: true,
    headers: {
      common: {
        crossDomain: 'true',
        Accept: 'application/json, text/plain, */*',
        'Access-Control-Allow-Origin': '*',
        'X-Requested-With': 'XMLHttpRequest'
      }
    },
    proxy: true,
    retry: { retries: 3 }
  },
  setup(_moduleOptions, nuxt) {
    // Combine options
    const moduleOptions: ModuleOptions = {
      ..._moduleOptions,
      ...(nuxt.options.runtimeConfig.public && nuxt.options.runtimeConfig.public[CONFIG_KEY])
    };

    // Default port
    const defaultPort =
      process.env.API_PORT ||
      moduleOptions.port ||
      process.env.PORT ||
      process.env.npm_package_config_nuxt_port ||
      (nuxt.options.server && nuxt.options.server.port) ||
      3000;

    // Default host
    let defaultHost =
      process.env.API_HOST ||
      moduleOptions.host ||
      process.env.HOST ||
      process.env.npm_package_config_nuxt_host ||
      (nuxt.options.server && nuxt.options.server.host) ||
      'localhost';

    /* istanbul ignore if */
    if (defaultHost === '0.0.0.0') { defaultHost = 'localhost'; }

    // Default prefix
    const prefix = process.env.API_PREFIX || moduleOptions.prefix || '/';

    // HTTPS
    const https = Boolean(nuxt.options.server && nuxt.options.server.https);

    // Headers
    const headers = {
      common: {
        accept: 'application/json, text/plain, */*'
      },
      delete: {},
      get: {},
      head: {},
      post: {},
      put: {},
      patch: {}
    };

    // Support baseUrl alternative
    if (moduleOptions.baseUrl) {
      moduleOptions.baseURL = moduleOptions.baseUrl;
      delete moduleOptions.baseUrl;
    }
    if (moduleOptions.browserBaseUrl) {
      moduleOptions.browserBaseURL = moduleOptions.browserBaseUrl;
      delete moduleOptions.browserBaseUrl;
    }

    // Apply defaults
    const options = {
      baseURL: `http://${defaultHost}:${defaultPort}${prefix}`,
      browserBaseURL: undefined,
      credentials: true,
      debug: false,
      progress: true,
      proxyHeaders: true,
      proxyHeadersIgnore: [
        'accept',
        'cf-connecting-ip',
        'cf-ray',
        'content-length',
        'content-md5',
        'content-type',
        'host',
        'if-modified-since',
        'if-none-match',
        'x-forwarded-host',
        'x-forwarded-port',
        'x-forwarded-proto'
      ],
      proxy: false,
      retry: false,
      https,
      headers,
      ...moduleOptions
    };

    /* istanbul ignore if */
    if (process.env.API_URL) { options.baseURL = process.env.API_URL; }

    /* istanbul ignore if */
    if (process.env.API_URL_BROWSER) { options.browserBaseURL = process.env.API_URL_BROWSER; }

    // Default browserBaseURL
    if (typeof options.browserBaseURL === 'undefined') { options.browserBaseURL = options.proxy ? prefix : options.baseURL; }

    // Normalize options
    if (options.retry) { options.retry = {}; }

    // Convert http:// to https:// if https option is on
    if (options.https) {
      const https = (s: string) => s.replace('http://', 'https://');
      options.baseURL = https(options.baseURL);
      options.browserBaseURL = https(options.browserBaseURL);
    }

    // globalName
    options.globalName = nuxt.options.globalName || 'nuxt';

    // resolver
    const { resolve } = createResolver(import.meta.url);
    const resolveComposable = (path: string) => resolveModule(path, { paths: resolve('./runtime/composables/') });

    // Register plugin
    addPluginTemplate({
      src: resolve('./runtime/plugin.template.mjs'),
      filename: 'axios.plugin.mjs',
      options
    });

    addImports([
      { name: 'useAxios', as: 'useAxios', from: resolveComposable('./axios') },
      { name: 'useAxiosGet', as: 'useAxiosGet', from: resolveComposable('./axios') },
      { name: 'useAxiosPut', as: 'useAxiosPut', from: resolveComposable('./axios') },
      { name: 'useAxiosPost', as: 'useAxiosPost', from: resolveComposable('./axios') },
      { name: 'useAxiosPatch', as: 'useAxiosPatch', from: resolveComposable('./axios') },
      { name: 'useAxiosDelete', as: 'useAxiosDelete', from: resolveComposable('./axios') }
    ]);

    // Set _AXIOS_BASE_URL_ for dynamic SSR baseURL
    process.env._AXIOS_BASE_URL_ = options.baseURL;
  }
});

export type { ModuleOptions, NuxtAxiosInstance };
