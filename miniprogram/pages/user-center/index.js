const {
    envList
} = require('../../envList');
// pages/me/index.js
Page({
    /**
     * 页面的初始数据
     */
    data: {
        defAvartarUrl: '../../images/icons/avatar.png',
        userInfo: {
            userAvatar: '',
            nickName: ''
        },
        shareTitle: '轮船人自己的小程序！',
        sharePath: 'pages/recruiter/recruiter',
    },
    onLoad() {
        var that = this
        that.showLoading()
        that.getUserInfo()
    },
    async getUserInfo() {
        let that = this
        const userInfo = wx.getStorageSync('userinfo')
        if (!!userInfo) {
            console.log('从缓存中读取userinfo:',userInfo)
            that.setData({
                userInfo
            })
            that.hideLoading()
        } else {
            let res = await wx.cloud.callFunction({
                name: 'cl_userInfo',
                data: {
                    type: 'get'
                }
            })
            const userinfo = res.result
            console.log('获取userinfo：',userinfo)
            wx.setStorageSync('userinfo', userinfo)
            that.setData({
                userInfo: res.result
            })
            that.hideLoading()
        }
    },
    onChooseAvatar(e) {
        let that = this
        that.showLoading()
        const avatarUrl = e.detail.avatarUrl;
        that.uploadAvatarToCloud(avatarUrl);

    },
    uploadAvatarToCloud(avatarUrl) {
        wx.cloud.uploadFile({
            cloudPath: `user_avatars/${Date.now()}.jpg`,
            filePath: avatarUrl,
            success: (res) => {
                const fileID = res.fileID;
                this.saveInfo('userAvatar', fileID)
                this.hideLoading()
            },
            fail: (err) => {
                console.log('头像上传失败:', err);
            }
        });
    },
    onInputNickname(e) {
        let that = this
        that.showLoading()
        that.saveInfo('nickName', e.detail.value)
    },

    //常见问题页面
    toqa() {
        console.log('aaaa')
        wx.navigateTo({
            url: '/pages/question/question',
        })
    },
    gotoAdmin() {
        console.log('去管理中心')
        wx.redirectTo({
            url: '/pages/admin/jobIndex/jobIndex',
        })
    },

    //保存用户名和头像
    async saveInfo(types, values) {
        let that = this
        let res = await wx.cloud.callFunction({
            name: 'cl_userInfo',
            data: {
                type: 'post',
                id: that.data.userInfo._id,
                fields: {
                    [types]: values
                }
            }
        })
        that.setData({
            userInfo: res.result.data[0]
        })
        that.hideLoading()
    },
    showLoading() {
        wx.showLoading({
            title: '加载中',
        })
    },
    hideLoading() {
        wx.hideLoading()
    },
    onShareAppMessage(res) {
        return {
            title: this.data.shareTitle,
            path: this.data.sharePath
        };
    }

});