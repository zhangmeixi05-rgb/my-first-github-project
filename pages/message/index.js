Page({
  data: {
    userInfo: {},
    friends: []
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    const storedFriends = wx.getStorageSync('friends') || [];
    const systemInfo = { id: 'system', nickName: '系统消息', avatarUrl: '/img/xtxx.jpg' };
    const ownInfo = { id: userInfo.studentId, nickName: '我', avatarUrl: userInfo.avatarUrl };

    // Filter out any existing system and own info to avoid duplicates
    let friends = storedFriends.filter(friend => friend.id !== 'system' && friend.id !== userInfo.studentId);

    // Ensure system and user info are always included
    friends = [systemInfo, ownInfo, ...friends];

    this.setData({ userInfo, friends });
  },

  handleMessageTap(event) {
    const friendId = event.currentTarget.dataset.friendId;
    const friendNickName = event.currentTarget.dataset.nickName;
    wx.navigateTo({
      url: `/pages/chat/chat?id=${friendId}&nickName=${friendNickName}`
    });
  },

  getFriendNickName(friendId) {
    const friend = this.data.friends.find(friend => friend.id === friendId);
    return friend ? friend.nickName : '';
  }
});
