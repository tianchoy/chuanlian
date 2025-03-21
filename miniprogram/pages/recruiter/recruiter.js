// pages/recruiter/recruiter.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLogin: false,
        isLoading: false,
        tabs: [],
        jobLists: [],
        currentTab: 0, // 当前选中的 Tab
        scrollLeft: 0, // 选项卡滚动位置
        swiperHeight: 0, // swiper 的高度
        tabWidth: 117, // 每个 Tab 的宽度
        screenWidth: 0,// 屏幕宽度
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.showLoading()
        // 获取屏幕宽度
        const systemInfo = wx.getSystemInfoSync();
        const windowHeight = systemInfo.windowHeight;
        const screenWidth = systemInfo.screenWidth;
        const tabHeight = 50; // 顶部选项卡的高度
        this.setData({
            swiperHeight: windowHeight - tabHeight,
            screenWidth: screenWidth
        });
        this.getUserId()
        this.getJobs()
    },

    //请求数据渲染列表
    getJobs() {
        wx.cloud.callFunction({
            name: 'getJobs',
            success: res => {
                console.log(res.result.jobLists)
                this.setData({
                    tabs: res.result.tabs,
                    jobLists: res.result.jobLists
                })
                this.hideLoading()
            },
            fail: err => {
                console.error('获取失败', err)
            }
        })
    },

    //跳转至详情页面 
    toDetail(e) {
        this.showLoading()
        const id = e.target.dataset.id
        console.log(id)
        this.hideLoading()
        wx.navigateTo({
            url: '/pages/jobDetail/jobDetail?id=' + id,
        })
    },


    //如果用户没有登陆，则去用户中心登陆
    toLogin() {
        wx.switchTab({
            url: '/pages/user-center/index',
        })
    },
    //获取用户id来确定用户是否是登陆了
    getUserId() {
        this.setData({ isLoading: true }); // 开始加载
        const userinfo = wx.getStorageSync('userinfo');
        console.log('用户ID:', userinfo);
        const userid = userinfo.nickName
        this.setData({
            isLogin: !!userid, // 更新登录状态
            isLoading: false, // 结束加载
        });
        console.log('加载状态:', this.data.isLoading);
    },
    // 切换 Tab
    switchTab(e) {
        const index = e.currentTarget.dataset.index;
        this.setData({
            currentTab: index
        });
        this.adjustScrollPosition(index);
    },
    // Swiper 切换事件
    swiperChange(e) {
        const index = e.detail.current;
        this.setData({
            currentTab: index
        });
        this.adjustScrollPosition(index);
    },
    // 调整滚动位置，确保选中的 Tab 居中
    adjustScrollPosition(index) {
        const { tabWidth, screenWidth } = this.data;
        const halfScreenWidth = screenWidth / 2; // 屏幕宽度的一半
        const scrollLeft = index * tabWidth - halfScreenWidth + tabWidth / 2;

        this.setData({
            scrollLeft: scrollLeft
        });
    },

    onTabItemTap(item) {
        console.log('TabBar 被点击了', item);
        if (item.index === 0) {
            this.getJobs()
        }
    },

    showLoading(){
        wx.showLoading({
            title: '加载中',
        })
    },
    hideLoading(){
        wx.hideLoading()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        // 页面显示时执行
        console.log('找船模块，onShow 加载状态:', this.data.isLoading);
        if (!this.data.isLogin && !this.data.isLoading) {
            console.log('找船模块，用户未登录，重新获取用户ID');
            this.getUserId();
        }

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})