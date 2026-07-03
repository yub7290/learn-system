<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <u-navbar title="积分兑换" :border="true" :fixed="true" :safeAreaInsetTop="true" @leftClick="goBack">
      <view slot="left" class="nav-left">
        <u-icon name="arrow-left" size="20"></u-icon>
      </view>
      <view slot="right" class="points-badge" @click="showRecords">
        <text class="points-num">{{ userPoints }}</text>
        <text class="points-label">积分</text>
      </view>
    </u-navbar>

    <scroll-view scroll-y class="page-scroll" show-scrollbar="false">
      <!-- 积分余额卡片 -->
      <view class="points-card">
        <view class="points-card-bg"></view>
        <view class="points-card-circle"></view>
        <view class="points-card-content">
          <text class="points-card-label">当前可用积分</text>
          <view class="points-card-row">
            <text class="points-card-num">{{ userPoints }}</text>
            <text class="points-card-unit">分</text>
          </view>
          <text class="points-card-hint">兑换商品即扣除相应积分</text>
        </view>
      </view>

      <!-- 学习卡兑换 -->
      <view class="section">
        <view class="section-title">学习卡兑换</view>
        <view class="goods-grid" v-if="cardList.length > 0">
          <view
            v-for="item in cardList"
            :key="item.id"
            class="goods-card"
            @click="openExchangePanel(item)"
          >
            <image class="goods-image" :src="item.imageUrl || '/static/default-goods.png'" mode="aspectFill" />
            <view class="goods-info">
              <text class="goods-name">{{ item.name }}</text>
              <view class="goods-bottom">
                <text class="goods-points">{{ item.requiredPoints }} 积分</text>
                <view
                  v-if="userPoints >= item.requiredPoints"
                  class="exchange-btn"
                  @click.stop="openExchangePanel(item)"
                ><text class="exchange-btn-text">兑换</text></view>
                <view v-else class="insufficient-tag">
                  <text class="insufficient-text">积分不足</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="empty-state" v-else>
          <u-empty mode="list" text="暂无学习卡商品" :marginTop="20"></u-empty>
        </view>
      </view>

      <!-- 实物兑换 -->
      <view class="section">
        <view class="section-title">实物兑换</view>
        <view class="goods-grid" v-if="goodsList.length > 0">
          <view
            v-for="item in goodsList"
            :key="item.id"
            class="goods-card"
            @click="openExchangePanel(item)"
          >
            <image class="goods-image" :src="item.imageUrl || '/static/default-goods.png'" mode="aspectFill" />
            <view class="goods-info">
              <text class="goods-name">{{ item.name }}</text>
              <view class="goods-bottom">
                <text class="goods-points">{{ item.requiredPoints }} 积分</text>
                <view
                  v-if="userPoints >= item.requiredPoints"
                  class="exchange-btn"
                  @click.stop="openExchangePanel(item)"
                ><text class="exchange-btn-text">兑换</text></view>
                <view v-else class="insufficient-tag">
                  <text class="insufficient-text">积分不足</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="empty-state" v-else>
          <u-empty mode="list" text="暂无实物商品" :marginTop="20"></u-empty>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 兑换确认弹窗 -->
    <u-popup :show="showExchangePanel" mode="bottom" round="16" @close="closeExchangePanel">
      <view class="exchange-panel">
        <view class="panel-header">
          <text class="panel-title">确认兑换</text>
          <u-icon name="close" color="#999" size="18" @click="closeExchangePanel"></u-icon>
        </view>

        <view class="goods-row">
          <image class="row-image" :src="currentGoods.imageUrl || '/static/default-goods.png'" mode="aspectFill" />
          <view class="row-info">
            <text class="row-name">{{ currentGoods.name }}</text>
            <text class="row-points">消耗 {{ currentGoods.requiredPoints }} 积分</text>
          </view>
        </view>

        <!-- 实物商品: 兑换方式选择 -->
        <view class="way-select" v-if="currentGoods.productType === 1">
          <text class="way-label">兑换方式</text>
          <view class="way-btns">
            <view
              class="way-btn"
              :class="{ 'way-btn-active': exchangeWay === 'offline' }"
              @click="exchangeWay = 'offline'"
            >
              <u-icon name="map-fill" :color="exchangeWay === 'offline' ? '#fff' : '#999'" size="18"></u-icon>
              <text class="way-btn-text" :class="{ 'way-btn-text-active': exchangeWay === 'offline' }">线下兑换</text>
            </view>
            <view
              class="way-btn"
              :class="{ 'way-btn-active': exchangeWay === 'mail' }"
              @click="exchangeWay = 'mail'"
            >
              <u-icon name="car-fill" :color="exchangeWay === 'mail' ? '#fff' : '#999'" size="18"></u-icon>
              <text class="way-btn-text" :class="{ 'way-btn-text-active': exchangeWay === 'mail' }">邮寄到家</text>
            </view>
          </view>
        </view>

        <!-- 邮寄: 选择收货地址 -->
        <view class="address-select" v-if="currentGoods.productType === 1 && exchangeWay === 'mail'">
          <view class="address-header">
            <text class="way-label">收货地址</text>
            <view class="manage-link" @click="goAddressManage">
              <u-icon name="setting" color="#0195ff" size="14"></u-icon>
              <text class="manage-text">管理地址</text>
            </view>
          </view>
          <view class="address-list" v-if="addressList.length > 0">
            <view
              v-for="addr in addressList"
              :key="addr.id"
              class="address-item"
              :class="{ 'address-active': selectedAddressId === addr.id }"
              @click="selectedAddressId = addr.id"
            >
              <view class="addr-main">
                <text class="addr-name">{{ addr.name }}</text>
                <text class="addr-phone">{{ addr.phone }}</text>
              </view>
              <text class="addr-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }} {{ addr.detail }}</text>
              <view class="addr-default" v-if="addr.isDefault === 1">
                <text class="default-tag">默认</text>
              </view>
            </view>
          </view>
          <view class="address-empty" v-else @click="goAddressForm">
            <u-icon name="plus-circle" color="#0195ff" size="20"></u-icon>
            <text class="address-empty-text">暂无地址，去添加</text>
          </view>
        </view>

        <!-- 线下兑换提示 -->
        <view class="offline-tip" v-if="currentGoods.productType === 1 && exchangeWay === 'offline'">
          <u-icon name="info-circle" color="#d48806" size="16"></u-icon>
          <text class="tip-text">兑换成功后将生成兑换码，可凭码到线下校区领取实物</text>
        </view>

        <view class="confirm-btn-wrap" @click="submitExchange">
          <view class="confirm-btn" :class="{ 'confirm-btn-disabled': exchangeLoading }">
            <u-loading-icon v-if="exchangeLoading" color="#fff" size="18"></u-loading-icon>
            <text class="confirm-btn-text">{{ exchangeLoading ? '兑换中...' : '确认兑换' }}</text>
          </view>
        </view>
      </view>
    </u-popup>

    <!-- 兑换成功弹窗 -->
    <u-popup :show="showResultPanel" mode="center" round="16" @close="closeResultPanel">
      <view class="result-panel">
        <u-icon name="checkmark-circle" color="#07c160" size="50"></u-icon>
        <text class="result-title">兑换成功</text>

        <text class="result-desc" v-if="exchangeResult.cardNo">请保存好您的学习卡信息</text>
        <text class="result-desc" v-else-if="exchangeResult.exchangeCode">请保存好您的兑换码，凭码到线下校区领取</text>
        <text class="result-desc" v-else>订单已提交，我们将尽快为您发货</text>

        <!-- 学习卡 -->
        <view class="info-box" v-if="exchangeResult.cardNo">
          <view class="info-row">
            <text class="info-label">卡号</text>
            <text class="info-value">{{ exchangeResult.cardNo }}</text>
          </view>
          <view class="info-row" v-if="exchangeResult.cardSecret">
            <text class="info-label">密钥</text>
            <text class="info-value">{{ exchangeResult.cardSecret }}</text>
          </view>
        </view>

        <!-- 线下兑换码 -->
        <view v-if="exchangeResult.exchangeCode" style="width:100%">
          <view class="code-value" @click="copyText(exchangeResult.exchangeCode)">{{ exchangeResult.exchangeCode }}</view>
          <view class="copy-btn" @click.stop="copyText(exchangeResult.exchangeCode)">
            <text class="copy-btn-text">复制兑换码</text>
          </view>
        </view>

        <!-- 邮寄订单号 -->
        <view class="info-box" v-if="!exchangeResult.cardNo && !exchangeResult.exchangeCode && exchangeResult.orderNo">
          <view class="info-row">
            <text class="info-label">订单编号</text>
            <text class="info-value">{{ exchangeResult.orderNo }}</text>
          </view>
        </view>

        <view class="ok-btn" @click="closeResultPanel">
          <text class="ok-btn-text">我知道了</text>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getPointsAccount, getPointsProductList, exchangePointsProduct } from '../../api/mine'
