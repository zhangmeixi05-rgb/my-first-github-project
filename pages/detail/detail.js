Page({
  data: {
    post: {},
    postId: '',
    isFavorited: false,
    favoriteCount: 0,
    source: '',
    userInfo: {
      avatarUrl: '',
      nickName: ''
    }
  },

  onLoad(options) {
    this.loadFavoriteStatus();
    const postId = options.id;
    this.setData({
      postId,
      source: options.source || ''
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
    const post = posts.find(p => p.id === Number(postId));

    if (post) {
      this.setData({
        post,
        isFavorited: wx.getStorageSync(`favorite_${postId}`) || false
      });
    }
  },

  onShow() {
    this.loadFavoriteStatus();
  },

  toggleFavorite() {
    const isFavorited = !this.data.isFavorited;
    const postId = this.data.post.id;
  
    this.setData({
      isFavorited,
      favoriteCount: Math.max(isFavorited ? this.data.favoriteCount + 1 : this.data.favoriteCount - 1, 0)
    });
  
    wx.setStorageSync(`favorite_${postId}`, isFavorited);
    wx.setStorageSync(`favoriteCount_${postId}`, this.data.favoriteCount);
  
    let favoritePosts = wx.getStorageSync('favoritePosts') || [];
    if (isFavorited) {
      // 添加到收藏页面
      favoritePosts.push(this.data.post);
    } else {
      // 从收藏页面移除
      favoritePosts = favoritePosts.filter(post => post.id !== postId);
    }
    wx.setStorageSync('favoritePosts', favoritePosts);
  
    // 通知收藏页面刷新
    const pages = getCurrentPages();
    if (pages.length > 1) {
      const prevPage = pages[pages.length - 2]; // Assuming the previous page is the favorite page
      if (prevPage.route === "pages/my_favorite/index" && typeof prevPage.updateFavoritePosts === 'function') {
        prevPage.updateFavoritePosts(favoritePosts);
      }
    }
  
    wx.showToast({
      title: isFavorited ? '收藏成功' : '取消收藏',
      icon: 'success'
    });
  },
  
  addFavorite(postId) {
    let favoritePosts = wx.getStorageSync('favoritePosts') || [];
    favoritePosts.push(this.data.post);
    wx.setStorageSync('favoritePosts', favoritePosts);
  },

  removeFavorite(postId) {
    let favoritePosts = wx.getStorageSync('favoritePosts') || [];
    favoritePosts = favoritePosts.filter(post => post.id !== postId);
    wx.setStorageSync('favoritePosts', favoritePosts);

    // 通知收藏页面刷新
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2]; // Assuming the previous page is the favorite page
    if (prevPage && typeof prevPage.updateFavoritePosts === 'function') {
      prevPage.updateFavoritePosts(favoritePosts);
    }
  },

  deletePost() {
    const postId = this.data.post.id;
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
    let posts = wx.getStorageSync('posts') || [];
    posts = posts.filter(p => p.id !== postId);
    wx.setStorageSync('posts', posts);

    let favoritePosts = wx.getStorageSync('favoritePosts') || [];
    favoritePosts = favoritePosts.filter(p => p.id !== postId);
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
    const post = posts.find(p => p.id === Number(postId));
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
