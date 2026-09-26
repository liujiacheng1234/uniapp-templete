import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  applyAuthSession,
  clearAuthSession,
  configureAuth,
  getAuthSession,
  getAuthToken,
  isLoggedIn,
  loginWithExecutor,
  replaceAuthSessionToken,
  updateAuthSessionUser,
  type LoginUserRes,
} from '@/utils/auth'
import { AUTH_STORAGE_KEY } from '@/utils/storage'
import { peekStorage } from './setup'

/** 模拟后端登录响应 */
function fakeLoginRes(overrides: Partial<LoginUserRes> = {}): LoginUserRes {
  return {
    userToken: 'tok-abc',
    userId: 10001,
    phone: '138****0000',
    nickname: '模板用户',
    realNameVerified: false,
    status: 'normal',
    ...overrides,
  }
}

describe('本地登录态快照（utils/auth）', () => {
  beforeEach(() => {
    clearAuthSession()
  })

  it('applyAuthSession：登录返回落盘为扁平快照', () => {
    const session = applyAuthSession(fakeLoginRes())

    expect(session.userToken).toBe('tok-abc')
    expect(session.userId).toBe('10001')
    expect(session.realNameVerified).toBe(false)
    // 登录响应未提供的可选字段归一化为空串
    expect(session.avatarUrl).toBe('')
    // 落盘内容与返回值一致
    expect(peekStorage(AUTH_STORAGE_KEY)).toMatchObject({ userToken: 'tok-abc' })
  })

  it('applyAuthSession：缺 token 直接抛错', () => {
    expect(() => applyAuthSession(fakeLoginRes({ userToken: '' }))).toThrowError(
      '登录接口未返回 token'
    )
    expect(getAuthSession()).toBeNull()
  })

  it('replaceAuthSessionToken：换 token 保留旧快照字段，缺省字段不覆盖为空', () => {
    applyAuthSession(fakeLoginRes())

    const next = replaceAuthSessionToken({ userToken: 'tok-new' })

    expect(next.userToken).toBe('tok-new')
    expect(next.nickname).toBe('模板用户')
    expect(getAuthToken()).toBe('tok-new')
  })

  it('replaceAuthSessionToken：本地无快照时退化为全新落盘', () => {
    const next = replaceAuthSessionToken(fakeLoginRes({ userToken: 'tok-first' }))
    expect(next.nickname).toBe('模板用户')
  })

  it('updateAuthSessionUser：局部更新不影响 token', () => {
    applyAuthSession(fakeLoginRes())

    const next = updateAuthSessionUser({ nickname: '新昵称', realNameVerified: true })

    expect(next?.userToken).toBe('tok-abc')
    expect(next?.nickname).toBe('新昵称')
    expect(next?.realNameVerified).toBe(true)
  })

  it('updateAuthSessionUser：无会话时返回 null', () => {
    expect(updateAuthSessionUser({ nickname: 'x' })).toBeNull()
  })

  it('isLoggedIn / getAuthToken / clearAuthSession 生命周期', () => {
    expect(isLoggedIn()).toBe(false)
    applyAuthSession(fakeLoginRes())
    expect(isLoggedIn()).toBe(true)
    expect(getAuthToken()).toBe('tok-abc')
    clearAuthSession()
    expect(getAuthSession()).toBeNull()
    expect(isLoggedIn()).toBe(false)
  })
})

describe('configureAuth / loginWithExecutor（登录执行器）', () => {
  beforeEach(() => {
    clearAuthSession()
  })

  it('并发登录去重：多个调用只触发一次执行器，全部拿到同一会话', async () => {
    const executor = vi.fn().mockResolvedValue(fakeLoginRes({ userToken: 'tok-x' }))
    configureAuth(executor)

    const [a, b] = await Promise.all([loginWithExecutor(), loginWithExecutor()])

    expect(executor).toHaveBeenCalledTimes(1)
    expect(a.userToken).toBe('tok-x')
    expect(b.userToken).toBe('tok-x')
    expect(getAuthToken()).toBe('tok-x')
  })
})
