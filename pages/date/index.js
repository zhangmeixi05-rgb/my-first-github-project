Page({
  data: {
    posts: [],
    filteredPosts: [],
    leftColumn: [],
    rightColumn: [],
    keyword: ''
  },

  onLoad() {
    // this.loadPosts();
  },

  onShow() {
    this.loadPosts(); // 确保页面显示时加载最新数据
  },

   loadPosts() {
    const db = wx.cloud.database();
     db.collection('posts').get({
       success: res => {
        console.log('获取数据成功', res.data);
        // 在这里处理返回的数据
        this.setData({
          posts:res.data,
          filteredPosts:res.data
        })
       wx.setStorageSync('posts', res.data)
        console.log(this.data.posts);
        this.search()
      },
      fail: err => {
        console.error('获取数据失败', err);
        // 处理失败情况
      }
    });
    // const posts = wx.getStorageSync('posts') || [];
    // this.setData({
    //   posts,
    //   filteredPosts: posts
    // });
    this.splitColumns(this.data.posts);
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
    console.log(e);
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${postId}`
    });
  }
});
