Page({
  data: {
    sentRequests: [],
    receivedRequests: [],
    userInfo: null
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo }, () => {
        this.loadAllRequests();
      });
    }
  },

  loadAllRequests() {
    const userId = this.data.userInfo._id;

    // 获取收到的所有好友请求（包括已处理）
    wx.cloud.callFunction({
      name: 'all-friend-requests',
      data: { userId, type: 'received' },
      success: res => {
        console.log('Received requests:', res);
        if (res.result && res.result.data) {
          this.setData({ receivedRequests: res.result.data });
        }
      },
      fail: err => {
        console.error('获取收到的请求失败', err);
        wx.showToast({ title: '加载收到的请求失败', icon: 'none' });
      }
    });

    // 获取发出的所有好友请求
    wx.cloud.callFunction({
      name: 'all-friend-requests',
      data: { userId, type: 'sent' },
      success: res => {
        console.log('Sent requests:', res);
        if (res.result && res.result.data) {
          this.setData({ sentRequests: res.result.data });
        }
      },
      fail: err => {
        console.error('获取发出的请求失败', err);
        wx.showToast({ title: '加载发出的请求失败', icon: 'none' });
      }
    });
  },

  // 重新处理拒绝的请求
  retryRequest(e) {
    const request = e.currentTarget.dataset.request;
    const self = this.data.userInfo;

    wx.showModal({
      title: '确认通过',
      content: `确定要通过来自 ${request.nickName} 的好友请求吗？`,
      success: res => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'deal-request',
            data: {
              requestId: request._id,
              agree: true,
              userId: self._id,
              friendId: request.userId,
              userInfo: {
                nickName: self.nickName,
                avatarUrl: self.avatarUrl
              },
              friendInfo: {
                nickName: request.nickName,
                avatarUrl: request.avatarUrl
              }
            },
            success: res => {
              if (res.result && res.result.success) {
                wx.showToast({ title: '添加成功', icon: 'success' });
                this.loadAllRequests();

                // 发送申请理由到聊天（由申请方发送）
                if (request.reason) {
                  const chat_id = [self._id, request.userId].sort().join('_');
                  const welcomeMessage = {
                    from: request.nickName,
                    content: `我添加你为好友的理由是：${request.reason}`,
                    type: 'text',
                    time: new Date().toLocaleTimeString(),
                    avatar: request.avatarUrl
                  };

                  wx.cloud.callFunction({
                    name: 'chat',
                    data: { chat_id, message: welcomeMessage },
                    success: () => console.log('Welcome message sent'),
                    fail: err => console.error('Send welcome message failed', err)
                  });
                }

                // 刷新我的好友页面
                setTimeout(() => {
                  const pages = getCurrentPages();
                  const mySettingPage = pages.find(p => p.route === 'pages/my_setting/index');
                  if (mySettingPage) {
                    mySettingPage.loadFriendsFromCloud();
                    mySettingPage.loadFriendRequests();
                  }
                }, 1500);
              } else {
                wx.showToast({ title: res.result.message || '添加失败', icon: 'none' });
              }
            },
            fail: err => {
              console.error('接受请求失败', err);
              wx.showToast({ title: '网络异常', icon: 'none' });
            }
          });
        }
      }
    });
  },

  // 取消发出的请求
  cancelRequest(e) {
    const request = e.currentTarget.dataset.request;

    wx.showModal({
      title: '确认取消',
      content: `确定要取消发送给 ${request.friendNickName} 的好友请求吗？`,
      success: res => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'cancel-friend-request',
            data: { requestId: request._id },
            success: res => {
              if (res.result && res.result.success) {
                wx.showToast({ title: '已取消', icon: 'success' });
                this.loadAllRequests();
              } else {
                wx.showToast({ title: res.result.message || '操作失败', icon: 'none' });
              }
            },
            fail: err => {
              console.error('取消请求失败', err);
              wx.showToast({ title: '网络异常', icon: 'none' });
            }
          });
        }
      }
    });
  }
});