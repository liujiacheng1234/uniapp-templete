import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import { i18n } from './locales'
import { configureAuth } from './utils/auth'
import { loginByAccount } from './api/example'
import 'uno.css'

// 注册静默重登执行器：请求层收到 UNAUTHORIZED / SESSION_EXPIRED 时自动重登并重试一次。
// 模板默认用示例 mock 登录；接入真实项目时替换为你的登录实现（如微信 code 登录）。
configureAuth(() => loginByAccount({ username: 'demo', password: 'demo' }))

export function createApp() {
  const app = createSSRApp(App)

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)

  app.use(i18n)

  return {
    app,
  }
}
