// pages/jobseeker/jobseeker.js
import { trackBrowse, checkBrowsedStatus, BROWSE_TYPE } from '../../utils/browseTracker'
const app = getApp()

Page({
    data: {
        isLogin: false,
        isLoading: false,
        tabs: [],
        resumesLists: {},
        currentTab: 0,
        scrollLeft: 0,
        swiperHeight: 0,
        tabWidth: 117,
        screenWidth: 0,
        pageSize: 1,
        currentPages: {},
        hasMoreData: {},
        loadingMore: false,
        activeFilters: {}, // 存储各分类的筛选条件
        showFilterPopup: false, // 是否显示筛选弹窗
        currentFilterTab: null, // 当前正在筛选的分类
        tempFilterValue: '' // 临时存储筛选值
    },

    onLoad() {
        this.initPage()
        this.getUserId()
        this.getResumes(true)
        app.on('resumeBrowsed', this.handleResumeBrowsed)
        
        // 获取屏幕宽度
        wx.getSystemInfo({
            success: (res) => {
                this.setData({
                    screenWidth: res.windowWidth
                })
            }
        })
    },

    onUnload() {
        app.off('resumeBrowsed', this.handleResumeBrowsed)
    },

    initPage() {
        const { windowHeight, statusBarHeight } = wx.getSystemInfoSync();
        this.setData({
            swiperHeight: windowHeight - 50 - statusBarHeight
        });
    },

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

    // 打开筛选弹窗
    openFilterPopup(e) {
        const tabName = this.data.tabs[this.data.currentTab]?.name
        if (!tabName) return
        
        this.setData({
            showFilterPopup: true,
            currentFilterTab: tabName,
            tempFilterValue: this.data.activeFilters[tabName]?.location || ''
        })
    },

    // 关闭筛选弹窗
    closeFilterPopup() {
        this.setData({
            showFilterPopup: false,
            tempFilterValue: ''
        })
    },

    // 输入筛选条件
    onFilterInput(e) {
        this.setData({
            tempFilterValue: e.detail.value
        })
    },

    // 应用筛选条件
    applyFilter() {
        const { currentFilterTab, tempFilterValue } = this.data
        if (!currentFilterTab) return
        
        const newActiveFilters = {
            ...this.data.activeFilters,
            [currentFilterTab]: {
                location: tempFilterValue.trim()
            }
        }
        
        this.setData({
            activeFilters: newActiveFilters,
            showFilterPopup: false
        }, () => {
            // 重新加载当前分类数据
            this.getResumes(true)
        })
    },

    // 重置筛选条件
    resetFilter() {
        const { currentFilterTab } = this.data
        if (!currentFilterTab) return
        
        const newActiveFilters = { ...this.data.activeFilters }
        delete newActiveFilters[currentFilterTab]
        
        this.setData({
            activeFilters: newActiveFilters,
            tempFilterValue: '',
            showFilterPopup: false
        }, () => {
            // 重新加载当前分类数据
            this.getResumes(true)
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

            // 获取当前分类的筛选条件
            const filters = this.data.activeFilters[currentTabTitle] || {}

            const res = await wx.cloud.callFunction({
                name: 'getResumes',
                data: {
                    types: '2',
                    currentPage: currentPage,
                    categoryTitles: initialLoad ? [] : [currentTabTitle],
                    pageSize: this.data.pageSize,
                    filters: filters // 添加筛选条件
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

            this.setData({
                // tabs: res.result.tabs,
                tabs: res.result.tabs.length > 0 ? res.result.tabs : this.data.tabs,  // 保留原有tabs
                resumesLists: newResumesLists,
                currentPages: newCurrentPages,
                hasMoreData: newHasMoreData
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

    toLogin() {
        wx.switchTab({
            url: '/pages/user-center/index',
        })
    },

    getUserId() {
        const userinfo = wx.getStorageSync('userinfo')
        this.setData({
            isLogin: !!userinfo?.openId || !!userinfo?._id
        })
    },

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

    switchTab(e) {
        const index = e.currentTarget.dataset.index
        this.setData({ currentTab: index }, () => {
            this.adjustScrollPosition(index)
        })
    },

    swiperChange(e) {
        const index = e.detail.current
        this.setData({ currentTab: index }, () => {
            this.adjustScrollPosition(index)
        })
    },

    adjustScrollPosition(index) {
        const { tabWidth, screenWidth } = this.data;
        const halfScreenWidth = screenWidth / 2;
        const scrollLeft = index * tabWidth - halfScreenWidth + tabWidth / 2;

        this.setData({
            scrollLeft: scrollLeft
        });
    },

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