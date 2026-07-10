<template>
  <view class="page">
    <u-navbar title="充值" :border="true" :fixed="true" :safeAreaInsetTop="true" @leftClick="goBack">
      <view slot="left"><u-icon name="arrow-left" size="20"></u-icon></view>
    </u-navbar>
    <scroll-view scroll-y class="content-scroll" show-scrollbar="false">
      <view class="section">
        <text class="section-title">充值金额</text>
        <view class="amount-grid">
          <view v-for="item in presetAmounts" :key="item"
            :class="['amount-item', { active: selectedAmount === item && !customAmount }]"
            @click="selectPreset(item)">
            <text class="amount-text">¥{{ item }}</text>
          </view>
        </view>
        <view class="custom-input-wrap">
          <text class="unit">¥</text>
          <input class="custom-input" type="digit" placeholder="自定义金额（最低1元）" v-model="customAmount" @input="onCustomInput" />
        </view>
      </view>
      <view class="bottom-space"></view>
    </scroll-view>
    <view class="bottom-bar">
      <view :class="['recharge-btn', { disabled: !canRecharge }]" @click="handleRecharge">确认充值</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { createRechargeOrder } from '../../api/mine'

const presetAmounts = [10, 30, 50, 100, 200, 500]
const selectedAmount = ref(0)
const customAmount = ref('')
const paying = ref(false)

const finalAmount = computed(() => {
  if (customAmount.value) return parseFloat(customAmount.value) || 0
  return selectedAmount.value
})
const canRecharge = computed(() => finalAmount.value >= 1 && !paying.value)

function selectPreset(amount: number) { selectedAmount.value = amount; customAmount.value = '' }
function onCustomInput() { selectedAmount.value = 0 }
async function handleRecharge() {
  if (!canRecharge.value) return
  paying.value = true
  try {
    const res = await createRechargeOrder(finalAmount.value)
    if (res.success && res.payUrl) { window.location.href = res.payUrl }
    else { uni.showToast({ title: res.payUrl || '支付发起失败', icon: 'none' }) }
  } catch (e: any) { uni.showToast({ title: e.message || '支付发起失败', icon: 'none' }) }
  finally { paying.value = false }
}
function goBack() { uni.navigateBack() }
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #f5f7fa; position: relative; }
.content-scroll { height: calc(100vh - 140rpx); padding-top: 88rpx; }
.section { margin: 24rpx; padding: 32rpx; background: #fff; border-radius: 16rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: #333; margin-bottom: 24rpx; display: block; }
.amount-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20rpx; margin-bottom: 24rpx; }
.amount-item { padding: 28rpx; text-align: center; border: 2rpx solid #e8e8e8; border-radius: 12rpx; font-size: 32rpx; color: #333; &.active { border-color: #38daa6; background: rgba(56, 218, 166, 0.08); color: #38daa6; font-weight: 600; } }
.amount-text { font-weight: 500; }
.custom-input-wrap { display: flex; align-items: center; border: 2rpx solid #e8e8e8; border-radius: 12rpx; padding: 24rpx; gap: 12rpx; }
.unit { font-size: 32rpx; color: #333; font-weight: 500; }
.custom-input { flex: 1; font-size: 30rpx; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: 20rpx 24rpx; padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); background: #fff; }
.recharge-btn { width: 100%; padding: 28rpx; text-align: center; color: #fff; font-size: 32rpx; font-weight: 500; border-radius: 12rpx; background: linear-gradient(135deg, #38daa6, #2bc18a); &.disabled { opacity: 0.5; } }
.bottom-space { height: 40rpx; }
</style>
