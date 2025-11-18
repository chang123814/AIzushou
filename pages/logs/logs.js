// pages/logs/logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: []
  },
  onLoad() {
    try {
      const rawLogs = wx.getStorageSync('logs') || []
      const formatted = rawLogs.map(ts => util.formatTime(new Date(ts)))
      this.setData({ logs: formatted })
    } catch (e) {
      this.setData({ logs: [] })
    }
  }
})
