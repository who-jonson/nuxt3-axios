import type { NuxtAxiosOptions } from './options';

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    axiosModule: Omit<NuxtAxiosOptions, 'autoImport'>;
  }
}

declare module 'axios' {
  import type { AxiosStatic } from 'axios';

  export interface AxiosInstance {
    CancelToken: AxiosStatic['CancelToken'];
    isAxiosError: AxiosStatic['isAxiosError'];
    isCancel: AxiosStatic['isCancel'];
  }

  export interface AxiosRequestConfig {
    progress?: boolean;
  }
}


export {};
