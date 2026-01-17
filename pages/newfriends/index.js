Page({
  data: {
    newFriendRequests: [],
<<<<<<< HEAD
    rejectedRequests: [],
    userInfo: null,
    currentTab: 0
=======
    userInfo: null
>>>>>>> origin/main
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo }, () => {
        this.loadFriendRequests();
      });
    }
  },

<<<<<<< HEAD
  onShow() {
    this.loadFriendRequests();
  },

  switchTab(e) {
    const currentTab = e.currentTarget.dataset.index;
    this.setData({ currentTab });
  },

  loadFriendRequests() {
    const userId = this.data.userInfo._id;
    const db = wx.cloud.database();
    
    db.collection('fellow').where({ friendId: userId }).get().then(res => {
      console.log('fellow查询结果:', res);
      const allRequests = res.data || [];
      console.log('所有请求:', allRequests);
      
      const pendingRequests = allRequests.filter(req => !req.isAgree && !req.rejected);
      const rejectedRequests = allRequests.filter(req => req.rejected === true);
      
      this.setData({ 
        newFriendRequests: pendingRequests,
        rejectedRequests: rejectedRequests
      });
    }).catch(err => {
      console.error('获取请求失败', err);
      wx.showToast({ title: '网络异常', icon: 'none' });
=======
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
>>>>>>> origin/main
    });
  },

  // 接受好友请求
  acceptRequest(e) {
    const request = e.currentTarget.dataset.request;
<<<<<<< HEAD
    const { _id: requestId, userId: requesterId, avatarUrl, nickName, reason } = request;
=======
    const { _id: requestId, userId: requesterId, avatarUrl, nickName } = request;
>>>>>>> origin/main
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
<<<<<<< HEAD
        console.log('deal-request返回:', res);
        if (res.result && res.result.success) {
          wx.showToast({ title: '添加成功', icon: 'success' });
          
          this.sendSystemMessage(requesterId, nickName, reason);
          
          setTimeout(() => {
            wx.navigateBack({
              delta: 1,
              success: () => {
                const pages = getCurrentPages();
                const mySettingPage = pages.find(p => p.route === 'pages/my_setting/index');
                if (mySettingPage) {
                  mySettingPage.loadFriendsFromCloud();
                  mySettingPage.loadFriendRequests();
                }
              }
            });
          }, 1500);
=======
        if (res.result && res.result.success) {
          wx.showToast({ title: '添加成功', icon: 'success' });
          this.loadFriendRequests();

          // 刷新我的好友页面
          const pages = getCurrentPages();
          const mySettingPage = pages.find(p => p.route === 'pages/my_setting/index');
          if (mySettingPage) {
            mySettingPage.loadFriends();
          }
>>>>>>> origin/main
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

<<<<<<< HEAD
  sendSystemMessage(friendId, friendNickName, reason) {
    const self = this.data.userInfo;
    const chat_id = [self._id, friendId].sort().join('_');

    const systemMessage = {
      from: '系统消息',
      content: `${friendNickName} 已通过你的好友申请\n验证消息：${reason}`,
      type: 'system',
      time: new Date().toLocaleTimeString(),
      avatar: '/img/xtxx.jpg'
    };

    wx.cloud.callFunction({
      name: 'chat',
      data: { chat_id, message: systemMessage },
      success: res => {
        console.log('系统消息发送成功', res);
      },
      fail: err => {
        console.error('系统消息发送失败', err);
      }
    });
  },

  reacceptRequest(e) {
    const request = e.currentTarget.dataset.request;
    const { _id: requestId, userId: requesterId, avatarUrl, nickName, reason } = request;
    const self = this.data.userInfo;

    wx.showModal({
      title: '重新接受申请',
      content: `确定要重新接受 ${nickName} 的好友申请吗？`,
      success: (res) => {
        if (res.confirm) {
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
              console.log('reaccept deal-request返回:', res);
              if (res.result && res.result.success) {
                wx.showToast({ title: '添加成功', icon: 'success' });
                
                this.sendSystemMessage(requesterId, nickName, reason);
                
                setTimeout(() => {
                  wx.navigateBack({
                    delta: 1,
                    success: () => {
                      const pages = getCurrentPages();
                      const mySettingPage = pages.find(p => p.route === 'pages/my_setting/index');
                      if (mySettingPage) {
                        mySettingPage.loadFriendsFromCloud();
                        mySettingPage.loadFriendRequests();
                      }
                    }
                  });
                }, 1500);
              } else {
                wx.showToast({ title: res.result.message || '操作失败', icon: 'none' });
              }
            },
            fail: err => {
              console.error('重新接受请求失败', err);
              wx.showToast({ title: '网络异常', icon: 'none' });
            }
          });
        }
      }
    });
  },

=======
  // 拒绝好友请求
>>>>>>> origin/main
  rejectRequest(e) {
    const request = e.currentTarget.dataset.request;
    const { _id: requestId } = request;

<<<<<<< HEAD
    const db = wx.cloud.database();
    
    db.collection('fellow').doc(requestId).update({
      data: {
        isAgree: false,
        rejected: true,
        rejectedTime: new Date()
      }
    }).then(() => {
      wx.showToast({ title: '已拒绝', icon: 'none' });
      this.loadFriendRequests();
    }).catch(err => {
      console.error('拒绝请求失败', err);
      wx.showToast({ title: '操作失败', icon: 'none' });
    });
  },
=======
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
>>>>>>> origin/main
});
