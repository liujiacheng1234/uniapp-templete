<script setup lang="ts">
/**
 * 登录示例 —— 演示骨架的登录链路：
 * 表单校验 → api（mock）→ applyAuthSession 落盘 → 跳转首页；
 * 已登录态展示会话快照 + 退出登录。
 *
 * 接入真实项目：把 main.ts 的 configureAuth 执行器换成真实登录（如微信 code 登录），
 * 本页替换为对应 UI；请求层的鉴权头注入 / 静默重登 / 登录守卫无需改动。
 */
import { computed, ref } from 'vue'
import { useToast } from '@wot-ui/ui'
import { useAppI18n } from '@/composables/useAppI18n'
import { useApi } from '@/composables/useApi'
import {
  applyAuthSession,
  clearAuthSession,
  getAuthSession,
  isLoggedIn,
  type AuthSession,
} from '@/utils/auth'
import { loginByAccount } from '@/api/example'
import { formatDateTime } from '@/utils/commonUtil'

const { t } = useAppI18n()
const toast = useToast('login-toast')
const { loading: submitting, run } = useApi({ fallbackMessage: () => t('login.toast.loginFailed') })

const session = ref<AuthSession | null>(getAuthSession())
const loggedIn = computed(() => isLoggedIn())

const username = ref('')
const password = ref('')
const fieldErrors = ref<{ username?: string; password?: string }>({})

const sessionRows = computed(() => {
  const s = session.value
  if (!s) return []
  return [
    { label: 'nickname', value: s.nickname || '--' },
    { label: 'phone', value: s.phone || '--' },
    { label: 'userId', value: s.userId || '--' },
    { label: 'loginAt', value: formatDateTime(new Date(s.loginAt).toISOString()) },
  ]
})

function validate(): boolean {
  const errors: { username?: string; password?: string } = {}
  if (!username.value.trim()) {
    errors.username = t('login.validation.usernameRequired')
  }
  if (!password.value) {
    errors.password = t('login.validation.passwordRequired')
  } else if (password.value.length < 6) {
    errors.password = t('login.validation.passwordMin')
  }
  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function onSubmit() {
  if (submitting.value || !validate()) return

  try {
    const loginRes = await run(() =>
      loginByAccount({ username: username.value.trim(), password: password.value })
    )
    session.value = applyAuthSession(loginRes)
    toast.success(t('login.loggedIn'))
    setTimeout(() => uni.reLaunch({ url: '/pages/index/index' }), 600)
  } catch {
    // 失败已由 useApi 统一 toast；真实登录失败码在此分支处理（如密码错误）
  }
}

function onLogout() {
  clearAuthSession()
  session.value = null
  username.value = ''
  password.value = ''
  toast.info(t('login.toast.logoutDone'))
}
</script>

<template>
  <view class="login">
    <wd-toast selector="login-toast" />

    <text class="login-intro wot-text-text-secondary">{{ t('login.intro') }}</text>

    <!-- 已登录：会话快照 -->
    <view v-if="loggedIn" class="card">
      <view class="card-head">
        <text class="card-title wot-text-text-main">{{ t('login.loggedIn') }}</text>
        <wd-button size="small" plain @click="onLogout">{{ t('login.logout') }}</wd-button>
      </view>
      <view class="rows">
        <view v-for="row in sessionRows" :key="row.label" class="row">
          <text class="row-label wot-text-text-secondary">{{ row.label }}</text>
          <text class="row-value wot-text-text-main">{{ row.value }}</text>
        </view>
      </view>
    </view>

    <!-- 未登录：登录表单 -->
    <view v-else class="card">
      <wd-input
        v-model="username"
        :label="t('login.username')"
        :placeholder="t('login.usernamePlaceholder')"
        clearable
        no-border
        custom-class="login-input"
      />
      <text v-if="fieldErrors.username" class="field-error">{{ fieldErrors.username }}</text>

      <wd-input
        v-model="password"
        :label="t('login.password')"
        :placeholder="t('login.passwordPlaceholder')"
        show-password
        clearable
        no-border
        custom-class="login-input"
      />
      <text v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</text>

      <wd-button block :loading="submitting" @click="onSubmit">
        {{ submitting ? t('login.submitting') : t('login.submit') }}
      </wd-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.login {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
  background-color: var(--wot-filled-bottom);
}

.login-intro {
  display: block;
  padding: 8rpx 8rpx 24rpx;
  font-size: 24rpx;
  line-height: 38rpx;
}

.card {
  padding: 32rpx;
  border-radius: 24rpx;
  background-color: var(--wot-filled-oppo);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
}

.login-input {
  background-color: var(--wot-filled-content);
  border-radius: 16rpx;
  padding: 8rpx 16rpx;
}

.field-error {
  font-size: 22rpx;
  color: var(--wot-danger-main);
  margin: -12rpx 0 0 8rpx;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.row {
  display: flex;
  justify-content: space-between;
}

.row-label {
  font-size: 24rpx;
}

.row-value {
  font-size: 24rpx;
  font-weight: 500;
}
</style>
