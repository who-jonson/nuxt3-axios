import type { AxiosError, AxiosRequestConfig, AxiosResponse, AxiosStatic } from 'axios';
import type { IAxiosRetryConfig } from 'axios-retry';

export interface NuxtAxiosInstance extends AxiosStatic {
  $request<T = any, D = any>(config: AxiosRequestConfig<D>): Promise<T>
  $get<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>
  $delete<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>
  $head<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>
  $options<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>
  $post<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<T>
  $put<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<T>
  $patch<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<T>

  setBaseURL(baseURL: string): void
  setHeader(
    name: string,
    value?: string | false,
    scopes?: string | string[]
  ): void
  setToken(
    token: string | false,
    type?: string,
    scopes?: string | string[]
  ): void

  onRequest<D = any>(
    callback: (
      config: AxiosRequestConfig<D>
    ) => void | AxiosRequestConfig<D> | Promise<AxiosRequestConfig<D>>
  ): void
  onResponse<T = any, D = any>(
    callback: (
      response: AxiosResponse<T, D>
    ) => void | AxiosResponse<T, D> | Promise<AxiosResponse<T, D>>
  ): void
  onError<T = unknown, D = any>(callback: (error: AxiosError<T, D>) => any): void
  onRequestError<T = unknown, D = any>(callback: (error: AxiosError<T, D>) => any): void
  onResponseError<T = unknown, D = any>(callback: (error: AxiosError<T, D>) => any): void

  create(options?: AxiosRequestConfig): NuxtAxiosInstance
}

export interface ModuleOptions {
  baseURL?: string
  baseUrl?: string
  browserBaseURL?: string
  browserBaseUrl?: string
  globalName?: string
  credentials?: boolean
  debug?: boolean
  host?: string
  prefix?: string
  progress?: boolean
  proxyHeaders?: boolean
  proxyHeadersIgnore?: string[]
  proxy?: boolean
  port?: string | number
  retry?: boolean | IAxiosRetryConfig
  https?: boolean
  headers?: {
    common?: Record<string, string>
    delete?: Record<string, string>
    get?: Record<string, string>
    head?: Record<string, string>
    post?: Record<string, string>
    put?: Record<string, string>
    patch?: Record<string, string>
  }
}
