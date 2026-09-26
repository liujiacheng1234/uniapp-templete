import { beforeEach, vi } from 'vitest'

/**
 * 全局 uni API mock：单测只覆盖纯逻辑层，不启动小程序运行时。
 * storage 用内存 Map 模拟，与 utils/storage.ts 的同步语义一致（getStorageSync 返回原值）。
 */
const storageMap = new Map<string, unknown>()

export const uniMock = {
  getStorageSync: vi.fn((key: string) => (storageMap.has(key) ? storageMap.get(key) : '')),
  setStorageSync: vi.fn((key: string, value: unknown) => {
    storageMap.set(key, value)
  }),
  removeStorageSync: vi.fn((key: string) => {
    storageMap.delete(key)
  }),
  request: vi.fn(),
  uploadFile: vi.fn(),
  downloadFile: vi.fn(),
  reLaunch: vi.fn(),
  navigateTo: vi.fn(),
  showToast: vi.fn(),
  login: vi.fn(),
}

vi.stubGlobal('uni', uniMock)
vi.stubGlobal('getCurrentPages', vi.fn(() => []))

/** 与小程序 storage 行为对齐：值序列化由调用方负责，这里直接存原值 */
export function peekStorage(key: string): unknown {
  return storageMap.get(key)
}

export function clearTestStorage() {
  storageMap.clear()
}

beforeEach(() => {
  storageMap.clear()
  vi.clearAllMocks()
})
