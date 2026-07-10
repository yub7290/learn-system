<template>
  <view class="page">
    <u-navbar title="确认支付" :border="true" :fixed="true" :safeAreaInsetTop="true" @leftClick="goBack">
      <view slot="left"><u-icon name="arrow-left" size="20"></u-icon></view>
    </u-navbar>
    <view class="content">
      <view class="course-info">
        <text class="course-name">{{ courseName }}</text>
        <text class="course-price">¥{{ amount.toFixed(2) }}</text>
      </view>
      <view class="pay-method">
        <text class="pay-label">支付方式</text>
        <view class="pay-option active">
          <text>余额支付（可用 ¥{{ balance.toFixed(2) }}）</text>
        </view>
      </view>
      <view class="pay-btn-wrap">
        <view :class="['pay-btn', { disabled: paying || balance < amount }]" @click="handlePay">
          {{ balance < amount ? '余额不足' : '确认支付' }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getFundSummary, createCourseOrder } from '../../api/mine'

const courseId = ref(0)
const courseName = ref('')
const amount = ref(0)
const balance = ref(0)
const paying = ref(false)

onLoad((options: any) => {
  courseId.value = Number(options?.courseId || 0)
  courseName.value = options?.courseName || '课程'
  amount.value = Number(options?.amount || 0)
  loadBalance()
})

async function loadBalance() {
  try { const data = await getFundSummary(); balance.value = data.balance } catch { /* 0 */ }
}
async function handlePay() {
  if (paying.value || balance.value < amount.value) return
  paying.value = true
  try {
    await createCourseOrder(courseId.value, 'BALANCE')
    uni.showToast({ title: '购买成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } catch (e: any) { uni.showToast({ title: e.message || '购买失败', icon: 'none' }) }
  finally { paying.value = false }
}
function goBack() { uni.navigateBack() }
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #f5f7fa; }
.content { padding: 24rpx; padding-top: 112rpx; }
.course-info { background: #fff; border-radius: 16rpx; padding: 40rpx; display: flex; justify-content: space-between; align-items: center; }
.course-name { font-size: 30rpx; color: #333; flex: 1; }
.course-price { font-size: 36rpx; font-weight: 600; color: #333; }
.pay-method { margin-top: 24rpx; background: #fff; border-radius: 16rpx; padding: 32rpx; }
.pay-label { font-size: 28rpx; color: #333; font-weight: 500; margin-bottom: 20rpx; display: block; }
.pay-option { padding: 24rpx; border: 2rpx solid #e8e8e8; border-radius: 12rpx; font-size: 28rpx; color: #333; &.active { border-color: #38daa6; background: rgba(56, 218, 166, 0.05); } }
.pay-btn-wrap { margin-top: 60rpx; }
.pay-btn { width: 100%; padding: 28rpx; text-align: center; color: #fff; font-size: 32rpx; font-weight: 500; border-radius: 12rpx; background: linear-gradient(135deg, #38daa6, #2bc18a); &.disabled { opacity: 0.5; } }
</style>
