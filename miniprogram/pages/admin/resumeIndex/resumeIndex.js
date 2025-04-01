// pages/admin/resumeIndex/resumeIndex.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        jobLists: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.showLoading()
        this.getResumesList()
    },
    //获取求职信息列表
    getResumesList() {
        const userinfo = wx.getStorageSync('userinfo')
        if(userinfo.isAdmin){
            wx.cloud.callFunction({
                name: 'getResumes',
                data:{
                    types:'0'
                },
                success: res => {
                    console.log(res.result.resumesLists)
                    this.setData({
                        jobLists: res.result.resumesLists
                    })
                    this.hideLoading()
                },
                fail: err => {
                    console.error('获取失败', err)
                    this.hideLoading()
                }
            })
        }else{
            wx.reLaunch({
                url: '/pages/user-center/index',
              })
        }
        
    },
    getResumeDetails(e) {
        this.showLoading()
        const id = e.currentTarget.dataset.id
        wx.setStorageSync('adminResumeId', id);
        wx.navigateTo({
            url: '../resumeDetail/resumeDetail?id=' + id,
        })
        this.hideLoading()
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
        this.getResumesList()
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