<template>
  <view class="home">
    <!-- 顶部：Logo + 搜索栏 -->
    <view class="header-bar">
      <view class="header-left">
        <text class="logo-text">智慧教育</text>
      </view>
      <view class="search-wrap" @click="goSearch">
        <u-icon name="search" color="#bbb" size="16"></u-icon>
        <text class="search-ph">搜索课程 / 老师</text>
      </view>
    </view>

    <!-- Banner 轮播 -->
    <view class="banner-wrap">
      <u-swiper v-if="bannerList.length" :list="bannerList" indicator indicator-mode="line" radius="14" height="130" img-mode="aspectFill"></u-swiper>
      <view v-else class="banner-placeholder">
        <text class="bp-text">智慧教育 学你所想</text>
      </view>
    </view>

    <!-- 金刚区导航 -->
    <view class="nav-card" v-if="navList.length">
      <view class="nav-item" v-for="(item, i) in navList" :key="i" @click="goLink(item.link)">
        <view class="nav-img icon-wrap">
          <text class="iconfont" :class="getNavIcon(item.name)"></text>
        </view>
        <text class="nav-name">{{ item.name }}</text>
      </view>
    </view>

    <!-- 优秀老师推荐 -->
    <view class="section">
      <view class="sec-head">
        <text class="sec-title">优秀老师推荐</text>
        <text class="sec-more" @click="goTeacherAll">全部 ›</text>
      </view>
      <scroll-view scroll-x class="teacher-scroll" v-if="teacherList.length">
        <view class="teacher-card" v-for="t in teacherList" :key="t.id" @click="goTeacher(t.id)">
          <image class="avatar" :src="t.avatarUrl" v-if="t.avatarUrl"></image>
          <view class="avatar ph" v-else>
            <text class="iconfont icon-renwensheke ph-icon"></text>
          </view>
          <text class="t-name">{{ t.name }}</text>
          <text class="t-title" v-if="t.titleName">{{ t.titleName }}</text>
        </view>
      </scroll-view>
      <u-empty v-else text="暂无推荐老师" mode="data" margin-top="16"></u-empty>
    </view>

    <!-- 精选课程 -->
    <view class="section">
      <view class="sec-head">
        <text class="sec-title">精选课程</text>
        <text class="sec-more" @click="goCourseAll">全部 ›</text>
      </view>
      <view class="course-grid" v-if="courseList.length">
        <CourseCard v-for="item in courseList" :key="item.id" :item="item" @click="goCourseDetail" />
      </view>
      <u-empty v-else text="暂无推荐课程" mode="data" margin-top="16"></u-empty>
    </view>

    <TabBar :current="0"></TabBar>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CourseCard from '../../components/CourseCard.vue'
import TabBar from '../../components/TabBar.vue'
import { getHomeBase, getHomeTeacher, getHomeCourse } from '../../api/home'
import { requireLogin } from '../../utils/auth'
import type { NavItem, TeacherItem, HomeCourseItem } from '../../types/home'

const bannerList = ref<{ image: string; url: string }[]>([])
const navList = ref<NavItem[]>([])
const teacherList = ref<TeacherItem[]>([])
const courseList = ref<HomeCourseItem[]>([])

/** 首页导航项 */
const navData: NavItem[] = [
  { name: '全部课程', link: '/pages/course/course' },
  { name: '在线考试', link: '/pages/exam/exam' },
  { name: '名师风采', link: '/pages/teacher/teacher' },
  { name: '我的学习', link: '/pages/mine/mine' },
]

async function loadData() {
  try {
    const base = await getHomeBase()
    bannerList.value = (base.banner || []).map((item) => ({ image: item.imageUrl, url: item.linkUrl }))
  } catch (e) { /* stub -> empty */ }
  navList.value = navData
  try { const t = await getHomeTeacher(); teacherList.value = t.list || [] } catch (e) { /* ignore */ }
  try { const c = await getHomeCourse(); courseList.value = c.list || [] } catch (e) { /* ignore */ }
}

onShow(loadData)

function goLink(url: string) {
  if (!url) return
  if (url === '/pages/exam/exam' && !requireLogin('登录后才能查看你的在线考试')) return
  if (url === '/pages/mine/mine' && !requireLogin('登录后才能查看我的学习')) return
  uni.navigateTo({ url }).catch(() => {})
}
function goAI() { uni.navigateTo({ url: '/pages/ai/chat' }).catch(() => {}) }
function goSearch() { uni.navigateTo({ url: '/pages/course/course' }).catch(() => {}) }
function goTeacher(id: number) { uni.navigateTo({ url: `/pages/teacher/teacher?tid=${id}` }).catch(() => {}) }
function goTeacherAll() { uni.navigateTo({ url: '/pages/teacher/teacher' }).catch(() => {}) }
function goCourseAll() { uni.navigateTo({ url: '/pages/course/course' }).catch(() => {}) }
function goCourseDetail(item: HomeCourseItem) { uni.navigateTo({ url: `/pages/course/detail?cid=${item.id}` }).catch(() => {}) }
function goExamAll() {
  if (!requireLogin('登录后才能查看你的在线考试')) return
  uni.navigateTo({ url: '/pages/exam/exam' }).catch(() => {})
}
function goExam(id: number) {
  if (!requireLogin('登录后才能查看考试详情')) return
  uni.navigateTo({ url: `/pages/exam/exam-detail?eid=${id}` }).catch(() => {})
}

