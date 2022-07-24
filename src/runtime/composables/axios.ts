import { ref } from 'vue';
import { useAsyncData } from '#app';
import type { AsyncDataOptions, AsyncData, NuxtApp } from '#app';
import type { AxiosRequestConfig } from 'axios';
import type { Ref } from 'vue';

type HandlerFn<T> = (app?: NuxtApp) => Promise<T>;
type RequestData = FormData | Record<string, any> | {[p: string]: any} | null | undefined;

export interface UseAxiosOptions<T, D = RequestData> extends AsyncDataOptions<T> {
  key?: string,
  config?: AxiosRequestConfig<D>
}

export interface UseAxiosResponse<T, E = Error> extends AsyncData<T, E>{

  /**
   * Indicates if the request was canceled
   */
  aborted: Ref<boolean>

  /**
   * Aborts the current request
   */
  abort: () => void

  /**
   * abort alias
   */
  cancel: () => void

  /**
   * isAborted alias
   */
  canceled: Ref<boolean>
}

interface UseAxiosParams<T> {
  url: string;
  config?: AxiosRequestConfig;
  options?: UseAxiosOptions<T>
}

interface UseAxiosParamsWithData<T, D> extends UseAxiosParams<T> {
  reqData?: D;
  config?: AxiosRequestConfig<D>;
}

function tapUse<T, D = any>(value: T, callback: (value: T) => D): D {
  return callback(value);
}

function getParams<T>(...args: any[]): UseAxiosParams<T> {
  if (args.length === 1) {
    return { url: args[0] };
  }
  if (args.length === 2) {
    return { url: args[0], config: args[1].config || {}, options: args[1] };
  } else {
    return { url: args[0], config: args[1], options: args[2] };
  }
}

function getParamsWithData<T, D>(...args: any[]): UseAxiosParamsWithData<T, D> {
  if (args.length === 1) {
    return { url: args[0] };
  }
  if (args.length === 2) {
    return { url: args[0], reqData: args[1] };
  }
  if (args.length === 3) {
    return { url: args[0], reqData: args[1], config: args[2].config || {}, options: args[2] };
  } else {
    return { url: args[0], reqData: args[1], config: args[2], options: args[3] };
  }
}

export function useAxios<T, E = Error>(url: string, config?: AxiosRequestConfig, options?: Omit<UseAxiosOptions<T>, 'config'>): UseAxiosResponse<T, E>;
export function useAxios<T, E = Error>(url: string, options?: UseAxiosOptions<T>): UseAxiosResponse<T, E>;
export function useAxios<T, E = Error>(...args: any[]): UseAxiosResponse<T, E> {
  // eslint-disable-next-line prefer-const
  let { url, config, options } = getParams<T>(...args);
  const controller = new AbortController();
  config = {
    ...(config || {}),
    url,
    signal: controller.signal
  };
  const aborted = ref(false);
  let result;

  const abort = () => {
    if (!result.pending) {
      return;
    }
    aborted.value = true;
    controller.abort();
  };

  const handler: HandlerFn<T> = ({ $axios }) => $axios.$request(config);

  if (options?.key) {
    const key = options.key;
    delete options.key;

    result = useAsyncData<T, E>(key, handler, options);
  } else {
    result = useAsyncData<T, E>(handler, options);
  }

  result.aborted = result.canceled = aborted;
  result.abort = result.cancel = abort;

  return result;
}

export function useAxiosGet<T, E = Error>(url: string, config?: AxiosRequestConfig, options?: Omit<UseAxiosOptions<T>, 'config'>): UseAxiosResponse<T, E>;
export function useAxiosGet<T, E = Error>(url: string, options?: UseAxiosOptions<T>): UseAxiosResponse<T, E>;
export function useAxiosGet<T, E = Error>(...args: any[]): UseAxiosResponse<T, E> {
  return tapUse<UseAxiosParams<T>, UseAxiosResponse<T, E>>(getParams<T>(...args), ({ url, config, options }) => {
    return useAxios<T, E>(url, {
      ...(config || {}),
      method: 'GET'
    }, options);
  });
}

export function useAxiosPost<T, D = RequestData, E = Error>(url: string, data?: D, config?: AxiosRequestConfig<D>, options?: Omit<UseAxiosOptions<T, D>, 'config'>): UseAxiosResponse<T, E>;
export function useAxiosPost<T, D = RequestData, E = Error>(url: string, data?: D, options?: UseAxiosOptions<T, D>): UseAxiosResponse<T, E>;
export function useAxiosPost<T, D = RequestData, E = Error>(...args: any[]): UseAxiosResponse<T, E> {
  return tapUse<UseAxiosParamsWithData<T, D>, UseAxiosResponse<T, E>>(getParamsWithData<T, D>(...args), ({ url, reqData, config, options }) => {
    return useAxios<T, E>(url, {
      ...(config || {}),
      method: 'POST',
      data: reqData
    }, options);
  });
}

export function useAxiosPut<T, D = RequestData, E = Error>(url: string, data?: D, config?: AxiosRequestConfig<D>, options?: Omit<UseAxiosOptions<T, D>, 'config'>): UseAxiosResponse<T, E>;
export function useAxiosPut<T, D = RequestData, E = Error>(url: string, data?: D, options?: UseAxiosOptions<T, D>): UseAxiosResponse<T, E>;
export function useAxiosPut<T, D = RequestData, E = Error>(...args: any[]): UseAxiosResponse<T, E> {
  return tapUse<UseAxiosParamsWithData<T, D>, UseAxiosResponse<T, E>>(getParamsWithData<T, D>(...args), ({ url, reqData, config, options }) => {
    return useAxios<T, E>(url, {
      ...(config || {}),
      method: 'PUT',
      data: reqData
    }, options);
  });
}

export function useAxiosPatch<T, D = RequestData, E = Error>(url: string, data?: D, config?: AxiosRequestConfig<D>, options?: Omit<UseAxiosOptions<T, D>, 'config'>): UseAxiosResponse<T, E>;
export function useAxiosPatch<T, D = RequestData, E = Error>(url: string, data?: D, options?: UseAxiosOptions<T, D>): UseAxiosResponse<T, E>;
export function useAxiosPatch<T, D = RequestData, E = Error>(...args: any[]): UseAxiosResponse<T, E> {
  return tapUse<UseAxiosParamsWithData<T, D>, UseAxiosResponse<T, E>>(getParamsWithData<T, D>(...args), ({ url, reqData, config, options }) => {
    return useAxios<T, E>(url, {
      ...(config || {}),
      method: 'PATCH',
      data: reqData
    }, options);
  });
}

export function useAxiosDelete<T, D = RequestData, E = Error>(url: string, data?: D, config?: AxiosRequestConfig<D>, options?: Omit<UseAxiosOptions<T, D>, 'config'>): UseAxiosResponse<T, E>;
export function useAxiosDelete<T, D = RequestData, E = Error>(url: string, data?: D, options?: UseAxiosOptions<T, D>): UseAxiosResponse<T, E>;
export function useAxiosDelete<T, D = RequestData, E = Error>(...args: any[]): UseAxiosResponse<T, E> {
  return tapUse<UseAxiosParamsWithData<T, D>, UseAxiosResponse<T, E>>(getParamsWithData<T, D>(...args), ({ url, reqData, config, options }) => {
    return useAxios<T, E>(url, {
      ...(config || {}),
      method: 'DELETE',
      data: reqData
    }, options);
  });
}
