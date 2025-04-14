Page({
  data: {
    newFriendRequests: []
  },

  onLoad() {
    this.loadFriendRequests();
  },

  loadFriendRequests() {
    const newFriendRequests = wx.getStorageSync('newFriendRequests') || [];
    this.setData({ newFriendRequests });
  },

  acceptRequest(e) {
    const { userId } = e.currentTarget.dataset;
    let friends = wx.getStorageSync('friends') || [];
    const request = this.data.newFriendRequests.find(req => req.userId === userId);

    if (request) {
      if (!friends.find(friend => friend.id === userId)) {
        friends.push({
          id: request.userId,
          avatarUrl: request.avatarUrl,
          nickName: request.nickName
        });
        wx.setStorageSync('friends', friends);
      }

      this.setData({
        newFriendRequests: this.data.newFriendRequests.filter(req => req.userId !== userId)
      });
      wx.setStorageSync('newFriendRequests', this.data.newFriendRequests);

      wx.showToast({ title: '添加好友成功', icon: 'success' });

      const pages = getCurrentPages();
      const mySettingPage = pages.find(page => page.route === 'pages/my_setting/index');
      if (mySettingPage) {
        mySettingPage.loadFriends();
      }

      this.loadFriendRequests();
    }
  },

  rejectRequest(e) {
    const { userId } = e.currentTarget.dataset;
    this.setData({
      newFriendRequests: this.data.newFriendRequests.filter(req => req.userId !== userId)
    });
    wx.setStorageSync('newFriendRequests', this.data.newFriendRequests);

    wx.showToast({ title: '已拒绝好友请求', icon: 'none' });

    const pages = getCurrentPages();
    const mySettingPage = pages.find(page => page.route === 'pages/my_setting/index');
    if (mySettingPage) {
      mySettingPage.loadFriends();
    }

    this.loadFriendRequests();
  }
});
