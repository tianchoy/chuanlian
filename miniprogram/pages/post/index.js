Page({
    data: {
        isLogin: false,
        isLoading: false,
        tabs: [
            { name: '已发布', tag: '已下架' },
            { name: '未发布', tag: '招聘中' },
            { name: '审核中', tag: '招聘中' },
            { name: '未过审', tag: '招聘中' },
        ],
        jobLists: [
            [
                { title: '一类轮机长', salary: '8000', route: '上海~武汉', date: '2月10号' },
                { title: '一类轮机长', salary: '8000', route: '上海~武汉', date: '2月10号' }
            ],
            [
                { title: '二类轮机长', salary: '6000', route: '上海~武汉', date: '2月10号' },
                { title: '二类轮机长', salary: '6000', route: '上海~武汉', date: '2月10号' }
            ],
            [
                { title: '三类轮机长', salary: '5000', route: '上海~武汉', date: '2月10号' },
                { title: '三类轮机长', salary: '5000', route: '上海~武汉', date: '2月10号' }
            ],
            [
                { title: '一类轮船员', salary: '7000', route: '上海~武汉', date: '2月10号' },
                { title: '一类轮船员', salary: '7000', route: '上海~武汉', date: '2月10号' }
            ],
        ],
        currentTab: 0, // 当前选中的 Tab
        scrollLeft: 0, // 选项卡滚动位置
        swiperHeight: 0, // swiper 的高度
        tabWidth: 120, // 每个 Tab 的宽度
        screenWidth: 0 // 屏幕宽度
    },

    onLoad: function (options) {
        // 页面创建时执行
        this.getUserId()
        // 获取屏幕宽度
        const systemInfo = wx.getSystemInfoSync();
        const windowHeight = systemInfo.windowHeight;
        const screenWidth = systemInfo.screenWidth;
        const tabHeight = 50; // 顶部选项卡的高度
        this.setData({
            swiperHeight: windowHeight - tabHeight,
            screenWidth: screenWidth
        });
    },
    //获取用户id来确定用户是否是登陆了
    getUserId() {
        this.setData({ isLoading: true }); // 开始加载
        const userid = wx.getStorageSync('userId');
        console.log('用户ID:', userid);
        this.setData({
            isLogin: !!userid, // 更新登录状态
            isLoading: false, // 结束加载
        });
        console.log('加载状态:', this.data.isLoading);
    },
    //如果用户没有登陆，则去用户中心登陆
    toLogin() {
        wx.switchTab({
            url: '/pages/user-center/index',
        })
    },

    //跳转到发布招聘页面
    publish(e) {
        let types = e.target.dataset.type
        if (types == 'publishJobPost') {
            wx.navigateTo({
                url: '/pages/publishJobPost/publishJobPost',
            })
        } else if (types == 'publishJobSeeking') {
            wx.navigateTo({
                url: '/pages/publishJobSeeking/publishJobSeeking',
            })
        }
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
    onShow: function () {
        // 页面显示时执行
        console.log('onShow 加载状态:', this.data.isLoading);
        if (!this.data.isLogin && !this.data.isLoading) {
            console.log('用户未登录，重新获取用户ID');
            this.getUserId();
        }
    },
    onReady: function () {
        // 页面首次渲染完毕时执行
    },
    onHide: function () {
        // 页面隐藏时执行
    },
    onUnload: function () {
        // 页面卸载时执行
    }
});