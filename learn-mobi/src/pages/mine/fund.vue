<template>
  <view class="page">
    <u-navbar title="资金明细" :border="true" :fixed="true" :safeAreaInsetTop="true" @leftClick="goBack">
      <view slot="left"><u-icon name="arrow-left" size="20"></u-icon></view>
      <view slot="right" class="recharge-btn" @click="goRecharge">充值</view>
    </u-navbar>
    <scroll-view scroll-y class="content-scroll" show-scrollbar="false"
      refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore">
      <view class="balance-card">
        <view class="balance-label">可用余额(元)</view>
        <view class="balance-amount">{{ summary.balance.toFixed(2) }}</view>
        <view class="balance-stats">
          <view class="stat-item">
            <text class="stat-label">累计充值</text>
            <text class="stat-value">¥{{ summary.totalRecharge.toFixed(2) }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">累计消费</text>
            <text class="stat-value">¥{{ summary.totalConsumption.toFixed(2) }}</text>
          </view>
        </view>
      </view>
      <view class="tab-bar">
        <view v-for="(tab, index) in tabs" :key="index"
          :class="['tab-item', { active: currentTab === index }]"
          @click="switchTab(index)">
          {{ tab.label }}
        </view>
      </view>
      <view class="transaction-list">
        <view v-for="item in transactionList" :key="item.id" class="transaction-item">
          <view class="item-left">
            <view :class="['icon-wrap', typeIconClass(item.transactionType)]">
              <u-icon :name="typeIconName(item.transactionType)" size="18"></u-icon>
            </view>
            <view class="item-info">
              <text class="item-title">{{ item.description }}</text>
              <text class="item-date">{{ item.createTime }}</text>
            </view>
          </view>
          <text :class="['item-amount', item.amount >= 0 ? 'income' : 'expense']">
            {{ item.amount >= 0 ? '+' : '' }}{{ Math.abs(item.amount).toFixed(2) }}
          </text>
        </view>
        <view v-if="transactionList.length === 0 && !loading" class="empty-state">
          <text>暂无交易记录</text>
        </view>
        <view v-if="noMore && transactionList.length > 0" class="no-more">
          <text>— 没有更多记录了 —</text>
        </view>
      </view>
      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getFundSummary, getFundTransactions } from '../../api/mine'
import type { FundSummaryVO, FundTransactionVO } from '../../types/mine'

const loading = ref(false)
const isRefreshing = ref(false)
const noMore = ref(false)
const currentTab = ref(0)
const tabs = [
  { label: '全部', value: '' },
  { label: '收入', value: 'INCOME' },
  { label: '支出', value: 'EXPENSE' }
]
const summary = reactive<FundSummaryVO>({ balance: 0, totalRecharge: 0, totalConsumption: 0 })
const transactionList = ref<FundTransactionVO[]>([])
const page = ref(1)
const pageSize = 10

onShow(() => { loadSummary(); loadTransactions(true) })

async function loadSummary() {
  try {
    const data = await getFundSummary()
    Object.assign(summary, data)
  } catch { /* 保持默认值 */ }
}

async function loadTransactions(reset = false) {
  if (loading.value) return
  if (reset) { page.value = 1; noMore.value = false; transactionList.value = [] }
  if (noMore.value) return
  loading.value = true
  try {
    let transactionType = ''
    if (currentTab.value === 1) transactionType = 'RECHARGE,REFUND'
    if (currentTab.value === 2) transactionType = 'COURSE_PURCHASE'
    const res = await getFundTransactions({ transactionType, page: page.value, pageSize })
    if (reset) transactionList.value = res.list
    else transactionList.value.push(...res.list)
    if (transactionList.value.length >= res.total || res.list.length < pageSize) noMore.value = true
    page.value++
  } catch { /* 保持当前列表 */ }
  finally { loading.value = false; isRefreshing.value = false }
}

function switchTab(index: number) {
  if (currentTab.value === index) return
  currentTab.value = index
  loadTransactions(true)
}
function onRefresh() { isRefreshing.value = true; loadSummary(); loadTransactions(true) }
function onLoadMore() { loadTransactions(false) }
function goBack() { uni.navigateBack() }
function goRecharge() { uni.navigateTo({ url: '/pages/mine/recharge' }) }
function typeIconClass(type: string) {
  if (type === 'RECHARGE') return 'icon-orange'
  if (type === 'REFUND') return 'icon-blue'
  return 'icon-green'
}
function typeIconName(type: string) {
  if (type === 'RECHARGE') return 'rmb-circle'
  if (type === 'REFUND') return 'reload'
  return 'list'
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #f5f7fa; }
.content-scroll { height: 100vh; padding-top: 88rpx; }
.recharge-btn { color: #fff; background: #38daa6; padding: 8rpx 24rpx; border-radius: 20rpx; font-size: 26rpx; }
.balance-card { margin: 24rpx; padding: 40rpx; border-radius: 16rpx; background: linear-gradient(135deg, #38daa6, #2bc18a); color: #fff; }
.balance-label { font-size: 26rpx; opacity: 0.8; }
.balance-amount { font-size: 64rpx; font-weight: bold; margin: 16rpx 0 32rpx; }
.balance-stats { display: flex; justify-content: space-between; }
.stat-item { display: flex; flex-direction: column; }
.stat-label { font-size: 24rpx; opacity: 0.8; }
.stat-value { font-size: 30rpx; font-weight: 500; margin-top: 8rpx; }
.tab-bar { display: flex; margin: 0 24rpx; background: #fff; border-radius: 12rpx; padding: 8rpx; gap: 8rpx; }
.tab-item { flex: 1; text-align: center; padding: 16rpx 0; border-radius: 8rpx; font-size: 28rpx; color: #666; &.active { background: #38daa6; color: #fff; font-weight: 500; } }
.transaction-list { margin: 24rpx; }
.transaction-item { display: flex; align-items: center; justify-content: space-between; padding: 28rpx; background: #fff; border-radius: 12rpx; margin-bottom: 16rpx; }
.item-left { display: flex; align-items: center; gap: 20rpx; }
.icon-wrap { width: 72rpx; height: 72rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.icon-orange { background: rgba(255, 120, 71, 0.1); color: #ff7847; }
.icon-green { background: rgba(7, 193, 96, 0.1); color: #07c160; }
.icon-blue { background: rgba(1, 149, 255, 0.1); color: #0195ff; }
.item-info { display: flex; flex-direction: column; }
.item-title { font-size: 28rpx; color: #333; }
.item-date { font-size: 24rpx; color: #999; margin-top: 6rpx; }
.item-amount { font-size: 30rpx; font-weight: 600; }
.income { color: #38daa6; }
.expense { color: #f56c6c; }
.empty-state, .no-more { text-align: center; padding: 80rpx 0; color: #999; font-size: 26rpx; }
.bottom-space { height: 40rpx; }
</style>
