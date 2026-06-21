<template>
  <view class="content">
    <image class="logo" src="/static/logo.png" />
    <text class="title">{{ title }}</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('智慧教育 - 学员端')
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.logo {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 40rpx;
}

.title {
  font-size: 36rpx;
  color: #333;
}
</style>
