import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import en from './en'
import { interpolateI18nMessage } from '@/utils/i18n'

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

type StaticI18nParams = Record<string, string | number | boolean>

/**
 * 非组件上下文（api 请求层、utils 等）取用户可见文案：每次调用实时读当前 locale，
 * 语言切换后即刻生效；不做响应式，组件内仍统一走 composables/useAppI18n。
 * 小程序 runtime-only 构建不执行命名插值，这里统一补齐 `{name}` 替换。
 */
export function tStatic(key: string, params?: StaticI18nParams): string {
  // 与 useAppI18n 同构：params 先透传给 t()（完整构建下 vue-i18n 直接完成插值），
  // runtime-only 构建未插值时由 interpolateI18nMessage 兑底补齐。
  const message = params ? i18n.global.t(key, params) : i18n.global.t(key)
  return interpolateI18nMessage(message, params)
}
