import { defineStore } from 'pinia'
import { login as apiLogin, getUserInfo as apiGetUserInfo } from '../api/auth'
import type { StudentInfoRespVO, StudentLoginReqDTO } from '../types/auth'
import { setTokens, clearTokens, getAccessToken, getRefreshToken } from '../utils/auth'
import { StorageKey } from '../utils/storage'

interface UserState {
  userInfo: StudentInfoRespVO | null
  accessToken: string
  refreshToken: string
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: uni.getStorageSync(StorageKey.USER_INFO) || null,
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
  }),
  getters: {
    isLoggedIn: (s) => !!s.accessToken,
    displayName: (s) => s.userInfo?.nickName || s.userInfo?.name || '同学',
  },
  actions: {
    async login(req: StudentLoginReqDTO) {
      const data = await apiLogin(req)
      this.accessToken = data.accessToken
      this.refreshToken = data.refreshToken
      setTokens(data.accessToken, data.refreshToken)
      // 拉取用户信息失败不阻断登录:token 已有效,首页/onLaunch 会重试
      try {
        await this.fetchUserInfo()
      } catch (e) {
        // 忽略:登录本身已成功
      }
    },
    async fetchUserInfo() {
      const info = await apiGetUserInfo()
      this.userInfo = info
      uni.setStorageSync(StorageKey.USER_INFO, info)
    },
    logout() {
      this.userInfo = null
      this.accessToken = ''
      this.refreshToken = ''
      clearTokens()
    },
  },
})
