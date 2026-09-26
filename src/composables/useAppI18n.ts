import { useI18n } from 'vue-i18n'
import { interpolateI18nMessage } from '@/utils/i18n'

type I18nParams = Readonly<Record<string, string | number | boolean>>

export { interpolateI18nMessage } from '@/utils/i18n'

/** 项目页面统一使用的翻译入口，兼容微信小程序 runtime-only 构建。 */
export function useAppI18n() {
  const { t: translate } = useI18n()

  function t(key: string, params?: I18nParams): string {
    const message = params ? translate(key, params) : translate(key)
    return interpolateI18nMessage(message, params)
  }

  return { t }
}
