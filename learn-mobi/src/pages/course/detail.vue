<template>
  <view class="detail-page">
    <view class="banner">
      <image v-if="info.course.bannerImg" :src="info.course.bannerImg" mode="aspectFill" class="banner-img"></image>
      <view class="banner-overlay">
        <view class="back" @click="goBack"><u-icon name="arrow-left" color="#fff" size="20"></u-icon></view>
        <text class="banner-title">{{ info.course.title || '课程详情' }}</text>
        <view class="banner-tags">
          <view class="banner-tag free" v-if="info.course.freeFlag">免费</view>
          <view class="banner-tag hot" v-else>热门</view>
        </view>
        <view class="banner-meta">
          <text class="banner-view">浏览 {{ info.course.viewNum || 0 }}次</text>
        </view>
      </view>
    </view>

    <!-- 开始学习按钮 -->
    <view class="start-bar" @click="startLearning">
      <view class="start-btn">
        <u-icon name="play-circle" color="#fff" size="20"></u-icon>
        <text class="start-text">开始学习</text>
      </view>
    </view>

    <view class="func-grid">
      <view class="func-item" v-for="(f, i) in funcList" :key="i" @click="clickFunc(f)">
        <view class="func-icon">
          <view v-if="f.iconfont" :class="['iconfont', f.iconfont]" style="font-size: 22px; color: #666;"></view>
          <u-icon v-else :name="f.icon" color="#666" size="22"></u-icon>
        </view>
        <text class="func-name">{{ f.name }}</text>
      </view>
    </view>

    <u-tabs :list="tabList" :current="tabIndex" @click="tabIndex = $event.index" line-color="#0195ff" :scrollable="false" :active-style="{ color: '#0195ff', fontWeight: 600 }"></u-tabs>

    <view class="content">
      <view v-if="tabIndex === 0" class="tab-panel">
        <rich-text class="text-content" :nodes="info.course.desc || '暂无课程介绍'"></rich-text>
      </view>
      <view v-if="tabIndex === 1" class="tab-panel">
        <view class="chapter-list">
          <view class="chapter-item" v-for="(ch, i) in info.chapter" :key="ch.id" @click="openStudy(ch.id)">
            <view class="ch-idx">{{ i + 1 }}</view>
            <text class="ch-name">{{ ch.name }}</text>
            <view class="ch-btn">学习</view>
          </view>
          <u-empty v-if="!info.chapter.length" text="暂无章节" mode="list" margin-top="30"></u-empty>
        </view>
      </view>
      <view v-if="tabIndex === 2" class="tab-panel">
        <rich-text class="text-content" :nodes="info.course.target || '暂无学习目标'"></rich-text>
      </view>
      <view v-if="tabIndex === 3" class="tab-panel">
        <view class="teacher-content">
          <image class="t-avatar" :src="info.teacher.avatar" v-if="info.teacher.avatar"></image>
          <view class="t-avatar ph" v-else></view>
          <text class="t-name">{{ info.teacher.name || '未知讲师' }}</text>
          <text class="t-intro">{{ info.teacher.intro || '暂无讲师简介' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCourseDetail } from '../../api/course'
import { getCourseFinalExam } from '../../api/exam'
import { requireLogin } from '../../utils/auth'
import type { CourseDetailVO } from '../../types/course'

const cid = ref(0)
const tabIndex = ref(1)  // 默认选中章节 tab
const tabList = [{ name: '课程介绍' }, { name: '章节' }, { name: '学习目标' }, { name: '讲师' }]
const info = ref<CourseDetailVO>({
  course: { title: '', bannerImg: '', viewNum: 0, freeFlag: false, desc: '', target: '' },
  chapter: [], teacher: { avatar: '', name: '', intro: '' },
})
const funcList = [
  { name: '视频/直播', icon: 'play-circle' },
  { name: '试题练习', icon: 'edit-pen' },
  { name: '在线测试', icon: 'grid' },
  { name: '结课考试', icon: 'checkmark-circle' },
  { name: '知识库', icon: 'bookmark' },
  { name: '课程公告', icon: 'bell' },
  { name: 'AI助教', icon: 'chat', iconfont: 'icon-ai64' },
  { name: '综合成绩', icon: 'star' },
]

onLoad((q: any) => { cid.value = Number(q.cid) || 0; if (cid.value) loadDetail() })

async function loadDetail() {
  try { info.value = await getCourseDetail(cid.value) } catch (e) { uni.showToast({ title: '课程加载失败', icon: 'none' }) }
}
function goBack() { uni.navigateBack().catch(() => uni.reLaunch({ url: '/pages/course/course' })) }

/** 开始学习：跳转到第一章 */
function startLearning() {
  if (!requireLogin('登录后才能开始学习并保存学习进度')) return
  if (info.value.chapter && info.value.chapter.length > 0) {
    openStudy(info.value.chapter[0].id)
  } else {
    uni.showToast({ title: '暂无章节内容', icon: 'none' })
  }
}

function openStudy(chId: number) {
  if (!requireLogin('登录后才能开始学习并保存学习进度')) return
  uni.navigateTo({ url: `/pages/course/study?cid=${cid.value}&chId=${chId}` }).catch(() => {})
}
function clickFunc(f: { name: string; icon?: string; iconfont?: string }) {
  if (f.name === 'AI助教') {
    if (!requireLogin('登录后才能使用 AI 助教')) return
    uni.navigateTo({ url: `/pages/ai/chat?courseId=${cid.value}` }).catch(() => {})
    return
  }
  if (f.name === '视频/直播') {
    // 跳转到学习页的第一个章节
    if (info.value.chapter && info.value.chapter.length > 0) {
      openStudy(info.value.chapter[0].id)
    } else { uni.showToast({ title: '暂无视频内容', icon: 'none' }) }
    return
  }
  if (f.name === '试题练习') {
    if (!requireLogin('登录后才能进行试题练习')) return
    uni.navigateTo({ url: `/pages/practice/index?courseId=${cid.value}` }).catch(() => {})
    return
  }
  if (f.name === '在线测试') {
    if (!requireLogin('登录后才能参加在线测试')) return
    uni.navigateTo({ url: `/pages/exam/online-test?courseId=${cid.value}` }).catch(() => {})
    return
  }
  if (f.name === '知识库') {
    uni.navigateTo({
      url: `/pages/course/knowledge-list?courseId=${cid.value}&courseName=${encodeURIComponent(info.value.course.title)}`,
    }).catch(() => {})
    return
  }
  if (f.name === '结课考试') {
    if (!requireLogin('登录后才能参加结课考试')) return
    handleFinalExam()
    return
  }
  if (f.name === '课程公告') {
    uni.navigateTo({ url: `/pages/course/announcement-list?cid=${cid.value}` }).catch(() => {})
    return
  }
  if (f.name === '综合成绩') {
    if (!requireLogin('登录后才能查看综合成绩')) return
    uni.navigateTo({ url: `/pages/course/comprehensive-score?courseId=${cid.value}` }).catch(() => {})
    return
  }
  uni.showToast({ title: `${f.name}功能即将上线`, icon: 'none' })
}

async function handleFinalExam() {
  try {
    uni.showLoading({ title: '加载中...', mask: true })
    const data = await getCourseFinalExam(cid.value)
    uni.hideLoading()
    if (data && data.examId) {
      uni.navigateTo({ url: `/pages/exam/exam-detail?courseId=${cid.value}&final=1` }).catch(() => {})
    } else {
      uni.showToast({ title: '暂无结课考试', icon: 'none' })
    }
  } catch {
    uni.hideLoading()
    uni.showToast({ title: '暂无结课考试', icon: 'none' })
  }
}
</script>

<style scoped lang="scss">
.detail-page { min-height: 100vh; }
.banner { position: relative; height: 180px; overflow: hidden; }
.banner-img { position: absolute; width: 100%; height: 100%; z-index: 0; object-fit: cover; }
.banner-overlay { position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 14px; color: #fff; background: linear-gradient(180deg, rgba(0,0,0,.3), rgba(0,0,0,.55)); }
.back { width: 30px; height: 30px; border-radius: 50%; background: rgba(0,0,0,.25); display: flex; align-items: center; justify-content: center; }
.banner-title { position: absolute; top: 14px; left: 54px; right: 14px; font-size: 15px; font-weight: 600; line-height: 30px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.banner-tags { display: flex; gap: 8px; align-self: flex-start; }
.banner-tag { font-size: 11px; padding: 3px 10px; border-radius: 12px; background: rgba(255,255,255,.9); }
.banner-tag.free { color: #07c160; }
.banner-tag.hot { color: $accent; }
.banner-meta { text-align: right; }
.banner-view { font-size: 11px; }

/* 开始学习按钮条 */
.start-bar { margin: -18px 12px 0; position: relative; z-index: 2; }
.start-btn { display: flex; align-items: center; justify-content: center; gap: 6px; background: $gradient-primary; color: #fff; padding: 10px 0; border-radius: 21px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(1,149,255,.35); }
.start-text { font-size: 15px; }

.func-grid { background: $bg-card; margin: 10px 12px 0; border-radius: 12px; padding: 12px 4px; display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; box-shadow: $shadow-card; }
.func-item { text-align: center; padding: 4px 0; }
.func-icon { width: 36px; height: 36px; border-radius: 10px; background: $primary-bg; margin: 0 auto 4px; display: flex; align-items: center; justify-content: center; }
.func-name { font-size: 10px; color: $text-2; }
.content { background: $bg-card; margin: 10px 12px 0; border-radius: 12px; padding: 14px; min-height: 200px; }
.text-content { font-size: 14px; color: $text-2; line-height: 1.7; }
.chapter-item { display: flex; align-items: center; padding: 11px 0; border-bottom: 1px solid $border; }
.ch-idx { width: 22px; height: 22px; border-radius: 50%; background: $primary-bg; color: $primary; font-size: 11px; display: flex; align-items: center; justify-content: center; }
.ch-name { flex: 1; margin-left: 10px; font-size: 13px; color: $text-1; }
.ch-btn { font-size: 11px; color: $bg-card; background: linear-gradient(135deg,$primary,$primary-light); padding: 4px 12px; border-radius: 12px; }
.teacher-content { text-align: center; padding: 10px 0; }
.t-avatar { width: 64px; height: 64px; border-radius: 50%; }
.t-avatar.ph { width: 64px; height: 64px; border-radius: 50%; background: #d6dde6; }
.t-name { display: block; font-size: 15px; font-weight: 600; margin-top: 8px; color: $text-1; }
.t-intro { display: block; font-size: 13px; color: $text-3; margin-top: 6px; line-height: 1.6; }
</style>
