Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: ''
    },
    hasUserInfo: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl'),
    canIUseGetUserProfile: wx.canIUse('button.open-type.getUserProfile'),
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad() {
    this.updateUserInfo();
  },

  onShow() {
    this.updateUserInfo();
  },

  updateUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
    }
  },

  getUserProfile(e) {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
        wx.setStorageSync('userInfo', res.userInfo);
      }
    });
  },

  getUserInfo(e) {
    if (e.detail.userInfo) {
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      });
      wx.setStorageSync('userInfo', e.detail.userInfo);
    }
  }

});
