<template>
  <view class="login">
    <view class="close-btn" @click="goBack">
      <u-icon name="close" color="#fff" size="18"></u-icon>
    </view>

    <!-- 渐变品牌头 -->
    <view class="brand-head">
      <view class="logo">LOGO</view>
      <view class="brand-name">智慧教育</view>
      <view class="brand-slogan">随时随地,学你所想</view>
    </view>

    <!-- 注册卡 -->
    <view class="login-card">
      <view class="card-title">学员注册</view>

      <view class="field">
        <u-icon name="account" color="#0195ff" size="20"></u-icon>
        <u-input v-model="form.account" placeholder="请输入手机号/账号" border="none" clearable></u-input>
      </view>

      <view class="field">
        <u-icon name="lock" color="#0195ff" size="20"></u-icon>
        <u-input v-model="form.password" placeholder="请输入密码" border="none" :password="true"></u-input>
      </view>

      <view class="field">
        <u-icon name="lock" color="#0195ff" size="20"></u-icon>
        <u-input v-model="form.confirmPassword" placeholder="请确认密码" border="none" :password="true"></u-input>
      </view>

      <view class="field">
        <u-icon name="info-circle" color="#0195ff" size="20"></u-icon>
        <u-input v-model="form.captchaCode" placeholder="请输入验证码" border="none"></u-input>
        <view class="captcha-tap" @click="loadCaptcha">
          <image v-if="captcha.image" class="captcha-img" :src="captcha.image" mode="aspectFit"></image>
          <view v-else class="captcha-img placeholder">点击加载</view>
        </view>
      </view>

      <view class="field" v-if="inviterId">
        <u-icon name="gift" color="#0195ff" size="20"></u-icon>
        <u-input v-model="inviterId" placeholder="邀请码" border="none" disabled></u-input>
      </view>

      <u-button type="primary" shape="circle" :loading="loading" @click="doRegister" custom-style="margin-top:18px;height:42px;background:linear-gradient(135deg,#0195ff,#00c6ff);border:none">注 册</u-button>

      <view class="links">
        <text class="link" @click="goBack">已有账号?去登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCaptcha } from '../../api/auth'
import { register, shareRegister } from '../../api/mine'
import { sm3Hash } from '../../utils/sm3'

const form = ref({ account: '', password: '', confirmPassword: '', captchaCode: '' })
const captcha = ref({ key: '', image: '' })
const loading = ref(false)
const inviterId = ref('')

onMounted(() => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  inviterId.value = page?.options?.inviter || ''
  loadCaptcha()
})

async function loadCaptcha() {
  try {
    const res = await getCaptcha()
    captcha.value = res
  } catch {
    // toast 已由 request 层提示
  }
}

async function doRegister() {
  if (!form.value.account || !form.value.password || !form.value.captchaCode) {
    uni.showToast({ title: '请填写完整', icon: 'none' })
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
    return
  }
  loading.value = true
  try {
    await register({
      account: form.value.account,
      password: sm3Hash(form.value.password),
      captchaKey: captcha.value.key,
      captchaCode: form.value.captchaCode,
    })
    if (inviterId.value) {
      try {
        await shareRegister(Number(inviterId.value))
      } catch {
        // 邀请奖励失败不阻断注册
      }
    }
    uni.showToast({ title: '注册成功', icon: 'success' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/login/login' })
    }, 500)
  } catch {
    loadCaptcha()
  } finally {
    loading.value = false
  }
}

function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.reLaunch({ url: '/pages/login/login' })
  }
}
</script>

<style scoped lang="scss">
.login { min-height: 100vh; background: $bg-page; }
.close-btn {
  position: fixed;
  right: 16px;
  top: calc(12px + env(safe-area-inset-top));
  z-index: 10;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:active { opacity: 0.75; }
.brand-head {
  background: linear-gradient(135deg, $primary, $primary-light);
  padding: 40px 22px 50px; color: #fff;
  border-radius: 0 0 24px 24px;
}
.logo { width: 54px; height: 54px; border-radius: 14px; background: rgba(255,255,255,.2); display: flex; align-items: center; justify-content: center; font-size: 11px; }
.brand-name { font-size: 23px; font-weight: 700; margin-top: 16px; }
.brand-slogan { font-size: 13px; opacity: .85; margin-top: 4px; }
.login-card {
  background: $bg-card; border-radius: 16px; padding: 22px 18px;
  margin: -26px 22px 0; box-shadow: 0 10px 30px rgba(0,40,80,.1);
}
.card-title { font-size: 16px; font-weight: 700; color: $text-1; margin-bottom: 18px; }
.field {
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid $border; padding: 10px 0;
}
.captcha-tap { width: auto; height: auto; display: flex; align-items: center; }
.captcha-img { width: 120px; height: 48px; border-radius: 8px; }
.captcha-img.placeholder { width: 120px; height: 48px; background: $primary-bg; color: $primary; font-size: 13px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
.links { display: flex; justify-content: center; font-size: 12px; color: $text-3; margin-top: 12px; }
.link { color: $primary; }
</style>
