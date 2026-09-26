/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 后端域名，唯一来源。本地联调配在 .env.development（入库共享），构建发布配在 .env.production.local 或由 CI 注入；缺失时构建期/请求期都会显式报错 */
  readonly VITE_API_BASE_URL?: string
  /** 'true' 时命中 src/mocks/handlers.ts 路由的请求直接返回 mock 数据；.env.development 默认开启（个人差异用 .env.development.local 覆盖），构建环境禁止开启 */
  readonly VITE_USE_MOCK?: string
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}
