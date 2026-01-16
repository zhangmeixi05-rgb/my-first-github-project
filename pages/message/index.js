Page({
  data: {
    userInfo: {},
    friends: []
  },

  async onLoad() {
    const userInfo = wx.getStorageSync('userInfo');

    if (!userInfo || !userInfo._id) {
      console.error('未获取到用户信息或用户_id');
      return;
    }

    const systemInfo = { id: 'system', nickName: '系统消息', avatarUrl: '/img/xtxx.jpg' };
    const ownInfo = { id: userInfo._id, nickName: '我', avatarUrl: userInfo.avatarUrl || '/img/default-avatar.png' };

    let dbFriends = [];

    try {
      const res = await wx.cloud.callFunction({
        name: 'get-simple-friends',
        data: { userId: userInfo._id }
      });

      if (res.result.error) {
        console.error('云函数返回错误:', res.result.error);
      }

      const users = res.result.friends || [];

      dbFriends = users.map(user => ({
        id: user.id,
        nickName: user.nickName || '好友',
        avatarUrl: user.avatarUrl || '/img/default-avatar.png'
      }));
    } catch (e) {
      console.error('❌ 获取好友失败', e);
    }

    // 过滤掉 system 和自己
    const filtered = dbFriends.filter(f => f.id !== 'system' && f.id !== userInfo._id);

    const friends = [systemInfo, ownInfo, ...filtered];

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
