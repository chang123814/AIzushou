Page({
  data: {
    windowHeight: 0
  },
  onLoad() {
    // 获取系统信息，包括窗口高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      windowHeight: systemInfo.windowHeight
    });
  },
  
  // 分享给朋友
  onShareAppMessage() {
    return {
      title: 'AI绘画提示词配置',
      path: '/pages/home/index',
      imageUrl: '/pages/home/images/top_background.jpeg'
    };
  }
});
