// pages/admin/jobIndex/jobIndex.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        jobLists: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getjobs()
    },
    getjobs() {
        this.showLoading()
        wx.cloud.callFunction({
            name: 'getJobs',
            data: {
                types: '0'
            },
            success: res => {
                console.log(res.result.jobLists)
                this.setData({
                    jobLists: res.result.jobLists
                })
                this.hideLoading()
            },
            fail: err => {
                console.error('获取失败', err)
            }
        })
    },
    viewInfo(e) {
        wx.navigateTo({
            url: '../jobDetail/jobDetail?id=' + e.target.dataset.id,
        })
    },

    showLoading() {
        wx.showLoading({
            title: '加载中',
        })
    },
    hideLoading() {
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
        this.getjobs()
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