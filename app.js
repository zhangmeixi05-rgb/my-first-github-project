// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

      wx.cloud.init({
        env: 'cloud1-8gkoymjia23bac63', // 你的环境ID
        traceUser: true, // 是否要在控制台打印用户身份信息，开发环境建议开启
      })
   
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null
  }
})
