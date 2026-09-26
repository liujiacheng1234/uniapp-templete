/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'true' 时命中 src/mocks/handlers.ts 路由的请求直接返回 mock 数据（仅建议 .env.development.local 使用） */
  readonly VITE_USE_MOCK?: string
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}
