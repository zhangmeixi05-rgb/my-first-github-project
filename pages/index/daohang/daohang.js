Page({
  goToTrack() {
    wx.navigateTo({
      url: '/pages/track/track'
    });
  },
  goToTrend() {
    wx.navigateTo({
      url: '/pages/trend/trend'
    });
  }
});
