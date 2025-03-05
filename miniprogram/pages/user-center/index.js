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
            avatarUrl: '',
            nickName:''
        },
    },
    onLoad() {
        this.getOpenId()
        this.getNicknameFromCloud()
    },

    //获取用户头像
    onChooseAvatar(e) {
        let that = this
        const {
            avatarUrl
        } = e.detail
        that.setData({
            'userInfo.avatarUrl': avatarUrl,
        })
    },

    //由于官方更新了api，直接获取不到，则改成让用户输入用户名
    onInputNickname(e){
        let that = this
        console.log(e.detail.value)
        that.setData({
            'userInfo.nickName':e.detail.value
        })
    },

    //获取openid 作为标志符存数据库
    getOpenId() {
        wx.cloud.callFunction({
            name: 'getOpenid',
            success: (res) => {
                const openid = res.result.openid;
                wx.setStorageSync('openid', openid); // 存储 openid
                console.log('获取 openid 成功:', openid);
            },
            fail: (err) => {
                console.log('获取 openid 失败:', err);
            }
        });
    },
    //把用户名和头像保存在云空间
    saveUserInfo() {
        const userInfos = this.data.userInfo;
        console.log(userInfos)
        const openid = wx.getStorageSync('openid');
        console.log(userInfos.nickName != '')
        console.log(openid != '')
        console.log(openid)
        if (userInfos.nickName != '' && openid != '') {
          const db = wx.cloud.database();
          db.collection('users').add({
            data: {
              nickName: userInfos.nickName,
              avatarUrl:userInfos.avatarUrl,
            },
            success: (res) => {
              console.log('昵称存储成功:', res);
              wx.showToast({
                title: '昵称保存成功',
                icon: 'success'
              });
            },
            fail: (err) => {
              console.log('昵称存储失败:', err);
              wx.showToast({
                title: '保存失败，请重试',
                icon: 'none'
              });
            }
          });
        } else {
          wx.showToast({
            title: '请输入昵称',
            icon: 'none'
          });
        }
      },
      getNicknameFromCloud() {
        const db = wx.cloud.database();
        const openid = wx.getStorageSync('openid');
        db.collection('users').where({
            _openid: openid
        }).get({
          success: (res) => {
              console.log(res)
            if (res.data.length > 0) {
              this.setData({
                'userInfo.nickName': res.data[0].nickName,
                'userInfo.avatarUrl':res.data[0].avatarUrl
              });
            }
          },
          fail: (err) => {
            console.log('从云数据库读取昵称失败:', err);
          }
        });
      }

});