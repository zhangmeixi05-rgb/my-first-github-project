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
    const db = wx.cloud.database();
    // const userId = wx.getStorageSync('userId');
    const userId = wx.getStorageSync('userInfo')._id;
    console.log(userId);
    db.collection('posts').where({
      userId:userId
    }).get({
      success: res => {
        console.log('获取数据成功', res);
        // 在这里处理返回的数据
        this.setData({
          userPosts:res.data
        })
        this.splitColumns(this.data.userPosts);
      },
      fail: err => {
        console.error('获取数据失败', err);
        // 处理失败情况
      }
    });
    // let posts = wx.getStorageSync('posts') || [];
    // let userPosts = posts.filter(post => post.userId === userId);

    // this.setData({
    //   userPosts
    // });
  },

  splitColumns(posts) {
    console.log(posts);
    let leftColumn = [];
    let rightColumn = [];

    posts.forEach((post, index) => {

      if (index % 2 === 0) {
        leftColumn.push(post);
      } else {
        rightColumn.push(post);
      }
    });
    console.log(rightColumn);

    this.setData({
      leftColumn,
      rightColumn
    });
  },

  viewDetail(e) {
    const postId = e.currentTarget.dataset.id;
    console.log(postId);
    wx.navigateTo({
      url: `/pages/detail/detail?id=${postId}&source=my_publish`
    });
  }
});