import { getAddressList } from '../../api/address'
import type { PointsProductVO, AddressVO, ExchangeResultVO } from '../../types/mine'

const userPoints = ref(0)

const cardList = ref<PointsProductVO[]>([])
const goodsList = ref<PointsProductVO[]>([])

const showExchangePanel = ref(false)
const showResultPanel = ref(false)
const exchangeLoading = ref(false)
const currentGoods = ref<PointsProductVO>({
  id: 0,
  name: '',
  productType: 1,
  imageUrl: '',
  requiredPoints: 0,
  stockCount: 0,
})

const exchangeWay = ref<'offline' | 'mail'>('offline')
const addressList = ref<AddressVO[]>([])
const selectedAddressId = ref<number>(0)
const exchangeResult = ref<ExchangeResultVO>({})

/** 加载积分和商品数据 */
async function loadData() {
  try {
    const pa = await getPointsAccount()
    userPoints.value = pa.availablePoints || 0
  } catch {
    /* 保持 0 */
  }

  try {
    const res = await getPointsProductList({ page: 1, pageSize: 50 })
    if (res.list.length > 0) {
      cardList.value = res.list.filter((p) => p.productType === 2)
      goodsList.value = res.list.filter((p) => p.productType === 1)
    }
  } catch {
    /* 保持空列表 */
  }
}

