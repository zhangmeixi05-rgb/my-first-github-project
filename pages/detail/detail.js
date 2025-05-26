Page({
  data: {
    post: {},
    postId: '',
    isFavorited: false,
    favoriteCount: 0,
    source: '', // 新增 source 字段，用于记录页面来源
    userInfo: {
      avatarUrl: '',
      nickName: ''
    }
  },

  onLoad(options) {
    console.log(options);
    this.loadFavoriteStatus();
    const postId = options.id;
    this.setData({
      postId,
      source: options.source || '' // 从参数中获取 source
    });
    
    this.loadDetail(postId);

    // Load user info
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      });
    }

    const posts = wx.getStorageSync('posts') || [];
    console.log(posts);
    const post = posts.find(p => p._id === Number(postId));
    if (post) {

      this.setData({
        post,
        isFavorited: wx.getStorageSync(`favorite_${postId}`) || false
      });
    }
  },

  onShow() {
    this.loadFavoriteStatus();
    const userInfo = wx.getStorageSync('userInfo');
const userId = userInfo ? userInfo._id : null;

if (userId) {
  wx.cloud.callFunction({
    name: 'getUserFavorites',
    data: { userId },
    success: res => {
      if (res.result.code === 200) {
        const favoritedPostIds = res.result.data;
        const isFavorited = favoritedPostIds.includes(post._id);
        this.setData({
          isFavorited
        });
        wx.setStorageSync(`favorite_${post._id}`, isFavorited);
      }
    },
    fail: err => {
      console.error('获取收藏状态失败', err);
    }
  });
}

  },

  toggleFavorite() {
    const isFavorited = !this.data.isFavorited;
    const postId = this.data.post._id;
    const userInfo = wx.getStorageSync('userInfo');
    const userId = userInfo ? userInfo._id : null;
  
    this.setData({
      isFavorited,
      favoriteCount: Math.max(isFavorited ? this.data.favoriteCount + 1 : this.data.favoriteCount - 1, 0)
    });
  
    wx.setStorageSync(`favorite_${postId}`, isFavorited);
    wx.setStorageSync(`favoriteCount_${postId}`, this.data.favoriteCount);
  
    let favoritePosts = wx.getStorageSync('favoritePosts') || [];
    if (isFavorited) {
      favoritePosts.push(this.data.post);
      this.callFavoriteCloud('addFavorite', userId, postId);
    } else {
      favoritePosts = favoritePosts.filter(post => post._id !== postId);
      this.callFavoriteCloud('removeFavorite', userId, postId);
    }
    wx.setStorageSync('favoritePosts', favoritePosts);
  
    const pages = getCurrentPages();
    if (pages.length > 1) {
      const prevPage = pages[pages.length - 2];
      if (prevPage.route === "pages/my_favorite/index" && typeof prevPage.updateFavoritePosts === 'function') {
        prevPage.updateFavoritePosts(favoritePosts);
      }
    }
  
    wx.showToast({
      title: isFavorited ? '收藏成功' : '取消收藏',
      icon: 'success'
    });
  },
  
  callFavoriteCloud(functionName, userId, postId) {
    wx.cloud.callFunction({
      name: functionName,
      data: {
        userId,
        postId
      },
      success: res => {
        console.log(`${functionName} 调用成功`, res);
      },
      fail: err => {
        console.error(`${functionName} 调用失败`, err);
      }
    });
  },
  

  addFavorite(postId) {
    let favoritePosts = wx.getStorageSync('favoritePosts') || [];
    favoritePosts.push(this.data.post);
    wx.setStorageSync('favoritePosts', favoritePosts);
  },

  removeFavorite(postId) {
    let favoritePosts = wx.getStorageSync('favoritePosts') || [];
    favoritePosts = favoritePosts.filter(post => post._id !== postId); // 修正为 _id
    wx.setStorageSync('favoritePosts', favoritePosts);

    // 通知收藏页面刷新
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2]; // Assuming the previous page is the favorite page
    if (prevPage && typeof prevPage.updateFavoritePosts === 'function') {
      prevPage.updateFavoritePosts(favoritePosts);
    }
  },

  deletePost(e) {
    console.log(e);
    const postId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '是否确认删除帖子？',
      success: (res) => {
        if (res.confirm) {
          this.removePost(postId);
          wx.navigateBack();
        }
      }
    });
  },

  removePost(postId) {
    console.log(postId);
    let posts = wx.getStorageSync('posts') || [];
    posts = posts.filter(p => p._id !== postId);
    wx.setStorageSync('posts', posts);
    wx.cloud.callFunction({
      name: 'delete-card', // 替换为你的云函数名称
      data: {
        _id: postId
      }
    }).then(res => {
      console.log(res);
    })
    let favoritePosts = wx.getStorageSync('favoritePosts') || [];
    favoritePosts = favoritePosts.filter(p => p._id !== postId);
    wx.setStorageSync('favoritePosts', favoritePosts);

    // 刷新页面
    const pages = getCurrentPages();
    if (pages.length > 1) {
      const prevPage = pages[pages.length - 2];
      if (prevPage && typeof prevPage.loadUserPosts === 'function') {
        prevPage.loadUserPosts();
      }
    }
  },

  navigateToMessage() {
    wx.switchTab({
      url: '/pages/message/index'
    });
  },

  navigateToDaohang() {
    const location = this.data.post.location;
    wx.navigateTo({
      url: `/pages/index/daohang/daohang?latitude=${location.latitude}&longitude=${location.longitude}&name=${location.name}`
    });
  },

  loadDetail(postId) {
    const posts = wx.getStorageSync('posts') || [];
    const post = posts.find(p => p._id === postId);
    const favoriteCount = wx.getStorageSync(`favoriteCount_${postId}`) || 0;
    this.setData({
      post,
      favoriteCount
    });
  },

  loadFavoriteStatus() {
    const postId = this.data.postId;
    const isFavorited = wx.getStorageSync(`favorite_${postId}`) || false;
    const favoriteCount = wx.getStorageSync(`favoriteCount_${postId}`) || 0;
    this.setData({
      isFavorited,
      favoriteCount
    });
  }
});
