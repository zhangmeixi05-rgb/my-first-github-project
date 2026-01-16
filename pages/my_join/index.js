Page({
  data: {
    items: []
  },

  onLoad() {
    this.loadItems();
  },

  loadItems() {
    let items = wx.getStorageSync('formDataList') || [];
    items = this.sortItemsByDateTime(items);
    this.setData({
      items
    });
  },

  sortItemsByDateTime(items) {
    return items.sort((a, b) => {
      const dateTimeA = new Date(`${a.date} ${a.time}`).getTime();
      const dateTimeB = new Date(`${b.date} ${b.time}`).getTime();
      return dateTimeA - dateTimeB;
    });
  },

  navigateToDaohang(e) {
    const location = e.currentTarget.dataset.location;
    wx.navigateTo({
      url: `/pages/index/daohang/daohang?latitude=${location.latitude}&longitude=${location.longitude}&name=${location.name}`
    });
  },

  editItem(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.items[index];
    wx.navigateTo({
      url: `/pages/index/yuyue/yuyue?item=${encodeURIComponent(JSON.stringify(item))}`
    });
  },

  deleteItem(e) {
    const index = e.currentTarget.dataset.index;
    const that = this;
    wx.showModal({
      title: '提示',
      content: '是否删除该日程？',
      success(res) {
        if (res.confirm) {
          const items = that.data.items;
          items.splice(index, 1);
          wx.setStorageSync('formDataList', items);
          that.setData({
            items
          });
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  }
});
