// pages/publishJobPost/publishJobPost.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLogin: false,
        isLoading: false,
        jobCategories: [
            { cate_id: 1, cate_name: '一类' },
            { cate_id: 2, cate_name: '二类' },
            { cate_id: 3, cate_name: '三类' },
        ],
        selectedJobCategory: '', // 选中的类别
        jobTypes: [
            { job_id: 1, job_name: '机长' },
            { job_id: 2, job_name: '船员' },
            { job_id: 3, job_name: '船长' },
            { job_id: 4, job_name: '水手' },
            { job_id: 5, job_name: '厨师' },
        ],
        selectedJobType: '', // 选中的岗位
        routeFrom: '', // 航线起点
        routeTo: '', // 航线终点
        selectedDate: '', // 上船时间
        selectedLocation: [], // 上船地点
        salaryOptions: ['每天', '每月'], // 待遇选项
        selectedSalary: '', // 选中的待遇
        jobDescription: '', // 岗位描述
        totalSalary: '',
        mobilePhone: '',
        openid: '',
        charCount: 0,
        maxLength: 50
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getOpenid()
    },
    getOpenid() {
        this.setData({ isLoading: true }); // 开始加载
        const userinfo = wx.getStorageSync('userinfo');
        console.log('用户ID:', userinfo);
        const userid = userinfo.nickName
        const openid = userinfo.openid
        this.setData({
            openid,
            isLogin: !!userid, // 更新登录状态
            isLoading: false, // 结束加载
        })
    },
    // 处理类别选择
    handleJobCategoryChange(e) {
        const index = e.detail.value;
        const selectedJobCategory = this.data.jobCategories[index].cate_name;
        this.setData({ selectedJobCategory });
    },

    // 处理岗位选择
    handleJobTypeChange(e) {
        const index = e.detail.value;
        const selectedJobType = this.data.jobTypes[index].job_name;
        this.setData({ selectedJobType });
    },

    // 处理航线起点输入
    handleRouteFromInput(e) {
        this.setData({ routeFrom: e.detail.value });
    },

    // 处理航线终点输入
    handleRouteToInput(e) {
        this.setData({ routeTo: e.detail.value });
    },

    // 处理上船时间选择
    handleDateChange(e) {
        this.setData({ selectedDate: e.detail.value });
    },

    // 处理上船地点选择
    handleLocationChange(e) {
        const selectedLocation = e.detail.value; // 获取选中的省市区
        this.setData({ selectedLocation });
    },

    // 处理待遇选择
    handleSalaryChange(e) {
        const index = e.detail.value;
        const selectedSalary = this.data.salaryOptions[index];
        this.setData({ selectedSalary });
    },
    handleMoneyChange(e) {
        const money = e.detail.value
        this.setData({ totalSalary: money })
    },

    //处理手机号码
    handlemobilePhoneChange(e) {
        const phoneNo = e.detail.value
        if (!this.validatePhoneNumber(phoneNo)) {
            wx.showToast({
                title: '请输入有效的手机号码',
                icon: 'none'
            });
            return;
        }
        this.setData({ mobilePhone: phoneNo })
    },

    validatePhoneNumber: function (phoneNumber) {
        // 简单的手机号码验证逻辑
        const reg = /^1[3456789]\d{9}$/;
        return reg.test(phoneNumber);
    },

    // 处理岗位描述输入
    handleJobDescriptionInput(e) {
        const value = e.detail.value;
        this.setData({
            charCount: value.length,
            jobDescription: value
        });
    },

    // 处理提交
    handleSubmit() {
        const {
            selectedJobCategory,
            selectedJobType,
            routeFrom,
            routeTo,
            selectedDate,
            selectedLocation,
            selectedSalary,
            totalSalary,
            jobDescription,
            mobilePhone,
            openid
        } = this.data;

        if (!selectedJobCategory || !selectedJobType || !routeFrom || !routeTo || !selectedDate || !selectedLocation || !totalSalary || !jobDescription || !mobilePhone || !selectedSalary) {
            wx.showToast({
                title: '请填写完整信息',
                icon: 'none',
            });
            return;
        }
        console.log('提交数据：', {
            selectedJobCategory,
            selectedJobType,
            routeFrom,
            routeTo,
            selectedDate,
            selectedLocation,
            totalSalary,
            jobDescription,
            mobilePhone,
            selectedSalary,
            openid
        });
        // 提交逻辑
        wx.cloud.callFunction({
            name: 'addJob',
            data: {
                "jobDescription": jobDescription,
                "openid": this.data.openid,
                "selectedJobCategory": selectedJobCategory,
                "selectedJobType": selectedJobType,
                "routeFrom": routeFrom,
                "routeTo": routeTo,
                "selectedDate": selectedDate,
                "selectedLocation": selectedLocation,
                "mobilePhone": mobilePhone,
                "selectedSalary": selectedSalary,
                "totalSalary": totalSalary
            },
            success: res => {
                wx.showToast({
                    title: '发布成功，请等审核',
                    icon: 'success',
                });
                console.log('发布成功', res)
                wx.navigateBack()
            },
            fail: err => {
                wx.showToast({
                    title: '发布失败，请修改',
                    icon: 'success',
                });
                console.error('发布失败', err)
            }
        })



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
        console.log('onShow 加载状态:', this.data.isLoading);
        if (!this.data.isLogin && !this.data.isLoading) {
            console.log('用户未登录，重新获取用户ID');
            this.getOpenid();
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