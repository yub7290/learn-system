<template>
  <view class="page">
    <u-navbar title="登录日志" :border="true" :fixed="true" :safeAreaInsetTop="true" @leftClick="goBack">
      <view slot="left" class="nav-left">
        <u-icon name="arrow-left" size="20"></u-icon>
      </view>
    </u-navbar>

    <scroll-view scroll-y class="list-scroll" show-scrollbar="false">
      <view class="log-list" v-if="logList.length > 0">
        <view class="log-item" v-for="(item, idx) in logList" :key="idx">
          <view class="log-status">
            <view class="status-dot" :class="item.status === 1 ? 'dot-success' : 'dot-fail'"></view>
          </view>
          <view class="log-info">
            <view class="log-row">
              <text :class="item.status === 1 ? 'text-success' : 'text-fail'">
                {{ item.status === 1 ? '登录成功' : '登录失败' }}
              </text>
              <text class="log-time">{{ item.createTime }}</text>
            </view>
            <view class="log-detail">
              <text class="log-ip">IP: {{ item.ip || '-' }}</text>
              <text class="log-device" v-if="item.userAgent">{{ item.userAgent }}</text>
              <text class="log-error" v-if="item.status === 0 && item.errorMsg">{{ item.errorMsg }}</text>
            </view>
          </view>
        </view>
      </view>

      <u-empty v-if="logList.length === 0 && !loading" text="暂无登录记录" mode="list" :marginTop="60"></u-empty>
      <view class="loading-tip" v-if="loading">加载中...</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getLoginLogList } from '../../api/mine'
import type { LoginLogVO } from '../../types/mine'

const logList = ref<LoginLogVO[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    logList.value = await getLoginLogList()
  } catch (e) {
    console.error('获取登录日志失败', e)
  } finally {
    loading.value = false
  }
})

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
}
.list-scroll {
  width: 100%;
  padding: 56px 14px 0;
  box-sizing: border-box;
}
.loading-tip {
  padding: 30px 0;
  text-align: center;
  font-size: 14px;
  color: $text-3;
}
.log-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 20px;
}
.log-item {
  display: flex;
  flex-direction: row;
  background: $bg-card;
  border-radius: $radius-card;
  padding: 14px;
  box-shadow: $shadow-card;
  gap: 12px;
}
.log-status {
  padding-top: 2px;
}
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 4px;
}
.dot-success { background: #10b981; }
.dot-fail { background: #ef4444; }
.log-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.log-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.text-success { font-size: 14px; font-weight: 500; color: #10b981; }
.text-fail { font-size: 14px; font-weight: 500; color: #ef4444; }
.log-time { font-size: 12px; color: $text-3; }
.log-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.log-ip, .log-error { font-size: 12px; color: $text-3; }
.log-device {
  font-size: 11px;
  color: $text-3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nav-left {
  display: flex;
  align-items: center;
  padding-left: 6px;
}
</style>
