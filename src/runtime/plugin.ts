import http from 'http';
import https from 'https';
import Axios from 'axios';
import { defu } from 'defu';
import { getHeaders } from 'h3';
import axiosRetry from 'axios-retry';
import type { CreateAxiosDefaults } from 'axios'; // @ts-ignore
import { createError, defineNuxtPlugin } from '#app';
import { isBoolean, isClient } from '@whoj/utils-core';

import type { NuxtAxiosInstance, NuxtAxiosOptions } from '../options';

const log = (level, ...messages) => console[level]('[Axios]', ...messages);

// Axios.prototype cannot be modified
const axiosExtra: Partial<NuxtAxiosInstance> = {
  setBaseURL(this: NuxtAxiosInstance, baseURL) {
    this.defaults.baseURL = baseURL;
  },
  setHeader(this: NuxtAxiosInstance, name, value, scopes = 'common') {
    for (const scope of Array.isArray(scopes) ? scopes : [scopes]) {
      if (!value) {
        // @ts-ignore
        delete this.defaults.headers[scope][name];
        continue;
      }
      // @ts-ignore
      this.defaults.headers[scope][name] = value;
    }
  },
  setToken(this: NuxtAxiosInstance, token, type, scopes = 'common') {
    const value = !token ? null : (type ? `${type} ` : '') + token;
    this.setHeader('Authorization', value, scopes);
  },
  onRequest(this: NuxtAxiosInstance, fn) {
    // @ts-ignore
    this.interceptors.request.use(config => fn(config) || config);
  },
  onResponse(this: NuxtAxiosInstance, fn) {
    this.interceptors.response.use(response => fn(response) || response);
  },
  onRequestError(this: NuxtAxiosInstance, fn) {
    this.interceptors.request.use(undefined, error => fn(error) || Promise.reject(error));
  },
  onResponseError(this: NuxtAxiosInstance, fn) {
    this.interceptors.response.use(undefined, error => fn(error) || Promise.reject(error));
  },
  onError(this: NuxtAxiosInstance, fn) {
    this.onRequestError(fn);
    this.onResponseError(fn);
  },
  onAuthError(this: NuxtAxiosInstance, fn) {
    this.onError((error) => {
      // @ts-ignore
      const code = parseInt(error.response && error.response.status);
      if (code === 401) {
        // @ts-ignore
        fn(error);
      }
    });
  },
  create(this: NuxtAxiosInstance, options) {
    return createAxiosInstance({ ...this.defaults, ...options });
  }
};

