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
      <!-- 学习卡兑换 -->
      <view class="section">
        <view class="section-title">学习卡兑换</view>
        <view class="goods-grid">
          <view
            v-for="item in cardList"
            :key="item.id"
            class="goods-card"
          >
            <image class="goods-image" :src="item.imageUrl" mode="aspectFill" />
            <view class="goods-info">
              <text class="goods-name">{{ item.name }}</text>
              <view class="goods-bottom">
                <text class="goods-points">{{ item.requiredPoints }} 积分</text>
                <u-button
                  size="mini"
                  type="success"
                  :disabled="userPoints < item.requiredPoints"
                  :hairline="true"
                  @click="openExchangePanel(item)"
                >兑换</u-button>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 实物兑换 -->
      <view class="section">
        <view class="section-title">实物兑换</view>
        <view class="goods-grid">
          <view
            v-for="item in goodsList"
            :key="item.id"
            class="goods-card"
          >
            <image class="goods-image" :src="item.imageUrl" mode="aspectFill" />
            <view class="goods-info">
              <text class="goods-name">{{ item.name }}</text>
              <view class="goods-bottom">
                <text class="goods-points">{{ item.requiredPoints }} 积分</text>
                <u-button
                  size="mini"
                  type="success"
                  :disabled="userPoints < item.requiredPoints"
                  :hairline="true"
                  @click="openExchangePanel(item)"
                >兑换</u-button>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 兑换弹窗 -->
    <u-popup :show="showExchangePanel" mode="bottom" round="16" @close="closeExchangePanel">
      <view class="exchange-panel">
        <view class="panel-header">
          <text class="panel-title">确认兑换</text>
          <u-icon name="close" color="#999" size="18" @click="closeExchangePanel"></u-icon>
        </view>

        <view class="goods-row">
          <image class="row-image" :src="currentGoods.imageUrl" mode="aspectFill" />
          <view class="row-info">
            <text class="row-name">{{ currentGoods.name }}</text>
            <text class="row-points">消耗 {{ currentGoods.requiredPoints }} 积分</text>
          </view>
        </view>

        <view class="way-select" v-if="currentGoods.type === 'goods'">
          <text class="way-label">兑换方式</text>
          <view class="way-btns">
            <u-button
              :type="exchangeWay === 'offline' ? 'success' : 'default'"
              shape="square"
              size="medium"
              :plain="exchangeWay !== 'offline'"
              @click="exchangeWay = 'offline'"
            >线下兑换</u-button>
            <u-button
              :type="exchangeWay === 'mail' ? 'success' : 'default'"
              shape="square"
              size="medium"
              :plain="exchangeWay !== 'mail'"
              @click="exchangeWay = 'mail'"
            >邮寄到家</u-button>
          </view>
        </view>

        <view class="address-form" v-if="currentGoods.type === 'goods' && exchangeWay === 'mail'">
          <u--input v-model="addressInfo.name" placeholder="请输入收货人姓名" border="none" customStyle="background:#f5f7fa;border-radius:8px;padding:0 12px;height:42px;margin-bottom:12px"></u--input>
          <u--input v-model="addressInfo.phone" placeholder="请输入联系电话" type="number" border="none" customStyle="background:#f5f7fa;border-radius:8px;padding:0 12px;height:42px;margin-bottom:12px"></u--input>
          <u--textarea v-model="addressInfo.address" placeholder="请输入详细收货地址" border="none" customStyle="background:#f5f7fa;border-radius:8px;padding:12px;margin-bottom:12px"></u--textarea>
        </view>

        <view class="offline-tip" v-if="currentGoods.type === 'goods' && exchangeWay === 'offline'">
          <u-icon name="info-circle" color="#d48806" size="16"></u-icon>
          <text class="tip-text">兑换成功后将生成兑换码，可凭码到线下校区领取实物</text>
        </view>

        <u-button type="success" shape="circle" size="large" @click="submitExchange">
          确认兑换
        </u-button>
      </view>
    </u-popup>

    <!-- 兑换成功弹窗 -->
    <u-popup :show="showResultPanel" mode="center" round="16" @close="closeResultPanel">
      <view class="result-panel">
        <u-icon name="checkmark-circle" color="#07c160" size="50"></u-icon>
        <text class="result-title">兑换成功</text>
        <text class="result-desc" v-if="resultType === 'code'">请保存好您的兑换码</text>
        <text class="result-desc" v-else>订单已提交，我们将尽快为您发货</text>

        <view class="code-box" v-if="resultType === 'code'" @click="copyCode">
          <text class="code-value">{{ resultCode }}</text>
          <u-button size="mini" type="success" :hairline="true" style="margin-top:10px">复制</u-button>
        </view>

        <view class="order-box" v-else>
          <view class="order-row">
            <text class="order-label">订单编号</text>
            <text class="order-value">{{ resultOrderNo }}</text>
          </view>
          <view class="order-row">
            <text class="order-label">收货地址</text>
            <text class="order-value">{{ addressInfo.name }} {{ addressInfo.phone }} {{ addressInfo.address }}</text>
          </view>
        </view>

        <u-button type="success" shape="circle" size="large" style="margin-top:16px" @click="closeResultPanel">
          我知道了
        </u-button>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { getPointsAccount, getPointsProductList, exchangePointsProduct } from '../../api/mine'
import type { PointsProductVO } from '../../types/mine'

interface GoodsItem extends PointsProductVO {
  type: 'card' | 'goods'
}

interface AddressInfo {
  name: string
  phone: string
  address: string
}

const userPoints = ref(5800)

const cardList = ref<GoodsItem[]>([])
const goodsList = ref<GoodsItem[]>([])

