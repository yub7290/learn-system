const BASE_URL = 'http://localhost:8001/api'

export default {
  data() {
    return {
      cid: 0,
      chId: 0,
      cacheKey: "",
      mediaType: "video",
      mediaSrc: "",
      playProgress: 0,
      totalStudySecond: 0,
      studyTimer: null as any,
      drawerShow: false,
      chapterAllList: [] as Array<any>,
      currentChapterId: 0,
      bottomTabList: [{ name: "章节列表" }, { name: "交流" }, { name: "学习内容" }, { name: "附件" }, { name: "返回课程" }],
      currentBottomTab: 2,
      studyArticle: "",
      attachList: [] as Array<any>,
      chatInput: "",
      chatMsgList: [] as Array<any>,
      chatPage: 1,
      uploadThrottleTimer: null as any,
      offlineQueue: [] as Array<any>,
      minValidSecond: 10,
      finishPercent: 0.9
    }
  },
  onLoad(option) {
    this.cid = Number(option.cid) || 0
    this.chId = Number(option.chId) || 0
    this.cacheKey = 'study_record_' + this.cid + '_' + this.chId

    const cache = uni.getStorageSync(this.cacheKey)
    if (cache != null) {
      this.playProgress = cache.playSecond || 0
      this.totalStudySecond = cache.totalStudySecond || 0
    }

    const offlineData = uni.getStorageSync("study_offline_queue")
    if (Array.isArray(offlineData) && offlineData.length > 0) {
      this.offlineQueue = offlineData
      this.batchUploadOffline()
    }

    this.getChapterDetail()
    this.getAllChapterList()
  },
  onShow() { this.startTimer() },
  onHide() {
    this.pauseTimer()
    this.saveLocalCache()
    this.throttleUploadRecord()
  },
  onUnload() {
    this.clearAllTimer()
    this.saveLocalCache()
    this.uploadStudyRecord(true)
  },
  onReady() {
    if (this.offlineQueue.length > 0) this.batchUploadOffline()
  },
  methods: {
    startTimer() {
      if (this.studyTimer != null) return
      this.studyTimer = setInterval(() => {
        this.totalStudySecond += 1
        if (this.totalStudySecond % 30 === 0) {
          this.saveLocalCache()
          this.throttleUploadRecord()
        }
      }, 1000)
    },
    pauseTimer() {
      if (this.studyTimer != null) { clearInterval(this.studyTimer); this.studyTimer = null }
    },
    clearAllTimer() {
      this.pauseTimer()
      if (this.uploadThrottleTimer != null) { clearTimeout(this.uploadThrottleTimer); this.uploadThrottleTimer = null }
    },
    handleTimeUpdate(e) {
      if (this.mediaType === "live") return
      this.playProgress = Number(e.detail.currentTime.toFixed(0))
      const totalDuration = e.detail.duration || 0
      if (totalDuration > 0 && (this.playProgress / totalDuration) >= this.finishPercent) {
        uni.setStorageSync('chapter_finish_' + this.currentChapterId, true)
      }
    },
    handleVideoEnd() {
      this.playProgress = 0
      this.pauseTimer()
      this.saveLocalCache()
      this.uploadStudyRecord()
      uni.removeStorageSync(this.cacheKey)
    },
    saveLocalCache() {
      uni.setStorageSync(this.cacheKey, { playSecond: this.playProgress, totalStudySecond: this.totalStudySecond })
    },
    clearChapterCache() { uni.removeStorageSync(this.cacheKey) },
    throttleUploadRecord() {
      if (this.uploadThrottleTimer != null) return
      this.uploadThrottleTimer = setTimeout(() => {
        this.uploadStudyRecord()
        if (this.uploadThrottleTimer != null) { clearTimeout(this.uploadThrottleTimer); this.uploadThrottleTimer = null }
      }, 3000)
    },
    uploadStudyRecord(isForce) {
      if (this.cid === 0 || this.currentChapterId === 0) return
      if (!isForce && this.totalStudySecond < this.minValidSecond) return

      const record = { courseId: this.cid, chapterId: this.currentChapterId, playSecond: this.playProgress, totalStudySecond: this.totalStudySecond }

      uni.request({
        url: BASE_URL + '/student/study/saveRecord',
        method: 'POST',
        data: record,
        success: () => {},
        fail: () => {
          this.offlineQueue.push(record)
          uni.setStorageSync("study_offline_queue", this.offlineQueue)
          uni.showToast({ title: "网络异常，记录已离线保存", icon: "none", duration: 1500 })
        }
      })
    },
    batchUploadOffline() {
      if (this.offlineQueue.length === 0) return
      const copyQueue = [...this.offlineQueue]
      let done = 0
      copyQueue.forEach((item) => {
        uni.request({
          url: BASE_URL + '/study/saveRecord',
          method: 'POST',
          data: item,
          success: () => { done++; if (done === copyQueue.length) { this.offlineQueue = []; uni.setStorageSync("study_offline_queue", []) } },
          fail: () => { done++ }
        })
      })
    },
    switchChapter(ch) {
      this.pauseTimer()
      this.saveLocalCache()
      this.uploadStudyRecord(true)
      this.clearChapterCache()

      this.currentChapterId = ch.id
      this.mediaSrc = ch.mediaSrc
      this.mediaType = ch.mediaType || 'video'
      this.cacheKey = 'study_record_' + this.cid + '_' + ch.id

      const cache = uni.getStorageSync(this.cacheKey)
      if (cache != null) {
        this.playProgress = cache.playSecond || 0
        this.totalStudySecond = cache.totalStudySecond || 0
      } else {
        this.playProgress = 0
        this.totalStudySecond = 0
      }

      this.chatMsgList = []
      this.chatPage = 1
      this.studyArticle = ch.article || ''
      this.attachList = ch.attachList || []
      this.startTimer()
      this.closeDrawer()
    },
    openDrawer() { this.drawerShow = true },
    closeDrawer() { this.drawerShow = false },
    handleTabClick(idx) {
      if (idx === 4) { uni.navigateBack(); return }
      if (idx === 0) { this.openDrawer(); return }
      if (idx === 1) { this.loadChatHistory() }
      this.currentBottomTab = idx
    },
    loadChatHistory() {
      uni.request({
        url: BASE_URL + '/chat/list',
        method: 'GET',
        data: { chapterId: this.currentChapterId, page: this.chatPage, pageSize: 20 },
        success: (res) => {
          const r = res as any
          if (r.statusCode === 200 && r.data.code === 200 && r.data.data.list != null) {
            this.chatMsgList = [...this.chatMsgList, ...r.data.data.list]
          }
        },
        fail: () => {}
      })
    },
    sendChatMsg() {
      const text = this.chatInput.trim()
      if (text.length === 0) return
      uni.request({
        url: BASE_URL + '/chat/send',
        method: 'POST',
        data: { chapterId: this.currentChapterId, content: text },
        success: (res) => {
          const r = res as any
          if (r.statusCode === 200) {
            this.chatMsgList.push({ id: Date.now(), userName: "我", content: text, sendTime: new Date().toISOString() })
            this.chatInput = ""
          }
        },
        fail: () => { uni.showToast({ title: "发送失败", icon: "none" }) }
      })
    },
    downloadFile(file) {
      uni.showLoading({ title: "下载中..." })
      uni.downloadFile({
        url: file.fileUrl,
        success: (res) => {
          const r = res as any
          if (r.statusCode === 200) {
            uni.saveFile({ tempFilePath: r.tempFilePath, success: () => { uni.showToast({ title: "下载完成" }) }, fail: () => { uni.showToast({ title: "保存失败", icon: "none" }) } })
          }
        },
        fail: () => { uni.showToast({ title: "下载失败", icon: "none" }) },
        complete: () => { uni.hideLoading() }
      })
    },
    getChapterDetail() {
      uni.request({
        url: BASE_URL + '/student/chapter/detail',
        method: 'GET',
        data: { chId: this.chId, cid: this.cid },
        success: (res) => {
          const r = res as any
          if (r.statusCode === 200 && r.data.code === 200) {
            this.currentChapterId = r.data.data.id
            this.mediaSrc = r.data.data.mediaSrc || ''
            this.mediaType = r.data.data.mediaType || 'video'
            this.studyArticle = r.data.data.article || ''
            this.attachList = r.data.data.attachList || []
          }
        },
        fail: () => { uni.showToast({ title: "章节加载失败", icon: "none" }) }
      })
    },
    getAllChapterList() {
      uni.request({
        url: BASE_URL + '/student/chapter/list',
        method: 'GET',
        data: { cid: this.cid },
        success: (res) => {
          const r = res as any
          if (r.statusCode === 200 && r.data.code === 200) {
            this.chapterAllList = r.data.data.list || []
          }
        },
        fail: () => { uni.showToast({ title: "章节列表加载失败", icon: "none" }) }
      })
    }
  }
}
