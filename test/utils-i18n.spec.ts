import { afterEach, describe, expect, it } from 'vitest'
import { interpolateI18nMessage } from '@/utils/i18n'
import { i18n, tStatic } from '@/locales'

describe('interpolateI18nMessage（命名占位符替换）', () => {
  it('无参数时原样返回', () => {
    expect(interpolateI18nMessage('hello')).toBe('hello')
    expect(interpolateI18nMessage('Hi {name}')).toBe('Hi {name}')
  })

  it('替换已知占位符，缺少参数时保留占位符便于发现调用错误', () => {
    expect(interpolateI18nMessage('Hi {name}', { name: '世界' })).toBe('Hi 世界')
    expect(interpolateI18nMessage('Hi {name}', {})).toBe('Hi {name}')
    expect(interpolateI18nMessage('共 {total} 条，第 {page} 页', { total: 23 })).toBe(
      '共 23 条，第 {page} 页'
    )
  })

  it('参数值为数字 / 布尔时转字符串', () => {
    expect(interpolateI18nMessage('请求失败({statusCode})', { statusCode: 500 })).toBe(
      '请求失败(500)'
    )
    expect(interpolateI18nMessage('ok={flag}', { flag: true })).toBe('ok=true')
  })

  it('非法占位符名不参与替换', () => {
    expect(interpolateI18nMessage('{1bad} {ok}', { '1bad': 'x', ok: 'y' })).toBe('{1bad} y')
  })
})

describe('tStatic（非组件上下文取文案）', () => {
  afterEach(() => {
    // 恢复默认语言，避免影响其他用例
    i18n.global.locale.value = 'zh-CN'
  })

  it('默认 zh-CN 取值', () => {
    expect(tStatic('request.requestFailed')).toBe('请求失败')
  })

  it('实时跟随当前 locale（请求层文案随语言切换）', () => {
    i18n.global.locale.value = 'en'
    expect(tStatic('request.requestFailed')).toBe('Request failed')
  })

  it('带参数走命名插值补齐', () => {
    expect(tStatic('request.httpError', { statusCode: 502 })).toBe('请求失败(502)')
  })
})
