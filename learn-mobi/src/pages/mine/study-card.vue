<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <u-navbar title="学习卡" :border="true" :fixed="true" :safeAreaInsetTop="true" @leftClick="goBack">
      <view slot="left" class="nav-left">
        <u-icon name="arrow-left" size="20"></u-icon>
      </view>
    </u-navbar>

    <scroll-view scroll-y class="content-scroll" show-scrollbar="false">
      <!-- 用户信息卡片 -->
      <view class="user-info-card">
        <image class="user-avatar" :src="'/static/default-avatar.png'" mode="aspectFill" />
        <view class="user-base">
          <text class="user-nickname">{{ nickname }}</text>
          <view class="count-row">
            <view class="count-item">
              <text class="count-num">{{ totalCardCount }}</text>
              <text class="count-label">学习卡总数</text>
            </view>
            <view class="count-item">
              <text class="count-num">{{ usedCount }}</text>
              <text class="count-label">已使用</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 学习卡输入 -->
      <view class="section-card">
        <view class="section-title">学习卡使用</view>
        <view class="input-area">
          <input
            class="card-input"
            v-model="cardInput"
            placeholder="请输入学习卡号"
            maxlength="32"
          />
        </view>
        <view class="action-row">
          <view class="scan-btn" @click="handleScan">
            <u-icon name="scan" color="#0195ff" size="18"></u-icon>
            <text class="scan-text">扫码</text>
          </view>
          <view class="right-btns">
            <u-button size="small" shape="circle" type="primary" plain @click="handleSave">暂存</u-button>
            <u-button size="small" shape="circle" type="primary" @click="handleUse">使用</u-button>
          </view>
        </view>
      </view>

      <!-- 我的学习卡列表 -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">我的学习卡</text>
          <view class="filter-btn" @click="showFilterSheet">
            <text class="filter-text">{{ currentFilterText }}</text>
            <u-icon name="arrow-down" color="#999" size="12"></u-icon>
          </view>
        </view>

        <view class="card-list">
          <view
            v-for="(item, index) in filteredList"
            :key="item.id"
            class="card-item"
          >
            <text class="card-index">{{ index + 1 }}</text>
            <view class="card-main">
              <text class="card-no">{{ item.cardNo }}</text>
              <text class="card-date">{{ item.startDate }} 至 {{ item.endDate }}</text>
            </view>
            <view class="card-right">
              <u-tag
                :text="statusTextMap[item.status]"
                :type="statusTypeMap[item.status]"
                size="mini"
              />
              <u-button
                v-if="item.status === 0"
                size="mini"
                type="primary"
                plain
                :hairline="true"
                @click="fillCardInput(item.cardNo)"
              >立即使用</u-button>
            </view>
          </view>
        </view>

        <u-empty v-if="filteredList.length === 0" text="暂无对应学习卡" mode="list" :marginTop="30"></u-empty>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface CardItem {
  id: number
  cardNo: string
  startDate: string
  endDate: string
  status: number
}

const statusTextMap: string[] = ['未使用', '已使用', '已回滚']
const statusTypeMap: string[] = ['primary', 'success', 'info']
const filterOptions: string[] = ['全部', '未使用', '已使用', '已回滚']

const nickname = ref('同学')
const cardInput = ref('')
const scrollTop = ref(0)
const currentFilter = ref(0)

const cardList = ref<CardItem[]>([
  { id: 1, cardNo: 'STUDY20240001', startDate: '2024-01-01', endDate: '2024-12-31', status: 0 },
  { id: 2, cardNo: 'STUDY20240002', startDate: '2024-03-01', endDate: '2025-02-28', status: 1 },
  { id: 3, cardNo: 'STUDY20240003', startDate: '2023-06-01', endDate: '2024-05-31', status: 2 },
  { id: 4, cardNo: 'STUDY20240004', startDate: '2024-06-01', endDate: '2025-05-31', status: 0 },
])

const totalCardCount = computed(() => cardList.value.length)

const usedCount = computed(() => cardList.value.filter((item) => item.status === 1).length)

const currentFilterText = computed(() => filterOptions[currentFilter.value])

const filteredList = computed(() => {
  let list = [...cardList.value]
  if (currentFilter.value !== 0) {
    const status = currentFilter.value - 1
    list = list.filter((item) => item.status === status)
  }
  list.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  return list
})

