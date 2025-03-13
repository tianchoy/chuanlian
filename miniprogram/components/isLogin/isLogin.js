// components/isLogin/isLogin.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    isLogin: {
        type: Boolean,
        value: false,
      },
  },
 

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 按钮点击事件
    toLogin() {
        this.triggerEvent('toLogin'); // 向父组件触发事件
      },
  },
})