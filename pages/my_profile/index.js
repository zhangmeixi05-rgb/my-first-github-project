Page({
  data: {
    userInfo: {
      _id: '',       // 确保有 _id 用于更新数据库
      avatarUrl: '',
      nickName: '',
      phoneNumber: '',
      studentId: '',
      gender: ''
    }
  },

  onLoad() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo && typeof userInfo === 'object') {
        console.log('读取本地缓存用户信息:', userInfo);
        this.setData({
          userInfo: userInfo
        });
      } else {
        console.log('本地缓存中没有用户信息，使用默认数据');
      }
    } catch (e) {
      console.error('读取缓存异常', e);
    }
  },

  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (res.tempFilePaths && res.tempFilePaths.length > 0) {
          this.setData({
            'userInfo.avatarUrl': res.tempFilePaths[0]
          });
        }
      },
      fail: (err) => {
        console.error('选择图片失败', err);
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
    const { _id, avatarUrl, nickName, phoneNumber, studentId, gender } = this.data.userInfo;

    if (!phoneNumber || phoneNumber.length !== 11) {
      wx.showToast({
        title: '手机号输入错误',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (!_id) {
      wx.showToast({
        title: '用户ID缺失，无法更新',
        icon: 'none',
        duration: 2000
      });
      console.error('用户 _id 缺失，无法更新数据库');
      return;
    }

    wx.showLoading({
      title: '保存中...'
    });

    wx.cloud.callFunction({
      name: 'update-user',
      data: {
        _id,
        avatarUrl,
        nickName,
        phoneNumber,
        studentId,
        gender
      },
      success: (res) => {
        wx.hideLoading();
        console.log('云函数调用成功:', res);
        // 更新缓存
        try {
          wx.setStorageSync('userInfo', this.data.userInfo);
        } catch (e) {
          console.error('缓存写入失败', e);
        }

        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        });

        // 通知相关页面刷新
        const pages = getCurrentPages();
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          if (page.route === 'pages/message/index' || page.route === 'pages/my_setting/index') {
            if (page.onLoad) page.onLoad();  // 重新加载
          }
        }

        wx.navigateBack();
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('云函数调用失败:', err);
        wx.showToast({
          title: '保存失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
});
