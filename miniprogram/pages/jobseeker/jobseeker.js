// pages/jobseeker/jobseeker.js
import { trackBrowse, checkBrowsedStatus, BROWSE_TYPE } from '../../utils/browseTracker'
const app = getApp()

Page({
    data: {
        isLogin: false,
        isLoading: false,
        tabs: [],
        resumesLists: {}, // 改为对象形式存储各分类数据
        currentTab: 0,
        scrollLeft: 0,
        swiperHeight: 0,
        tabWidth: 117,
        screenWidth: 0,
        pageSize: 1, // 每页5条数据
        currentPages: {}, // 记录各分类当前页码
        hasMoreData: {}, // 记录各分类是否还有更多数据
        loadingMore: false // 是否正在加载更多
    },

    onLoad() {
        this.initPage()
        this.getUserId()
        this.getResumes(true) // 初始加载
        app.on('resumeBrowsed', this.handleResumeBrowsed)
    },

    onUnload() {
        app.off('resumeBrowsed', this.handleResumeBrowsed)
    },

    // 初始化页面高度
    initPage() {
        const { windowHeight, statusBarHeight } = wx.getSystemInfoSync();
        this.setData({
            swiperHeight: windowHeight - 50 - statusBarHeight // 减去tab栏和状态栏高度
        });
    },

    // 处理简历浏览状态更新
    handleResumeBrowsed({ resumeId }) {
        this.setData({
            resumesLists: Object.fromEntries(
                Object.entries(this.data.resumesLists).map(([title, resumes]) => [
                    title,
                    resumes.map(resume =>
                        resume.id === resumeId ? { ...resume, isBrowsed: true } : resume
                    )
                ])
            )
        })
    },

    // 获取简历数据
    async getResumes(initialLoad = false) {
        if (this.data.loadingMore && !initialLoad) return

        this.setData({ loadingMore: true })
        initialLoad ? this.showLoading() : wx.showNavigationBarLoading()

        try {
            const currentTabTitle = this.data.tabs[this.data.currentTab]?.name
            const currentPage = initialLoad ? 1 : (this.data.currentPages[currentTabTitle] || 1) + 1

            const res = await wx.cloud.callFunction({
                name: 'getResumes',
                data: {
                    types: '2',
                    currentPage: currentPage,
                    categoryTitles: initialLoad ? [] : [currentTabTitle],
                    pageSize: this.data.pageSize
                }
            })
            console.log(res.result)
            let newResumesLists = initialLoad ? {} : { ...this.data.resumesLists }
            let newCurrentPages = initialLoad ? {} : { ...this.data.currentPages }
            let newHasMoreData = initialLoad ? {} : { ...this.data.hasMoreData }

            if (initialLoad) {
                // 初次加载
                newResumesLists = res.result.resumesLists
                Object.keys(newResumesLists).forEach(title => {
                    newCurrentPages[title] = 1
                    newHasMoreData[title] = res.result.hasMoreData[title]
                })
            } else if (currentTabTitle) {
                // 加载更多
                newResumesLists[currentTabTitle] = res.result.resumesLists[currentTabTitle] || []
                newCurrentPages[currentTabTitle] = currentPage
                newHasMoreData[currentTabTitle] = res.result.hasMoreData[currentTabTitle]
            }

            // 处理浏览状态
            if (this.data.isLogin) {
                const allResumeIds = Object.values(newResumesLists).flat().map(resume => resume.id).filter(Boolean)
                if (allResumeIds.length > 0) {
                    const browsedIds = await checkBrowsedStatus(allResumeIds, BROWSE_TYPE.RESUME)
                    newResumesLists = Object.fromEntries(
                        Object.entries(newResumesLists).map(([title, resumes]) => [
                            title,
                            resumes.map(resume => ({
                                ...resume,
                                isBrowsed: browsedIds.includes(resume.id)
                            }))
                        ])
                    )
                }
            }
            console.log('tabs',res.result.tabs)
            this.setData({
                tabs: res.result.tabs,
                resumesLists: newResumesLists,
                currentPages: newCurrentPages,
                hasMoreData: newHasMoreData,
                // loadingMore: false
            })

        } catch (err) {
            console.error('获取简历失败:', err)
            wx.showToast({
                title: '加载失败',
                icon: 'none'
            })
        } finally {
            initialLoad ? this.hideLoading() : wx.hideNavigationBarLoading()
            this.setData({ loadingMore: false })
        }
    },

    // 跳转登录
    toLogin() {
        wx.switchTab({
            url: '/pages/user-center/index',
        })
    },

    // 获取用户ID
    getUserId() {
        const userinfo = wx.getStorageSync('userinfo')
        this.setData({
            isLogin: !!userinfo?.openId || !!userinfo?._id
        })
    },

    // 查看简历详情
    getResumeDetails(e) {
        const id = e.currentTarget.dataset.id
        if (!id) return

        if (this.data.isLogin) {
            trackBrowse(id, BROWSE_TYPE.RESUME)
        }

        wx.navigateTo({
            url: `/pages/resumeDetail/resumeDetail?id=${id}`,
        })
    },

    // 切换Tab
    // switchTab(e) {
    //     const index = e.currentTarget.dataset.index
    //     this.setData({ currentTab: index }, () => {
    //         this.adjustScrollPosition(index)
    //         // 如果当前分类没有数据，则加载
    //         const currentTabTitle = this.data.tabs[index]?.name
    //         if (currentTabTitle && (!this.data.resumesLists[currentTabTitle] || this.data.resumesLists[currentTabTitle].length === 0)) {
    //             this.getResumes(true)
    //         }
    //     })
    // },
    switchTab(e) {
        const index = e.currentTarget.dataset.index
        this.setData({ currentTab: index }, () => {
            this.adjustScrollPosition(index)
        })
    },

    // Swiper切换
    // swiperChange(e) {
    //     const index = e.detail.current
    //     this.setData({ currentTab: index }, () => {
    //         this.adjustScrollPosition(index)
    //         // 如果当前分类没有数据，则加载
    //         const currentTabTitle = this.data.tabs[index]?.name
    //         if (currentTabTitle && (!this.data.resumesLists[currentTabTitle] || this.data.resumesLists[currentTabTitle].length === 0)) {
    //             this.getResumes(true)
    //         }
    //     })
    // },
    swiperChange(e) {
        const index = e.detail.current
        this.setData({ currentTab: index }, () => {
            this.adjustScrollPosition(index)
        })
    },

    // 调整滚动位置
    adjustScrollPosition(index) {
        const { tabWidth, screenWidth } = this.data;
        const halfScreenWidth = screenWidth / 2; // 屏幕宽度的一半
        const scrollLeft = index * tabWidth - halfScreenWidth + tabWidth / 2;

        this.setData({
            scrollLeft: scrollLeft
        });
    },

    // 上拉加载更多
    loadMore(e) {
        const category = e.currentTarget.dataset.category;
        if (this.data.hasMoreData[category] && !this.data.loadingMore) {
            this.getResumes();
        }
    },

    showLoading() {
        wx.showLoading({ title: '加载中', mask: true })
    },

    hideLoading() {
        wx.hideLoading()
    },

    onShow() {
        if (!this.data.isLogin) {
            this.getUserId()
        }
    }
})