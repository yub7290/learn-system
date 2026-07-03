import { StorageKey } from './storage'

export function getAccessToken(): string {
  return uni.getStorageSync(StorageKey.ACCESS_TOKEN) || ''
}

export function getRefreshToken(): string {
  return uni.getStorageSync(StorageKey.REFRESH_TOKEN) || ''
}

export function setTokens(accessToken: string, refreshToken: string): void {
  uni.setStorageSync(StorageKey.ACCESS_TOKEN, accessToken)
  uni.setStorageSync(StorageKey.REFRESH_TOKEN, refreshToken)
}

export function clearTokens(): void {
  uni.removeStorageSync(StorageKey.ACCESS_TOKEN)
  uni.removeStorageSync(StorageKey.REFRESH_TOKEN)
  uni.removeStorageSync(StorageKey.USER_INFO)
}

export function isLoggedIn(): boolean {
  return !!getAccessToken()
}

/** 跳转登录页 */
export function goLogin(): void {
  uni.navigateTo({ url: '/pages/login/login' }).catch(() => {
    uni.reLaunch({ url: '/pages/login/login' })
  })
}

/** 需要用户信息时提示登录 */
export function requireLogin(message = '该功能需要登录后使用'): boolean {
  if (isLoggedIn()) return true
  uni.showModal({
    title: '需要登录',
    content: message,
    confirmText: '去登录',
    cancelText: '暂不登录',
    success: (res) => {
      if (res.confirm) goLogin()
    },
  })
  return false
}

/** 跳转登录页(清 token) */
export function redirectLogin(): void {
  clearTokens()
  goLogin()
}
