Page({
  data: {
    searchQuery: '',
    searchResult: null,
    userInfo: {},
    friends: [],
    newFriendRequests: [],
    isLoading: false
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      userInfo: userInfo
    });
    this.loadFriendsFromCloud();
    this.loadFriendRequests();
  },

  onShow() {
    if (this.data.userInfo._id) {
      this.loadFriendsFromCloud();
      this.loadFriendRequests();
    }
  },

  loadFriends() {
    const systemInfo = { id: 'system', avatarUrl: '/img/xtxx.jpg', nickName: '系统消息' };
    const userInfo = this.data.userInfo;
    const ownInfo = { id: userInfo.studentId, avatarUrl: userInfo.avatarUrl, nickName: '我' };
    let friends = wx.getStorageSync('friends') || [];

    // 过滤已有的系统和自己，避免重复
    friends = friends.filter(friend => friend.id !== 'system' && friend.id !== userInfo.studentId);

    this.setData({
      friends: [systemInfo, ownInfo, ...friends]
    });
  },

  loadFriendRequests() {
    const userId = this.data.userInfo._id;
    if (!userId) return;
  
    wx.cloud.callFunction({
      name: 'friend-request',
      data: { userId: userId },
      success: (res) => {
        if (res.result && res.result.data) {
          this.setData({
            newFriendRequests: res.result.data
          });
        } else {
          this.setData({ newFriendRequests: [] });
        }
      },
      fail: (err) => {
        console.error('获取好友请求失败', err);
        wx.showToast({ title: '加载好友请求失败', icon: 'none' });
      }
    });
  },
  
  onSearchInput(e) {
    this.setData({ searchQuery: e.detail.value });
  },

  searchFriend() {
    const query = this.data.searchQuery.trim();
    const userInfo = this.data.userInfo;
  
    if (!query) {
      wx.showToast({ title: '请输入关键词', icon: 'none' });
      return;
    }
  
    wx.cloud.database().collection('users')
      .where({
        $and: [
          { _id: wx.cloud.database().command.neq(userInfo._id) },  // 排除自己
          {
            $or: [
              { nickName: wx.cloud.database().RegExp({ regexp: query, options: 'i' }) },
              { phoneNumber: wx.cloud.database().RegExp({ regexp: query, options: 'i' }) },
              { studentId: wx.cloud.database().RegExp({ regexp: query, options: 'i' }) }
            ]
          }
        ]
      })
      .get()
      .then(res => {
        if (res.data.length > 0) {
          this.setData({ searchResult: res.data[0] });
        } else {
          this.setData({ searchResult: null });
          wx.showToast({ title: '未找到用户', icon: 'none' });
        }
      })
      .catch(err => {
        console.error('搜索失败', err);
        wx.showToast({ title: '搜索失败', icon: 'none' });
      });
  },

  addFriend(e) {
    const user = e.currentTarget.dataset.user;
    const self = this.data.userInfo;

    if (!user || !user._id || user._id === self._id) {
      wx.showToast({ title: '无效用户', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '申请添加好友',
      content: '请输入申请理由',
      editable: true,
      success: (res) => {
        if (res.confirm && res.content.trim() !== '') {
          wx.cloud.callFunction({
            name: 'add-friend',
            data: {
              userId: self._id,
              friendId: user._id,
              reason: res.content.trim(),
              nickName: self.nickName,
              avatarUrl: self.avatarUrl
            },
            success: res => {
              if (res.result && res.result.success) {
                wx.showToast({ title: '申请已发送', icon: 'success' });
              } else {
                wx.showToast({ title: res.result.message || '申请失败', icon: 'none' });
              }
            },
            fail: err => {
              console.error('添加好友失败', err);
              wx.showToast({ title: '请求失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  loadFriendsFromCloud() {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    
    const userInfo = this.data.userInfo;
    if (!userInfo || !userInfo._id) {
      this.setData({ isLoading: false });
      return;
    }
  
    const db = wx.cloud.database();
    db.collection('friend')
      .where({ userId: userInfo._id })
      .get()
      .then(res => {
        const friendList = res.data.map(item => ({
          id: item.friendId,
          avatarUrl: item.avatarUrl,
          nickName: item.nickName
        })) || [];
        const systemInfo = { id: 'system', avatarUrl: '/img/xtxx.jpg', nickName: '系统消息' };
        const ownInfo = { id: userInfo.studentId, avatarUrl: userInfo.avatarUrl, nickName: '我' };
  
      this.setData({
        friends: [systemInfo, ownInfo, ...friendList],
        isLoading: false
      });
  
      wx.setStorageSync('friends', friendList);
    })
    .catch(err => {
      console.error('加载好友列表失败', err);
      wx.showToast({ title: '加载好友失败', icon: 'none' });
      this.setData({ isLoading: false });
    });
  },
  
  deleteFriend(e) {
    const friendId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除好友',
      content: '确定要删除该好友吗？',
      success: (res) => {
        if (res.confirm) {
          let friends = wx.getStorageSync('friends') || [];
          friends = friends.filter(friend => friend.id !== friendId);
          wx.setStorageSync('friends', friends);
          this.loadFriends();
          wx.showToast({ title: '删除好友成功', icon: 'success' });
        }
      }
    });
  },

  navigateToChat(e) {
    const { id, nickname } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/chat/chat?id=${id}&nickName=${nickname}`
    });
  },

  navigateToNewFriends() {
    wx.navigateTo({
      url: '/pages/newfriends/index'
    });
  },

  navigateToRequestHistory() {
    wx.navigateTo({
      url: '/pages/request-history/index'
    });
  }
});