// Request helpers ($get, $post, ...)
for (const method of ['request', 'delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'postForm', 'putForm', 'patchForm']) {
  axiosExtra[`$${method}`] = function () {
    // eslint-disable-next-line prefer-spread,prefer-rest-params
    return this[method].apply(this, arguments).then(res => res && res.data).catch(err => createError(err.response || err));
  };
}

export default defineNuxtPlugin(({ $config, ssrContext }) => {
  // runtimeConfig
  const options = $config.public.axios;

  // baseURL
  // @ts-ignore
  const baseURL = import.meta.client
    // @ts-ignore
    ? (options?.browserBaseURL || options?.browserBaseUrl || '')
    // @ts-ignore
    : ($config.axios?.baseURL || $config.axios?.baseUrl || process.env?.API_URL || process.env?._AXIOS_BASE_URL_ || '');

  const headers = {
    ...(options.headers || {})
  };

  // Create fresh objects for all default header scopes
  // Axios creates only one which is shared across SSR requests!
  // https://axios-http.com/docs/config_defaults
  const axiosOptions = {
    baseURL,
    headers
  } as CreateAxiosDefaults;
  // @ts-ignore
  if (options.proxyHeaders && import.meta.server && ssrContext?.event) {
    // Proxy SSR request headers
    const reqHeaders = getHeaders(ssrContext.event);
    for (const h of (options.proxyHeadersIgnore || [])) {
      delete reqHeaders[h];
    }
    axiosOptions.headers!.common = { ...reqHeaders, ...axiosOptions.headers?.common };
  }
  // @ts-ignore
  if (import.meta.server) {
    // Don't accept brotli encoding because Node can't parse it
    axiosOptions.headers!.common['accept-encoding'] = 'gzip, deflate';
    if ($config.axios.agents) { // @ts-ignore
      if ($config.axios.agents.http) { // @ts-ignore
        const Agent = $config.axios.agents.http.class || http.Agent; // @ts-ignore
        axiosOptions.httpAgent = new Agent($config.axios.agents.http.options);
      }
      if ($config.axios.agents.https) { // @ts-ignore
        const Agent = $config.axios.agents.https.class || https.Agent;
        axiosOptions.httpsAgent = new Agent($config.axios.agents.https.options);
      }
    }
  }
  // @ts-ignore
  const axios = createAxiosInstance(axiosOptions, options);

  return {
    provide: {
      [options.alias]: axios
    }
  };
});

function extendAxiosInstance(axios: NuxtAxiosInstance) {
  for (const key in axiosExtra) {
    axios[key] = axiosExtra[key].bind(axios);
  }
}

function createAxiosInstance(axiosOptions: CreateAxiosDefaults, options?: NuxtAxiosOptions) {
  // Create new axios instance
  const axios = Axios.create(axiosOptions) as NuxtAxiosInstance;
  axios.CancelToken = Axios.CancelToken;
  axios.isCancel = Axios.isCancel;
  axios.isAxiosError = Axios.isAxiosError;

  // Extend axios proto
  extendAxiosInstance(axios);

  // Intercept to apply default headers
  axios.interceptors.request.use(config => defu(config, {
    headers: axios.defaults.headers.common
  }));

  // Setup interceptors
  if (options?.debug) {
    setupDebugInterceptor(axios);
  }
  if (options?.credentials) {
    setupCredentialsInterceptor(axios);
  }
  if (options?.progress) {
    setupProgress(axios, options?.globalName);
  }
  if (options?.retry) {
    axiosRetry(
      axios,
      !isBoolean(options.retry)
        ? options.retry
        : { retryDelay: axiosRetry.exponentialDelay }
    );
  }

  return axios;
}

function setupDebugInterceptor(axios: NuxtAxiosInstance) {
  // request
  axios.onRequestError((error) => {
    log('error', 'Request error:', error);
  });

  // response
  axios.onResponseError((error) => {
    log('error', 'Response error:', error);
  });
  axios.onResponse((res) => {
    log(
      'info',
      `[${res.status} ${res.statusText}]`,
      `[${res.config.method!.toUpperCase()}]`,
      res.config.url);
    // @ts-ignore
    if (import.meta.client) {
      console.log(res);
    } else {
      console.log(JSON.stringify(res.data, undefined, 2));
    }

    return res;
  });
}

function setupCredentialsInterceptor(axios: NuxtAxiosInstance) {
  // Send credentials only to relative and API Backend requests
  axios.onRequest((config) => {
    if (config.withCredentials === undefined) {
      if (!/^https?:\/\//i.test(config.url!) || config.url!.indexOf(config.baseURL!) === 0) {
        config.withCredentials = true;
      }
    }
  });
}

function setupProgress(axios: NuxtAxiosInstance, globalName: string) { // @ts-ignore
  if (import.meta.server) {
    return;
  }

  // A noop loading interface for when $nuxt is not yet ready
  const noopLoading = {
    finish: () => { },
    start: () => { },
    fail: () => { },
    set: () => { }
  };

  const $loading = () => {
    const $nuxt = isClient() && window[globalName];
    return ($nuxt && $nuxt.$loading && $nuxt.$loading.set) ? $nuxt.$loading : noopLoading;
  };

  let currentRequests = 0;

  axios.onRequest((config) => { // @ts-ignore
    if (config && config.progress === false) {
      return;
    }

    currentRequests++;
  });

  axios.onResponse((response) => { // @ts-ignore
    if (response && response.config && response.config.progress === false) {
      return;
    }

    currentRequests--;
    if (currentRequests <= 0) {
      currentRequests = 0;
      $loading().finish();
    }
  });

  axios.onError((error) => { // @ts-ignore
    if (error && error.config && error.config.progress === false) {
      return;
    }

    currentRequests--;

    if (Axios.isCancel(error)) {
      if (currentRequests <= 0) {
        currentRequests = 0;
        $loading().finish();
      }
      return;
    }

    $loading().fail();
    $loading().finish();
  });

  const onProgress = (e) => {
    if (!currentRequests || !e.total) {
      return;
    }
    const progress = ((e.loaded * 100) / (e.total * currentRequests));
    $loading().set(Math.min(100, progress));
  };

  axios.defaults.onUploadProgress = onProgress;
  axios.defaults.onDownloadProgress = onProgress;
}
