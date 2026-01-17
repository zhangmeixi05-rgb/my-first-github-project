Page({
  data: {
    sentRequests: [],
    receivedRequests: [],
    userInfo: null,
    loading: false
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo }, () => {
        this.loadRequestHistory();
      });
    }
  },

  loadRequestHistory() {
    if (this.data.loading) return;
    
    const userId = this.data.userInfo._id;
    if (!userId) return;

    this.setData({ loading: true });

    wx.cloud.callFunction({
      name: 'get-request-history',
      data: { userId }
    })
    .then(res => {
      if (res.result && res.result.success) {
        this.setData({
          sentRequests: res.result.sent || [],
          receivedRequests: res.result.received || []
        });
      } else {
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
      this.setData({ loading: false });
    })
    .catch(err => {
      console.error('加载申请历史失败', err);
      wx.showToast({ title: '网络异常', icon: 'none' });
      this.setData({ loading: false });
    });
  },

  acceptRequest(e) {
    const request = e.currentTarget.dataset.request;
    this.dealRequest(request, true);
  },

  rejectRequest(e) {
    const request = e.currentTarget.dataset.request;
    this.dealRequest(request, false);
  },

  dealRequest(request, agree) {
    if (this.data.loading) return;
    
    const { _id: requestId, userId: requesterId, avatarUrl, nickName, reason } = request;
    const self = this.data.userInfo;

    this.setData({ loading: true });

    wx.cloud.callFunction({
      name: 'deal-request',
      data: {
        requestId: requestId,
        agree: agree,
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
          wx.showToast({ 
            title: agree ? '添加成功' : '已拒绝', 
            icon: agree ? 'success' : 'none' 
          });
          
          if (agree && reason) {
            this.sendFriendRequestToChat(reason, requesterId, nickName);
          }
          
          setTimeout(() => {
            this.loadRequestHistory();
          }, 1000);
        } else {
          wx.showToast({ title: res.result.message || '操作失败', icon: 'none' });
          this.setData({ loading: false });
        }
      },
      fail: err => {
        console.error('处理请求失败', err);
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
  }
});