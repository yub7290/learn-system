<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <u-navbar title="个人中心" :border="true" :fixed="true" :safeAreaInsetTop="true" @leftClick="goBack">
      <view slot="left" class="nav-left">
        <u-icon name="arrow-left" size="20"></u-icon>
      </view>
    </u-navbar>

    <scroll-view scroll-y class="content-scroll" show-scrollbar="false">
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <image class="user-avatar" :src="userInfo.avatarUrl || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="user-base">
          <text class="user-nickname">{{ userInfo.nickname || '同学' }}</text>
          <text class="user-account">账号: {{ userInfo.id || '-' }}</text>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="section-title">基本信息</view>
      <view class="section-card">
        <view class="menu-item" @click="goPage('personalInfo')">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-blue">
              <u-icon name="account" color="#0195ff" size="18"></u-icon>
            </view>
            <text class="menu-text">个人信息</text>
          </view>
          <view class="menu-right">
            <text class="menu-desc">{{ userInfo.nickname || '' }}</text>
            <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
          </view>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-green">
              <u-icon name="phone" color="#07c160" size="18"></u-icon>
            </view>
            <text class="menu-text">联系方式</text>
          </view>
          <view class="menu-right">
            <text class="menu-desc">{{ userInfo.phone || '未设置' }}</text>
            <!-- <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon> -->
          </view>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item" @click="showChangePassword = true">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-orange">
              <u-icon name="lock" color="#ff7847" size="18"></u-icon>
            </view>
            <text class="menu-text">密码修改</text>
          </view>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
      </view>

      <!-- 其他 -->
      <view class="section-title">其他</view>
      <view class="section-card">
        <view class="menu-item" @click="goPage('loginLog')">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-blue">
              <u-icon name="order" color="#0195ff" size="18"></u-icon>
            </view>
            <text class="menu-text">登录日志</text>
          </view>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item" @click="handleShare">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-purple">
              <u-icon name="share" color="#9b59b6" size="18"></u-icon>
            </view>
            <text class="menu-text">分享</text>
          </view>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 密码修改弹窗 -->
    <u-popup :show="showChangePassword" mode="center" @close="showChangePassword = false" :round="16" :closeable="true">
      <view class="popup-body">
        <text class="popup-title">修改密码</text>

        <view class="popup-field">
          <text class="popup-label">原密码</text>
          <input class="popup-input" v-model="pwdForm.oldPassword" type="password" placeholder="请输入原密码" maxlength="20" />
        </view>
        <view class="popup-field">
          <text class="popup-label">新密码</text>
          <input class="popup-input" v-model="pwdForm.newPassword" type="password" placeholder="请输入新密码（6-20位）" maxlength="20" />
        </view>
        <view class="popup-field">
          <text class="popup-label">确认密码</text>
          <input class="popup-input" v-model="pwdForm.confirmPassword" type="password" placeholder="再次输入新密码" maxlength="20" />
        </view>

        <text class="pwd-error" v-if="pwdError">{{ pwdError }}</text>

        <u-button type="primary" shape="circle" :loading="pwdLoading" @click="handleChangePassword" class="popup-btn">确认修改</u-button>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getPersonalInfo, shareRecord, shareRegister } from '../../api/mine'
import { sm3Hash } from '../../utils/sm3'
import { http } from '../../api/request'
import { useUserStore } from '../../stores/user'
import { BASE_URL } from '../../env'
import type { PersonalInfoVO } from '../../types/mine'

const userInfo = ref<PersonalInfoVO>({
  id: 0,
  nickname: '同学',
  avatarUrl: '',
  realName: '',
  phone: '',
  email: '',
  gender: 0,
  birthday: '',
  schoolName: '',
})

const userStore = useUserStore()

async function loadUserInfo() {
  try {
    const info = await getPersonalInfo()
    userInfo.value = info
  } catch (e) {
    // 保持默认值
  }
}

onMounted(() => {
  loadUserInfo()
})

onShow(() => {
  loadUserInfo()
})

// 密码修改弹窗
const showChangePassword = ref(false)
const pwdLoading = ref(false)
const pwdForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })
const pwdError = ref('')

function checkPasswordStrength(pwd: string): { ok: boolean; msg: string } {
  const hasUpper = /[A-Z]/.test(pwd)
  const hasLower = /[a-z]/.test(pwd)
  const hasDigit = /\d/.test(pwd)
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd)
  const count = [hasUpper, hasLower, hasDigit, hasSymbol].filter(Boolean).length
  if (count >= 3) return { ok: true, msg: '' }
  const missing: string[] = []
  if (!hasUpper) missing.push('大写字母')
  if (!hasLower) missing.push('小写字母')
  if (!hasDigit) missing.push('数字')
  if (!hasSymbol) missing.push('符号')
  return { ok: false, msg: `密码缺少${missing.join('、')}，至少包含三类` }
}

