// ====================== 类型定义 ======================
interface ChapterItem {
  id: number
  chapterName: string
  mediaSrc: string
  mediaType: "video" | "live"
  article: string
  attachList: Array<AttachItem>
}
interface AttachItem {
  id: number
  fileName: string
  fileSize: string
  fileUrl: string
}
interface ChatMsg {
  id: number
  userName: string
  content: string
}
interface StudyCache {
  playSecond: number
  totalStudySecond: number
}
interface OfflineRecord {
  courseId: number
  chapterId: number
  playSecond: number
  totalStudySecond: number
}

export default {
  data() {
    return {
      // 路由参数
      cid: 0,
      chId: 0,
      cacheKey: "",

      // 播放器计时缓存
      mediaType: "video" as "video" | "live",
      mediaSrc: "",
      playProgress: 0,
      totalStudySecond: 0,
      studyTimer: null as any,

      // 章节抽屉
      drawerShow: false,
      chapterAllList: [] as Array<ChapterItem>,
      currentChapterId: 0,

      // 底部Tab
      bottomTabList: [
        { name: "章节列表" },
        { name: "交流" },
        { name: "学习内容" },
        { name: "附件" },
        { name: "返回课程" }
      ],
      currentBottomTab: 2, // 默认学习内容

      // 页面内容
      studyArticle: "",
      attachList: [] as Array<AttachItem>,

      // 聊天
      chatInput: "",
      chatMsgList: [] as Array<ChatMsg>,

      // ========== 拓展优化变量 ==========
      uploadThrottleTimer: null as any, // 节流定时器
      offlineQueue: [] as Array<OfflineRecord>, // 离线上报队列
      minValidSecond: 10, // 最小有效时长10秒，小于则不上报
      finishPercent: 0.9 // 90%进度标记章节完成
    }
  },
  onLoad(option: any) {
    this.cid = Number(option.cid) || 0
    this.chId = Number(option.chId) || 0
    this.cacheKey = `study_record_${this.cid}_${this.chId}`

    // 1、读取本地播放缓存（断点续播）
    const cache = uni.getStorageSync(this.cacheKey) as StudyCache
    if (cache) {
      this.playProgress = cache.playSecond
      this.totalStudySecond = cache.totalStudySecond
    }

    // 2、读取离线上报队列，联网自动批量提交
    const offlineData = uni.getStorageSync("study_offline_queue") as Array<OfflineRecord>
    if (Array.isArray(offlineData) && offlineData.length) {
      this.offlineQueue = offlineData
      this.batchUploadOffline()
    }

    this.getChapterDetail()
    this.getAllChapterList()
  },
  onShow() {
    this.startTimer()
  },
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
    // 页面加载完成检查离线队列
    if (this.offlineQueue.length) this.batchUploadOffline()
  },
  methods: {
    // ====================== 1、计时器控制（防重复创建） ======================
    startTimer() {
      if (this.studyTimer) return
      this.studyTimer = setInterval(() => {
        this.totalStudySecond += 1
        // 每30秒自动落盘缓存
        if (this.totalStudySecond % 30 === 0) {
          this.saveLocalCache()
          this.throttleUploadRecord()
        }
      }, 1000)
    },
    pauseTimer() {
      if (this.studyTimer) {
        clearInterval(this.studyTimer)
        this.studyTimer = null
      }
    },
    clearAllTimer() {
      this.pauseTimer()
      if (this.uploadThrottleTimer) {
        clearTimeout(this.uploadThrottleTimer)
        this.uploadThrottleTimer = null
      }
    },

    // ====================== 2、播放进度监听 & 章节完成标记 ======================
    handleTimeUpdate(e: any) {
      if (this.mediaType === "live") return
      this.playProgress = Number(e.detail.currentTime.toFixed(0))
      // 播放进度超过90%标记章节完成
      const totalDuration = e.detail.duration || 0
      if (totalDuration && (this.playProgress / totalDuration) >= this.finishPercent) {
        this.markChapterFinish()
      }
    },
    handleVideoEnd() {
      this.playProgress = 0
      this.pauseTimer()
      this.saveLocalCache()
      this.uploadStudyRecord()
      // 播放完毕清空本地缓存
      uni.removeStorageSync(this.cacheKey)
    },
    markChapterFinish() {
      uni.setStorageSync(`chapter_finish_${this.currentChapterId}`, true)
    },

    // ====================== 3、本地持久化缓存 ======================
    saveLocalCache() {
      const cacheData: StudyCache = {
        playSecond: this.playProgress,
        totalStudySecond: this.totalStudySecond
      }
      uni.setStorageSync(this.cacheKey, cacheData)
    },
    clearChapterCache() {
      uni.removeStorageSync(this.cacheKey)
    },

    // ====================== 4、节流上报（3秒防抖，避免频繁请求） ======================
    throttleUploadRecord() {
      if (this.uploadThrottleTimer) return
      this.uploadThrottleTimer = setTimeout(() => {
        this.uploadStudyRecord()
        clearTimeout(this.uploadThrottleTimer)
        this.uploadThrottleTimer = null
      }, 3000)
    },

    // ====================== 5、核心上报 + 离线队列存储 ======================
    uploadStudyRecord(isForce = false) {
      if (!this.cid || !this.currentChapterId) return
      // 最小有效时长过滤
      if (!isForce && this.totalStudySecond < this.minValidSecond) return

      const record: OfflineRecord = {
        courseId: this.cid,
        chapterId: this.currentChapterId,
        playSecond: this.playProgress,
        totalStudySecond: this.totalStudySecond
      }

      uni.request({
        url: "https://xxx.com/api/study/saveRecord",
        method: "POST",
        data: record,
        success: () => {
          // 上报成功可清空本地时长（按需开启）
          // this.totalStudySecond = 0
          // this.saveLocalCache()
        },
        fail: () => {
          // 网络失败存入离线队列
          this.offlineQueue.push(record)
          uni.setStorageSync("study_offline_queue", this.offlineQueue)
          uni.showToast({ title: "网络异常，记录已离线保存", icon: "none", duration: 1500 })
        }
      })
    },

    // ====================== 6、离线队列批量上传 ======================
    batchUploadOffline() {
      if (!this.offlineQueue.length) return
      const copyQueue = [...this.offlineQueue]
      let successCount = 0
      copyQueue.forEach((item, index) => {
        uni.request({
          url: "https://xxx.com/api/study/saveRecord",
          method: "POST",
          data: item,
          success: () => {
            successCount++
            // 全部上报成功清空队列
            if (successCount === copyQueue.length) {
              this.offlineQueue = []
              uni.setStorageSync("study_offline_queue", [])
              uni.showToast({ title: "离线学习记录同步完成", icon: "none" })
            }
          }
        })
      })
    },

    // ====================== 7、章节切换逻辑（重置缓存+计时） ======================
    switchChapter(ch: ChapterItem) {
      this.pauseTimer()
      this.saveLocalCache()
      this.uploadStudyRecord(true)

      // 切换章节清空旧缓存
      this.clearChapterCache()

      // 重置新章节数据
      this.currentChapterId = ch.id
      this.mediaSrc = ch.mediaSrc
      this.mediaType = ch.mediaType
      this.cacheKey = `study_record_${this.cid}_${ch.id}`

      // 读取新章节缓存
      const cache = uni.getStorageSync(this.cacheKey) as StudyCache
      if (cache) {
        this.playProgress = cache.playSecond
        this.totalStudySecond = cache.totalStudySecond
      } else {
        this.playProgress = 0
        this.totalStudySecond = 0
      }

      this.chatMsgList = []
      this.studyArticle = ch.article
      this.attachList = ch.attachList
      this.startTimer()
      this.closeDrawer()
    },

    // ====================== 抽屉控制 ======================
    openDrawer() {
      this.drawerShow = true
    },
    closeDrawer() {
      this.drawerShow = false
    },

    // ====================== 底部Tab切换 ======================
    handleTabClick(idx: number) {
      if (idx === 4) {
        uni.navigateBack()
        return
      }
      if (idx === 0) {
        this.openDrawer()
        return
      }
      this.currentBottomTab = idx
    },

    // ====================== 聊天模块 ======================
    sendChatMsg() {
      const text = this.chatInput.trim()
      if (!text) return
      this.chatMsgList.push({
        id: Date.now(),
        userName: "我",
        content: text
      })
      this.chatInput = ""
    },

    // ====================== 附件下载 ======================
    downloadFile(file: AttachItem) {
      uni.downloadFile({
        url: file.fileUrl,
        success: (res) => {
          uni.saveFile({
            tempFilePath: res.tempFilePath,
            success: () => {
              uni.showToast({ title: "下载完成" })
            }
          })
        },
        fail: () => {
          uni.showToast({ title: "下载失败", icon: "none" })
        }
      })
    },

    // ====================== 接口请求 ======================
    getChapterDetail() {
      uni.request({
        url: `https://xxx.com/api/chapter/detail?chId=${this.chId}&cid=${this.cid}`,
        success: (res: any) => {
          const data = res.data.data
          this.currentChapterId = data.id
          this.mediaSrc = data.mediaSrc
          this.mediaType = data.mediaType
          this.studyArticle = data.article
          this.attachList = data.attachList
        }
      })
    },
    getAllChapterList() {
      uni.request({
        url: `https://xxx.com/api/chapter/list?cid=${this.cid}`,
        success: (res: any) => {
          this.chapterAllList = res.data.data.list
        }
      })
    }
  }
}