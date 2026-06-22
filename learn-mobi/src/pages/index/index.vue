<template>
  <view class="home">
    <view class="search-bar">
      <view class="search" @click="goSearch">
        <u-icon name="search" color="#bbb" size="16"></u-icon>
        <text class="ph">搜索课程 / 老师</text>
      </view>
    </view>

    <view class="banner-wrap">
      <u-swiper v-if="bannerList.length" :list="bannerList" indicator indicator-mode="line" radius="14" height="120" img-mode="aspectFill"></u-swiper>
      <view v-else class="banner-placeholder">
        <text class="bp-text">智慧教育 · 学你所想</text>
      </view>
    </view>

    <view class="nav-card" v-if="navList.length">
      <view class="nav-item" v-for="(item, i) in navList" :key="i" @click="goLink(item.link)">
        <view class="nav-img icon-wrap">
          <text class="iconfont" :class="getNavIcon(item.name)"></text>
        </view>
        <text class="nav-name">{{ item.name }}</text>
      </view>
    </view>

    <view class="section">
      <view class="sec-head">
        <text class="sec-title">优秀老师推荐</text>
        <text class="sec-more" @click="goTeacherAll">全部 ›</text>
      </view>
      <scroll-view scroll-x class="teacher-scroll" v-if="teacherList.length">
        <view class="teacher-card" v-for="t in teacherList" :key="t.id" @click="goTeacher(t.id)">
          <image class="avatar" :src="t.avatarUrl" v-if="t.avatarUrl"></image>
          <view class="avatar ph" v-else></view>
          <text class="t-name">{{ t.name }}</text>
          <text class="t-title" v-if="t.titleName">{{ t.titleName }}</text>
        </view>
      </scroll-view>
      <u-empty v-else text="暂无推荐老师" mode="data" margin-top="20"></u-empty>
    </view>

    <view class="section">
      <view class="sec-head">
        <text class="sec-title">精选课程</text>
        <text class="sec-more" @click="goCourseAll">全部 ›</text>
      </view>
      <view class="course-grid" v-if="courseList.length">
        <CourseCard v-for="item in courseList" :key="item.id" :item="item" @click="goCourseDetail" />
      </view>
      <u-empty v-else text="暂无推荐课程" mode="data" margin-top="20"></u-empty>
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
import type { BannerItem, NavItem, TeacherItem, HomeCourseItem } from '../../types/home'

const bannerList = ref<{ image: string; url: string }[]>([])
const navList = ref<NavItem[]>([])
const teacherList = ref<TeacherItem[]>([])
const courseList = ref<HomeCourseItem[]>([])

/** 硬编码导航数据 */
const navData: NavItem[] = [
  { name: '全部课程', link: '/pages/course/course' },
  { name: '在线考试', link: '/pages/exam/exam' },
  { name: '我的学习', link: '/pages/mine/mine' },
  { name: '名师风采', link: '/pages/teacher/teacher' },
]

async function loadData() {
  try {
    const base = await getHomeBase()
    bannerList.value = (base.banner || []).map((item) => ({ image: item.imageUrl, url: item.linkUrl }))
  } catch (e) { /* stub -> empty */ }
  navList.value = navData
  try { const t = await getHomeTeacher(); teacherList.value = t.list || [] } catch (e) {}
  try { const c = await getHomeCourse(); courseList.value = c.list || [] } catch (e) {}
}

onShow(loadData)

function goLink(url: string) { if (url) uni.navigateTo({ url }).catch(() => {}) }
function goSearch() { uni.navigateTo({ url: '/pages/course/course' }).catch(() => {}) }
function goTeacher(id: number) { uni.showToast({ title: '老师详情', icon: 'none' }) }
function goTeacherAll() { uni.navigateTo({ url: '/pages/teacher/teacher' }).catch(() => {}) }
function goCourseAll() { uni.navigateTo({ url: '/pages/course/course' }).catch(() => {}) }
function goCourseDetail(item: HomeCourseItem) { uni.navigateTo({ url: `/pages/course/detail?cid=${item.id}` }).catch(() => {}) }

/** 根据导航名称返回对应的 iconfont class */
function getNavIcon(name: string): string {
  const map: Record<string, string> = {
    '全部课程': 'icon-kexuejishu',
    '在线考试': 'icon-shijuan',
    '我的学习': 'icon-xuexiao',
    '名师风采': 'icon-renwensheke',
    '课程': 'icon-xuexiao',
    '考试': 'icon-shijuan',
    '学习': 'icon-kexuejishu',
    '老师': 'icon-renwensheke',
    '教师': 'icon-renwensheke',
    'AI': 'icon-ai64',
    '成绩': 'icon-zhengshu',
    '证书': 'icon-zhengshu',
    '收藏': 'icon-shoucang',
  }
  for (const [key, val] of Object.entries(map)) {
    if (name.includes(key)) return val
  }
  return 'icon-kexuejishu'
}
</script>

<style scoped lang="scss">
.home { min-height: 100vh; padding-bottom: 20px; }
.search-bar { background: $bg-card; padding: 12px 14px; }
.search { background: $bg-page; border-radius: 22px; height: 36px; display: flex; align-items: center; padding: 0 14px; gap: 8px; }
.ph { font-size: 13px; color: #bbb; }
.banner-wrap { padding: 10px 14px 0; }
.nav-card { background: $bg-card; margin: 12px 14px 0; border-radius: $radius-card; padding: 14px 6px 2px; display: flex; justify-content: center; gap: 16px; box-shadow: $shadow-card; }
.nav-item { flex: 0 0 72px; display: flex; flex-direction: column; align-items: center; margin-bottom: 14px; }
.nav-img { width: 56px; height: 56px; border-radius: 14px; }
.nav-img.icon-wrap { background: $primary-bg; color: $primary; display: flex; align-items: center; justify-content: center; }
.nav-img.icon-wrap .iconfont { font-size: 36px; }
.nav-name { font-size: 12px; color: $text-2; margin-top: 6px; text-align: center; }
.section { margin-top: 16px; padding: 0 14px; }
.sec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.sec-title { font-size: 15px; font-weight: 700; color: $text-1; }
.sec-more { font-size: 11px; color: $text-3; }
.teacher-scroll { white-space: nowrap; }
.teacher-card { display: inline-block; width: 80px; background: $bg-card; border-radius: 12px; padding: 10px 6px; text-align: center; margin-right: 10px; box-shadow: $shadow-card; }
.avatar { width: 48px; height: 48px; border-radius: 50%; }
.avatar.ph { background: #d6dde6; }
.t-name { display: block; font-size: 12px; color: $text-1; margin-top: 6px; }
.course-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.banner-placeholder { height: 120px; border-radius: 14px; background: linear-gradient(135deg, $primary, $primary-light); display: flex; align-items: center; justify-content: center; }
.bp-text { color: #fff; font-size: 16px; font-weight: 600; opacity: .9; }
</style>
