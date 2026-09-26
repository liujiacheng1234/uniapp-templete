import { AUTH_STORAGE_KEY, getStorage, removeStorage } from '@/utils/storage'
import { matchMockRoute, MOCK_DEFAULT_DELAY_MS } from '@/mocks/handlers'
import { tStatic } from '@/locales'
import { CommonCode, UserCode } from './business-code'

/** 请求超时（ms）。uni 各端默认 60s，弱网下用户等待过久；显式收敛到 15s。
 *  超时走 fail 回调（errMsg 含 request:fail timeout），由下方统一转为「网络请求失败」错误。 */
export const REQUEST_TIMEOUT_MS = 15000

/**
 * 后端域名集中配置：唯一来源是环境变量 VITE_API_BASE_URL，代码不内置任何兑底域名。
 * - 本地联调默认值入库在 .env.development（团队共享）；个人差异用 .env.development.local 覆盖（gitignore）
 * - 构建发布必须在 .env.production.local / CI 环境提供正式 https 域名（小程序要求合法域名）
 * 每次请求时读取（而非模块常量），未配置时显式抛错，避免请求悄悄打到错误主机。
 */
function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || ''
}

// 导出供非 JSON 请求（图片上传/下载、拼接图片 src 等）复用，保持域名与鉴权头单点配置。
export function buildUrl(url: string) {
  if (/^https?:\/\//i.test(url)) {
    return url
  }

  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    throw new Error(
      'VITE_API_BASE_URL 未配置：请在 .env.development（本地联调）或 .env.production.local（构建发布）提供后端域名'
    )
  }

  return `${baseUrl}${url}`
}

// 构造鉴权请求头（userToken），供 uni.uploadFile / uni.downloadFile 等
// 绕过 request() 的请求复用。content-type 不在此设置：上传由 uni 自动设为 multipart，
// 图片二进制响应无需 json。与 performRequest 保持一致的 token 读取。
export function getAuthHeaders(auth = true): Record<string, string> {
  const headers: Record<string, string> = {}
  if (auth) {
    const token = getToken()
    if (token) {
      headers.userToken = `${token}`
    }
  }
  return headers
}

function getToken() {
  const authSession = getStorage(AUTH_STORAGE_KEY, null)
  return authSession && authSession.userToken ? authSession.userToken : ''
}

export interface RequestError extends Error {
  detail: unknown
  statusCode?: number
  code?: number
}

export function createRequestError(
  message?: string,
  detail?: unknown,
  statusCode?: number,
  code?: number
): RequestError {
  const error = new Error(message || tStatic('request.requestFailed')) as RequestError
  error.detail = detail
  error.statusCode = statusCode
  error.code = code
  return error
}

export function isRequestError(error: unknown): error is RequestError {
  return error instanceof Error && 'detail' in error
}

// 未识别系统异常统一给出安全提示。uni.showToast 单实例后调会覆盖前调，
// 调用方 catch 中的页面级友好文案仍可覆盖该兜底。
function notifyServerError(message: string) {
  uni.showToast({ title: message, icon: 'none' })
}

export interface ResultEnvelope<T = unknown> {
  code: number
  msg?: string
  data?: T
}

/** 严格按 Result.code 解包；HTTP 200 或 data 是否存在都不能代替成功业务码。 */
export function unwrapResult<T>(payload: unknown, statusCode = 200): T {
  if (
    !payload ||
    typeof payload !== 'object' ||
    typeof (payload as ResultEnvelope).code !== 'number'
  ) {
    throw createRequestError(tStatic('request.protocolError'), payload, statusCode)
  }

  const result = payload as ResultEnvelope<T>
  if (result.code !== CommonCode.SUCCESS) {
    throw createRequestError(
      result.msg || tStatic('request.businessError'),
      result,
      statusCode,
      result.code
    )
  }

  return result.data as T
}

interface RequestOptions {
  url: string
  method?: UniApp.RequestOptions['method']
  // 放宽为 object：interface 没有「隐式索引签名」，无法赋给 Record<string, unknown>，
  // 若用 Record 会让每个 POST 的 interface 请求体都必须 as 断言。object 既兼容 interface
  // 也兼容内联对象字面量，结构正确性由各请求体 interface 自身保证。
  data?: object
  header?: Record<string, string>
  auth?: boolean
  /** 内部标记：本次为登录态业务码重试，避免重登后仍失败时进入死循环 */
  _isRetry?: boolean
}

// 静默重登处理器，由 auth 层通过 setTokenRefreshHandler 注入。
// request.ts 不直接依赖 auth，以避免 request → auth → api/user → request 的循环依赖。
type TokenRefreshHandler = () => Promise<unknown>
let tokenRefreshHandler: TokenRefreshHandler | null = null

export function setTokenRefreshHandler(handler: TokenRefreshHandler | null) {
  tokenRefreshHandler = handler
}

