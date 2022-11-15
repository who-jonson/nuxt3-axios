import defu from 'defu';
import { isObject, objectEntries } from '@whoj/utils-core';
import { addImports, addPluginTemplate, createResolver, defineNuxtModule, resolveModule } from '@nuxt/kit';

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
    autoImport: {
      importMap: {
        useAxios: 'useAxios',
        useAxiosGet: 'useAxiosGet',
        useAxiosPost: 'useAxiosPost',
        useAxiosPut: 'useAxiosPut',
        useAxiosPatch: 'useAxiosPatch',
        useAxiosDelete: 'useAxiosDelete'
      },
      priority: 1
    },
    credentials: true,
    headers: {
      common: {
        'crossDomain': 'true',
        'Accept': 'application/json, text/plain, */*',
        'Access-Control-Allow-Origin': '*',
        'X-Requested-With': 'XMLHttpRequest'
      }
    },
    proxy: true,
    retry: { retries: 3 },
    browserBaseURL: undefined,
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
    ]
  },
  setup(_moduleOptions, nuxt) {
    // Combine options
    const moduleOptions: ModuleOptions = defu(
      _moduleOptions,
      (nuxt.options.runtimeConfig.public && nuxt.options.runtimeConfig.public[CONFIG_KEY])
    );

    // Default port
    const defaultPort
      = process.env.API_PORT
      || moduleOptions.port
      || process.env.PORT
      || process.env.npm_package_config_nuxt_port
      // @ts-ignore
      || (nuxt.options.server && nuxt.options.server.port)
      || 3000;

    // Default host
    let defaultHost
      = process.env.API_HOST
      || moduleOptions.host
      || process.env.HOST
      || process.env.npm_package_config_nuxt_host
      // @ts-ignore
      || (nuxt.options.server && nuxt.options.server.host)
      || 'localhost';

    /* istanbul ignore if */
    if (defaultHost === '0.0.0.0') {
      defaultHost = 'localhost';
    }

    // Default prefix
    const prefix = process.env.API_PREFIX || moduleOptions.prefix || '/';

    // @ts-ignore // HTTPS
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
      https,
      headers,
      ...moduleOptions
    };

    /* istanbul ignore if */
    if (process.env.API_URL) {
      options.baseURL = process.env.API_URL;
    }

    /* istanbul ignore if */
    if (process.env.API_URL_BROWSER) {
      options.browserBaseURL = process.env.API_URL_BROWSER;
    }

    // Default browserBaseURL
    if (typeof options.browserBaseURL === 'undefined') {
      options.browserBaseURL = options.proxy ? prefix : options.baseURL;
    }

    // Normalize options
    if (options.retry) {
      options.retry = {};
    }

    // Convert http:// to https:// if https option is on
    if (options.https) {
      const https = (s: string) => s.replace('http://', 'https://');
      options.baseURL = https(options.baseURL);
      options.browserBaseURL = https(options.browserBaseURL);
    }

    // resolver
    const { resolve } = createResolver(import.meta.url);
    const resolveComposable = (path: string) => resolveModule(path, { paths: resolve('./runtime/composables/') });

    // Register plugin
    addPluginTemplate({
      src: resolve('./runtime/plugin.template.mjs'),
      filename: 'axios.plugin.mjs',
      options
    });

    // imports / composables
    if (isObject(options.autoImport)) {
      addImports(objectEntries(options.autoImport.importMap!).map(([name, as]) => ({
        // @ts-ignore
        name, as, priority: options.autoImport!.priority, from: resolveComposable('./axios')
      })));
    }

    // Set _AXIOS_BASE_URL_ for dynamic SSR baseURL
    process.env._AXIOS_BASE_URL_ = options.baseURL;
  }
});

export type { ModuleOptions, NuxtAxiosInstance };
