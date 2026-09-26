import { defineStore } from 'pinia'
import { Locale } from '@wot-ui/ui'
import enUS from '@wot-ui/ui/locale/lang/en-US'
import zhCNWot from '@wot-ui/ui/locale/lang/zh-CN'
import { i18n, type AppLocale } from '@/locales'
import { uniStorage } from '@/utils/storage'

// 注册 wot-ui 组件级文案包（zh-CN 为默认，en-US 需补充注册）
Locale.add({ 'zh-CN': zhCNWot, 'en-US': enUS })

// 业务 locale → wot-ui Locale 语言映射
const wotLangMap: Record<AppLocale, string> = { 'zh-CN': 'zh-CN', en: 'en-US' }

export const useLocaleStore = defineStore('locale', {
  state: () => ({
    locale: 'zh-CN' as AppLocale,
  }),
  actions: {
    /** 切换语言：同时驱动 vue-i18n 业务文案与 wot-ui 组件文案 */
    setLocale(locale: AppLocale) {
      this.locale = locale
      i18n.global.locale.value = locale
      const pack = locale === 'en' ? enUS : zhCNWot
      Locale.use(wotLangMap[locale], pack)
    },
    /** 启动时调用，把持久化的 locale 同步到 vue-i18n 与 wot Locale */
    init() {
      this.setLocale(this.locale)
    },
  },
  persist: {
    storage: uniStorage,
    paths: ['locale'],
  },
})
