Page({
    data: {
        isLogin: false,
        isLoading: false,
        status:['审核中','未过审','已审核','已下线'],
        jobLists: [],
    },

    onLoad: function (options) {
        // 页面创建时执行
        this.getUserId()
        this.getJobsList()
    },
    //获取发布职位列表
    getJobsList(){
        wx.cloud.callFunction({
            name: 'postJobLists',
            success: res => {
                console.log(res.result.jobLists)
                this.setData({
                    jobLists: res.result.jobLists
                })
            },
            fail: err => {
                console.error(err)
            }
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