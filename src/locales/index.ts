import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import en from './en'

/** 应用支持的语言（业务文案 vue-i18n），同时作为设置页选项的唯一数据源。 */
export const APP_LOCALE_KEYS = ['zh-CN', 'en'] as const

export type AppLocale = (typeof APP_LOCALE_KEYS)[number]

export const messages = {
  'zh-CN': zhCN,
  en,
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'zh-CN',
  // 中文为主语言：某语言包缺 key 时回退中文，避免界面突然出现英文
  fallbackLocale: 'zh-CN',
  messages,
})
