export const AUTH_STORAGE_KEY = 'lease_auth_session'

export function getStorage(key: string, fallback = null) {
  try {
    const value = uni.getStorageSync(key)
    return value || fallback
  } catch {
    return fallback
  }
}

export function setStorage(key: string, value: unknown) {
  try {
    uni.setStorageSync(key, value)
    return true
  } catch {
    return false
  }
}

export function removeStorage(key: string) {
  try {
    uni.removeStorageSync(key)
    return true
  } catch {
    return false
  }
}

/**
 * 适配 pinia-plugin-persistedstate 的 uni 存储。
 * 该插件会把 state 序列化为 JSON 字符串后调用 setItem，读取时调用 getItem 拿回字符串再反序列化。
 */
export const uniStorage = {
  getItem(key: string): string | null {
    const value = uni.getStorageSync(key)
    return value || null
  },
  setItem(key: string, value: string) {
    uni.setStorageSync(key, value)
  },
  removeItem(key: string) {
    uni.removeStorageSync(key)
  },
}
