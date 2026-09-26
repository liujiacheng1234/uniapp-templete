import { describe, expect, it, vi } from 'vitest'
import { getErrorMessage, useApi } from '@/composables/useApi'
import { createRequestError } from '@/api/request'
import { CommonCode } from '@/api/business-code'
import { uniMock } from './setup'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('getErrorMessage', () => {
  it('取 Error.message，空 message / 非 Error 回退 fallback', () => {
    expect(getErrorMessage(new Error('网络错误'), '兜底')).toBe('网络错误')
    expect(getErrorMessage(new Error(''), '兜底')).toBe('兜底')
    expect(getErrorMessage('str', '兜底')).toBe('兜底')
    expect(getErrorMessage(undefined)).toBe('')
  })
})

describe('useApi（统一请求调用范式）', () => {
  it('成功：托管 loading 并透传返回值', async () => {
    const { loading, run } = useApi()
    const gate = deferred<string>()

    const pending = run(() => gate.promise)
    expect(loading.value).toBe(true)

    gate.resolve('ok')
    await expect(pending).resolves.toBe('ok')
    expect(loading.value).toBe(false)
  })

  it('失败：自动 toast（文案取 error.message）并原样抛出', async () => {
    const { loading, run } = useApi({ fallbackMessage: '加载失败' })
    const gate = deferred<never>()

    const pending = run(() => gate.promise)
    gate.reject(createRequestError('余额不足'))
    await expect(pending).rejects.toThrowError('余额不足')
    expect(loading.value).toBe(false)
    expect(uniMock.showToast).toHaveBeenCalledWith({ title: '余额不足', icon: 'none' })
  })

  it('error.message 为空时使用 fallbackMessage', async () => {
    const { run } = useApi({ fallbackMessage: '加载失败' })
    await expect(run(() => Promise.reject(new Error('')))).rejects.toThrow()
    expect(uniMock.showToast).toHaveBeenCalledWith({ title: '加载失败', icon: 'none' })
  })

  it('toast: false 跳过自动提示（调用方自行 toast）', async () => {
    const { run } = useApi()
    await expect(run(() => Promise.reject(new Error('x')), { toast: false })).rejects.toThrowError(
      'x'
    )
    expect(uniMock.showToast).not.toHaveBeenCalled()
  })

  it('100999 内部异常：请求层已 toast，不再重复提示', async () => {
    const { run } = useApi()
    await expect(
      run(() =>
        Promise.reject(createRequestError('服务器异常', undefined, 200, CommonCode.INTERNAL_ERROR))
      )
    ).rejects.toThrow()
    expect(uniMock.showToast).not.toHaveBeenCalled()
  })

  it('HTTP >= 500：请求层已 toast，不再重复提示', async () => {
    const { run } = useApi()
    await expect(
      run(() => Promise.reject(createRequestError('请求失败(502)', undefined, 502)))
    ).rejects.toThrow()
    expect(uniMock.showToast).not.toHaveBeenCalled()
  })

  it('非 RequestError 的编程错误：toast 兜底并抛出', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const { run } = useApi({ fallbackMessage: '操作失败' })
      await expect(run(() => Promise.reject(new TypeError('bad code')))).rejects.toThrow()
      expect(uniMock.showToast).toHaveBeenCalledWith({ title: 'bad code', icon: 'none' })
    } finally {
      consoleError.mockRestore()
    }
  })
})
