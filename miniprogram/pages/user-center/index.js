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
        const filePath = e.detail.avatarUrl;
        if (!filePath) {
            return;
        }
        // 生成一个唯一的文件名，这里使用当前时间戳
        const cloudPath = 'user_avatar/' + Date.now() + filePath.match(/\.[^.]+?$/)[0];
        wx.cloud.uploadFile({
            cloudPath,
            filePath,
            success: res => {
                console.log('上传成功', res.fileID);
                // 可以在这里将 fileID 保存到云数据库等操作
                this.saveFileIDToDatabase(res.fileID)
                this.setData({
                    'userInfo.avatarUrl': res.fileID
                })
            },
            fail: err => {
                console.error('上传失败', err);
            }
        });
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
    //把头像保存在云存储里
    saveFileIDToDatabase(fileID) {
        const userInfos = this.data.userInfo;
        console.log(userInfos)
        const openid = wx.getStorageSync('openid');
        if(userInfos.nickName != '' && openid != ''){
            wx.cloud.database().collection('users').add({
                data: {
                  fileID: fileID,
                  uploadTime: new Date(),nickName: userInfos.nickName,
                  avatarUrl:userInfos.avatarUrl,
                },
                success: res => {
                  console.log('fileID 保存到数据库成功', res);
                  wx.showToast({
                      title: '保存成功',
                      icon: 'success'
                    });
                },
                fail: err => {
                  console.error('fileID 保存到数据库失败', err);
                  wx.showToast({
                      title: '保存失败，请重试',
                      icon: 'none'
                    });
                }
              });
        }else{
            wx.showToast({
                title: '请输入昵称',
                icon: 'none'
              });
        }
      },
    //把用户名和头像保存在数据库
    // saveUserInfo() {
    //     const userInfos = this.data.userInfo;
    //     console.log(userInfos)
    //     const openid = wx.getStorageSync('openid');
    //     if (userInfos.nickName != '' && openid != '') {
    //       const db = wx.cloud.database();
    //       db.collection('users').add({
    //         data: {
    //           nickName: userInfos.nickName,
    //           avatarUrl:userInfos.avatarUrl,
    //         },
    //         success: (res) => {
    //           console.log('昵称存储成功:', res);
    //           wx.showToast({
    //             title: '昵称保存成功',
    //             icon: 'success'
    //           });
    //         },
    //         fail: (err) => {
    //           console.log('昵称存储失败:', err);
    //           wx.showToast({
    //             title: '保存失败，请重试',
    //             icon: 'none'
    //           });
    //         }
    //       });
    //     } else {
    //       wx.showToast({
    //         title: '请输入昵称',
    //         icon: 'none'
    //       });
    //     }
    //   },
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
                'userInfo.avatarUrl':res.data[0].fileID
              });
            }
          },
          fail: (err) => {
            console.log('从云数据库读取昵称失败:', err);
          }
        });
      }

});