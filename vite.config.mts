import { defineConfig } from 'vite'
import uniModule from '@dcloudio/vite-plugin-uni'
import UnoCSS from 'unocss/vite'
import UniKuRoot from '@uni-ku/root'

const uni = uniModule.default

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // UniKuRoot 提供虚拟根组件 App.ku.vue，使全局 wd-config-provider + 主题 class 能跨页共享
  plugins: [UnoCSS(), UniKuRoot(), uni()],
  // npm 模式下 wot-ui 国际化需要预构建排除
  optimizeDeps: {
    exclude: ['@wot-ui/ui'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin'],
      },
    },
  },
  // 生产构建剥离 console.* 与 debugger（调试日志不上线上包）；本地 dev 不受影响。
  // 需要保留的日志用 console.warn / console.error 的请走「收紧路线图」第 4 条改为源码级约束。
  esbuild: command === 'build' ? { drop: ['console', 'debugger'] } : undefined,
}))