function handleChangePassword() {
  pwdError.value = ''
  const { oldPassword, newPassword, confirmPassword } = pwdForm.value

  if (!oldPassword) { pwdError.value = '请输入原密码'; return }
  if (!newPassword) { pwdError.value = '请输入新密码'; return }
  if (newPassword.length < 6) { pwdError.value = '新密码不能少于6位'; return }
  if (newPassword !== confirmPassword) { pwdError.value = '两次密码输入不一致'; return }

  const strength = checkPasswordStrength(newPassword)
  if (!strength.ok) { pwdError.value = strength.msg; return }

  pwdLoading.value = true
  http.post<void>('/app/profile/changePassword', {
    oldPassword: sm3Hash(oldPassword),
    newPassword: sm3Hash(newPassword),
  }, undefined, { showError: false }).then(() => {
    pwdError.value = ''
    uni.showToast({ title: '密码修改成功', icon: 'success' })
    showChangePassword.value = false
    pwdForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  }).catch((err: any) => {
    pwdError.value = err?.message || '修改失败'
  }).finally(() => {
    pwdLoading.value = false
  })
}

function goBack() {
  uni.navigateBack()
}

function goPage(pageKey: string) {
  const pageMap: Record<string, string> = {
    personalInfo: '/pages/profile/personal-info',
    changePassword: '/pages/profile/change-password',
    loginLog: '/pages/profile/login-log',
  }
  const url = pageMap[pageKey]
  if (url) {
    uni.navigateTo({ url }).catch(() => {})
  } else {
    uni.showToast({ title: '即将上线', icon: 'none' })
  }
}

async function handleShare() {
  const userId = userStore.userInfo?.id
  if (!userId) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  const shareUrl = `${BASE_URL}/#/pages/register/register?inviter=${userId}`
  uni.showActionSheet({
    itemList: ['分享给好友', '分享到朋友圈', '复制链接'],
    success: async (res) => {
      if (res.tapIndex === 0 || res.tapIndex === 1) {
        try {
          await shareRecord()
          uni.showToast({ title: '分享成功,获得积分奖励', icon: 'success' })
        } catch {
          uni.showToast({ title: '已分享', icon: 'success' })
        }
      } else {
        uni.setClipboardData({
          data: shareUrl,
          success: () => {
            uni.showToast({ title: '链接已复制', icon: 'success' })
          },
        })
      }
    },
  })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
}

.content-scroll {
  flex: 1;
  width: 100%;
  padding-top: 64px;
  box-sizing: border-box;
}

/* 用户信息卡片 */
.user-card {
  margin: 12px 14px;
  padding: 20px 16px;
  background: $bg-card;
  border-radius: $radius-card;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-shadow: $shadow-card;
}

.user-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid $primary-bg;
  background: $bg-page;
}

.user-base {
  margin-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.user-nickname {
  font-size: 18px;
  font-weight: 600;
  color: $text-1;
}

.user-account {
  font-size: 13px;
  color: $text-3;
}

/* 分组标题 */
.section-title {
  font-size: 13px;
  color: $text-3;
  margin: 8px 14px 6px;
  padding-left: 4px;
}

/* 功能卡片 */
.section-card {
  margin: 0 14px 12px;
  background: $bg-card;
  border-radius: $radius-card;
  overflow: hidden;
  box-shadow: $shadow-card;
}

/* 菜单项 */
.menu-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 16px;
  box-sizing: border-box;
}

.menu-item:active {
  background: #f8f9fa;
}

.menu-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.menu-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-blue {
  background: #e6f4ff;
}

.icon-green {
  background: #f0f9eb;
}

.icon-orange {
  background: #fff3ec;
}

.icon-purple {
  background: #f3eef9;
}

.menu-text {
  font-size: 15px;
  color: $text-1;
}

.menu-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  max-width: 60%;
}

.menu-desc {
  font-size: 12px;
  color: $text-3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 分割线 */
.menu-divider {
  height: 1px;
  background: $border;
  margin-left: 60px;
}

.bottom-space {
  height: 30px;
  width: 100%;
}

.nav-left {
  display: flex;
  align-items: center;
  padding-left: 6px;
}

/* 密码修改弹窗 */
.popup-body {
  width: 300px;
  padding: 24px 20px 30px;
}
.popup-title {
  font-size: 18px;
  font-weight: 600;
  color: $text-1;
  text-align: center;
  display: block;
  margin-bottom: 20px;
}
.popup-field {
  margin-bottom: 14px;
}
.popup-label {
  font-size: 13px;
  color: $text-2;
  display: block;
  margin-bottom: 6px;
}
.popup-input {
  height: 44px;
  background: $bg-page;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  color: $text-1;
}
.popup-btn {
  margin-top: 8px;
}
.pwd-error {
  color: #ef4444;
  font-size: 12px;
  display: block;
  margin: 4px 0 0;
  text-align: center;
}
</style>
