// pages/resumeDetail/resumeDetail.js
const app = getApp()
const { formatDate } = require('../../utils/formatDate.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        resumes: {},
        formattedDate:'',
        isBrowsed:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.resumeId = options.id
        if (this.resumeId) {
            this.getResumeDetails(this.resumeId); // 调用方法获取数据
            app.on('resumeBrowsed', this.handleResumeBrowsed)
        }
    },
    onUnload() {
        app.off('resumeBrowsed', this.handleResumeBrowsed)
    },

    handleResumeBrowsed: function({ resumeId }) {
        console.log(resumeId,this.resumeId)
      if (resumeId === this.resumeId) {
        this.setData({ isBrowsed: true });
      }
    },  

    //获取人才信息
    getResumeDetails(resumeId) {
        console.log(resumeId)
        const db = wx.cloud.database(); // 获取云数据库实例
        db.collection('resumes').doc(resumeId).get({
            success: (res) => {
                console.log(res.data)
                this.sendBrowse(resumeId)
                this.setData({
                    resumes: res.data, // 将获取的数据存储到页面数据中
                    formattedDate:formatDate(res.data.updatedAt)
                });
            },
            fail: (err) => {
                console.error('获取数据失败', err);
            },
        });
    },

     //记录浏览行为
     async sendBrowse(resumeId) {
        try {
            // 1. 检查文档是否存在
            const resumeDoc = await wx.cloud.database().collection('resumes')
                .doc(resumeId)
                .field({ _id: true })
                .get()
            
            if (!resumeDoc.data) {
                console.error('职位文档不存在:', resumeId)
                return { success: false, error: 'DOCUMENT_NOT_FOUND' }
            }
    
            // 2. 获取当前用户ID
            const userInfo = wx.getStorageSync('userinfo') || app.globalData.userInfo
            if (!userInfo || !userInfo._id) {
                return { success: false, error: 'USER_NOT_LOGIN' }
            }
    
            // 3. 调用云函数记录浏览
            const res = await wx.cloud.callFunction({
                name: 'addBrowseRecord',
                data: {
                    userId: userInfo._id,
                    targetId: resumeId,
                    type: 'resume'
                }
            })
            console.log(res)
            app.emit('resumeBrowsed', { resumeId: resumeId });
            if (!res.result.success) {
                console.error('浏览记录失败:', res.result)
            }
            return res.result
        } catch (err) {
            console.error('记录浏览异常:', err)
            return {
                success: false,
                error: 'CLIENT_ERROR',
                message: err.message
            }
        }
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