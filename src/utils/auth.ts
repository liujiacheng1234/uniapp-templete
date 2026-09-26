import { setTokenRefreshHandler } from '@/api/request'
import { tStatic } from '@/locales'
import { AUTH_STORAGE_KEY, getStorage, removeStorage, setStorage } from './storage'

/**
 * 本地登录态：登录接口落盘后的扁平快照。
 * 供请求层取 token、页面首屏填充等使用；token 字段为 userToken。
 *
 * 与具体登录方式（微信 code / 账号密码 / 短信）解耦：
 * - 登录接口返回什么，经 applyAuthSession 归一化落盘；
 * - 静默重登的执行器由应用入口（main.ts）经 configureAuth 注入。
 */
export interface LoginUserRes {
  userToken: string
  userId?: number | string | null
  phone?: string | null
  nickname?: string | null
  avatarUrl?: string | null
  realNameVerified?: boolean | null
  status?: string | null
}

export interface AuthSession {
  userToken: string
  userId: string
  phone: string
  nickname: string
  avatarUrl: string
  realNameVerified: boolean
  status: string
  loginAt: number
}

let loginExecutor: (() => Promise<LoginUserRes>) | null = null
let loginPromise: Promise<AuthSession> | null = null

/**
 * 注入登录执行器（应用入口调用一次，见 src/main.ts）。
 * 请求层收到 UNAUTHORIZED / SESSION_EXPIRED 业务码时会调用它静默重登并重试一次；
 * 主动登录也可复用 loginWithExecutor（内部并发去重，多个并发失败只触发一次登录）。
 */
export function configureAuth(executor: () => Promise<LoginUserRes>) {
  loginExecutor = executor
  setTokenRefreshHandler(() => loginWithExecutor())
}

/** 用注入的执行器执行登录并落盘（带并发去重） */
export async function loginWithExecutor(): Promise<AuthSession> {
  if (!loginExecutor) {
    throw new Error(tStatic('request.loginExecutorMissing'))
  }
  if (loginPromise) {
    return loginPromise
  }
  loginPromise = (async () => applyAuthSession(await loginExecutor!()))()
  try {
    return await loginPromise
  } finally {
    loginPromise = null
  }
}

function normalizeAuthSession(data: LoginUserRes): AuthSession {
  return {
    userToken: String(data?.userToken ?? ''),
    userId: String(data?.userId ?? ''),
    phone: String(data?.phone ?? ''),
    nickname: String(data?.nickname ?? ''),
    avatarUrl: String(data?.avatarUrl ?? ''),
    realNameVerified: Boolean(data?.realNameVerified),
    status: String(data?.status ?? 'normal'),
    loginAt: Date.now(),
  }
}

/**
 * 将登录接口返回写入本地登录态，统一走这里落盘。
 * 字段与后端约定不一致时（如登录响应缺 avatarUrl），先调整 LoginUserRes / 后端，勿在此拼接业务逻辑。
 */
export function applyAuthSession(loginData: LoginUserRes): AuthSession {
  if (!loginData?.userToken) {
    throw new Error(tStatic('request.loginNoToken'))
  }
  const authSession = normalizeAuthSession(loginData)
  setStorage(AUTH_STORAGE_KEY, authSession)
  return authSession
}

/**
 * 换发 token 只保证返回新的 userToken，其他用户字段可能缺省：
 * 保留现有快照字段，避免把未返回的字段覆盖为空。
 */
export function replaceAuthSessionToken(loginData: LoginUserRes) {
  if (!loginData?.userToken) {
    throw new Error(tStatic('request.loginNoToken'))
  }

  const session = getAuthSession()
  if (!session) {
    return applyAuthSession(loginData)
  }

  const nextSession: AuthSession = {
    ...session,
    userToken: String(loginData.userToken),
    loginAt: Date.now(),
  }
  if (loginData.userId != null) nextSession.userId = String(loginData.userId)
  if (loginData.phone != null) nextSession.phone = String(loginData.phone)
  if (loginData.nickname != null) nextSession.nickname = String(loginData.nickname)
  if (loginData.avatarUrl != null) nextSession.avatarUrl = String(loginData.avatarUrl)
  if (loginData.realNameVerified != null)
    nextSession.realNameVerified = Boolean(loginData.realNameVerified)
  if (loginData.status != null) nextSession.status = String(loginData.status)

  setStorage(AUTH_STORAGE_KEY, nextSession)
  return nextSession
}

export function getAuthSession(): AuthSession | null {
  return getStorage(AUTH_STORAGE_KEY, null)
}

export function getAuthToken(): string {
  const authSession = getAuthSession()
  return authSession && authSession.userToken ? authSession.userToken : ''
}

export function isLoggedIn(): boolean {
  return Boolean(getAuthToken())
}

export function clearAuthSession() {
  return removeStorage(AUTH_STORAGE_KEY)
}

/** 局部更新本地登录态里的用户字段（如绑定手机号、改昵称后同步），token 与 loginAt 不在此修改 */
export function updateAuthSessionUser(patch: Partial<Omit<AuthSession, 'userToken' | 'loginAt'>>) {
  const session = getAuthSession()
  if (!session) {
    return null
  }
  const nextSession = { ...session, ...patch }
  setStorage(AUTH_STORAGE_KEY, nextSession)
  return nextSession
}
