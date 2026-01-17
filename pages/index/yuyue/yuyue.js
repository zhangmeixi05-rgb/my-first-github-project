Page({
  data: {
    name: '',
    studentId: '',
    time: '',
    date: '',
    location: {},
    formData: {
      location: '',
      date: '',
      time: ''
    }
  },

  onLoad(options) {
    if (options.item) {
      const item = JSON.parse(decodeURIComponent(options.item));
      this.setData({
        formData: item
      });
    }
  },
  
  onNameInput(e) {
    this.setData({
      name: e.detail.value
    });
  },

  onIdInput(e) {
    this.setData({
      studentId: e.detail.value
    });
  },

  onTimeChange(e) {
    this.setData({
      time: e.detail.value
    });
  },

  onDateChange(e) {
    this.setData({
      date: e.detail.value
    });
  },

  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          location: res
        });
      }
    });
  },

  submitForm() {
    const formData = {
      name: this.data.name,
      studentId: this.data.studentId,
      time: this.data.time,
      date: this.data.date,
      location: this.data.location
    };
    const formDataList = wx.getStorageSync('formDataList') || [];
    formDataList.push(formData);
    wx.setStorageSync('formDataList', formDataList);
    wx.showToast({
      title: '提交成功',
      icon: 'success',
      duration: 2000
    });

    // 清空表单内容
    this.setData({
      name: '',
      studentId: '',
      time: '',
      date: '',
      location: {}
    });
  }
});
