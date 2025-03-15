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
        that.getUserInfo()
    },
    async getUserInfo() {
        let that = this
        let res = await wx.cloud.callFunction({
            name: 'cl_userInfo',
            data: {
                type: 'get'
            }
        })
        const userid = res.result._id
        wx.setStorageSync('userId', userid)
        that.setData({
            userInfo: res.result
        })
    },
    onChooseAvatar(e) {
        let that = this
        const avatarUrl = e.detail.avatarUrl;
        this.uploadAvatarToCloud(avatarUrl);

    },
    uploadAvatarToCloud(avatarUrl) {
        wx.cloud.uploadFile({
            cloudPath: `user_avatars/${Date.now()}.jpg`,
            filePath: avatarUrl,
            success: (res) => {
                const fileID = res.fileID;
                this.saveInfo('userAvatar', fileID)
            },
            fail: (err) => {
                console.log('头像上传失败:', err);
            }
        });
    },
    onInputNickname(e) {
        let that = this
        this.saveInfo('nickName', e.detail.value)
    },

    //常见问题页面
    toqa(){
        console.log('aaaa')
        wx.navigateTo({
          url: '/pages/question/question',
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
    },
    onShareAppMessage(res) {
        return {
          title: this.data.shareTitle,
          path: this.data.sharePath
        };
      }

});