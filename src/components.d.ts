import type { DefineComponent } from 'vue'

/**
 * @uni-ku/root 在构建期把 <KuRootView /> 当作页面视图插槽（会被替换为 <slot />）。
 * 该组件由插件全局注入、无运行时导出，这里补一个全局类型，避免 vue-tsc 报未知组件。
 */
declare module 'vue' {
  export interface GlobalComponents {
    KuRootView: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  }
}