/** 加载收货地址列表 */
async function loadAddressList() {
  try {
    const list = await getAddressList()
    addressList.value = list || []
    // 默认选中默认地址
    const defaultAddr = addressList.value.find((a) => a.isDefault === 1)
    if (defaultAddr) {
      selectedAddressId.value = defaultAddr.id
    } else if (addressList.value.length > 0) {
      selectedAddressId.value = addressList.value[0].id
    }
  } catch {
    addressList.value = []
  }
}

onShow(() => {
  loadData()
  // 如果之前已经打开过地址列表则刷新
  if (showExchangePanel.value && currentGoods.value.productType === 1 && exchangeWay.value === 'mail') {
    loadAddressList()
  }
})

function openExchangePanel(item: PointsProductVO) {
  if (userPoints.value < item.requiredPoints) {
    uni.showToast({ title: '积分不足', icon: 'none' })
    return
  }
  currentGoods.value = item
  exchangeWay.value = 'offline'
  selectedAddressId.value = 0
  showExchangePanel.value = true
  // 实物商品需要加载地址列表
  if (item.productType === 1) {
    loadAddressList()
  }
}

function closeExchangePanel() {
  showExchangePanel.value = false
}

function submitExchange() {
  if (userPoints.value < currentGoods.value.requiredPoints) {
    uni.showToast({ title: '积分不足', icon: 'none' })
    return
  }

  // 邮寄方式需要校验收货地址
  if (currentGoods.value.productType === 1 && exchangeWay.value === 'mail') {
    if (!selectedAddressId.value) {
      uni.showToast({ title: '请选择收货地址', icon: 'none' })
      return
    }
  }

  uni.showLoading({ title: '兑换中...' })
  exchangeLoading.value = true

  const exchangeType = currentGoods.value.productType === 2 ? 1 : (exchangeWay.value === 'mail' ? 2 : 1)
  const addressId = (currentGoods.value.productType === 1 && exchangeWay.value === 'mail')
    ? selectedAddressId.value
    : undefined

  exchangePointsProduct(currentGoods.value.id, exchangeType, addressId)
    .then((result) => {
      userPoints.value -= currentGoods.value.requiredPoints
      exchangeResult.value = result || {}
      showExchangePanel.value = false
      showResultPanel.value = true
    })
    .catch(() => {
      uni.showToast({ title: '兑换失败，请稍后重试', icon: 'none' })
    })
    .finally(() => {
      uni.hideLoading()
      exchangeLoading.value = false
    })
}

