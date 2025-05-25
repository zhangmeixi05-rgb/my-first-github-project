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
    let favoritePosts = wx.getStorageSync('favoritePosts') || [];
    this.splitColumns(favoritePosts);
    this.setData({
      favoritePosts
    });
  },

  updateFavoritePosts(newFavoritePosts) {
    this.splitColumns(newFavoritePosts);
    this.setData({
      favoritePosts: newFavoritePosts
    });
  },

  splitColumns(posts) {
    let leftColumn = [];
    let rightColumn = [];

    posts.forEach((post, index) => { // 修正了posts -> post
      if (index % 2 === 0) {
        leftColumn.push(post);
      } else {
        rightColumn.push(post);
      }
    });

    this.setData({
      leftColumn,
      rightColumn
    });
  },

  viewDetail(e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${postId}&source=favorites` // 增加 source 参数用于标记来源
    });
  }
});
