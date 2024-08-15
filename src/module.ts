import { defu } from 'defu';
import { dirname, join, relative } from 'path';
import { getObjProp, objectEntries, objectPick, setObjProp } from '@whoj/utils-core';
import { addImports, addPlugin, addTypeTemplate, createResolver, defineNuxtModule, resolvePath, useLogger } from '@nuxt/kit';

import { name, version } from '../package.json';
import type { NuxtAxiosInstance, NuxtAxiosOptions } from './options';

const CONFIG_KEY = 'axios' as const;

export default defineNuxtModule<NuxtAxiosOptions>({
  meta: {
    name,
    version,
    configKey: CONFIG_KEY,
    compatibility: {
      bridge: false,
      nuxt: '^3.7.0'
    }
  },
  defaults: ({ options }) => ({
    alias: 'axios',
    autoImport: {
      enabled: false,
      imports: {
        useAxios: 'useAxios',
        useAxiosGet: 'useAxiosGet',
        useAxiosPost: 'useAxiosPost',
        useAxiosPut: 'useAxiosPut',
        useAxiosPatch: 'useAxiosPatch',
        useAxiosDelete: 'useAxiosDelete'
      },
      priority: 1
    },
    credentials: false,
    headers: {
      common: {
        'crossDomain': 'true',
        'Accept': 'application/json, text/plain, */*',
        'Access-Control-Allow-Origin': '*',
        'X-Requested-With': 'XMLHttpRequest'
      }
    },
    proxy: false,
    debug: false,
    progress: true,
    proxyHeaders: true,
    // @ts-ignore
    globalName: options.globalName || 'nuxt',
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
  }),
  async setup(_options, nuxt) {
    const logger = useLogger('nuxt:axios');
    // Combined options
    const moduleOptions = defu(
      _options,
      getObjProp(nuxt.options.runtimeConfig, CONFIG_KEY, {}),
      getObjProp(nuxt.options.runtimeConfig.public, CONFIG_KEY, {})
    );

    // Default port
    const defaultPort
      = process.env.API_PORT
      || moduleOptions.port
      || process.env.NITRO_PORT
      || process.env.PORT
      // @ts-ignore
      || (nuxt.options.server && nuxt.options.server.port)
      || 3000;

    // Default host
    let defaultHost
      = process.env.API_HOST
      || moduleOptions.host
      || process.env.HOST
      || process.env.NITRO_HOST
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
    const options = defu(moduleOptions, {
      baseURL: `http://${defaultHost}:${defaultPort}${prefix}`,
      https,
      headers
    });

    /* istanbul ignore if */
    const API_URL = process.env.API_URL || process.env.NUXT_AXIOS_BASE_URL;
    if (API_URL) {
      options.baseURL = process.env.API_URL!;
    }

    /* istanbul ignore if */
    const API_URL_BROWSER = process.env.API_URL_BROWSER || process.env.NUXT_PUBLIC_AXIOS_BROWSER_BASE_URL;
    if (API_URL_BROWSER) {
      options.browserBaseURL = API_URL_BROWSER;
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
      if (options.baseURL) {
        options.baseURL = https(options.baseURL);
      }
      if (options.browserBaseURL) {
        options.browserBaseURL = https(options.browserBaseURL);
      }
    }

    setObjProp(nuxt.options.runtimeConfig, CONFIG_KEY, objectPick(options, ['agents', 'baseUrl', 'baseURL']));
    setObjProp(nuxt.options.runtimeConfig.public, CONFIG_KEY, { ...options, baseUrl: undefined, baseURL: undefined, agents: undefined });

    // @ts-ignore
    const { resolve } = createResolver(import.meta.url);

    nuxt.options.build.transpile.push(resolve('./runtime'));

    // Register plugin
    addPlugin({
      order: -1,
      mode: 'all',
      src: resolve('./runtime/plugin')
    });

    // imports / composables
    if (options.autoImport?.enabled) {
      addImports(objectEntries<Record<string, string>>(options.autoImport.imports || {}).map(([name, as]) => ({
        name,
        as,
        priority: options.autoImport?.priority,
        from: resolve('./runtime/composables/axios')
      })));
    }

    // Set NUXT_AXIOS_BASE_URL for dynamic SSR baseURL
    process.env.NUXT_AXIOS_BASE_URL = process.env._AXIOS_BASE_URL_ = options.baseURL;

    logger.debug(`baseURL: ${options.baseURL}`);
    logger.debug(`browserBaseURL: ${options.browserBaseURL}`);

    let nuxtPath = dirname(await resolvePath('nuxt'));
    nuxtPath = relative(join(nuxt.options.buildDir, 'types'), join(nuxtPath, 'dist'));

    addTypeTemplate({
      filename: 'types/nuxt3-axios.d.ts',
      getContents: () => `// Generated by @whoj/nuxt3-axios
import type { AxiosStatic } from 'axios';
import type { NuxtAxiosInstance, NuxtAxiosOptions } from '@whoj/nuxt3-axios';

declare module 'axios' {
  export interface AxiosInstance {
    CancelToken: AxiosStatic['CancelToken'];
    isAxiosError: AxiosStatic['isAxiosError'];
    isCancel: AxiosStatic['isCancel'];
  }

  export interface AxiosRequestConfig {
    progress?: boolean;
  }
}

declare module 'nuxt/schema' {
  interface NuxtConfig {
    axios?: NuxtAxiosOptions
  }

  interface RuntimeConfig {
    axios: Pick<NuxtAxiosOptions, 'agents' | 'baseUrl' | 'baseURL'>;
  }

  interface PublicRuntimeConfig {
    axios: Omit<NuxtAxiosOptions, 'agents' | 'autoImport' | 'baseUrl' | 'baseURL'>
  }
}

declare module '${join(dirname(nuxtPath), 'app/nuxt')}' {
  interface NuxtApp {
    $${options.alias}: NuxtAxiosInstance;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $${options.alias}: NuxtAxiosInstance;
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $${options.alias}: NuxtAxiosInstance;
  }
}

export {};
`
    });
  }
});

export type { NuxtAxiosOptions, NuxtAxiosInstance };
