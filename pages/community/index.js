Page({
  data: {
    activeTab: 'hot', // 'hot' or 'new'
    questionList: []
  },

  onLoad(options) {
    this.loadQuestions();
  },

  // 预留接口: 加载问题列表
  loadQuestions() {
    // 在这里根据 activeTab 的值来决定排序方式，并发起 API 请求
    // const sortBy = this.data.activeTab;
    // wx.request({ url: `YOUR_API/questions?sort=${sortBy}`, ... })

    // --- Mock 数据 --- //
    const mockData = [
      {
        id: 'q1',
        title: '微信小程序开发中，如何实现一个优雅的下拉刷新和上拉加载？',
        tags: ['小程序', '前端开发', 'UI交互'],
        likes: 128,
        answers: 15,
        author: '代码小白',
        timeAgo: '2小时前'
      },
      {
        id: 'q2',
        title: '云服务器的数据库应该如何选择？MySQL 还是 PostgreSQL？',
        tags: ['后端', '数据库', '架构'],
        likes: 256,
        answers: 32,
        author: '架构师大牛',
        timeAgo: '5小时前'
      },
      {
        id: 'q3',
        title: 'WXML 中 wx:if 和 hidden 有什么区别，性能上哪个更好？',
        tags: ['性能优化', 'WXML'],
        likes: 99,
        answers: 8,
        author: '性能控',
        timeAgo: '1天前'
      }
    ];
    this.setData({
      questionList: mockData
    });
  },
  
  // 分享给朋友
  onShareAppMessage() {
    return {
      title: 'AI绘画提示词社区',
      path: '/pages/community/index'
    };
  },

  // 切换排序方式
  switchTab(e) {
    const newTab = e.currentTarget.dataset.tab;
    if (newTab !== this.data.activeTab) {
      this.setData({
        activeTab: newTab
      });
      // 重新加载数据
      this.loadQuestions();
    }
  },

  // 跳转到发布页
  navigateToPost() {
    wx.navigateTo({ url: '/pages/community/post/index' });
  },

  // 跳转到详情页
  navigateToDetail(e) {
    const questionId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/community/detail/index?id=${questionId}` });
  }
});