function copyText(text: string) {
  if (!text) return
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '复制成功', icon: 'success' })
    },
  })
}

function closeResultPanel() {
  showResultPanel.value = false
}

function showRecords() {
  uni.showToast({ title: '积分记录', icon: 'none' })
}

function goAddressManage() {
  showExchangePanel.value = false
  uni.navigateTo({ url: '/pages/address/address-list' })
}

function goAddressForm() {
  showExchangePanel.value = false
  uni.navigateTo({ url: '/pages/address/address-form' })
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
/* ── Page Layout ───────────────────────────────────── */
.page {
  min-height: 100vh;
  background: $bg-page;
}

.page-scroll {
  width: 100%;
  padding: 64px 14px;
  box-sizing: border-box;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  position: relative;
  font-size: 16px;
  font-weight: 600;
  color: $text-1;
  margin-bottom: 12px;
  padding-left: 12px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 3px;
    bottom: 3px;
    width: 3px;
    border-radius: 2px;
    background: $primary;
  }
}

/* ── Points Badge (Navbar) ─────────────────────────── */
.points-badge {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 2px;
  padding: 4px 14px;
  background: linear-gradient(135deg, #ff9a44, #fc6040);
  border-radius: 20px;
  margin-right: 6px;
}

.points-num {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.points-label {
  font-size: 11px;
  color: #fff;
  opacity: 0.9;
}

.nav-left {
  display: flex;
  align-items: center;
  padding-left: 6px;
}

/* ── Points Card ───────────────────────────────────── */
.points-card {
  position: relative;
  margin-bottom: 24px;
  border-radius: $radius-card;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(1, 149, 255, 0.3);
}

.points-card-bg {
  position: absolute;
  inset: 0;
  background: $gradient-primary;
}

.points-card-circle {
  position: absolute;
  top: -30px;
  right: -20px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.points-card-content {
  position: relative;
  padding: 28px 22px 24px;
  z-index: 1;
}

.points-card-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 1px;
}

.points-card-row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 4px;
  margin-top: 10px;
}

.points-card-num {
  font-size: 40px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -1px;
}

.points-card-unit {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  margin-left: 2px;
}

.points-card-hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 6px;
}

/* ── Goods Grid ────────────────────────────────────── */
.goods-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
}

.goods-card {
  width: calc((100% - 12px) / 2);
  background: $bg-card;
  border-radius: $radius-card;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 40, 80, 0.06);
  box-sizing: border-box;
  transition: transform 0.15s;

  &:active {
    transform: scale(0.98);
  }
}

