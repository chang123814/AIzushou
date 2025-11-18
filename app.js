// app.js
App({
  onLaunch() {
    // 初始化云能力
    if (!wx.cloud) {
      console.error('wx.cloud not available in this version');
    } else {
      wx.cloud.init({
        env: 'cloud1-6guzdqjkd69a13fb', // 已替换为你的云环境ID
        traceUser: true,
      });
    }

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

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