function isUnauthorizedError(error: unknown): boolean {
  if (!isRequestError(error)) {
    return false
  }
  return error.code === UserCode.UNAUTHORIZED || error.code === UserCode.SESSION_EXPIRED
}

function isNotRegisteredError(error: unknown): boolean {
  return isRequestError(error) && error.code === UserCode.USER_NOT_REGISTERED
}

function requiresAuthentication(options: RequestOptions): boolean {
  return options.auth !== false
}

function redirectIfAuthenticationFailed(options: RequestOptions, error: unknown) {
  if (
    requiresAuthentication(options) &&
    (isUnauthorizedError(error) || isNotRegisteredError(error))
  ) {
    redirectToLogin()
  }
}

// 未注册 → reLaunch 到登录（注册）页。防止并发失败触发多次跳转；已在登录页则不再跳。
let redirectingToLogin = false
function redirectToLogin() {
  if (redirectingToLogin) {
    return
  }
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
  const current = pages[pages.length - 1] as { route?: string } | undefined
  if (current?.route && current.route.indexOf('pages/login/login') !== -1) {
    return
  }
  redirectingToLogin = true
  // 未注册意味着本地登录态无效，直接清 storage；不引入 auth 以避免 request → auth → api/user → request 循环依赖
  try {
    removeStorage(AUTH_STORAGE_KEY)
  } catch (error) {
    console.warn('清理登录态失败', error instanceof Error ? error.message : error)
  }
  uni.reLaunch({
    url: '/pages/login/login',
    complete: () => {
      redirectingToLogin = false
    },
  })
}

// 执行一次实际的 uni.request，每次调用都会重新读取最新的 token
function performRequest<T>(options: RequestOptions): Promise<T> {
  const { url, method = 'POST', data = {}, header = {}, auth = true } = options

  const token = auth ? getToken() : ''
  const requestHeader: Record<string, string> = {
    'content-type': 'application/json',
    ...header,
  }

  if (token) {
    requestHeader.userToken = `${token}`
  }

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: buildUrl(url),
      method,
      data,
      timeout: REQUEST_TIMEOUT_MS,
      header: requestHeader,
      success: (response) => {
        const statusCode = response.statusCode || 0

        if (statusCode !== 200) {
          // 普通 JSON 接口按协议固定返回 HTTP 200；非 200 属于传输层或协议异常。
          if (statusCode >= 500) {
            notifyServerError(tStatic('request.serverError'))
          }
          reject(
            createRequestError(tStatic('request.httpError', { statusCode }), response, statusCode)
          )
          return
        }

        try {
          resolve(unwrapResult<T>(response.data, statusCode))
        } catch (error) {
          if (isRequestError(error) && error.code === CommonCode.INTERNAL_ERROR) {
            notifyServerError(error.message || tStatic('request.internalError'))
          }
          reject(error)
        }
      },
      fail: (error) => {
        reject(
          createRequestError(
            error && error.errMsg ? error.errMsg : tStatic('request.networkError'),
            error
          )
        )
      },
    })
  })
}

export async function request<T = unknown>(options: RequestOptions): Promise<T> {
  // mock 短路：VITE_USE_MOCK=true 且命中 src/mocks/handlers.ts 路由时直接返回 fixture，
  // 未命中仍走真实请求，可逐个替换；不校验登录态，便于 UI 在后端未就绪时先行开发。
  const mockRoute = matchMockRoute(options.method, options.url)
  if (mockRoute) {
    await new Promise((resolve) => setTimeout(resolve, mockRoute.delay ?? MOCK_DEFAULT_DELAY_MS))
    if (mockRoute.resolve) {
      return mockRoute.resolve(options.data ?? {}) as T
    }
    return mockRoute.data as T
  }

  if (requiresAuthentication(options) && !getToken()) {
    redirectToLogin()
    throw createRequestError(
      tStatic('request.notLoggedIn'),
      undefined,
      undefined,
      UserCode.UNAUTHORIZED
    )
  }

  try {
    return await performRequest<T>(options)
  } catch (error) {
    // 鉴权请求、首次失败、判定为未授权、且已注入重登处理器时：静默重登并重试一次
    const canRetry =
      requiresAuthentication(options) &&
      !options._isRetry &&
      tokenRefreshHandler !== null &&
      isUnauthorizedError(error)

    if (!canRetry) {
      redirectIfAuthenticationFailed(options, error)
      throw error
    }

    try {
      await tokenRefreshHandler!()
    } catch (refreshError) {
      console.warn(
        '静默重登失败',
        refreshError instanceof Error ? refreshError.message : refreshError
      )
      if (requiresAuthentication(options)) {
        redirectToLogin()
      }
      throw refreshError
    }

    try {
      return await performRequest<T>({ ...options, _isRetry: true })
    } catch (retryError) {
      redirectIfAuthenticationFailed(options, retryError)
      throw retryError
    }
  }
}

export default request
