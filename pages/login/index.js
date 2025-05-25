Page({
  data: {
    username: '',
    password: ''
  },

  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    });
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  onLogin() {
    const { username, password } = this.data;
    if (!username || !password) {
      wx.showToast({
        title: '用户名和密码不能为空',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '登录中...'
    });

    wx.cloud.callFunction({
      name: 'login-user',
      data: {
        username,
        password
      }
    }).then(res => {
      wx.hideLoading();

      if (res.result && res.result.code === 200) {
        wx.setStorageSync('userInfo', res.result.data); // 保存登录用户信息
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1000
        });
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/index/index'  // 登录成功后跳转首页
          });
        }, 1000);
      } else {
        wx.showToast({
          title: res.result ? res.result.message : '登录失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('云函数调用失败', err);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    });
  },

  onRegister() {
    // 点击注册按钮跳转到注册页面
    wx.navigateTo({
      url: '/pages/register/index'
    });
  }
});