.goods-image {
  width: 100%;
  height: 140px;
  display: block;
  background: linear-gradient(135deg, #f0f4f8, #e8ecf1);
}

.goods-info {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.goods-name {
  font-size: 14px;
  color: $text-1;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.goods-bottom {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.goods-points {
  font-size: 15px;
  color: $accent;
  font-weight: 700;
}

.exchange-btn {
  padding: 4px 14px;
  background: $gradient-primary;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(1, 149, 255, 0.25);

  &:active {
    opacity: 0.85;
  }
}

.exchange-btn-text {
  font-size: 12px;
  color: #fff;
  font-weight: 500;
}

.insufficient-tag {
  padding: 2px 8px;
  background: #f5f7fa;
  border-radius: 4px;
}

.insufficient-text {
  font-size: 11px;
  color: $text-3;
}

/* ── Exchange Panel (Bottom Sheet) ─────────────────── */
.exchange-panel {
  padding: 24px 20px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

.panel-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  color: $text-1;
}

.goods-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: $bg-page;
  border-radius: 14px;
  margin-bottom: 20px;
}

.row-image {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #f0f4f8, #e8ecf1);
}

.row-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.row-name {
  font-size: 14px;
  color: $text-1;
  font-weight: 500;
}

.row-points {
  font-size: 12px;
  color: $accent;
}

/* ── Exchange Way Selection ─────────────────────────── */
.way-select {
  margin-bottom: 16px;
}

.way-label {
  display: block;
  font-size: 14px;
  color: $text-1;
  margin-bottom: 10px;
  font-weight: 500;
}

.way-btns {
  display: flex;
  flex-direction: row;
  gap: 12px;
}

.way-btn {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
  border-radius: 10px;
  background: $bg-page;
  border: 2px solid $border;
}

.way-btn-active {
  background: $gradient-primary;
  border-color: $primary;
}

.way-btn-text {
  font-size: 14px;
  color: $text-2;
  font-weight: 500;
}

.way-btn-text-active {
  color: #fff;
}

/* ── Address Selection ─────────────────────────────── */
.address-select {
  margin-bottom: 16px;
}

.address-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  .way-label {
    margin-bottom: 0;
  }
}

.manage-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
}

.manage-text {
  font-size: 13px;
  color: $primary;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.address-item {
  padding: 12px;
  background: $bg-page;
  border-radius: 8px;
  border: 2px solid transparent;
  position: relative;

  &.address-active {
    border-color: $primary;
  }
}

.addr-main {
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin-bottom: 4px;
}

.addr-name {
  font-size: 14px;
  font-weight: 500;
  color: $text-1;
}

.addr-phone {
  font-size: 14px;
  color: $text-2;
}

.addr-detail {
  font-size: 12px;
  color: $text-3;
  line-height: 1.5;
}

.addr-default {
  position: absolute;
  top: 12px;
  right: 12px;
}

.default-tag {
  font-size: 11px;
  color: $primary;
  background: $primary-bg;
  padding: 2px 8px;
  border-radius: 4px;
}

.address-empty {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  background: $bg-page;
  border-radius: 8px;
  border: 1px dashed $border;
}

.address-empty-text {
  font-size: 13px;
  color: $primary;
}

/* ── Offline Tip ───────────────────────────────────── */
.offline-tip {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: #fff7e6;
  border-radius: 12px;
  margin-bottom: 16px;
}

.tip-text {
  flex: 1;
  font-size: 12px;
  color: #d48806;
  line-height: 1.6;
}

/* ── Confirm Button ────────────────────────────────── */
.confirm-btn-wrap {
  margin-top: 4px;
  width: 100%;
}

.confirm-btn {
  height: 48px;
  background: $gradient-primary;
  border-radius: 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.85;
  }
}

.confirm-btn-disabled {
  opacity: 0.6;
}

.confirm-btn-text {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

/* ── Result Panel (Center Popup) ───────────────────── */
.result-panel {
  width: 320px;
  padding: 24px 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: center;
}

.result-title {
  font-size: 20px;
  font-weight: 700;
  color: $text-1;
  margin: 14px 0 8px;
  text-align: center;
}

.result-desc {
  font-size: 13px;
  color: $text-2;
  margin-bottom: 16px;
  text-align: center;
}

.info-box {
  padding: 16px;
  background: $bg-page;
  border-radius: 14px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.info-label {
  font-size: 13px;
  color: $text-2;
}

.info-value {
  font-size: 14px;
  color: $text-1;
  font-weight: 500;
}

.code-value {
  width: 100%;
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: $primary;
  letter-spacing: 4px;
  padding: 12px 0;
  background: rgba(1, 149, 255, 0.06);
  border-radius: 10px;
  margin-bottom: 12px;
}

.copy-btn {
  width: 100%;
  height: 44px;
  background: $gradient-primary;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  &:active {
    opacity: 0.85;
  }
}

.copy-btn-text {
  font-size: 15px;
  color: #fff;
  font-weight: 500;
}

.ok-btn {
  width: 100%;
  height: 44px;
  background: $gradient-primary;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.85;
  }
}

.ok-btn-text {
  font-size: 16px;
  color: #fff;
  font-weight: 600;
}

/* ── Utilities ─────────────────────────────────────── */
.bottom-space {
  height: 20px;
}

.empty-state {
  padding: 10px 0;
  text-align: center;
}
</style>