/** 根据导航名称返回对应的 iconfont class */
function getNavIcon(name: string): string {
  const map: Record<string, string> = {
    '全部课程': 'icon-shuji',
    '在线考试': 'icon-shijuan',
    'AI 助教': 'icon-robot',
    '名师风采': 'icon-lianmengzhuanjia',
    '我的学习': 'icon-xuewei',
    '成长档案': 'icon-tongji',
  }
  for (const [key, val] of Object.entries(map)) {
    if (name.includes(key)) return val
  }
  return 'icon-kexuejishu'
}
</script>

<style scoped lang="scss">
.home {
  min-height: 100vh;
  padding-bottom: 20px;
}

/* ===== 顶部栏 ===== */
.header-bar {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  gap: 10px;
  background: $bg-card;
  padding-top: calc(12px + env(safe-area-inset-top));
}
.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: $primary;
  flex-shrink: 0;
}
.search-wrap {
  flex: 1;
  background: $bg-page;
  border-radius: 22px;
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 8px;
}
.search-ph { font-size: 13px; color: #bbb; }

/* ===== Banner ===== */
.banner-wrap { padding: 10px 14px 0; }
.banner-placeholder {
  height: 130px;
  border-radius: 14px;
  background: $gradient-primary;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bp-text { color: #fff; font-size: 16px; font-weight: 600; opacity: 0.9; }

/* ===== 金刚区导航 ===== */
.nav-card {
  background: $bg-card;
  margin: 12px 14px 0;
  border-radius: $radius-card;
  padding: 14px 6px 2px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  box-shadow: $shadow-card;
}
.nav-item {
  flex: 0 0 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 14px;
}
.nav-img { width: 56px; height: 56px; border-radius: 14px; }
.nav-img.icon-wrap { background: $primary-bg; color: $primary; display: flex; align-items: center; justify-content: center; }
.nav-img.icon-wrap .iconfont { font-size: 36px; }
.nav-name { font-size: 12px; color: $text-2; margin-top: 6px; text-align: center; }

/* ===== AI助教横幅 ===== */
.ai-banner {
  margin: 12px 14px 0;
  padding: 14px 16px;
  border-radius: $radius-card;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}
.ai-banner-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ai-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ai-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ai-title { font-size: 15px; font-weight: 600; color: #fff; }
.ai-desc { font-size: 11px; color: rgba(255, 255, 255, 0.75); }
.ai-enter {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 14px;
  border-radius: 16px;
}
.ai-enter-text { font-size: 12px; color: #fff; font-weight: 500; }

/* ===== 通用区块 ===== */
.section { margin-top: 16px; padding: 0 14px; }
.sec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.sec-title { font-size: 15px; font-weight: 700; color: $text-1; }
.sec-more { font-size: 11px; color: $text-3; }

/* ===== 老师推荐 ===== */
.teacher-scroll { white-space: nowrap; }
.teacher-card {
  display: inline-block;
  width: 80px;
  background: $bg-card;
  border-radius: 12px;
  padding: 10px 6px;
  text-align: center;
  margin-right: 10px;
  box-shadow: $shadow-card;
}
.avatar { width: 48px; height: 48px; border-radius: 50%; }
.avatar.ph {
  background: $primary-bg;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ph-icon { font-size: 24px; color: $primary; }
.t-name { display: block; font-size: 12px; color: $text-1; margin-top: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.t-title { display: block; font-size: 10px; color: $text-3; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ===== 课程网格 ===== */
.course-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

/* ===== 考试推荐 ===== */
.exam-scroll { white-space: nowrap; }
.exam-card {
  display: inline-flex;
  align-items: center;
  width: 240px;
  background: $bg-card;
  border-radius: 12px;
  padding: 12px;
  margin-right: 10px;
  box-shadow: $shadow-card;
  gap: 10px;
}
.exam-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: $primary-bg;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.exam-icon .iconfont { font-size: 24px; color: $primary; }
.exam-info { flex: 1; overflow: hidden; }
.exam-title { display: block; font-size: 13px; font-weight: 500; color: $text-1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.exam-meta { display: block; font-size: 11px; color: $text-3; margin-top: 4px; }
</style>
