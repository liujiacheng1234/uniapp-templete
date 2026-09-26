import { describe, expect, it } from 'vitest'
import {
  formatClock,
  formatDateTime,
  formatDistance,
  formatDuration,
  formatHMS,
  formatPercent,
  yuan,
} from '@/utils/commonUtil'

describe('yuan（分 → 元）', () => {
  it('整数分转元', () => {
    expect(yuan(19900)).toBe(199)
    expect(yuan(137)).toBe(1.37)
    expect(yuan(0)).toBe(0)
  })

  it('非数字或缺省返回 0', () => {
    expect(yuan(undefined)).toBe(0)
    expect(yuan(Number.NaN)).toBe(0)
    expect(yuan(Number.POSITIVE_INFINITY)).toBe(0)
  })
})

describe('formatDistance', () => {
  it('米级取整展示', () => {
    expect(formatDistance(0)).toBe('0m')
    expect(formatDistance(999)).toBe('999m')
  })

  it('公里级：≥10km 取整，<10km 保留一位并去掉 .0', () => {
    expect(formatDistance(1500)).toBe('1.5km')
    expect(formatDistance(9_400)).toBe('9.4km')
    expect(formatDistance(10_000)).toBe('10km')
    expect(formatDistance(12_300)).toBe('12km')
  })

  it('非有限数字返回 fallback', () => {
    expect(formatDistance(undefined)).toBe('--')
    expect(formatDistance(Number.NaN)).toBe('--')
    expect(formatDistance(undefined, '未知')).toBe('未知')
  })
})

describe('formatDuration', () => {
  it('整点小时简写，其余展示分钟', () => {
    expect(formatDuration(60)).toBe('1小时')
    expect(formatDuration(120)).toBe('2小时')
    expect(formatDuration(90)).toBe('90分钟')
    expect(formatDuration(45)).toBe('45分钟')
  })
})

describe('formatClock / formatDateTime', () => {
  it('合法 ISO（本地时区）格式化', () => {
    expect(formatClock('2026-08-31T08:05:00')).toBe('08:05')
    expect(formatDateTime('2026-08-31T08:05:00')).toBe('2026-08-31 08:05')
  })

  it('非法或缺省返回占位符', () => {
    expect(formatClock(undefined)).toBe('--:--')
    expect(formatClock('not-a-date')).toBe('--:--')
    expect(formatDateTime(undefined)).toBe('--')
    expect(formatDateTime('not-a-date')).toBe('--')
  })
})

describe('formatHMS', () => {
  it('不足 1 小时展示 mm:ss，超过展示 H:mm:ss', () => {
    expect(formatHMS(0)).toBe('00:00')
    expect(formatHMS(59)).toBe('00:59')
    expect(formatHMS(60)).toBe('01:00')
    expect(formatHMS(3661)).toBe('1:01:01')
  })

  it('负数按 0 处理，小数向下取整', () => {
    expect(formatHMS(-5)).toBe('00:00')
    expect(formatHMS(59.9)).toBe('00:59')
  })
})

describe('formatPercent', () => {
  it('数值字符串转百分比并 clamp 到 0–100', () => {
    expect(formatPercent('88')).toBe('88%')
    expect(formatPercent('150')).toBe('100%')
    expect(formatPercent('-5')).toBe('0%')
  })

  it('非有限数字返回 --；空串转数字为 0（Number("") === 0），按 0% 展示', () => {
    expect(formatPercent('abc')).toBe('--')
    expect(formatPercent('')).toBe('0%')
  })
})
