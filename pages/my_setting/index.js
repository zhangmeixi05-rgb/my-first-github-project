Page({
  data: {
    searchQuery: '',
    searchResult: null,
    userInfo: {},
    friends: [],
    newFriendRequests: []
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      userInfo: userInfo
    });
    this.loadFriends();
    this.loadFriendRequests();
  },

  loadFriends() {
    const systemInfo = { id: 'system', avatarUrl: '/img/xtxx.jpg', nickName: '系统消息' };
    const userInfo = this.data.userInfo;
    const ownInfo = { id: userInfo.studentId, avatarUrl: userInfo.avatarUrl, nickName: '我' };
    let friends = wx.getStorageSync('friends') || [];

    // Filter out any existing system and own info to avoid duplicates
    friends = friends.filter(friend => friend.id !== 'system' && friend.id !== userInfo.studentId);

    // Ensure system and user info are always included
    this.setData({
      friends: [systemInfo, ownInfo, ...friends]
    });
  },

  loadFriendRequests() {
    const newFriendRequests = wx.getStorageSync('newFriendRequests') || [];
    this.setData({ newFriendRequests });
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
        // 使用正则进行模糊匹配，忽略大小写
        _id: wx.cloud.database().command.neq(userInfo._id), // 排除自己
        // 使用或逻辑，匹配任意字段
        $or: [
          { nickName: wx.cloud.database().RegExp({ regexp: query, options: 'i' }) },
          { phoneNumber: wx.cloud.database().RegExp({ regexp: query, options: 'i' }) },
          { studentId: wx.cloud.database().RegExp({ regexp: query, options: 'i' }) }
        ]
      })
      .get()
      .then(res => {
        if (res.data.length > 0) {
          this.setData({ searchResult: res.data[0] }); // 只展示第一个结果
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
    wx.showModal({
      title: '申请添加好友',
      content: '请输入申请理由',
      editable: true,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '申请已发送', icon: 'success' });
          let newFriendRequests = wx.getStorageSync('newFriendRequests') || [];
          newFriendRequests.push({
            userId: user.id,
            avatarUrl: user.avatarUrl,
            nickName: user.nickName,
            reason: res.content
          });
          wx.setStorageSync('newFriendRequests', newFriendRequests);
          this.loadFriendRequests();
        }
      }
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
    const { id, nickName } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/chat/chat?id=${id}&nickName=${nickName}`
    });
  },

  navigateToNewFriends() {
    wx.navigateTo({
      url: '/pages/newfriends/index'
    });
  }
});
