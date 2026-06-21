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

/** 跳转登录页(清 token) */
export function redirectLogin(): void {
  clearTokens()
  uni.reLaunch({ url: '/pages/login/login' })
}
