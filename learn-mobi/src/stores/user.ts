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
    displayName: (s) => s.userInfo?.name || '同学',
  },
  actions: {
    async login(req: StudentLoginReqDTO) {
      const data = await apiLogin(req)
      this.accessToken = data.accessToken
      this.refreshToken = data.refreshToken
      setTokens(data.accessToken, data.refreshToken)
      await this.fetchUserInfo()
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
