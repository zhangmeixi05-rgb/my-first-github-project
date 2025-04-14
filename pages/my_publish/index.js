Page({
  data: {
    userPosts: [],
    leftColumn: [],
    rightColumn: []
  },

  onLoad() {
    this.loadUserPosts();
  },

  onShow() {
    this.loadUserPosts(); // 确保页面显示最新数据
  },

  loadUserPosts() {
    const userId = wx.getStorageSync('userId');
    let posts = wx.getStorageSync('posts') || [];
    let userPosts = posts.filter(post => post.userId === userId);
    this.splitColumns(userPosts);
    this.setData({
      userPosts
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

    this.setData({
      leftColumn,
      rightColumn
    });
  },

  viewDetail(e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${postId}&source=my_publish`
    });
  }
});
