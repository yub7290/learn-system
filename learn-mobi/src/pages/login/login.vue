<template>
  <view class="login">
    <!-- 渐变品牌头 -->
    <view class="brand-head">
      <view class="logo">LOGO</view>
      <view class="brand-name">智慧教育</view>
      <view class="brand-slogan">随时随地,学你所想</view>
    </view>

    <!-- 登录卡 -->
    <view class="login-card">
      <view class="card-title">学员登录</view>

      <view class="field">
        <u-icon name="account" color="#0195ff" size="20"></u-icon>
        <u-input v-model="form.account" placeholder="请输入账号" border="none" clearable></u-input>
      </view>

      <view class="field">
        <u-icon name="lock" color="#0195ff" size="20"></u-icon>
        <u-input v-model="form.password" :type="showPwd ? 'text' : 'password'" placeholder="请输入密码" border="none"></u-input>
        <u-icon :name="showPwd ? 'eye' : 'eye-off'" color="#bbb" size="20" @click="showPwd = !showPwd"></u-icon>
      </view>

      <view class="field">
        <u-icon name="info-circle" color="#0195ff" size="20"></u-icon>
        <u-input v-model="form.captchaCode" placeholder="请输入验证码" border="none"></u-input>
        <image v-if="captcha.image" class="captcha-img" :src="captcha.image" @click="loadCaptcha" mode="aspectFit"></image>
        <view v-else class="captcha-img placeholder" @click="loadCaptcha">点击加载</view>
      </view>

      <u-button type="primary" shape="circle" :loading="loading" @click="doLogin" custom-style="margin-top:18px;height:42px;background:linear-gradient(90deg,#0195ff,#00c6ff);border:none">登 录</u-button>

      <view class="links">
        <text>忘记密码?</text>
        <text class="link">注册账号</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCaptcha } from '../../api/auth'
import { sm3Hash } from '../../utils/sm3'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
const form = ref({ account: '', password: '', captchaCode: '' })
const captcha = ref({ key: '', image: '' })
const showPwd = ref(false)
const loading = ref(false)

onMounted(loadCaptcha)

async function loadCaptcha() {
  try {
    const res = await getCaptcha()
    captcha.value = res
  } catch (e) {
    // toast 已由 request 层提示
  }
}

async function doLogin() {
  if (!form.value.account || !form.value.password || !form.value.captchaCode) {
    uni.showToast({ title: '请填写完整', icon: 'none' })
    return
  }
  loading.value = true
  try {
    await userStore.login({
      account: form.value.account,
      password: sm3Hash(form.value.password),
      captchaKey: captcha.value.key,
      captchaCode: form.value.captchaCode,
    })
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => uni.reLaunch({ url: '/pages/index/index' }), 500)
  } catch (e) {
    loadCaptcha() // 验证码失效,刷新
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login { min-height: 100vh; background: #f5f7fa; }
.brand-head {
  background: linear-gradient(160deg, #0195ff, #00c6ff);
  padding: 40px 22px 50px; color: #fff;
  border-radius: 0 0 24px 24px;
}
.logo { width: 54px; height: 54px; border-radius: 14px; background: rgba(255,255,255,.2); display: flex; align-items: center; justify-content: center; font-size: 11px; }
.brand-name { font-size: 23px; font-weight: 700; margin-top: 16px; }
.brand-slogan { font-size: 13px; opacity: .85; margin-top: 4px; }
.login-card {
  background: #fff; border-radius: 16px; padding: 22px 18px;
  margin: -26px 22px 0; box-shadow: 0 10px 30px rgba(0,40,80,.1);
}
.card-title { font-size: 16px; font-weight: 700; color: #222; margin-bottom: 18px; }
.field {
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid #eef2f7; padding: 10px 0;
}
.captcha-img { width: 70px; height: 28px; border-radius: 6px; }
.captcha-img.placeholder { background: #e6f4ff; color: #0195ff; font-size: 11px; display: flex; align-items: center; justify-content: center; }
.links { display: flex; justify-content: space-between; font-size: 12px; color: #999; margin-top: 12px; }
.link { color: #0195ff; }
</style>
