Page({
  data: {
    newFriendRequests: [],
    userInfo: null,
    loading: false
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
    if (this.data.loading) return;
    
    const request = e.currentTarget.dataset.request;
    const { _id: requestId, userId: requesterId, avatarUrl, nickName, reason } = request;
    const self = this.data.userInfo;

    this.setData({ loading: true });

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
          
          this.sendFriendRequestToChat(reason, requesterId, nickName);
          
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            });
          }, 1000);
        } else {
          wx.showToast({ title: res.result.message || '添加失败', icon: 'none' });
          this.setData({ loading: false });
        }
      },
      fail: err => {
        console.error('接受请求失败', err);
        wx.showToast({ title: '网络异常', icon: 'none' });
        this.setData({ loading: false });
      }
    });
  },

  sendFriendRequestToChat(reason, friendId, friendNickName) {
    const self = this.data.userInfo;
    
    if (!reason || reason.trim() === '') return;
    
    const db = wx.cloud.database();
    db.collection('chat')
      .add({
        data: {
          fromUserId: self._id,
          toUserId: friendId,
          message: reason,
          type: 'text',
          createTime: db.serverDate()
        }
      })
      .then(res => {
        console.log('好友申请消息已发送到聊天', res);
      })
      .catch(err => {
        console.error('发送消息失败', err);
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
