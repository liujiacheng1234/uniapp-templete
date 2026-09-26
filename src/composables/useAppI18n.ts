import { useI18n } from 'vue-i18n'

type I18nParamValue = string | number | boolean
type I18nParams = Readonly<Record<string, I18nParamValue>>

const NAMED_PLACEHOLDER_RE = /\{([A-Za-z_][A-Za-z0-9_]*)\}/g

/**
 * uni-app 小程序构建使用 runtime-only vue-i18n，字符串消息不会执行命名插值。
 * 在业务层补齐 `{name}` 替换；缺少参数时保留占位符，便于及时发现调用错误。
 */
export function interpolateI18nMessage(message: string, params?: I18nParams): string {
  if (!params) return message

  return message.replace(NAMED_PLACEHOLDER_RE, (placeholder, key: string) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : placeholder
  )
}

/** 项目页面统一使用的翻译入口，兼容微信小程序 runtime-only 构建。 */
export function useAppI18n() {
  const { t: translate } = useI18n()

  function t(key: string, params?: I18nParams): string {
    const message = params ? translate(key, params) : translate(key)
    return interpolateI18nMessage(message, params)
  }

  return { t }
}
