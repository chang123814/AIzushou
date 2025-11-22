Page({
  data: {
    title: '',
    content: '',
    tags: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  // 提交问题
  submitQuestion() {
    const { title, content, tags } = this.data;

    if (!title) {
      wx.showToast({
        title: '标题不能为空',
        icon: 'none'
      });
      return;
    }

    // 将标签字符串按空格分割成数组
    const tagList = tags.trim().split(/\s+/).filter(Boolean);

    console.log('提交的问题:', {
      title,
      content,
      tags: tagList
    });

    // --- 预留的 API 请求 --- //
    /*
    wx.request({
      url: 'YOUR_API_ENDPOINT/questions',
      method: 'POST',
      data: {
        title,
        content,
        tags: tagList,
        userId: 'YOUR_USER_ID' // 从本地存储或全局状态中获取用户ID
      },
      success: (res) => {
        if (res.statusCode === 201) {
          wx.showToast({
            title: '发布成功',
            icon: 'success'
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          // 处理错误
        }
      },
      fail: (err) => {
        // 处理网络错误
      }
    });
    */

    // --- 前端模拟成功 --- //
    wx.showToast({
      title: '发布成功 (模拟)',
      icon: 'success'
    });

    // 模拟成功后，延时返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
});
