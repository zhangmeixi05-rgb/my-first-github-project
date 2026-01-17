Page({ 
  data: {
    username: '',
    password: '',
    nickName: ''
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  onNickNameInput(e) {
    this.setData({ nickName: e.detail.value });
  },

  onRegister() {
    const { username, password, nickName } = this.data;

    if (!username || !password || !nickName) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    wx.cloud.callFunction({
      name: 'register-user',
      data: { username, password, nickName },
      success: res => {
        if (res.result.code === 200) {
          wx.setStorageSync('userInfo', {
            _id: res.result.data._id,
            username,
            nickName
          });

          // ✅ 弹窗提示成功
          wx.showModal({
            title: '注册成功',
            content: '请返回登录页面登录',
            showCancel: false,
            confirmText: '去登录',
            success(modalRes) {
              if (modalRes.confirm) {
                wx.redirectTo({ url: '/pages/login/index' });
              }
            }
          });
        } else {
          wx.showToast({ title: res.result.message, icon: 'none' });
        }
      },
      fail: err => {
        wx.showToast({ title: '注册失败', icon: 'none' });
        console.error(err);
      }
    });
  },

  goToLogin() {
    wx.redirectTo({ url: '/pages/login/index' });
  }
});
