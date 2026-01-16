Page({
  data: {
    userId: '',
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    calendar: [],
    emotions: {}
  },

  onLoad: function () {
    const user = wx.getStorageSync('userInfo');
    if (!user || !user._id) {
      wx.showToast({ title: '请先登录', icon: 'error' });
      return;
    }
    this.setData({
      userId: user._id,
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1
    }, () => {
      this.generateCalendar();
      this.loadEmotions();
    });
  },

  generateCalendar: function () {
    const { currentYear, currentMonth } = this.data;
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const calendarArray = [];

    for (let i = 0; i < firstDay; i++) {
      calendarArray.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      calendarArray.push({ date: i });
    }

    while (calendarArray.length % 7 !== 0) {
      calendarArray.push(null);
    }

    this.setData({
      calendar: calendarArray
    });
  },

  getDateKey(date) {
    const { currentYear, currentMonth } = this.data;
    const monthStr = currentMonth < 10 ? '0' + currentMonth : currentMonth;
    const dayStr = date < 10 ? '0' + date : date;
    return `${currentYear}-${monthStr}-${dayStr}`;
  },

  onDateClick(e) {
    const date = e.currentTarget.dataset.date;
    if (date) {
      wx.showActionSheet({
        itemList: ['选择情绪', '删除情绪'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.chooseEmotion(date);
          } else if (res.tapIndex === 1) {
            this.removeEmotion(date);
          }
        }
      });
    }
  },

  chooseEmotion(date) {
    wx.showActionSheet({
      itemList: ['😊', '😞', '😠', '😱', '😌'],
      success: (res) => {
        const emoji = ['😊', '😞', '😠', '😱', '😌'][res.tapIndex];
        this.setEmotion(date, emoji);
      }
    });
  },

  setEmotion(date, emoji) {
    const emotions = this.data.emotions;
    const key = this.getDateKey(date);
    emotions[key] = emoji;
    this.setData({ emotions });

    wx.cloud.callFunction({
      name: 'saveEmotion',
      data: {
        userId: this.data.userId,
        date: key,
        emotion: emoji
      },
      success: res => {
        wx.showToast({ title: '保存成功', icon: 'success' });
      },
      fail: err => {
        wx.showToast({ title: '保存失败', icon: 'none' });
        console.error('saveEmotion失败', err);
      }
    });
  },

  removeEmotion(date) {
    const emotions = this.data.emotions;
    const key = this.getDateKey(date);
    delete emotions[key];
    this.setData({ emotions });

    wx.cloud.callFunction({
      name: 'removeEmotion',
      data: {
        userId: this.data.userId,
        date: key
      },
      success: res => {
        wx.showToast({ title: '删除成功', icon: 'success' });
      },
      fail: err => {
        wx.showToast({ title: '删除失败', icon: 'none' });
        console.error('removeEmotion失败', err);
      }
    });
  },

  loadEmotions() {
    console.log('loadEmotions userId:', this.data.userId);
    if (!this.data.userId) {
      wx.showToast({ title: '用户ID不存在，无法加载情绪', icon: 'none' });
      return;
    }
    wx.cloud.callFunction({
      name: 'getEmotions',
      data: {
        userId: this.data.userId
      },
      success: res => {
        console.log('getEmotions返回:', res);
        if (res.result && res.result.data) {
          const emotions = {};
          res.result.data.forEach(item => {
            emotions[item.date] = item.emotion;
          });
          this.setData({ emotions });
        } else if (res.result && res.result.errorCode !== 0) {
          wx.showToast({ title: res.result.errorMessage || '查询失败', icon: 'none' });
        } else {
          wx.showToast({ title: '没有查询到数据', icon: 'none' });
        }
      },
      fail: err => {
        wx.showToast({ title: '加载历史打卡失败', icon: 'none' });
        console.error('getEmotions失败', err);
      }
    });
  },

  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 1) {
      currentMonth = 12;
      currentYear--;
    } else {
      currentMonth--;
    }
    this.setData({ currentYear, currentMonth }, () => {
      this.generateCalendar();
      this.loadEmotions();
    });
  },

  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 12) {
      currentMonth = 1;
      currentYear++;
    } else {
      currentMonth++;
    }
    this.setData({ currentYear, currentMonth }, () => {
      this.generateCalendar();
      this.loadEmotions();
    });
  }
});