function goBack() {
  uni.navigateBack()
}

function handleScan() {
  uni.showActionSheet({
    itemList: ['相机扫码', '相册图片识别'],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.scanCode({
          scanType: ['qrCode'],
          success: (scanRes) => {
            cardInput.value = scanRes.result
            uni.showToast({ title: '识别成功', icon: 'success' })
          },
          fail: () => {
            uni.showToast({ title: '扫码失败，请重试', icon: 'none' })
          },
        })
      } else {
        uni.showToast({ title: '请使用系统相机扫描二维码', icon: 'none' })
      }
    },
  })
}

function handleSave() {
  const inputNo = cardInput.value.trim()
  if (!inputNo) {
    uni.showToast({ title: '请输入学习卡号', icon: 'none' })
    return
  }
  const isExist = cardList.value.some((item) => item.cardNo === inputNo)
  if (isExist) {
    uni.showToast({ title: '学习卡已寄存', icon: 'none' })
    return
  }
  uni.showLoading({ title: '提交中...' })
  setTimeout(() => {
    uni.hideLoading()
    const newCard: CardItem = {
      id: Date.now(),
      cardNo: inputNo,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      status: 0,
    }
    cardList.value.unshift(newCard)
    cardInput.value = ''
    uni.showToast({ title: '已存入我的学习卡中', icon: 'success' })
  }, 800)
}

function handleUse() {
  const inputNo = cardInput.value.trim()
  if (!inputNo) {
    uni.showToast({ title: '请输入学习卡号', icon: 'none' })
    return
  }
  uni.showLoading({ title: '使用中...' })
  setTimeout(() => {
    uni.hideLoading()
    const target = cardList.value.find((item) => item.cardNo === inputNo)
    if (target) {
      target.status = 1
    }
    cardInput.value = ''
    uni.showToast({ title: '已使用', icon: 'success' })
  }, 800)
}

function showFilterSheet() {
  uni.showActionSheet({
    itemList: filterOptions,
    success: (res) => {
      currentFilter.value = res.tapIndex
    },
  })
}

function fillCardInput(cardNo: string) {
  cardInput.value = cardNo
  scrollTop.value = 0
  uni.showToast({ title: '卡号已填入，可点击使用', icon: 'none', duration: 1500 })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
}

.content-scroll {
  width: 100%;
  padding: 12px 14px;
  box-sizing: border-box;
}

/* 通用卡片 */
.section-card {
  background: $bg-card;
  border-radius: $radius-card;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: $shadow-card;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: $text-1;
  margin-bottom: 12px;
  display: block;
}

.section-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-header .section-title {
  margin-bottom: 0;
}

/* 用户信息卡 */
.user-info-card {
  background: $gradient-primary;
  border-radius: $radius-card;
  padding: 20px 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  background: #fff;
}

.user-base {
  margin-left: 14px;
  flex: 1;
}

.user-nickname {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  display: block;
  margin-bottom: 10px;
}

.count-row {
  display: flex;
  flex-direction: row;
  gap: 28px;
}

.count-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.count-num {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.count-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
}

/* 输入区域 */
.input-area {
  margin-bottom: 12px;
}

.card-input {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  background: $bg-page;
  border-radius: 8px;
  font-size: 15px;
  color: $text-1;
  box-sizing: border-box;
}

.action-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.scan-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: $primary-bg;
  border-radius: 8px;
}

.scan-text {
  font-size: 13px;
  color: $primary;
}

.right-btns {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

/* 筛选按钮 */
.filter-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: $bg-page;
  border-radius: 6px;
}

.filter-text {
  font-size: 12px;
  color: $text-2;
}

/* 学习卡列表 */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px;
  background: $bg-page;
  border-radius: 8px;
}

.card-index {
  width: 28px;
  font-size: 13px;
  color: $text-3;
  flex-shrink: 0;
  text-align: center;
}

.card-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  margin: 0 10px;
}

.card-no {
  font-size: 14px;
  font-weight: 500;
  color: $text-1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-date {
  font-size: 11px;
  color: $text-3;
}

.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.bottom-space {
  height: 20px;
  width: 100%;
}

.nav-left {
  display: flex;
  align-items: center;
  padding-left: 6px;
}
</style>
