<template>
  <view class="bind-account">
    <u-navbar title="账号绑定" @leftClick="goBack"></u-navbar>

    <scroll-view scroll-y class="content">
      <!-- 平台卡片 -->
      <view class="platform-list">
        <!-- 微信卡片 -->
        <view class="platform-card">
          <view class="card-left">
            <view class="platform-icon wechat">
              <u-icon name="weixin-circle-fill" color="#fff" size="24"></u-icon>
            </view>
            <view class="platform-info">
              <view class="platform-name">微信</view>
              <view class="bind-status" :class="{ bound: bindStatus.wechat?.bound }">
                <view v-if="bindStatus.wechat?.bound" class="status-dot bound"></view>
                <view v-else class="status-dot"></view>
                {{ bindStatus.wechat?.bound ? bindStatus.wechat.nickname : '未绑定' }}
              </view>
            </view>
          </view>
          <view class="card-right">
            <text v-if="bindStatus.wechat?.bound" class="btn-action btn-unbind" @click="handleUnbind('wechat')">解绑</text>
            <text v-else class="btn-action btn-bind" @click="handleBind('wechat')">立即绑定</text>
          </view>
        </view>

        <!-- QQ卡片 -->
        <view class="platform-card">
          <view class="card-left">
            <view class="platform-icon qq">
              <u-icon name="qq-circle-fill" color="#fff" size="24"></u-icon>
            </view>
            <view class="platform-info">
              <view class="platform-name">QQ</view>
              <view class="bind-status" :class="{ bound: bindStatus.qq?.bound }">
                <view v-if="bindStatus.qq?.bound" class="status-dot bound"></view>
                <view v-else class="status-dot"></view>
                {{ bindStatus.qq?.bound ? bindStatus.qq.nickname : '未绑定' }}
              </view>
            </view>
          </view>
          <view class="card-right">
            <text v-if="bindStatus.qq?.bound" class="btn-action btn-unbind" @click="handleUnbind('qq')">解绑</text>
            <text v-else class="btn-action btn-bind" @click="handleBind('qq')">立即绑定</text>
          </view>
        </view>
      </view>

      <!-- 安全提示 -->
      <view class="security-tip">
        <view class="tip-icon">
          <u-icon name="info-circle" color="#0195ff" size="14"></u-icon>
        </view>
        <view class="tip-content">
          <view class="tip-title">绑定须知</view>
          <view class="tip-text">首次授权将自动创建账号，绑定后可使用第三方账号快捷登录系统</view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getOAuthBindUrl, getOAuthBindStatus, unbindOAuth } from '../../api/mine'
import type { OAuthBindStatusVO } from '../../types/mine'

const bindStatus = ref<OAuthBindStatusVO>({
  wechat: { bound: false },
  qq: { bound: false },
})

onMounted(loadStatus)

async function loadStatus() {
  try {
    bindStatus.value = await getOAuthBindStatus()
  } catch (e) {
    // toast handled by request layer
  }
}

async function handleBind(platform: string) {
  try {
    const res = await getOAuthBindUrl(platform)
    if (res.url) {
      window.location.href = res.url
    }
  } catch (e) {
    // toast handled by request layer
  }
}

function handleUnbind(platform: string) {
  const name = platform === 'wechat' ? '微信' : 'QQ'
  uni.showModal({
    title: '确认解绑',
    content: `确定要解绑${name}账号吗？解绑后将无法使用${name}快捷登录。`,
    confirmColor: '#fa3534',
    success: async (res) => {
      if (res.confirm) {
        try {
          await unbindOAuth(platform)
          uni.showToast({ title: '解绑成功', icon: 'success' })
          loadStatus()
        } catch (e) {
          // toast handled by request layer
        }
      }
    },
  })
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.bind-account {
  min-height: 100vh;
  background: #f0f4f8;
}
.content {
  padding: 64px 14px 0px 14px;
  box-sizing: border-box;
}

/* 平台卡片列表 */
.platform-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.platform-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 18px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.03);
}
.card-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}
.platform-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  &.wechat {
    background: linear-gradient(135deg, #07c160, #06ae56);
    box-shadow: 0 4px 12px rgba(7, 193, 96, 0.3);
  }
  &.qq {
    background: linear-gradient(135deg, #12b7f5, #0ea5e9);
    box-shadow: 0 4px 12px rgba(18, 183, 245, 0.3);
  }
}
.platform-info {
  flex: 1;
  min-width: 0;
}
.platform-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a2332;
  line-height: 1.2;
}
.bind-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #94a3b8;
  margin-top: 4px;
  &.bound {
    color: #07c160;
    font-weight: 500;
  }
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d1d5db;
  &.bound {
    background: #07c160;
    box-shadow: 0 0 6px rgba(7, 193, 96, 0.4);
  }
}
.card-right {
  flex-shrink: 0;
  margin-left: 12px;
}

/* 按钮 */
.btn-action {
  display: inline-block;
  font-size: 13px;
  font-weight: 500;
  padding: 7px 18px;
  border-radius: 20px;
  letter-spacing: 0.3px;
}
.btn-bind {
  color: #ffffff;
  background: linear-gradient(135deg, #0195ff, #00c6ff);
  box-shadow: 0 3px 10px rgba(1, 149, 255, 0.3);
}
.btn-unbind {
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

/* 安全提示 */
.security-tip {
  display: flex;
  gap: 10px;
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-top: 20px;
  border: 1px solid rgba(1, 149, 255, 0.1);
}
.tip-icon {
  flex-shrink: 0;
  margin-top: 1px;
}
.tip-content {
  flex: 1;
}
.tip-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a2332;
  line-height: 1.2;
}
.tip-text {
  font-size: 12px;
  color: #7a8b9a;
  margin-top: 3px;
  line-height: 1.5;
}
</style>
