interface CateItem {
  id: number
  name: string
  children: Array<CateItem>
}
interface CourseItem {
  id: number
  img: string
  name: string
  link: string
  type: number
}

export default {
  data() {
    return {
      drawerShow: false,
      searchKey: "",
      tabList: [
        { name: "推荐" },
        { name: "热门" },
        { name: "直播" },
        { name: "免费" },
        { name: "会员" }
      ],
      currentTab: 0,
      cateList: [] as Array<CateItem>,
      currentCateId: 0,
      courseList: [] as Array<CourseItem>
    }
  },
  onShow() {
    this.getCateData()
    this.getCourseData()
  },
  methods: {
    toggleDrawer() {
      this.drawerShow = !this.drawerShow
    },
    closeDrawer() {
      this.drawerShow = false
    },

    selectCate(cateId: number, parentId: number) {
      this.currentCateId = cateId
      this.closeDrawer()
      this.getCourseData()
    },

    switchTab(idx: number) {
      this.currentTab = idx
      this.getCourseData()
    },

    getCateData() {
      uni.request({
        url: "https://xxx.com/api/course/category",
        success: (res) => {
          const r = res as any
          if (r.data.code === 200) {
            this.cateList = r.data.data.list
          }
        },
        fail: () => {
          uni.showToast({ title: "分类加载失败", icon: "none" })
        }
      })
    },

    getCourseData() {
      const tabType = this.currentTab
      const cateId = this.currentCateId
      uni.request({
        url: `https://xxx.com/api/course/list?cateId=${cateId}&tabType=${tabType}`,
        success: (res) => {
          const r = res as any
          if (r.data.code === 200) {
            this.courseList = r.data.data.list
          }
        },
        fail: () => {
          uni.showToast({ title: "课程加载失败", icon: "none" })
        }
      })
    },

    // 搜索方法
    doSearch() {
      const keyword = this.searchKey.trim()
      if (!keyword) {
        uni.showToast({ title: "请输入关键词", icon: "none" })
        return
      }
      uni.request({
        url: `https://xxx.com/api/course/search?keyword=${keyword}&cateId=${this.currentCateId}&tabType=${this.currentTab}`,
        success: (res) => {
          const r = res as any
          if (r.data.code === 200) {
            this.courseList = r.data.data.list
          }
        },
        fail: () => {
          uni.showToast({ title: "搜索失败", icon: "none" })
        }
      })
    },

    goLink(url: string) {
      if (!url) return
      uni.navigateTo({ url: url })
    }
  }
}