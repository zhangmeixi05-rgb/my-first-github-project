Page({
  data: {
    sentRequests: [],
    receivedRequests: [],
    currentTab: 0,
    userInfo: null
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo }, () => {
        this.loadRequestHistory();
      });
    }
  },

  onShow() {
    this.loadRequestHistory();
  },

  switchTab(e) {
    const currentTab = e.currentTarget.dataset.index;
    this.setData({ currentTab });
  },

  loadRequestHistory() {
    const userInfo = this.data.userInfo;
    if (!userInfo || !userInfo._id) return;

    const db = wx.cloud.database();

    Promise.all([
      db.collection('fellow').where({ userId: userInfo._id }).get(),
      db.collection('fellow').where({ friendId: userInfo._id }).get()
    ]).then(([sentRes, receivedRes]) => {
      console.log('发出的申请:', sentRes.data);
      console.log('收到的申请:', receivedRes.data);
      
      const sentWithStatus = (sentRes.data || []).map(item => ({
        ...item,
        status: item.isAgree === true ? 'accepted' : (item.rejected === true ? 'rejected' : 'pending'),
        createTime: item.timestamp ? new Date(item.timestamp).toLocaleString() : ''
      }));
      
      const receivedWithStatus = (receivedRes.data || []).map(item => ({
        ...item,
        status: item.isAgree === true ? 'accepted' : (item.rejected === true ? 'rejected' : 'pending'),
        createTime: item.timestamp ? new Date(item.timestamp).toLocaleString() : ''
      }));
      
      this.setData({
        sentRequests: sentWithStatus,
        receivedRequests: receivedWithStatus
      });
    }).catch(err => {
      console.error('加载申请历史失败', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  getStatusText(status) {
    const statusMap = {
      'pending': '待处理',
      'accepted': '已接受',
      'rejected': '已拒绝'
    };
    return statusMap[status] || '未知';
  },

  getStatusColor(status) {
    const colorMap = {
      'pending': '#FFA500',
      'accepted': '#32CD32',
      'rejected': '#FF6347'
    };
    return colorMap[status] || '#999';
  },

  resendRequest(e) {
    const request = e.currentTarget.dataset.request;
    const self = this.data.userInfo;

    wx.showModal({
      title: '重新申请',
      content: '请输入新的申请理由',
      editable: true,
      placeholderText: request.reason || '',
      success: (res) => {
        if (res.confirm && res.content.trim() !== '') {
          const db = wx.cloud.database();
          
          db.collection('fellow').add({
            data: {
              userId: self._id,
              friendId: request.friendId,
              reason: res.content.trim(),
              nickName: self.nickName,
              avatarUrl: self.avatarUrl,
              timestamp: new Date(),
              isAgree: false
            }
          }).then(() => {
            wx.showToast({ title: '申请已发送', icon: 'success' });
            this.loadRequestHistory();
          }).catch(err => {
            console.error('重新申请失败', err);
            wx.showToast({ title: '请求失败', icon: 'none' });
          });
        }
      }
    });
  },

  viewProfile(e) {
    const userId = e.currentTarget.dataset.userid;
    wx.showToast({ title: '查看用户信息功能开发中', icon: 'none' });
  }
});
