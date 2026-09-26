import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * 独立于 vite.config.mts：vitest 优先读取本文件，
 * 从而不加载 @dcloudio/vite-plugin-uni（uni 编译链对纯逻辑单测是多余且会报错）。
 * 单测只覆盖纯逻辑层（api / utils / composables / themes / mocks），不渲染 .vue 组件。
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['test/**/*.spec.ts'],
    setupFiles: ['./test/setup.ts'],
  },
})
