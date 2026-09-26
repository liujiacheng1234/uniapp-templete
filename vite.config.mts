import { defineConfig, loadEnv } from 'vite'
import uniModule from '@dcloudio/vite-plugin-uni'
import UnoCSS from 'unocss/vite'
import UniKuRoot from '@uni-ku/root'

const uni = uniModule.default

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 构建期环境校验：把「域名未配置 / mock 误开」的失败提前到打包阶段，
  // 而不是等到线上用户首次请求才暴露（运行时仍有显式报错兜底，见 api/request.ts）。
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  if (command === 'build') {
    if (env.VITE_USE_MOCK === 'true') {
      console.warn('[build] 警告：VITE_USE_MOCK=true，构建产物将对命中 mock 路由的请求返回假数据！')
    } else if (!env.VITE_API_BASE_URL) {
      throw new Error(
        '[build] VITE_API_BASE_URL 未配置：请在 .env.production.local（不入库）或 CI 环境提供正式 https 域名；' +
          '若确要构建 mock 演示包，请显式设置 VITE_USE_MOCK=true'
      )
    }
  }

  return {
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
  }
})
