// pages/resumeDetail/resumeDetail.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        resumes: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        const resumeId = options.id
        if (resumeId) {
            this.getResumeDetails(resumeId); // 调用方法获取数据
        }
    },

    //获取人才信息
    getResumeDetails(resumeId) {
        console.log(resumeId)
        const db = wx.cloud.database(); // 获取云数据库实例
        db.collection('resumes').doc(resumeId).get({
            success: (res) => {
                console.log(res.data)
                this.setData({
                    resumes: res.data, // 将获取的数据存储到页面数据中
                });
            },
            fail: (err) => {
                console.error('获取数据失败', err);
            },
        });
    },
    //拨打电话
    makePhoneCall(){
        const phone = this.data.resumes.mobilePhone
        wx.makePhoneCall({
            phoneNumber: phone
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