<template>
  <view class="mine-page">
    <view class="user-card">
      <image class="avatar" :src="user.avatarUrl" v-if="user.avatarUrl"></image>
      <view class="avatar ph" v-else></view>
      <view class="user-info">
        <text class="u-name">{{ user.name || '未登录' }}</text>
        <text class="u-meta">学号:{{ user.studentNo || '-' }} · {{ user.major || '' }}</text>
      </view>
      <u-icon name="setting" color="#fff" size="20"></u-icon>
    </view>

    <view class="stats-card">
      <view class="stat"><text class="s-num">{{ stats.courseCount || 0 }}</text><text class="s-label">在学课程</text></view>
      <view class="divider"></view>
      <view class="stat"><text class="s-num">{{ stats.studyHours || 0 }}h</text><text class="s-label">累计学时</text></view>
      <view class="divider"></view>
      <view class="stat"><text class="s-num">{{ stats.certCount || 0 }}</text><text class="s-label">获得证书</text></view>
    </view>

    <u-cell-group :border="false" custom-style="border-radius:14px;overflow:hidden;margin:12px 14px 0;box-shadow:0 2px 10px rgba(0,0,0,.04)">
      <u-cell icon="bookmark" title="我的课程" isLink @click="todo"></u-cell>
      <u-cell icon="clock" title="学习记录" isLink @click="todo"></u-cell>
      <u-cell icon="heart" title="我的收藏" isLink @click="todo"></u-cell>
      <u-cell icon="edit-pen" title="我的笔记" isLink @click="todo"></u-cell>
    </u-cell-group>

    <u-cell-group :border="false" custom-style="border-radius:14px;overflow:hidden;margin:12px 14px 0;box-shadow:0 2px 10px rgba(0,0,0,.04)">
      <u-cell icon="account" title="个人信息" isLink @click="todo"></u-cell>
      <u-cell icon="setting" title="账号设置" isLink @click="todo"></u-cell>
      <u-cell icon="info-circle" title="关于我们" isLink @click="todo"></u-cell>
      <u-cell icon="reload" title="退出登录" isLink @click="logout"></u-cell>
    </u-cell-group>

    <TabBar :current="4"></TabBar>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import TabBar from '../../components/TabBar.vue'
import { useUserStore } from '../../stores/user'
import { getStudyStats } from '../../api/study'
import { redirectLogin } from '../../utils/auth'
import type { StudyStatsVO } from '../../types/study'

const userStore = useUserStore()
const user = ref(userStore.userInfo || {} as any)
const stats = ref<StudyStatsVO>({ courseCount: 0, studyHours: 0, certCount: 0 })

onShow(async () => {
  if (userStore.isLoggedIn) {
    user.value = userStore.userInfo || {} as any
    try { stats.value = await getStudyStats() } catch (e) { /* stub => zeros */ }
  } else {
    redirectLogin()
  }
})

function todo() { uni.showToast({ title: '即将上线', icon: 'none' }) }
function logout() {
  uni.showModal({ title: '提示', content: '确定退出登录?', showCancel: true }).then((res: any) => {
    if (res.confirm) { userStore.logout(); redirectLogin() }
  })
}
</script>

<style scoped lang="scss">
.mine-page { min-height: 100vh; padding-bottom: 20px; }
.user-card { background: linear-gradient(135deg,$primary,$primary-light); padding: 24px 18px 40px; display: flex; align-items: center; gap: 14px; color: #fff; }
.avatar { width: 60px; height: 60px; border-radius: 50%; border: 2px solid rgba(255,255,255,.5); }
.avatar.ph { background: rgba(255,255,255,.25); }
.user-info { flex: 1; }
.u-name { font-size: 18px; font-weight: 700; }
.u-meta { font-size: 12px; opacity: .85; margin-top: 4px; }
.stats-card { background: $bg-card; margin: -26px 14px 0; border-radius: $radius-card; padding: 16px 6px; display: flex; box-shadow: 0 6px 20px rgba(1,149,255,.22); position: relative; }
.stat { flex: 1; text-align: center; }
.s-num { display: block; font-size: 22px; font-weight: 700; color: $primary; }
.s-label { font-size: 11px; color: $text-3; margin-top: 4px; }
.divider { width: 1px; background: $border; }
</style>
