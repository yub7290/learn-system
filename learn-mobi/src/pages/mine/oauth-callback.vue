<template>
  <view class="callback-page">
    <view class="callback-card">
      <u-icon v-if="status === 'success'" name="checkmark-circle-fill" color="#19be6b" size="64"></u-icon>
      <u-icon v-else-if="status === 'error'" name="close-circle-fill" color="#fa3534" size="64"></u-icon>
      <u-icon v-else name="loading" color="#0195ff" size="64"></u-icon>

      <view class="title">{{ statusTitle }}</view>
      <view class="desc">{{ statusDesc }}</view>

      <u-button type="primary" shape="circle" @click="goBack"
        custom-style="margin-top:30px;width:200px;height:42px;background:linear-gradient(135deg,#0195ff,#00c6ff);border:none">
        {{ status === 'loginSuccess' ? '进入首页' : '返回' }}
      </u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../../stores/user'
import { setTokens } from '../../utils/auth'

const userStore = useUserStore()
const status = ref('')
const platform = ref('')
const errorMsg = ref('')

const statusTitle = computed(() => {
  if (status.value === 'success') return '绑定成功'
  if (status.value === 'loginSuccess') return '登录成功'
  return '操作失败'
})

const statusDesc = computed(() => {
  if (status.value === 'success') {
    const name = platform.value === 'wechat' ? '微信' : 'QQ'
    return `已成功绑定${name}账号`
  }
  if (status.value === 'loginSuccess') return '正在跳转...'
  return errorMsg.value || '操作失败，请重试'
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const options = currentPage.$page?.options || currentPage.options || {}

  status.value = options.status || 'error'
  platform.value = options.platform || ''
  errorMsg.value = decodeURIComponent(options.message || '')

  // 登录成功：存储token
  if (status.value === 'loginSuccess' && options.accessToken) {
    setTokens(options.accessToken, options.refreshToken)
    userStore.fetchUserInfo()
  }
})

function goBack() {
  if (status.value === 'loginSuccess') {
    uni.reLaunch({ url: '/pages/index/index' })
  } else {
    uni.navigateBack()
  }
}
</script>

<style scoped lang="scss">
.callback-page {
  min-height: 100vh;
  background: $bg-page;
  display: flex;
  align-items: center;
  justify-content: center;
}
.callback-card {
  background: $bg-card;
  border-radius: 16px;
  padding: 40px 30px;
  text-align: center;
  margin: 0 30px;
  box-shadow: $shadow-card;
}
.title {
  font-size: 18px;
  font-weight: 700;
  color: $text-1;
  margin-top: 20px;
}
.desc {
  font-size: 14px;
  color: $text-3;
  margin-top: 8px;
}
</style>
