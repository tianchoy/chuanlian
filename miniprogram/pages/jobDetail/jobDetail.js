// pages/jobDetail/jobDetail.js
const { formatDate } = require('../../utils/formatDate.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        jobDetailInfo: {},
        formattedDate:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        const jobId = options.id
        if (jobId) {
            this.getJobDetails(jobId); // 调用方法获取数据
        }
    },
    //获取详情
    // 根据 ID 获取岗位详细信息
    getJobDetails(jobId) {
        const db = wx.cloud.database(); // 获取云数据库实例
        db.collection('jobs').doc(jobId).get({
            success: (res) => {
                console.log(res.data)
                this.setData({
                    jobDetailInfo: res.data, // 将获取的数据存储到页面数据中
                    formattedDate:formatDate(res.data.updatedAt)
                });
            },
            fail: (err) => {
                console.error('获取数据失败', err);
            },
        });
    },
    //拨打联系电话
    makePhoneCall: function () {
        wx.makePhoneCall({
            phoneNumber: this.data.jobDetailInfo.mobilePhone
        });
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