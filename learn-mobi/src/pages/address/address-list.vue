<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <u-navbar title="地址管理" :border="true" :fixed="true" :safeAreaInsetTop="true" @leftClick="goBack">
      <view slot="left" class="nav-left">
        <u-icon name="arrow-left" size="20"></u-icon>
      </view>
    </u-navbar>

    <scroll-view scroll-y class="content-scroll" show-scrollbar="false" refresher-enabled @refresherrefresh="onRefresh">
      <!-- 地址列表 -->
      <view class="address-list" v-if="addressList.length > 0">
        <view
          v-for="item in addressList"
          :key="item.id"
          class="address-card"
        >
          <view class="card-content">
            <view class="card-top">
              <text class="card-name">{{ item.name }}</text>
              <text class="card-phone">{{ item.phone }}</text>
              <view class="card-default" v-if="item.isDefault === 1">
                <text class="default-tag">默认</text>
              </view>
            </view>
            <text class="card-address">{{ item.province }}{{ item.city }}{{ item.district }} {{ item.detail }}</text>
          </view>
          <view class="card-actions">
            <view class="action-btn" @click="setDefault(item)">
              <u-icon :name="item.isDefault === 1 ? 'checkbox-mark' : 'checkbox-mark'" :color="item.isDefault === 1 ? '#0195ff' : '#ccc'" size="16"></u-icon>
              <text class="action-text" :style="{ color: item.isDefault === 1 ? '#0195ff' : '#999' }">默认</text>
            </view>
            <view class="action-btn" @click="editAddress(item)">
              <u-icon name="edit-pen" color="#666" size="16"></u-icon>
              <text class="action-text">编辑</text>
            </view>
            <view class="action-btn" @click="deleteAddr(item)">
              <u-icon name="trash" color="#f56c6c" size="16"></u-icon>
              <text class="action-text delete-text">删除</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-wrap" v-if="!loading && addressList.length === 0">
        <u-empty mode="list" text="暂无收货地址" :marginTop="60"></u-empty>
        <u-button type="primary" shape="circle" size="small" customStyle="margin-top:16px" @click="addAddress">添加地址</u-button>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 添加按钮 -->
    <view class="fab-btn" @click="addAddress" v-if="addressList.length > 0">
      <u-icon name="plus" color="#fff" size="24"></u-icon>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getAddressList, deleteAddress, setDefaultAddress } from '../../api/address'
import type { AddressVO } from '../../types/mine'

const loading = ref(false)
const addressList = ref<AddressVO[]>([])

async function loadList() {
  loading.value = true
  try {
    const list = await getAddressList()
    addressList.value = list || []
  } catch {
    addressList.value = []
  } finally {
    loading.value = false
  }
}

onShow(() => {
  loadList()
})

async function onRefresh() {
  await loadList()
}

function addAddress() {
  uni.navigateTo({ url: '/pages/address/address-form' })
}

function editAddress(item: AddressVO) {
  const params = encodeURIComponent(JSON.stringify(item))
  uni.navigateTo({ url: `/pages/address/address-form?data=${params}` })
}

function deleteAddr(item: AddressVO) {
  uni.showModal({
    title: '确认删除',
    content: `确定删除 "${item.name}" 的收货地址吗？`,
    confirmColor: '#f56c6c',
    success: async (res) => {
      if (!res.confirm) return
      uni.showLoading({ title: '删除中...' })
      try {
        await deleteAddress(item.id)
        uni.showToast({ title: '已删除', icon: 'success' })
        await loadList()
      } catch {
        // 错误已由 request 拦截器处理
      } finally {
        uni.hideLoading()
      }
    },
  })
}

async function setDefault(item: AddressVO) {
  if (item.isDefault === 1) return
  uni.showLoading({ title: '设置中...' })
  try {
    await setDefaultAddress(item.id)
    uni.showToast({ title: '已设为默认', icon: 'success' })
    await loadList()
  } catch {
    // 错误已由 request 拦截器处理
  } finally {
    uni.hideLoading()
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
}

.content-scroll {
  width: 100%;
  padding: 64px 14px;
  box-sizing: border-box;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-card {
  background: $bg-card;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
  overflow: hidden;
}

.card-content {
  padding: 16px;
}

.card-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.card-name {
  font-size: 16px;
  font-weight: 600;
  color: $text-1;
}

.card-phone {
  font-size: 14px;
  color: $text-2;
}

.default-tag {
  font-size: 11px;
  color: $primary;
  background: $primary-bg;
  padding: 2px 8px;
  border-radius: 4px;
}

.card-address {
  font-size: 13px;
  color: $text-3;
  line-height: 1.5;
}

.card-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  border-top: 1px solid $border;
  padding: 0 16px;
}

.action-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 12px 0;
  margin-right: 24px;
}

.action-text {
  font-size: 13px;
  color: $text-2;
}

.delete-text {
  color: $danger;
}

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.fab-btn {
  position: fixed;
  right: 20px;
  bottom: 40px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(1, 149, 255, 0.4);
}

.fab-btn:active {
  opacity: 0.85;
}

.bottom-space {
  height: 100px;
  width: 100%;
}

.nav-left {
  display: flex;
  align-items: center;
  padding-left: 6px;
}
</style>
