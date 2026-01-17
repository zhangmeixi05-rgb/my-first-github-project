Page({
  data: {
    favoritePosts: [],
    leftColumn: [],
    rightColumn: []
  },

  onLoad() {
    this.loadFavoritePosts();
  },

  onShow() {
    this.loadFavoritePosts(); // 确保页面显示最新数据
  },

  loadFavoritePosts() {
    const userInfo = wx.getStorageSync('userInfo');
    const userId = userInfo?._id;
    
    if (!userId) {
      wx.showToast({
        title: '未登录',
        icon: 'error'
      });
      return;
    }
  
    wx.cloud.callFunction({
      name: 'getUserFavorites',
      data: { userId },
      success: res => {
        if (res.result.code === 200) {
          const favoritePosts = res.result.data || [];
          this.splitColumns(favoritePosts);
          this.setData({ favoritePosts });
          wx.setStorageSync('favoritePosts', favoritePosts);
        } else {
          wx.showToast({ title: '获取收藏失败', icon: 'error' });
        }
      },
      fail: err => {
        wx.showToast({ title: '调用云函数失败', icon: 'error' });
      }
    });
  },
  

  splitColumns(posts) {
    let leftColumn = [];
    let rightColumn = [];

    posts.forEach((post, index) => {
      if (index % 2 === 0) {
        leftColumn.push(post);
      } else {
        rightColumn.push(post);
      }
    });

    this.setData({ leftColumn, rightColumn });
  },

  viewDetail(e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${postId}&source=favorites`
    });
  }
});
