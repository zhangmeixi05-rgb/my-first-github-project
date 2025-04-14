Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '',
      phoneNumber: '',
      studentId: '',
      gender: ''
    }
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      });
    }
  },

  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          'userInfo.avatarUrl': res.tempFilePaths[0]
        });
      }
    });
  },

  onNickNameInput(e) {
    this.setData({
      'userInfo.nickName': e.detail.value
    });
  },

  onPhoneNumberInput(e) {
    this.setData({
      'userInfo.phoneNumber': e.detail.value
    });
  },

  onStudentIdInput(e) {
    this.setData({
      'userInfo.studentId': e.detail.value
    });
  },

  onGenderInput(e) {
    this.setData({
      'userInfo.gender': e.detail.value
    });
  },

  submitForm() {
    const phoneNumber = this.data.userInfo.phoneNumber;
    if (phoneNumber.length !== 11) {
      wx.showToast({
        title: '手机号输入错误',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    wx.setStorageSync('userInfo', this.data.userInfo);
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 2000
    });

    // 更新好友和消息页面的用户头像
    const pages = getCurrentPages();
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (page.route === 'pages/message/index') {
        page.onLoad();  // 重新加载消息页面
      } else if (page.route === 'pages/my_setting/index') {
        page.onLoad();  // 重新加载好友页面
      }
    }

    wx.navigateBack();
  }
});
