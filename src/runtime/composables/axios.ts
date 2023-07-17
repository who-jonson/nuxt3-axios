import defu from 'defu';
import { useNuxtApp } from 'nuxt/app';
import { objectPick } from '@whoj/utils-core';
import { useAxios as _useAxios } from '@vueuse/integrations/useAxios';
import type { AxiosRequestConfig, AxiosResponseTransformer } from 'axios';
import type { UseAxiosOptions as _UseAxiosOptions } from '@vueuse/integrations/useAxios';

export type UseAxiosRequestConfig<D = any> = Omit<AxiosRequestConfig<D>, 'transformResponse'>;

export interface UseAxiosOptions extends _UseAxiosOptions {
  transformer?: AxiosResponseTransformer | AxiosResponseTransformer[];
}

export function useAxios<T = any, D = any>(url: string, config: UseAxiosRequestConfig<D> = {}, options: UseAxiosOptions = { immediate: true }) {
  const { $axios } = useNuxtApp();

  config = defu((config), {
    method: 'GET',
    transformResponse: options?.transformer || undefined
  });
  return _useAxios<T>(url, config, $axios, objectPick(options, ['immediate']));
}

export function useAxiosGet<T = any>(url: string, config: Omit<UseAxiosRequestConfig, 'method'> = {}, options?: UseAxiosOptions) {
  return useAxios<T>(url, { ...config, method: 'GET' }, options);
}

export function useAxiosPost<T = any, D = any>(url: string, data?: D, config: Omit<UseAxiosRequestConfig<D>, 'data' | 'method'> = {}, options?: UseAxiosOptions) {
  return useAxios<T, D>(url, { ...config, data, method: 'POST' }, options);
}

export function useAxiosPut<T = any, D = any>(url: string, data?: D, config: Omit<UseAxiosRequestConfig<D>, 'data' | 'method'> = {}, options?: UseAxiosOptions) {
  return useAxios<T, D>(url, { ...config, data, method: 'PUT' }, options);
}

export function useAxiosPatch<T = any, D = any>(url: string, data?: D, config: Omit<UseAxiosRequestConfig<D>, 'data' | 'method'> = {}, options?: UseAxiosOptions) {
  return useAxios<T, D>(url, { ...config, data, method: 'PATCH' }, options);
}

export function useAxiosDelete<T = any, D = any>(url: string, data?: D, config: Omit<UseAxiosRequestConfig<D>, 'data' | 'method'> = {}, options?: UseAxiosOptions) {
  return useAxios<T, D>(url, { ...config, data, method: 'DELETE' }, options);
}
