import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildUrl,
  createRequestError,
  getAuthHeaders,
  isRequestError,
  request,
  unwrapResult,
} from '@/api/request'
import { CommonCode, UserCode } from '@/api/business-code'
import { AUTH_STORAGE_KEY, setStorage } from '@/utils/storage'
import { clearTestStorage, uniMock } from './setup'

describe('unwrapResult（Result 信封解包）', () => {
  it('code=200 时返回 data 字段', () => {
    expect(unwrapResult({ code: 200, data: { a: 1 } })).toEqual({ a: 1 })
  })

  it('非对象 / 缺 code 视为协议异常', () => {
    expect(() => unwrapResult(null)).toThrowError('响应协议异常')
    expect(() => unwrapResult('str')).toThrowError('响应协议异常')
    expect(() => unwrapResult({ msg: 'no code' })).toThrowError('响应协议异常')
  })

  it('业务失败码抛 RequestError 且携带 code 与原始信封', () => {
    const envelope = { code: UserCode.UNAUTHORIZED, msg: '未登录' }
    try {
      unwrapResult(envelope)
      expect.unreachable('应当抛出')
    } catch (error) {
      expect(isRequestError(error)).toBe(true)
      expect((error as { code?: number }).code).toBe(UserCode.UNAUTHORIZED)
      expect((error as { message: string }).message).toBe('未登录')
    }
  })

  it('失败无 msg 时使用兜底文案', () => {
    try {
      unwrapResult({ code: 300001 })
      expect.unreachable('应当抛出')
    } catch (error) {
      expect((error as { message: string }).message).toBe('业务处理失败')
    }
  })
})

describe('createRequestError / isRequestError', () => {
  it('构造的错误带 detail/statusCode/code 且能被类型守卫识别', () => {
    const error = createRequestError('失败', { raw: true }, 500, 100999)
    expect(isRequestError(error)).toBe(true)
    expect(error.statusCode).toBe(500)
    expect(error.code).toBe(100999)
    expect(error.detail).toEqual({ raw: true })
  })

  it('普通 Error 不被识别为 RequestError', () => {
    expect(isRequestError(new Error('x'))).toBe(false)
    expect(isRequestError('str')).toBe(false)
  })
})

describe('buildUrl / getAuthHeaders', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('相对路径拼接 baseUrl', () => {
    expect(buildUrl('/api/example/orders')).toBe('https://api.example.com/api/example/orders')
  })

  it('绝对地址原样返回', () => {
    expect(buildUrl('https://other.com/a.png')).toBe('https://other.com/a.png')
  })

  it('未配置 VITE_API_BASE_URL 时显式抛错（不悄悄打错主机）', () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    expect(() => buildUrl('/api/x')).toThrowError('VITE_API_BASE_URL 未配置')
  })

  it('getAuthHeaders 从登录态读取 userToken；auth=false 时不带', () => {
    setStorage(AUTH_STORAGE_KEY, { userToken: 'tok-1' })
    expect(getAuthHeaders(true)).toEqual({ userToken: 'tok-1' })
    expect(getAuthHeaders(false)).toEqual({})
  })
})

describe('request（请求主流程）', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
    // 默认带登录态，专门验证无 token 行为的用例自行 clearTestStorage()
    setStorage(AUTH_STORAGE_KEY, { userToken: 'tok-test' })
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  function mockResponse(statusCode: number, data: unknown) {
    uniMock.request.mockImplementationOnce(
      (options: {
        success?: (res: { statusCode: number; data: unknown }) => void
        fail?: (err: { errMsg: string }) => void
      }) => {
        options.success?.({ statusCode, data })
      }
    )
  }

  it('成功：解包 data 并注入 userToken 请求头', async () => {
    setStorage(AUTH_STORAGE_KEY, { userToken: 'tok-9' })
    mockResponse(200, { code: 200, data: { ok: 1 } })

    const data = await request<{ ok: number }>({ url: '/api/x' })

    expect(data).toEqual({ ok: 1 })
    const call = uniMock.request.mock.calls[0][0] as { header: Record<string, string>; url: string }
    expect(call.header.userToken).toBe('tok-9')
    expect(call.header['content-type']).toBe('application/json')
    expect(call.url).toBe('https://api.example.com/api/x')
  })

  it('业务失败：reject 携带业务码，且非 100999 不重复 toast', async () => {
    mockResponse(200, { code: 300002, msg: '资源不存在' })
    await expect(request({ url: '/api/x' })).rejects.toMatchObject({ code: 300002 })
    expect(uniMock.showToast).not.toHaveBeenCalled()
  })

  it('内部异常（100999）：请求层统一 toast 兜底', async () => {
    mockResponse(200, { code: CommonCode.INTERNAL_ERROR, msg: '服务器异常' })
    await expect(request({ url: '/api/x' })).rejects.toMatchObject({
      code: CommonCode.INTERNAL_ERROR,
    })
    expect(uniMock.showToast).toHaveBeenCalledTimes(1)
  })

  it('HTTP 5xx：toast 服务异常并 reject statusCode', async () => {
    mockResponse(502, null)
    await expect(request({ url: '/api/x' })).rejects.toMatchObject({ statusCode: 502 })
    expect(uniMock.showToast).toHaveBeenCalledTimes(1)
  })

  it('无 token 的鉴权请求：直接拒绝并跳转登录页', async () => {
    clearTestStorage()
    await expect(request({ url: '/api/x' })).rejects.toMatchObject({
      code: UserCode.UNAUTHORIZED,
    })
    expect(uniMock.reLaunch).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/pages/login/login' })
    )
    // 未发起真实请求
    expect(uniMock.request).not.toHaveBeenCalled()
  })

  it('auth: false 的请求不要求登录态', async () => {
    mockResponse(200, { code: 200, data: null })
    const data = await request<null>({ url: '/api/open', auth: false })
    expect(data).toBeNull()
    const call = uniMock.request.mock.calls[0][0] as { header: Record<string, string> }
    expect(call.header.userToken).toBeUndefined()
  })

  it('VITE_USE_MOCK=true 时命中 mock 路由直接短路（resolve 按请求体计算）', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'true')
    try {
      const data = await request<{ total: number; records: unknown[] }>({
        url: '/api/example/orders',
        method: 'POST',
        data: { page: 1, pageSize: 10 },
      })
      expect(data.total).toBe(23)
      expect(data.records).toHaveLength(10)
      expect(uniMock.request).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllEnvs()
    }
  })
})
