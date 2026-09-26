import { onUnmounted, ref } from 'vue'

/**
 * 倒计时组合式（对齐 login.vue 验证码倒计时语义）：
 * `remaining` 秒数响应式递减到 0；`start()` 重置并重新计时；组件卸载自动清理定时器。
 *
 * ```ts
 * const { remaining, start } = useCountdown({ defaultSeconds: 60 })
 * const buttonText = computed(() =>
 *   remaining.value > 0 ? t('login.sms.countdown', { seconds: remaining.value }) : t('login.sms.send')
 * )
 * // 发送成功后：start()；或按后端 SMS_CODE_TOO_FREQUENT 提示的秒数 start(retrySeconds)
 * ```
 */
export function useCountdown(options: { defaultSeconds?: number } = {}) {
  const defaultSeconds = options.defaultSeconds ?? 60

  const remaining = ref(0)

  let timer: ReturnType<typeof setInterval> | null = null

  function stop() {
    if (!timer) return
    clearInterval(timer)
    timer = null
  }

  /** 开始/重置倒计时；seconds 缺省用 defaultSeconds，最少 1 秒 */
  function start(seconds: number = defaultSeconds) {
    stop()
    remaining.value = Math.max(1, Math.floor(seconds))
    timer = setInterval(() => {
      if (remaining.value <= 1) {
        remaining.value = 0
        stop()
        return
      }
      remaining.value -= 1
    }, 1000)
  }

  onUnmounted(stop)

  return { remaining, start, stop }
}
