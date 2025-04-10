// pages/jobseeker/jobseeker.js
import { trackBrowse, checkBrowsedStatus, BROWSE_TYPE } from '../../utils/browseTracker'
const app = getApp()

Page({
    data: {
        isLogin: false,
        isLoading: false,
        tabs: [],
        resumesLists: {}, // 当前展示的数据
        cachedResumesLists: {}, // 缓存的所有分类数据
        currentTab: 0,
        scrollLeft: 0,
        swiperHeight: 0,
        tabWidth: 117,
        screenWidth: 0,
        pageSize: 10,
        currentPages: {},
        hasMoreData: {},
        loadingMore: false,
        activeFilters: {}, // 存储各分类的筛选条件
        showFilterPopup: false, // 是否显示筛选弹窗
        currentFilterTab: null, // 当前正在筛选的分类
        tempFilterValue: '', // 临时存储筛选值
        rankKeywords: [],
        isRefreshing: false, // 是否正在刷新数据
    },

    onLoad() {
        this.initPage()
        this.getUserId()
        this.loadData()
        this.loadRankKeywords()
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

    // 加载职级关键词
    async loadRankKeywords() {
        try {
            const res = await wx.cloud.callFunction({
                name: 'getRankKeywords'
            })
            this.setData({
                rankKeywords: res.result.rankKeywords || [],
                _defaultRanks: ['船长', '大副', '轮机长', '水手', '大管轮']
            })
        } catch (err) {
            console.error('加载职级失败:', err)
            this.setData({
                rankKeywords: this.data._defaultRanks || []
            })
        }
    },

    async loadData() {
        this.setData({ isLoading: true })
        wx.showLoading({ title: '加载中...' })

        try {
            // 1. 先加载分类
            const categories = await this.getResumeCategories()

            // 2. 加载所有分类的第一页数据
            if (categories.length > 0) {
                const loadPromises = categories.map(category => 
                    this.loadTabData(category.name, true, true) // 第三个参数表示是初始加载
                )
                await Promise.all(loadPromises)
            }

            this.setData({ tabs: categories })
        } catch (error) {
            console.error('初始化加载失败:', error)
            wx.showToast({ title: '加载失败', icon: 'none' })
        } finally {
            wx.hideLoading()
            this.setData({ isLoading: false })
        }
    },

    // 处理简历浏览事件
    handleResumeBrowsed({ resumeId }) {
        this.setData({
            resumesLists: Object.fromEntries(
                Object.entries(this.data.resumesLists).map(([title, resumes]) => [
                    title,
                    resumes.map(resume =>
                        resume.id === resumeId ? { ...resume, isBrowsed: true } : resume
                    )
                ])
            ),
            cachedResumesLists: Object.fromEntries(
                Object.entries(this.data.cachedResumesLists).map(([title, resumes]) => [
                    title,
                    resumes.map(resume =>
                        resume.id === resumeId ? { ...resume, isBrowsed: true } : resume
                    )
                ])
            )
        })
    },

    // 获取分类数据
    async getResumeCategories() {
        const { rankKeywords } = this.data
        try {
            const res = await wx.cloud.callFunction({
                name: 'getResumeCategories',
                data: { types: '2', rankKeywords }
            })
            return res.result.tabs || []
        } catch (error) {
            console.error('获取分类失败:', error)
            return []
        }
    },

    // 打开筛选弹窗
    openFilterPopup() {
        const currentTabName = this.data.tabs[this.data.currentTab]?.name
        if (!currentTabName) return

        this.setData({
            showFilterPopup: true,
            currentFilterTab: currentTabName,
            tempFilterValue: this.data.activeFilters[currentTabName]?.location || ''
        })
    },

    // 关闭筛选弹窗
    closeFilterPopup() {
        this.setData({ showFilterPopup: false, tempFilterValue: '' })
    },

    // 输入筛选条件
    onFilterInput(e) {
        this.setData({ tempFilterValue: e.detail.value })
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
            showFilterPopup: false,
            [`currentPages.${currentFilterTab}`]: 1
        }, () => {
            this.loadTabData(currentFilterTab, true)
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
            showFilterPopup: false,
            tempFilterValue: '',
            [`currentPages.${currentFilterTab}`]: 1
        }, () => {
            this.loadTabData(currentFilterTab, true)
        })
    },

    // 获取简历数据
    async loadTabData(tabName, initialLoad = false, isInitialLoadAll = false) {
        let that = this
        if (this.data.loadingMore && !initialLoad) return
        if (!tabName) return

        // 如果是初始加载所有分类，不显示加载状态
        if (!isInitialLoadAll) {
            this.setData({
                loadingMore: true,
                isRefreshing: initialLoad
            })
            if (initialLoad) {
                wx.showNavigationBarLoading()
            }
        }
        initialLoad ? that.showLoading() : wx.showNavigationBarLoading()
        try {
            const res = await wx.cloud.callFunction({
                name: 'getResumes',
                data: {
                    types: '2',
                    categoryTitles: [tabName],
                    pageSize: this.data.pageSize,
                    currentPage: initialLoad ? 1 : (this.data.currentPages[tabName] || 1) + 1,
                    filters: this.data.activeFilters[tabName] || {},
                    rankKeywords: this.data.rankKeywords.length > 0 ? 
                        this.data.rankKeywords : 
                        this.data._defaultRanks
                }
            })
            console.log(res.result)
            // 错误处理
            if (res.result.errCode) {
                throw new Error(res.result.errMsg)
            }

            let newData = res.result.resumesLists[tabName] || []
            
            // 检查浏览状态
            if (this.data.isLogin && newData.length > 0) {
                const resumeIds = newData.map(resume => resume.id).filter(Boolean)
                const browsedIds = await checkBrowsedStatus(resumeIds, BROWSE_TYPE.RESUME)
                newData = newData.map(resume => ({
                    ...resume,
                    isBrowsed: browsedIds.includes(resume.id)
                }))
            }

            const currentData = this.data.cachedResumesLists[tabName] || []

            // 更新缓存数据
            const updatedCache = {
                ...this.data.cachedResumesLists,
                [tabName]: initialLoad ? 
                    newData : 
                    [...currentData, ...newData]
            }

            // 如果是初始加载或者是当前显示的tab，则更新显示数据
            const shouldUpdateDisplay = initialLoad || 
                                     this.data.tabs[this.data.currentTab]?.name === tabName

            this.setData({
                cachedResumesLists: updatedCache,
                [`currentPages.${tabName}`]: initialLoad ? 1 : (this.data.currentPages[tabName] || 1) + 1,
                [`hasMoreData.${tabName}`]: res.result.hasMoreData[tabName],
                loadingMore: false,
                isRefreshing: false,
                ...(shouldUpdateDisplay && { 
                    [`resumesLists.${tabName}`]: initialLoad ? 
                        newData : 
                        [...currentData, ...newData] 
                })
            })

            // 特殊处理：当首次加载无数据时尝试备用解析方式
            if (initialLoad && newData.length === 0) {
                await this.retryWithAltName(tabName)
            }
        } catch (error) {
            console.error(`加载${tabName}失败:`, error)
            this.setData({
                loadingMore: false,
                isRefreshing: false
            })
            if (!isInitialLoadAll) {
                wx.showToast({
                    title: '加载失败，请重试',
                    icon: 'none'
                })
            }
        } finally {
            if (!isInitialLoadAll && initialLoad) {
                wx.hideNavigationBarLoading()
            }
            initialLoad ? that.hideLoading() : wx.hideNavigationBarLoading()
        }
    },

    // 备用名称重试
    async retryWithAltName(tabName) {
        if (tabName === '水手水手') {
            const res = await wx.cloud.callFunction({
                name: 'getResumes',
                data: {
                    types: '2',
                    categoryTitles: ['水手'], // 尝试简单名称
                    pageSize: this.data.pageSize,
                    currentPage: 1,
                    filters: {},
                    rankKeywords: this.data.rankKeywords
                }
            })

            if (res.result.resumesLists['水手']?.length > 0) {
                this.setData({
                    [`cachedResumesLists.${tabName}`]: res.result.resumesLists['水手'],
                    [`hasMoreData.${tabName}`]: res.result.hasMoreData['水手'],
                    [`resumesLists.${tabName}`]: res.result.resumesLists['水手']
                })
            }
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

    // 点击分类标签切换
    switchTab(e) {
        const index = e.currentTarget.dataset.index
        const tabName = this.data.tabs[index]?.name
        // 如果滑动到当前已选标签或无效标签，则不做处理
        if (!tabName || this.data.currentTab === index) return
        
        // 先显示缓存数据
        this.setData({
            currentTab: index,
            scrollLeft: this.calculateScrollPosition(index),
            [`resumesLists.${tabName}`]: this.data.cachedResumesLists[tabName] || []
        })

        // 显示加载状态
        wx.showNavigationBarLoading()
        console.log('switchTab')
        // 如果该分类没有缓存数据或数据为空，则加载
        if (!this.data.cachedResumesLists[tabName] || this.data.cachedResumesLists[tabName].length === 0) {
            this.loadTabData(tabName, true)
        } else {
            // 即使有缓存数据，也刷新一下确保数据最新
            this.loadTabData(tabName, true)
            wx.hideNavigationBarLoading()
        }
    },

    // 计算标签滚动位置
    calculateScrollPosition(index) {
        const { tabWidth, screenWidth } = this.data
        const halfScreenWidth = screenWidth / 2
        return index * tabWidth - halfScreenWidth + tabWidth / 2
    },

    // 滑动切换
    swiperChange(e) {
        const index = e.detail.current
        const tabName = this.data.tabs[index]?.name
        // 如果滑动到当前已选标签或无效标签，则不做处理
        if (!tabName || this.data.currentTab === index) return
        
        // 先显示缓存数据
        this.setData({
            currentTab: index,
            scrollLeft: this.calculateScrollPosition(index),
            [`resumesLists.${tabName}`]: this.data.cachedResumesLists[tabName] || []
        })

        // 显示加载状态
        wx.showNavigationBarLoading()
        
        // 如果该分类没有缓存数据或数据为空，则加载
        if (!this.data.cachedResumesLists[tabName] || this.data.cachedResumesLists[tabName].length === 0) {
            this.loadTabData(tabName, true)
        } else {
            // 即使有缓存数据，也刷新一下确保数据最新
            this.loadTabData(tabName, true)
            wx.hideNavigationBarLoading()
        }
    },

    // 加载更多
    loadMore() {
        const currentTabName = this.data.tabs[this.data.currentTab]?.name
        if (!currentTabName || !this.data.hasMoreData[currentTabName]) return

        this.loadTabData(currentTabName)
    },

    // 下拉刷新
    onPullDownRefresh() {
        const currentTabName = this.data.tabs[this.data.currentTab]?.name
        if (!currentTabName) {
            wx.stopPullDownRefresh()
            return
        }

        this.loadTabData(currentTabName, true).finally(() => {
            wx.stopPullDownRefresh()
        })
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
    },
})