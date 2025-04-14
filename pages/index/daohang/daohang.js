Page({
  data: {
    startLocation: null,
    endLocation: null,
    isAutoFilled: false,
  },

  onLoad(options) {
    if (options.latitude && options.longitude && options.name) {
      this.setData({
        endLocation: {
          latitude: parseFloat(options.latitude),
          longitude: parseFloat(options.longitude),
          name: options.name
        },
        isAutoFilled: true
      });
    }
  },

  chooseStartLocation() {
    const self = this;
    wx.chooseLocation({
      success(res) {
        self.setData({
          startLocation: res
        });
      }
    });
  },

  chooseEndLocation() {
    const self = this;
    wx.chooseLocation({
      success(res) {
        self.setData({
          endLocation: res,
          isAutoFilled: false
        });
      }
    });
  },

  navigate() {
    if (!this.data.startLocation || !this.data.endLocation) {
      wx.showToast({
        title: '请选择起点和终点',
        icon: 'none'
      });
      return;
    }

    wx.openLocation({
      latitude: this.data.endLocation.latitude,
      longitude: this.data.endLocation.longitude,
      name: this.data.endLocation.name,
      address: this.data.endLocation.address
    });
  }
});
