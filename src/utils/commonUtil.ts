/**
 * 纯函数工具箱（无 Vue / uni 耦合）。
 *
 * 历史备注：Haversine 距离计算与 GeoJSON 多边形解析原先服务旧首页
 * （pages/index，已随 2026-08-25 审核 Roadmap 下线），现仅保留在用的格式化函数。
 */

/**
 * 计算距离
 * @param meters
 * @param fallback
 * @returns
 */
export function formatDistance(meters?: number, fallback = '--'): string {
  if (meters == null || !Number.isFinite(meters)) {
    return fallback
  }

  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }

  const km = meters / 1000
  return `${km >= 10 ? Math.round(km) : km.toFixed(1).replace(/\.0$/, '')}km`
}

/**
 * 金额：后端统一「分」(integer)，展示/计算前转「元」。
 * 非数字或缺省返回 0。详见 CLAUDE.md 的 *Money is in cents*。
 */
export function yuan(cents?: number): number {
  return typeof cents === 'number' && Number.isFinite(cents) ? cents / 100 : 0
}

/**
 * 时间 / 时长格式化。
 */

function padTwo(value: number) {
  return String(value).padStart(2, '0')
}

/** 把分钟数格式化为「N小时 / N分钟」，整点小时简写为「N小时」 */
export function formatDuration(minutes: number): string {
  if (minutes >= 60 && minutes % 60 === 0) {
    return `${minutes / 60}小时`
  }
  return `${minutes}分钟`
}

/** 把 ISO 时间字符串格式化为 HH:mm，非法或缺省返回 '--:--' */
export function formatClock(value?: string): string {
  if (!value) {
    return '--:--'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '--:--'
  }
  return `${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`
}

/** 把 ISO 时间字符串格式化为 YYYY-MM-DD HH:mm，非法或缺省返回 '--' */
export function formatDateTime(value?: string): string {
  if (!value) {
    return '--'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '--'
  }
  const month = padTwo(date.getMonth() + 1)
  const day = padTwo(date.getDate())
  return `${date.getFullYear()}-${month}-${day} ${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`
}

/** 把总秒数格式化为 mm:ss（不足 1 小时）或 H:mm:ss */
export function formatHMS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  if (hours > 0) {
    return `${hours}:${padTwo(minutes)}:${padTwo(seconds)}`
  }
  return `${padTwo(minutes)}:${padTwo(seconds)}`
}

/**
 * 把数值（通常是字符串形式的电量 / 百分比）格式化为「N%」：
 * 先转数字，再 clamp 到 0–100 并四舍五入；非有限数字返回 '--'。
 */
export function formatPercent(value: string) {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) {
    return '--'
  }
  return `${Math.max(0, Math.min(100, Math.round(numberValue)))}%`
}
