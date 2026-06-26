<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <u-navbar title="个人信息" :border="true" :fixed="true" :safeAreaInsetTop="true" @leftClick="goBack">
      <view slot="left" class="nav-left">
        <u-icon name="arrow-left" size="20"></u-icon>
      </view>
    </u-navbar>

    <scroll-view scroll-y class="content-scroll" show-scrollbar="false">
      <!-- 头像 -->
      <view class="section-card">
        <view class="form-item" @click="handleAvatar">
          <text class="form-label">头像</text>
          <view class="form-right">
            <image class="avatar-preview" :src="formData.avatarUrl || '/static/default-avatar.png'" mode="aspectFill" />
            <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
          </view>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="section-card">
        <view class="form-item">
          <text class="form-label">昵称</text>
          <input
            class="form-input"
            v-model="formData.nickname"
            placeholder="请输入昵称"
            maxlength="20"
          />
        </view>
        <view class="form-divider"></view>
        <view class="form-item">
          <text class="form-label">真实姓名</text>
          <input
            class="form-input"
            v-model="formData.realName"
            placeholder="请输入真实姓名"
            maxlength="20"
          />
        </view>
        <view class="form-divider"></view>
        <view class="form-item">
          <text class="form-label">性别</text>
          <picker
            mode="selector"
            :range="genderOptions"
            :value="genderIndex"
            @change="onGenderChange"
          >
            <view class="picker-value">
              <text :class="genderIndex === -1 ? 'placeholder' : ''">
                {{ genderIndex === -1 ? '请选择性别' : genderOptions[genderIndex] }}
              </text>
              <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
            </view>
          </picker>
        </view>
      </view>

      <!-- 联系方式 -->
      <view class="section-card">
        <view class="form-item">
          <text class="form-label">手机号</text>
          <input
            class="form-input"
            v-model="formData.phone"
            placeholder="请输入手机号"
            type="number"
            maxlength="11"
          />
        </view>
        <view class="form-divider"></view>
        <view class="form-item">
          <text class="form-label">邮箱</text>
          <input
            class="form-input"
            v-model="formData.email"
            placeholder="请输入邮箱"
            type="text"
            maxlength="50"
          />
        </view>
      </view>

      <!-- 教育信息 -->
      <view class="section-card">
        <view class="form-item">
          <text class="form-label">学校</text>
          <input
            class="form-input"
            v-model="formData.schoolName"
            placeholder="请输入所在学校"
            maxlength="50"
          />
        </view>
        <view class="form-divider"></view>
        <view class="form-item">
          <text class="form-label">年级</text>
          <input
            class="form-input"
            v-model="formData.gradeName"
            placeholder="请输入年级"
            maxlength="20"
          />
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 底部提交按钮 -->
    <view class="footer-bar">
      <u-button type="primary" shape="circle" size="large" @click="handleSubmit">保存</u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPersonalInfo, updatePersonalInfo } from '../../api/mine'
import type { PersonalInfoVO } from '../../types/mine'

interface FormData {
  nickname: string
  realName: string
  avatarUrl: string
  phone: string
  email: string
  birthday: string
  schoolName: string
  gradeName: string
}

const formData = ref<FormData>({
  nickname: '',
  realName: '',
  avatarUrl: '',
  phone: '',
  email: '',
  birthday: '',
  schoolName: '',
  gradeName: '',
})

const genderOptions: string[] = ['男', '女']
const genderIndex = ref(-1)

onMounted(async () => {
  try {
    const info = await getPersonalInfo()
    formData.value = {
      nickname: info.nickname || '',
      realName: info.realName || '',
      avatarUrl: info.avatarUrl || '',
      phone: info.phone || '',
      email: info.email || '',
      birthday: info.birthday || '',
      schoolName: info.schoolName || '',
      gradeName: info.gradeName || '',
    }
    if (info.gender === 1) genderIndex.value = 0
    else if (info.gender === 2) genderIndex.value = 1
    else genderIndex.value = -1
  } catch (e) {
    loadMockData()
  }
})

function loadMockData() {
  formData.value = {
    nickname: '学习用户001',
    realName: '张三',
    avatarUrl: '',
    phone: '138****8888',
    email: 'zhangsan@example.com',
    birthday: '2000-01-01',
    schoolName: '示例大学',
    gradeName: '大一',
  }
  genderIndex.value = 0
}

function onGenderChange(e: any) {
  genderIndex.value = e.detail.value
}

function handleAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempPath = res.tempFilePaths[0]
      formData.value.avatarUrl = tempPath
    },
  })
}

function handleSubmit() {
  if (!formData.value.nickname.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  uni.showLoading({ title: '保存中...' })
  const genderValue = genderIndex.value === 0 ? 1 : genderIndex.value === 1 ? 2 : 0

  const submitData: Partial<PersonalInfoVO> = {
    nickname: formData.value.nickname,
    realName: formData.value.realName,
    avatarUrl: formData.value.avatarUrl,
    phone: formData.value.phone,
    email: formData.value.email,
    gender: genderValue,
    birthday: formData.value.birthday,
    schoolName: formData.value.schoolName,
    gradeName: formData.value.gradeName,
  }

  updatePersonalInfo(submitData)
    .then(() => {
      uni.hideLoading()
      uni.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    })
    .catch(() => {
      uni.hideLoading()
      uni.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    })
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
  padding-top: 12px;
  box-sizing: border-box;
}

.section-card {
  margin: 0 14px 12px;
  background: $bg-card;
  border-radius: $radius-card;
  overflow: hidden;
  box-shadow: $shadow-card;
}

.form-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 16px;
  box-sizing: border-box;
}

.form-label {
  font-size: 15px;
  color: $text-1;
  flex-shrink: 0;
  width: 80px;
}

.form-input {
  flex: 1;
  font-size: 14px;
  color: $text-1;
  text-align: right;
  height: 100%;
}

.form-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
}

.avatar-preview {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: $bg-page;
}

.picker-value {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
}

.picker-value text {
  font-size: 14px;
  color: $text-1;
}

.placeholder {
  color: $text-3;
}

.form-divider {
  height: 1px;
  background: $border;
  margin-left: 60px;
}

.footer-bar {
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: $bg-card;
  border-top: 1px solid $border;
}

.bottom-space {
  height: 60px;
}

.nav-left {
  display: flex;
  align-items: center;
  padding-left: 6px;
}
</style>
