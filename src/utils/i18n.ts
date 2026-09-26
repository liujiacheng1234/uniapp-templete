/**
 * i18n 纯函数工具（无 Vue / uni 耦合）。
 *
 * 背景：uni-app 小程序构建使用 runtime-only vue-i18n，字符串消息不会执行命名插值，
 * 需要在业务层补齐 `{name}` 替换。组件内统一走 composables/useAppI18n；
 * 非组件上下文（api 请求层等）用 locales/index.ts 的 tStatic（内部复用本函数）。
 */

type I18nParamValue = string | number | boolean
type I18nParams = Readonly<Record<string, I18nParamValue>>

const NAMED_PLACEHOLDER_RE = /\{([A-Za-z_][A-Za-z0-9_]*)\}/g

/**
 * 对消息执行 `{name}` 命名占位符替换；缺少参数时保留占位符，便于及时发现调用错误。
 */
export function interpolateI18nMessage(message: string, params?: I18nParams): string {
  if (!params) return message

  return message.replace(NAMED_PLACEHOLDER_RE, (placeholder, key: string) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : placeholder
  )
}
