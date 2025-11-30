Page({
  data: {
    question: null, // 问题详情
    myReply: '' // 我的回复内容
  },

  onLoad(options) {
    const questionId = options.id;
    console.log('加载问题详情，ID:', questionId);
    this.loadQuestionDetail(questionId);
  },

  // 预留接口: 加载问题详情
  loadQuestionDetail(questionId) {
    // --- API 请求位置 ---
    // wx.request({ url: `YOUR_API/questions/${questionId}`, ... })

    // --- Mock 数据 --- //
    const mockData = {
      id: questionId,
      title: '微信小程序开发中，如何实现一个优雅的下拉刷新和上拉加载？',
      content: 'RT，最近在做一个项目，列表页需要支持下拉刷新和上拉加载更多的功能。官方提供的 enablePullDownRefresh 和 onReachBottom 感觉比较生硬，有没有一些成熟的UI组件或者实现方案推荐？希望交互体验能好一些，比如带有加载动画和状态提示。',
      tags: ['小程序', '前端开发', 'UI交互'],
      author: {
        nickname: '代码小白',
        avatar: 'https://fastly.picsum.photos/id/11/200/200.jpg?hmac=qX9lG2us2_oUq2M053s3sL4_NOT_malT5UZvP2jS3dc'
      },
      createdAt: '2天前',
      likeCount: 128,
      favoriteCount: 99,
      answerCount: 5,
      isLiked: false,
      isFavorited: true,
      answers: [
        {
          id: 'ans1',
          author: {
            nickname: '官方文档爱好者',
            avatar: 'https://fastly.picsum.photos/id/13/200/200.jpg?hmac=D-0_5kR-2etM0T_c5a-eB5S-Rgi_vg_ewBCQPA_K53I'
          },
          content: '其实官方的 API 已经够用了，关键在于你怎么封装。可以在 onPullDownRefresh 里请求新数据，结束后手动调用 wx.stopPullDownRefresh()。',
          createdAt: '2天前',
          children: [
            {
              id: 'ans1-1',
              author: {
                nickname: '代码小白',
                avatar: 'https://fastly.picsum.photos/id/11/200/200.jpg?hmac=qX9lG2us2_oUq2M053s3sL4_NOT_malT5UZvP2jS3dc'
              },
              replyTo: '官方文档爱好者',
              content: '感谢回复！主要还是觉得原生的交互效果太朴素了。',
              createdAt: '1天前',
            }
          ]
        },
        {
          id: 'ans2',
          author: {
            nickname: 'UI组件大师',
            avatar: 'https://fastly.picsum.photos/id/15/200/200.jpg?hmac=i_vB72eqi3wB_uMWw5h3g1T5z_m_Nl8a-p0n0jkv3ZM'
          },
          content: '可以考虑使用一些成熟的第三方UI库，比如 Vant Weapp 或者 Lin UI，它们都提供了封装好的 List 组件，自带下拉刷新和上拉加载功能，效果很不错。',
          createdAt: '1天前',
          children: []
        }
      ]
    };
    this.setData({
      question: mockData
    });
  },
  
  // 分享给朋友
  onShareAppMessage() {
    const { question } = this.data;
    return {
      title: question ? question.title : 'AI绘画提示词社区',
      path: `/pages/community/detail/index?id=${question ? question.id : ''}`
    };
  },

  // 预留接口: 切换点赞状态
  toggleLike() {
    const { question } = this.data;
    const isLiked = !question.isLiked;
    const likeCount = isLiked ? question.likeCount + 1 : question.likeCount - 1;
    this.setData({
      'question.isLiked': isLiked,
      'question.likeCount': likeCount
    });
    // --- API 请求位置 ---
    // wx.request({ url: `YOUR_API/questions/${question.id}/like`, method: 'POST', ... })
  },

  // 预留接口: 切换收藏状态
  toggleFavorite() {
    const { question } = this.data;
    const isFavorited = !question.isFavorited;
    const favoriteCount = isFavorited ? question.favoriteCount + 1 : question.favoriteCount - 1;
    this.setData({
      'question.isFavorited': isFavorited,
      'question.favoriteCount': favoriteCount
    });
    // --- API 请求位置 ---
    // wx.request({ url: `YOUR_API/questions/${question.id}/favorite`, method: 'POST', ... })
  },

  // 预留接口: 提交回复
  submitReply() {
    if (!this.data.myReply.trim()) {
      wx.showToast({ title: '回复内容不能为空', icon: 'none' });
      return;
    }

    console.log('提交回复:', this.data.myReply);
    // --- API 请求位置 ---
    /*
    wx.request({
      url: `YOUR_API/questions/${this.data.question.id}/answers`,
      method: 'POST',
      data: { content: this.data.myReply, ... },
      success: (res) => {
        // 成功后，重新拉取列表或在本地追加
      }
    })
    */

    // --- 前端模拟成功 ---
    const newAnswer = {
      id: 'ans' + Date.now(),
      author: { nickname: '我', avatar: 'https://fastly.picsum.photos/id/18/200/200.jpg?hmac=9w_ud33uiY_KRx2e93a2_W3W3bOa_k_iS3e7_V8Y-ms' },
      content: this.data.myReply,
      createdAt: '刚刚',
      children: []
    };
    this.setData({
      'question.answers': [newAnswer, ...this.data.question.answers],
      'question.answerCount': this.data.question.answerCount + 1,
      myReply: '' // 清空输入框
    });

    wx.showToast({ title: '回复成功(模拟)', icon: 'success' });
  }
});
