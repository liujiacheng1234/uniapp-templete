import { ref, type Ref } from 'vue'
import { CommonCode } from '@/api/business-code'
import { isRequestError } from '@/api/request'

/**
 * 统一请求调用范式：页面不再各自手写「try/catch + toast + loading」样板。
 *
 * 典型用法（替代每页重复的 getErrorMessage + finally loading 三件套）：
 *
 * ```ts
 * const toast = useToast('trip-list-toast')
 * const { loading, run } = useApi({ fallbackMessage: t('tripList.toast.loadFailed') })
 *
 * async function loadFirst() {
 *   try {
 *     const page = await run(() => getRideList(query))
 *     trips.value = page.records ?? []
 *   } catch (error) {
 *     // 失败已由 run 自动 toast（文案取 error.message，为空时用 fallbackMessage）；
 *     // 需要按业务码分支时在这里处理，无需再重复 toast
 *     if (isRequestError(error) && error.code === RideCode.VEHICLE_TOO_FAR) {
 *       // 特定分支处理
 *     }
 *   }
 * }
 * ```
 *
 * 行为约定：
 * - `loading` 在 fn 前后自动维护，配合 wd-button loading / wd-loading 使用；
 * - 失败时默认自动 `uni.showToast`（icon: none），并继续 throw，让调用方保留业务码分支能力；
 *   调用方自行 toast（如 wot useToast）时传 `{ toast: false }`；
 * - request.ts 已 toast 过的服务端兜底错误（业务码 100999 或 HTTP >= 500）不重复 toast；
 * - 登录态类错误（200001/200004/200003）由请求层静默重登或跳登录页，toast 文案对用户无意义，
 *   如需屏蔽可传 `{ toast: false }` 后自行判断。
 */

/** 从错误对象提取用户可读文案；非 Error 或空 message 时回退 fallback。 */
export function getErrorMessage(error: unknown, fallback = ''): string {
  return error instanceof Error && error.message ? error.message : fallback
}

/** request.ts 已做过服务端兜底提示的错误（内部异常 / 传输层 5xx），useApi 不再重复 toast。 */
function alreadyToastedByRequestLayer(error: unknown): boolean {
  if (!isRequestError(error)) {
    return false
  }
  if (error.code === CommonCode.INTERNAL_ERROR) {
    return true
  }
  return typeof error.statusCode === 'number' && error.statusCode >= 500
}

export interface UseApiOptions {
  /** 失败时是否自动 toast，默认 true */
  toastOnError?: boolean
  /** 兜底文案：error.message 为空时使用（建议传 i18n 文案） */
  fallbackMessage?: string
}

export interface ApiRunOptions {
  /** 单次调用覆盖 toastOnError */
  toast?: boolean
  /** 单次调用覆盖 fallbackMessage */
  fallbackMessage?: string
}

export function useApi(options: UseApiOptions = {}) {
  const { toastOnError = true, fallbackMessage = '' } = options

  const loading: Ref<boolean> = ref(false)

  /**
   * 执行一个请求（或任意 async 函数）：托管 loading，失败自动兜底 toast 后原样抛出。
   * @param fn 返回 Promise 的调用（通常是 api/* 里的函数调用包一层箭头函数以延迟执行）
   * @param runOptions 单次调用覆盖全局选项
   */
  async function run<T>(fn: () => Promise<T>, runOptions: ApiRunOptions = {}): Promise<T> {
    const shouldToast = runOptions.toast ?? toastOnError
    const fallback = runOptions.fallbackMessage ?? fallbackMessage

    loading.value = true
    try {
      return await fn()
    } catch (error) {
      if (shouldToast && !alreadyToastedByRequestLayer(error)) {
        uni.showToast({ title: getErrorMessage(error, fallback) || '请求失败', icon: 'none' })
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  return { loading, run }
}
