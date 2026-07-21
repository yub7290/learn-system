<template>
  <view class="login">
    <view class="close-btn" @click="closeLogin">
      <u-icon name="close" color="#fff" size="18"></u-icon>
    </view>

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
        <u-input v-model="form.password" placeholder="请输入密码" border="none" :password="true"></u-input>
      </view>

      <view class="field">
        <u-icon name="info-circle" color="#0195ff" size="20"></u-icon>
        <u-input v-model="form.captchaCode" placeholder="请输入验证码" border="none"></u-input>
        <view class="captcha-tap" @click="loadCaptcha">
          <image v-if="captcha.image" class="captcha-img" :src="captcha.image" mode="aspectFit"></image>
          <view v-else class="captcha-img placeholder">点击加载</view>
        </view>
      </view>

      <u-button type="primary" shape="circle" :loading="loading" @click="doLogin" custom-style="margin-top:18px;height:42px;background:linear-gradient(135deg,#0195ff,#00c6ff);border:none">登 录</u-button>

      <view class="links">
        <text>忘记密码?</text>
        <text class="link" @click="goToRegister">注册账号</text>
      </view>
    </view>

    <!-- 第三方登录 -->
    <view class="third-party">
      <view class="divider">
        <view class="line"></view>
        <text class="text">其他登录方式</text>
        <view class="line"></view>
      </view>
      <view class="social-icons">
        <view class="social-item" @click="oauthLogin('wechat')">
          <view class="social-icon wechat">
            <u-icon name="weixin-circle-fill" color="#07c160" size="32"></u-icon>
          </view>
          <text class="social-name">微信</text>
        </view>
        <view class="social-item" @click="oauthLogin('qq')">
          <view class="social-icon qq">
            <u-icon name="qq-circle-fill" color="#12b7f5" size="32"></u-icon>
          </view>
          <text class="social-name">QQ</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCaptcha, getOAuthLoginUrl } from '../../api/auth'
import { sm3Hash } from '../../utils/sm3'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
const form = ref({ account: '', password: '', captchaCode: '' })
const captcha = ref({ key: '', image: '' })
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

async function oauthLogin(platform: string) {
  try {
    const res = await getOAuthLoginUrl(platform)
    if (res.url) {
      window.location.href = res.url
    }
  } catch (e) {
    // toast handled by request layer
  }
}

function closeLogin() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.reLaunch({ url: '/pages/index/index' })
  }
}

function goToRegister() {
  uni.navigateTo({ url: '/pages/register/register' })
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
.links { display: flex; justify-content: space-between; font-size: 12px; color: $text-3; margin-top: 12px; }
.link { color: $primary; }
.third-party { margin-top: 36px; }
.divider {
  display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
  .line { flex: 1; height: 1px; background: $border; }
  .text { font-size: 12px; color: $text-3; white-space: nowrap; }
}
.social-icons {
  display: flex; justify-content: center; gap: 40px;
}
.social-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.social-icon {
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  &.wechat { background: rgba(7,193,96,0.1); }
  &.qq { background: rgba(18,183,245,0.1); }
}
.social-name { font-size: 11px; color: $text-3; }
</style>