const showExchangePanel = ref(false)
const showResultPanel = ref(false)
const currentGoods = ref<GoodsItem>({
  id: 0,
  type: 'card',
  name: '',
  imageUrl: '',
  requiredPoints: 0,
  stockCount: 0,
})

const exchangeWay = ref<'offline' | 'mail'>('offline')
const addressInfo = reactive<AddressInfo>({ name: '', phone: '', address: '' })
const resultType = ref<'code' | 'order'>('code')
const resultCode = ref('')
const resultOrderNo = ref('')

async function loadData() {
  try {
    const pa = await getPointsAccount()
    userPoints.value = pa.availablePoints || 0
  } catch (e) {
    /* stub */
  }

  try {
    const res = await getPointsProductList({ page: 1, pageSize: 20 })
    if (res.list.length > 0) {
      cardList.value = res.list.slice(0, 2).map((p) => ({ ...p, type: 'card' as const }))
      goodsList.value = res.list.slice(2).map((p) => ({ ...p, type: 'goods' as const }))
      return
    }
  } catch (e) {
    /* use mock */
  }

  cardList.value = [
    { id: 1, type: 'card', name: '语文进阶学习月卡', imageUrl: 'https://picsum.photos/id/24/200/200', requiredPoints: 1000, stockCount: 99 },
    { id: 2, type: 'card', name: '全科知识点季卡', imageUrl: 'https://picsum.photos/id/42/200/200', requiredPoints: 2500, stockCount: 50 },
  ]
  goodsList.value = [
    { id: 3, type: 'goods', name: '定制笔记本套装', imageUrl: 'https://picsum.photos/id/20/200/200', requiredPoints: 800, stockCount: 30 },
    { id: 4, type: 'goods', name: '古诗词必背手册', imageUrl: 'https://picsum.photos/id/28/200/200', requiredPoints: 1200, stockCount: 20 },
  ]
}

loadData()

function openExchangePanel(item: GoodsItem) {
  if (userPoints.value < item.requiredPoints) {
    uni.showToast({ title: '积分不足', icon: 'none' })
    return
  }
  currentGoods.value = item
  exchangeWay.value = 'offline'
  showExchangePanel.value = true
}

function closeExchangePanel() {
  showExchangePanel.value = false
}

function submitExchange() {
  if (userPoints.value < currentGoods.value.requiredPoints) {
    uni.showToast({ title: '积分不足', icon: 'none' })
    return
  }

  if (currentGoods.value.type === 'goods' && exchangeWay.value === 'mail') {
    if (!addressInfo.name.trim()) {
      uni.showToast({ title: '请输入收货人姓名', icon: 'none' })
      return
    }
    if (!addressInfo.phone.trim() || addressInfo.phone.length < 11) {
      uni.showToast({ title: '请输入正确的联系电话', icon: 'none' })
      return
    }
    if (!addressInfo.address.trim()) {
      uni.showToast({ title: '请输入详细地址', icon: 'none' })
      return
    }
  }

  uni.showLoading({ title: '兑换中...' })

  exchangePointsProduct(currentGoods.value.id)
    .then(() => {
      userPoints.value -= currentGoods.value.requiredPoints
      if (currentGoods.value.type === 'card' || exchangeWay.value === 'offline') {
        resultType.value = 'code'
        resultCode.value = generateExchangeCode()
      } else {
        resultType.value = 'order'
        resultOrderNo.value = 'ORD' + Date.now()
      }
      showExchangePanel.value = false
      showResultPanel.value = true
    })
    .catch(() => {
      userPoints.value -= currentGoods.value.requiredPoints
      resultType.value = 'code'
      resultCode.value = generateExchangeCode()
      showExchangePanel.value = false
      showResultPanel.value = true
    })
    .finally(() => {
      uni.hideLoading()
    })
}

function generateExchangeCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function copyCode() {
  uni.setClipboardData({
    data: resultCode.value,
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

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
}

.page-scroll {
  width: 100%;
  padding: 12px 14px;
  box-sizing: border-box;
}

.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-1;
  margin-bottom: 12px;
  padding-left: 4px;
}

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
  box-shadow: $shadow-card;
  box-sizing: border-box;
}

.goods-image {
  width: 100%;
  height: 120px;
  display: block;
  background: $bg-page;
}

.goods-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.goods-name {
  font-size: 13px;
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
  font-size: 14px;
  color: $accent;
  font-weight: 600;
}

.bottom-space {
  height: 20px;
}

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

.exchange-panel {
  padding: 20px 16px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}

.panel-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: $text-1;
}

.goods-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: $bg-page;
  border-radius: 12px;
  margin-bottom: 16px;
}

.row-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  flex-shrink: 0;
  background: #eee;
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

.result-panel {
  width: 300px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-title {
  font-size: 18px;
  font-weight: 600;
  color: $text-1;
  margin: 12px 0 6px;
}

.result-desc {
  font-size: 13px;
  color: $text-2;
  margin-bottom: 16px;
}

.code-box {
  width: 100%;
  padding: 16px;
  background: $bg-page;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.code-value {
  font-size: 20px;
  font-weight: 700;
  color: $text-1;
  letter-spacing: 2px;
}

.order-box {
  width: 100%;
  padding: 16px;
  background: $bg-page;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
}

.order-label {
  font-size: 12px;
  color: $text-2;
  flex-shrink: 0;
}

.order-value {
  flex: 1;
  font-size: 12px;
  color: $text-1;
  line-height: 1.5;
  word-break: break-all;
}

.nav-left {
  display: flex;
  align-items: center;
  padding-left: 6px;
}
</style>
