<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <u-navbar :title="isEdit ? '编辑地址' : '新增地址'" :border="true" :fixed="true" :safeAreaInsetTop="true" @leftClick="goBack">
      <view slot="left" class="nav-left">
        <u-icon name="arrow-left" size="20"></u-icon>
      </view>
    </u-navbar>

    <scroll-view scroll-y class="content-scroll" show-scrollbar="false">
      <view class="form-card">
        <view class="form-item">
          <text class="form-label">收货人</text>
          <input
            class="form-input"
            v-model="form.name"
            placeholder="请输入收货人姓名"
            maxlength="20"
          />
        </view>
        <view class="form-divider"></view>

        <view class="form-item">
          <text class="form-label">联系电话</text>
          <input
            class="form-input"
            v-model="form.phone"
            placeholder="请输入联系电话"
            type="number"
            maxlength="11"
          />
        </view>
        <view class="form-divider"></view>

        <view class="form-item" @click="openRegionPicker">
          <text class="form-label">省市区</text>
          <view class="form-input region-input">
            <text :class="regionText ? 'region-text' : 'region-placeholder'">{{ regionText || '请选择省市区' }}</text>
            <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
          </view>
        </view>
        <view class="form-divider"></view>

        <view class="form-item form-item-textarea">
          <text class="form-label">详细地址</text>
          <textarea
            class="form-textarea"
            v-model="form.detail"
            placeholder="请输入详细地址，如街道、门牌号等"
            maxlength="120"
            :auto-height="true"
          />
        </view>
        <view class="form-divider"></view>

        <view class="form-item">
          <text class="form-label">设为默认地址</text>
          <switch
            :checked="form.isDefault === 1"
            color="#0195ff"
            @change="toggleDefault"
          />
        </view>
      </view>

      <view class="save-btn-wrap">
        <u-button
          type="primary"
          shape="circle"
          size="large"
          :loading="saving"
          @click="handleSave"
        >保存</u-button>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 省市区级联选择器 -->
    <u-picker
      :show="showRegionPicker"
      :columns="regionColumns"
      :defaultIndex="regionDefaultIndex"
      keyName="label"
      @confirm="onRegionConfirm"
      @cancel="showRegionPicker = false"
    ></u-picker>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { addAddress, updateAddress } from '../../api/address'
import type { AddressVO } from '../../types/mine'
import regionData from '../../static/region.json'

const isEdit = ref(false)
const editId = ref(0)
const saving = ref(false)
const showRegionPicker = ref(false)

const form = ref({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: 0,
})

const regionText = computed(() => {
  if (form.value.province && form.value.city && form.value.district) {
    return `${form.value.province} ${form.value.city} ${form.value.district}`
  }
  return ''
})

/** 省市区级联数据 */
const regionColumns = computed(() => {
  const provinces = regionData.map((p: any) => ({ label: p.name, value: p.name, children: p.children }))
  const cityIdx = selectedProvinceIdx.value
  const cities = cityIdx >= 0 && provinces[cityIdx]?.children
    ? provinces[cityIdx].children.map((c: any) => ({ label: c.name, value: c.name, children: c.children }))
    : []
  const cityIdx2 = selectedCityIdx.value
  const districts = cityIdx2 >= 0 && cities[cityIdx2]?.children
    ? cities[cityIdx2].children.map((d: any) => ({ label: d.name, value: d.name }))
    : []
  return [provinces, cities, districts]
})

const selectedProvinceIdx = ref(0)
const selectedCityIdx = ref(0)
const selectedDistrictIdx = ref(0)

const regionDefaultIndex = computed(() => [
  selectedProvinceIdx.value,
  selectedCityIdx.value,
  selectedDistrictIdx.value,
])

