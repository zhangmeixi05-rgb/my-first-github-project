Page({
  data: {
    posts: [],
    filteredPosts: [],
    leftColumn: [],
    rightColumn: [],
    keyword: ''
  },

  onLoad() {
    this.loadPosts();
  },

  onShow() {
    this.loadPosts(); // 确保页面显示时加载最新数据
  },

  loadPosts() {
    const posts = wx.getStorageSync('posts') || [];
    this.setData({
      posts,
      filteredPosts: posts
    });
    this.splitColumns(posts);
  },

  inputChange(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  search() {
    const keyword = this.data.keyword.toLowerCase();
    const filteredPosts = this.data.posts.filter(post => 
      post.title.toLowerCase().includes(keyword) || 
      post.content.toLowerCase().includes(keyword) || 
      (post.location && post.location.name.toLowerCase().includes(keyword))
    );
    this.setData({
      filteredPosts
    });
    this.splitColumns(filteredPosts);
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
      url: `/pages/detail/detail?id=${postId}`
    });
  }
});
