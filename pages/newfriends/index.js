Page({
  data: {
    newFriendRequests: [],
    userInfo: null
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo }, () => {
        this.loadFriendRequests();
      });
    }
  },

  // 调用 friend-request 云函数获取待同意的请求
  loadFriendRequests() {
    const userId = this.data.userInfo._id;
    wx.cloud.callFunction({
      name: 'friend-request',
      data: { userId },
      success: res => {
        if (res.result && res.result.success) {
          this.setData({ newFriendRequests: res.result.data });
        } else {
          wx.showToast({ title: '加载请求失败', icon: 'none' });
        }
      },
      fail: err => {
        console.error('获取请求失败', err);
        wx.showToast({ title: '网络异常', icon: 'none' });
      }
    });
  },

  // 接受好友请求
  acceptRequest(e) {
    const request = e.currentTarget.dataset.request;
    const { _id: requestId, userId: requesterId, avatarUrl, nickName } = request;
    const self = this.data.userInfo;

    wx.cloud.callFunction({
      name: 'deal-request',
      data: {
        requestId: requestId,
        agree: true,
        userId: self._id,
        friendId: requesterId,
        userInfo: {
          nickName: self.nickName,
          avatarUrl: self.avatarUrl
        },
        friendInfo: {
          nickName,
          avatarUrl
        }
      },
      success: res => {
        if (res.result && res.result.success) {
          wx.showToast({ title: '添加成功', icon: 'success' });
          this.loadFriendRequests();

          // 刷新我的好友页面
          const pages = getCurrentPages();
          const mySettingPage = pages.find(p => p.route === 'pages/my_setting/index');
          if (mySettingPage) {
            mySettingPage.loadFriends();
          }
        } else {
          wx.showToast({ title: res.result.message || '添加失败', icon: 'none' });
        }
      },
      fail: err => {
        console.error('接受请求失败', err);
        wx.showToast({ title: '网络异常', icon: 'none' });
      }
    });
  },

  // 拒绝好友请求
  rejectRequest(e) {
    const request = e.currentTarget.dataset.request;
    const { _id: requestId } = request;

    wx.cloud.callFunction({
      name: 'deal-request',
      data: {
        requestId: requestId,
        agree: false
      },
      success: res => {
        if (res.result && res.result.success) {
          wx.showToast({ title: '已拒绝', icon: 'none' });
          this.loadFriendRequests();
        } else {
          wx.showToast({ title: res.result.message || '操作失败', icon: 'none' });
        }
      },
      fail: err => {
        console.error('拒绝请求失败', err);
        wx.showToast({ title: '网络异常', icon: 'none' });
      }
    });
  }
});