/** 打开省市区选择器 */
function openRegionPicker() {
  // 如果已有值，定位到对应索引
  if (form.value.province) {
    const pIdx = regionData.findIndex((p: any) => p.name === form.value.province)
    if (pIdx >= 0) {
      selectedProvinceIdx.value = pIdx
      const cities = regionData[pIdx]?.children || []
      const cIdx = cities.findIndex((c: any) => c.name === form.value.city)
      if (cIdx >= 0) {
        selectedCityIdx.value = cIdx
        const districts = cities[cIdx]?.children || []
        const dIdx = districts.findIndex((d: any) => d.name === form.value.district)
        selectedDistrictIdx.value = dIdx >= 0 ? dIdx : 0
      } else {
        selectedCityIdx.value = 0
        selectedDistrictIdx.value = 0
      }
    } else {
      selectedProvinceIdx.value = 0
      selectedCityIdx.value = 0
      selectedDistrictIdx.value = 0
    }
  } else {
    selectedProvinceIdx.value = 0
    selectedCityIdx.value = 0
    selectedDistrictIdx.value = 0
  }
  showRegionPicker.value = true
}

function onRegionConfirm(e: any) {
  const values = e.value
  if (values[0]) form.value.province = values[0].label
  if (values[1]) form.value.city = values[1].label
  if (values[2]) form.value.district = values[2].label
  showRegionPicker.value = false
}

/** 页面加载: 解析编辑模式的地址数据 */
onLoad((options) => {
  if (options?.data) {
    try {
      const addr: AddressVO = JSON.parse(decodeURIComponent(options.data))
      isEdit.value = true
      editId.value = addr.id
      form.value = {
        name: addr.name || '',
        phone: addr.phone || '',
        province: addr.province || '',
        city: addr.city || '',
        district: addr.district || '',
        detail: addr.detail || '',
        isDefault: addr.isDefault || 0,
      }
    } catch {
      // 忽略解析错误
    }
  }
})

function toggleDefault(e: any) {
  form.value.isDefault = e.detail.value ? 1 : 0
}

/** 表单校验 */
function validate(): boolean {
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入收货人', icon: 'none' })
    return false
  }
  if (!form.value.phone.trim() || form.value.phone.length < 11) {
    uni.showToast({ title: '请输入正确的联系电话', icon: 'none' })
    return false
  }
  if (!form.value.province || !form.value.city) {
    uni.showToast({ title: '请选择省市区', icon: 'none' })
    return false
  }
  if (!form.value.detail.trim()) {
    uni.showToast({ title: '请输入详细地址', icon: 'none' })
    return false
  }
  return true
}

/** 保存地址 */
async function handleSave() {
  if (!validate()) return

  uni.showLoading({ title: '保存中...' })
  saving.value = true
  try {
    if (isEdit.value) {
      await updateAddress({ id: editId.value, ...form.value })
    } else {
      await addAddress(form.value as Omit<AddressVO, 'id'>)
    }
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch {
    // 错误已由 request 拦截器处理
  } finally {
    uni.hideLoading()
    saving.value = false
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

.form-card {
  background: $bg-card;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
  overflow: hidden;
}

.form-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  min-height: 52px;
}

.form-item-textarea {
  flex-direction: column;
  align-items: flex-start;
  padding: 12px 16px;
}

.form-label {
  font-size: 15px;
  color: $text-1;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  height: 52px;
  text-align: right;
  font-size: 14px;
  color: $text-1;
}

.region-input {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.region-text {
  font-size: 14px;
  color: $text-1;
}

.region-placeholder {
  font-size: 14px;
  color: $text-3;
}

.form-textarea {
  width: 100%;
  min-height: 60px;
  font-size: 14px;
  color: $text-1;
  line-height: 1.5;
  padding-top: 10px;
}

.form-divider {
  height: 1px;
  background: $border;
  margin-left: 16px;
}

.save-btn-wrap {
  margin-top: 24px;
  padding: 0 4px;
}

.bottom-space {
  height: 40px;
  width: 100%;
}

.nav-left {
  display: flex;
  align-items: center;
  padding-left: 6px;
}
</style>
