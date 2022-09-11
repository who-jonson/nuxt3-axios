import { ref, type Ref } from 'vue';
import { useAsyncData, type NuxtApp } from 'nuxt/app';
import type { _AsyncData, _Transform, AsyncDataOptions, KeyOfRes, PickFrom } from 'nuxt/dist/app/composables/asyncData';
import type { AxiosRequestConfig } from 'axios';
import type { NuxtAxiosInstance } from '../../options';

interface _NuxtApp extends NuxtApp {
  $axios: NuxtAxiosInstance
}

type HandlerFn<T> = (ctx?: _NuxtApp) => Promise<T>;

type RequestData = FormData | Record<string, any> | {[p: string]: any} | null | undefined;

export interface _AxiosAsyncData<DataT, ErrorT> extends _AsyncData<DataT, ErrorT>{
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

export declare type AxiosAsyncData<Data, Error> = _AxiosAsyncData<Data, Error> & Promise<_AxiosAsyncData<Data, Error>>;

export interface UseAxiosOptions<DataT, D = RequestData, Transform extends _Transform<DataT> = _Transform<DataT, DataT>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>> extends AsyncDataOptions<DataT, Transform, PickKeys> {
  key?: string,
  config?: AxiosRequestConfig<D>
}

export type AsyncDataResponse<DataT, DataE = Error, Transform extends _Transform<DataT> = _Transform<DataT, DataT>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>> = AxiosAsyncData<PickFrom<ReturnType<Transform>, PickKeys>, DataE | null | true>;

export interface UseAxiosParams<T, D = RequestData, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>> {
  url: string;
  config?: AxiosRequestConfig<D>;
  options?: UseAxiosOptions<T, D, Transform, PickKeys>
}

export interface UseAxiosParamsWithData<T, D = RequestData, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>> extends UseAxiosParams<T, D, Transform, PickKeys> {
  reqData?: D;
}

/**
 * It takes a value and a callback, and returns the result of the callback.
 * @param value - T - The value to pass to the callback.
 * @param callback - (value: T) => D
 * @returns The callback function is being returned.
 */
function tapUse<T, D = any>(value: T, callback: (value: T) => D): D {
  return callback(value);
}

/**
 * If there's one argument, it's the url. If there's two arguments, the first is the url and the second is the config. If
 * there's three arguments, the first is the url, the second is the config, and the third is the options
 * @param {any[]} args - any[] - This is the arguments that are passed to the useAxios hook.
 * @returns function getParams<T>(...args: any[]): UseAxiosParams<T> {
 *   if (args.length === 1) {
 *     return { url: args[0] };
 *   }
 *   if (args.length === 2) {
 *     return { url: args[0], config: args[1].config || {},
 */
function getParams<T, D = RequestData, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(...args: any[]): UseAxiosParams<T, D, Transform, PickKeys> {
  if (args.length === 1) {
    return { url: args[0] };
  }
  if (args.length === 2) {
    return { url: args[0], config: args[1].config || {}, options: args[1] };
  } else {
    return { url: args[0], config: args[1], options: args[2] };
  }
}

/**
 * If there are 1, 2, 3, or 4 arguments, return an object with the url, reqData, config, and options properties
 * @param {any[]} args - The arguments passed to the useAxios hook.
 * @returns function getParamsWithData<T, D>(...args: any[]): UseAxiosParamsWithData<T, D> {
 *   if (args.length === 1) {
 *     return { url: args[0] };
 *   }
 *   if (args.length === 2) {
 *     return { url: args[0], reqData
 */
function getParamsWithData<T, D = RequestData, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(...args: any[]): UseAxiosParamsWithData<T, D, Transform, PickKeys> {
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

/**
 * It takes in a URL and an optional config object, and returns an object with the same properties as the `useAsyncData`
 * function
 * @param url - The arguments passed to the useAxios function.
 * @param config - The arguments passed to the useAxios function.
 * @param options - The arguments passed to the useAxios function.
 * @returns A function that returns an object with the following properties:
 * - data: The data returned from the request
 * - error: The error returned from the request
 * - loading: A boolean indicating if the request is pending
 * - aborted: A boolean indicating if the request was aborted
 * - cancel: A function that aborts the request
 * - cancelToken: A CancelToken that can be used to abort
 */
export function useAxios<T, E = Error, D = RequestData, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(url: string, config?: AxiosRequestConfig<D>, options?: Omit<UseAxiosOptions<T, D, Transform, PickKeys>, 'config'>): AsyncDataResponse<T, E, Transform, PickKeys>;
export function useAxios<T, E = Error, D = RequestData, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(url: string, options?: UseAxiosOptions<T, D, Transform, PickKeys>): AsyncDataResponse<T, E, Transform, PickKeys>;
export function useAxios<T, E = Error, D = RequestData, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(...args: any[]): AsyncDataResponse<T, E, Transform, PickKeys> {
  // eslint-disable-next-line prefer-const
  let { url, config, options } = getParams<T, D, Transform, PickKeys>(...args);
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

  const handler: HandlerFn<T> = ({ $axios }) => $axios.$request<T, D>(config);

  if (options?.key) {
    const key = options.key;
    delete options.key;

    result = useAsyncData<T, E, Transform, PickKeys>(key, handler, options);
  } else {
    result = useAsyncData<T, E, Transform, PickKeys>(handler, options);
  }

  result.aborted = result.canceled = aborted;
  result.abort = result.cancel = abort;

  return result;
}

export function useAxiosGet<T, E = Error, D = RequestData, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(url: string, config?: AxiosRequestConfig<D>, options?: Omit<UseAxiosOptions<T, D, Transform, PickKeys>, 'config'>): AsyncDataResponse<T, E, Transform, PickKeys>;
export function useAxiosGet<T, E = Error, D = RequestData, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(url: string, options?: UseAxiosOptions<T, D, Transform, PickKeys>): AsyncDataResponse<T, E, Transform, PickKeys>;
export function useAxiosGet<T, E = Error, D = RequestData, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(...args: any[]): AsyncDataResponse<T, E, Transform, PickKeys> {
  return tapUse<UseAxiosParams<T, D, Transform, PickKeys>, AsyncDataResponse<T, E, Transform, PickKeys>>(getParams<T, D, Transform, PickKeys>(...args), ({ url, config, options }) => {
    return useAxios<T, E, D, Transform, PickKeys>(url, {
      ...(config || {}),
      method: 'GET'
    }, options);
  });
}

export function useAxiosPost<T, D = RequestData, E = Error, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(url: string, data?: D, config?: AxiosRequestConfig<D>, options?: Omit<UseAxiosOptions<T, D, Transform, PickKeys>, 'config'>): AsyncDataResponse<T, E, Transform, PickKeys>;
export function useAxiosPost<T, D = RequestData, E = Error, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(url: string, data?: D, options?: UseAxiosOptions<T, D, Transform, PickKeys>): AsyncDataResponse<T, E, Transform, PickKeys>;
export function useAxiosPost<T, D = RequestData, E = Error, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(...args: any[]): AsyncDataResponse<T, E, Transform, PickKeys> {
  return tapUse<UseAxiosParamsWithData<T, D, Transform, PickKeys>, AsyncDataResponse<T, E, Transform, PickKeys>>(getParamsWithData<T, D, Transform, PickKeys>(...args), ({ url, reqData, config, options }) => {
    return useAxios<T, E, D, Transform, PickKeys>(url, {
      ...(config || {}),
      method: 'POST',
      data: reqData
    }, options);
  });
}

export function useAxiosPut<T, D = RequestData, E = Error, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(url: string, data?: D, config?: AxiosRequestConfig<D>, options?: Omit<UseAxiosOptions<T, D, Transform, PickKeys>, 'config'>): AsyncDataResponse<T, E, Transform, PickKeys>;
export function useAxiosPut<T, D = RequestData, E = Error, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(url: string, data?: D, options?: UseAxiosOptions<T, D, Transform, PickKeys>): AsyncDataResponse<T, E, Transform, PickKeys>;
export function useAxiosPut<T, D = RequestData, E = Error, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(...args: any[]): AsyncDataResponse<T, E, Transform, PickKeys> {
  return tapUse<UseAxiosParamsWithData<T, D, Transform, PickKeys>, AsyncDataResponse<T, E, Transform, PickKeys>>(getParamsWithData<T, D, Transform, PickKeys>(...args), ({ url, reqData, config, options }) => {
    return useAxios<T, E, D, Transform, PickKeys>(url, {
      ...(config || {}),
      method: 'PUT',
      data: reqData
    }, options);
  });
}

export function useAxiosPatch<T, D = RequestData, E = Error, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(url: string, data?: D, config?: AxiosRequestConfig<D>, options?: Omit<UseAxiosOptions<T, D, Transform, PickKeys>, 'config'>): AsyncDataResponse<T, E, Transform, PickKeys>;
export function useAxiosPatch<T, D = RequestData, E = Error, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(url: string, data?: D, options?: UseAxiosOptions<T, D, Transform, PickKeys>): AsyncDataResponse<T, E, Transform, PickKeys>;
export function useAxiosPatch<T, D = RequestData, E = Error, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(...args: any[]): AsyncDataResponse<T, E, Transform, PickKeys> {
  return tapUse<UseAxiosParamsWithData<T, D, Transform, PickKeys>, AsyncDataResponse<T, E, Transform, PickKeys>>(getParamsWithData<T, D, Transform, PickKeys>(...args), ({ url, reqData, config, options }) => {
    return useAxios<T, E, D, Transform, PickKeys>(url, {
      ...(config || {}),
      method: 'PATCH',
      data: reqData
    }, options);
  });
}

export function useAxiosDelete<T, D = RequestData, E = Error, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(url: string, data?: D, config?: AxiosRequestConfig<D>, options?: Omit<UseAxiosOptions<T, D, Transform, PickKeys>, 'config'>): AsyncDataResponse<T, E, Transform, PickKeys>;
export function useAxiosDelete<T, D = RequestData, E = Error, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(url: string, data?: D, options?: UseAxiosOptions<T, D, Transform, PickKeys>): AsyncDataResponse<T, E, Transform, PickKeys>;
export function useAxiosDelete<T, D = RequestData, E = Error, Transform extends _Transform<T> = _Transform<T, T>, PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>>(...args: any[]): AsyncDataResponse<T, E, Transform, PickKeys> {
  return tapUse<UseAxiosParamsWithData<T, D, Transform, PickKeys>, AsyncDataResponse<T, E, Transform, PickKeys>>(getParamsWithData<T, D, Transform, PickKeys>(...args), ({ url, reqData, config, options }) => {
    return useAxios<T, E, D, Transform, PickKeys>(url, {
      ...(config || {}),
      method: 'DELETE',
      data: reqData
    }, options);
  });
}
