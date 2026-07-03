<template>
  <view class="note-page">
    <!-- 顶部导航 -->
    <view class="top-nav">
      <view class="back" @click="goBack">
        <u-icon name="arrow-left" color="#333" size="20"></u-icon>
      </view>
      <view class="nav-center">
        <u-icon name="edit-pen" color="#9b59b6" size="22"></u-icon>
        <text class="nav-title">我的笔记</text>
      </view>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 课程 Tab 切换 -->
    <scroll-view scroll-x class="course-tabs" show-scrollbar="false">
      <view class="tabs-inner">
        <view
          v-for="tab in courseTabs"
          :key="tab.courseId"
          class="tab-item"
          :class="{ active: currentCourseId === tab.courseId }"
          @click="switchCourse(tab.courseId)"
        >
          <text class="tab-text">{{ tab.courseName }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 笔记列表 -->
    <scroll-view scroll-y class="list-scroll" show-scrollbar="false">
      <view class="list-content" v-if="list.length">
        <view
          class="note-card"
          v-for="(item, index) in list"
          :key="item.id"
          :style="{ animationDelay: index * 0.05 + 's' }"
        >
          <!-- 卡片头部：类型标签 + 操作按钮 -->
          <view class="card-header">
            <view class="type-tag" :style="{ background: getTypeBg(item.questionType), color: getTypeColor(item.questionType) }">
              {{ getTypeLabel(item.questionType) }}
            </view>
            <view class="card-actions">
              <view class="action-btn" @click.stop="editNote(item)">
                <u-icon name="edit-pen" color="#0195ff" size="14"></u-icon>
                <text class="action-text">编辑</text>
              </view>
              <view class="action-btn delete" @click.stop="confirmDelete(item)">
                <u-icon name="trash" color="#f56c6c" size="14"></u-icon>
                <text class="action-text delete-text">删除</text>
              </view>
            </view>
          </view>

          <!-- 题目内容 -->
          <text class="question-content" @click="goQuestion(item)">{{ stripHtml(item.questionContent) }}</text>

          <!-- 笔记内容 -->
          <view class="note-body" @click="goQuestion(item)">
            <view class="note-icon">
              <u-icon name="edit-pen" color="#f59e0b" size="14"></u-icon>
            </view>
            <text class="note-text">{{ item.noteContent }}</text>
          </view>

          <!-- 底部时间 -->
          <view class="card-footer">
            <text class="time-text">{{ item.createTime }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-wrap" v-if="!loading && !list.length">
        <u-empty text="暂无笔记" mode="data" margin-top="60"></u-empty>
        <view class="empty-action" @click="goPractice">
          <text>去练习</text>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-wrap" v-if="loading">
        <u-loading-icon mode="circle" size="36"></u-loading-icon>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 编辑笔记弹窗 -->
    <view class="modal-mask" v-if="showEditModal" @click="showEditModal = false">
      <view class="edit-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">编辑笔记</text>
          <view class="modal-close" @click="showEditModal = false">
            <u-icon name="close" color="#999" size="16"></u-icon>
          </view>
        </view>
        <view class="modal-question">
          <text class="modal-q-text">{{ stripHtml(editingNote?.questionContent || '') }}</text>
        </view>
        <textarea
          class="note-input"
          v-model="editContent"
          placeholder="记录你的解题思路、易错点、知识点总结..."
          maxlength="500"
          auto-height
        />
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showEditModal = false">
            <text>取消</text>
          </view>
          <view class="modal-btn confirm" @click="saveEdit">
            <text>保存</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getNotes, deleteNote, updateNote, getAllCoursesPracticeOverview } from '../../api/practice'
import type { NoteVO, CoursePracticeOverviewVO } from '../../types/practice'

interface CourseTab {
  courseId: number
  courseName: string
}

const currentCourseId = ref(0)
const courseTabs = ref<CourseTab[]>([{ courseId: 0, courseName: '全部' }])
const allCourses = ref<CoursePracticeOverviewVO[]>([])
const list = ref<NoteVO[]>([])
const loading = ref(true)

const showEditModal = ref(false)
const editingNote = ref<NoteVO | null>(null)
const editContent = ref('')

const typeLabels: Record<number, string> = { 0: '单选', 1: '多选', 2: '判断', 3: '填空', 4: '简答' }
const typeColors: Record<number, string> = { 0: '#0195ff', 1: '#f59e0b', 2: '#10b981', 3: '#8b5cf6', 4: '#ec4899' }

function getTypeLabel(t: number) { return typeLabels[t] ?? '未知' }
function getTypeColor(t: number) { return typeColors[t] ?? '#999' }
function getTypeBg(t: number) { return (typeColors[t] || '#999') + '18' }
function stripHtml(html: string) { return html?.replace(/<[^>]+>/g, '').trim() || '' }

onLoad(() => {})
onShow(() => { loadCourses() })

async function loadCourses() {
  try {
    const data = await getAllCoursesPracticeOverview()
    allCourses.value = data
    courseTabs.value = [
      { courseId: 0, courseName: '全部' },
      ...data.map(item => ({ courseId: item.courseId, courseName: item.courseName }))
    ]
  } catch {
    courseTabs.value = [{ courseId: 0, courseName: '全部' }]
  }
  loadNotes()
}

async function loadNotes() {
  loading.value = true
  try {
    const data = await getNotes(currentCourseId.value)
    list.value = data
    if (!data || data.length === 0) {
      list.value = getMockList()
    }
  } catch {
    list.value = getMockList()
  } finally {
    loading.value = false
  }
}

function switchCourse(courseId: number) {
  currentCourseId.value = courseId
  loadNotes()
}

function getMockList(): NoteVO[] {
  return [
    { id: 1, questionId: 1, courseId: currentCourseId.value, questionType: 0, questionContent: '计算 1/2 + 1/3 的结果，正确的是？', noteContent: '异分母加减必须先通分，不能分子分母直接加，容易和分数乘法搞混。', createTime: '2026-06-20 14:30' },
    { id: 2, questionId: 4, courseId: currentCourseId.value, questionType: 2, questionContent: '一根绳子用去 2/5 米，还剩全长的 2/5，用去的和剩下的相比？', noteContent: '分率和具体量要区分开，这里问的是比较，统一换算成分率就清楚了。', createTime: '2026-06-18 09:15' },
  ]
}

function editNote(item: NoteVO) {
  editingNote.value = item
  editContent.value = item.noteContent
  showEditModal.value = true
}

async function saveEdit() {
  if (!editingNote.value || !editContent.value.trim()) return
  try {
    await updateNote(editingNote.value.id, editContent.value.trim())
    editingNote.value.noteContent = editContent.value.trim()
    showEditModal.value = false
    uni.showToast({ title: '笔记已更新', icon: 'success' })
  } catch {
    uni.showToast({ title: '更新失败', icon: 'none' })
  }
}

function confirmDelete(item: NoteVO) {
  uni.showModal({
    title: '确认删除',
    content: '确定删除这条笔记吗？删除后不可恢复。',
    confirmColor: '#f56c6c',
    success: async (res) => {
      if (!res.confirm) return
      try {
        await deleteNote(item.id)
        list.value = list.value.filter(i => i.id !== item.id)
        uni.showToast({ title: '已删除', icon: 'success' })
      } catch {
        uni.showToast({ title: '删除失败', icon: 'none' })
      }
    },
  })
}

function goBack() { uni.navigateBack().catch(() => {}) }
function goPractice() { uni.reLaunch({ url: '/pages/index/index' }) }
function goQuestion(item: NoteVO) {
  uni.navigateTo({
    url: `/pages/practice/question?courseId=${item.courseId || 0}&chapterId=0&practiceMode=1`
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.note-page {
  min-height: 100vh;
  background: $bg-page;
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.top-nav {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  padding-top: calc(12px + constant(safe-area-inset-top));
  padding-top: calc(12px + env(safe-area-inset-top));
  background: $bg-card;
  border-bottom: 1px solid $border;
}
.back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f7fa;
}
.nav-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: $text-1;
}
.nav-placeholder {
  width: 36px;
}

/* 课程 Tab */
.course-tabs {
  flex-shrink: 0;
  background: $bg-card;
  white-space: nowrap;
  border-bottom: 1px solid $border;
}
.tabs-inner {
  display: inline-flex;
  padding: 10px 14px;
  gap: 10px;
}
.tab-item {
  padding: 6px 16px;
  border-radius: 16px;
  background: #f5f7fa;
  flex-shrink: 0;
  transition: all 0.2s;
}
.tab-item.active {
  background: $gradient-primary;
  box-shadow: 0 2px 8px rgba(1, 149, 255, 0.3);
}
.tab-text {
  font-size: 13px;
  color: $text-2;
}
.tab-item.active .tab-text {
  color: #fff;
  font-weight: 500;
}

/* 列表滚动区 */
.list-scroll {
  flex: 1;
  width: 100%;
  height: 0;
}
.list-content {
  padding: 12px 14px;
}

/* 笔记卡片 */
.note-card {
  background: $bg-card;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: $shadow-card;
  position: relative;
  animation: fadeInUp 0.3s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.type-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 8px;
  font-weight: 500;
}
.card-actions {
  display: flex;
  gap: 12px;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}
.action-btn:active {
  background: #f5f7fa;
}
.action-text {
  font-size: 12px;
  color: $text-3;
}
.action-text.delete-text {
  color: #f56c6c;
}

/* 题目内容 */
.question-content {
  font-size: 14px;
  color: $text-2;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10px;
}

/* 笔记内容 */
.note-body {
  display: flex;
  gap: 8px;
  background: linear-gradient(135deg, #fffbe6 0%, #fff8e1 100%);
  border-radius: 10px;
  padding: 12px;
  border-left: 3px solid #f59e0b;
}
.note-icon {
  flex-shrink: 0;
  margin-top: 2px;
}
.note-text {
  font-size: 14px;
  color: #8a6d0b;
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 卡片底部 */
.card-footer {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}
.time-text {
  font-size: 12px;
  color: $text-3;
}

/* 空状态 */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40px;
}
.empty-action {
  margin-top: 16px;
  padding: 8px 24px;
  background: $gradient-primary;
  border-radius: 20px;
  text {
    color: #fff;
    font-size: 14px;
  }
}

/* 加载状态 */
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

/* 编辑弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.edit-modal {
  width: 85%;
  background: $bg-card;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid $border;
}
.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-1;
}
.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-question {
  padding: 12px 16px;
  background: #f8f9fa;
}
.modal-q-text {
  font-size: 13px;
  color: $text-2;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.note-input {
  width: 100%;
  min-height: 160px;
  padding: 16px;
  font-size: 14px;
  color: $text-1;
  line-height: 1.6;
  box-sizing: border-box;
  border: none;
}
.modal-footer {
  display: flex;
  border-top: 1px solid $border;
}
.modal-btn {
  flex: 1;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}
.modal-btn.cancel {
  color: $text-3;
  border-right: 1px solid $border;
}
.modal-btn.confirm {
  color: $primary;
  font-weight: 500;
}

.bottom-space {
  height: 20px;
  width: 100%;
}
</style>
