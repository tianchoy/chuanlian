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
        var that =this 
        that.getUsetInfo()
    },

    async getUsetInfo(){
      let res = await wx.cloud.callFunction({
        name: 'cl_userInfo',
        data:{
          type:'get'
        }
      })
      console.log(res)
    }

});