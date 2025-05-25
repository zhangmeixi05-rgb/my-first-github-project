Page({
  data: {
    currentYear: 2025,
    currentMonth: 4,
    calendar: [],
    emotions: {}
  },

  onLoad: function () {
    const today = new Date();
    this.setData({
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth() + 1
    }, () => {
      this.generateCalendar();
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
  },

  removeEmotion(date) {
    const emotions = this.data.emotions;
    const key = this.getDateKey(date);
    delete emotions[key];
    this.setData({ emotions });
  },

  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 1) {
      currentMonth = 12;
      currentYear--;
    } else {
      currentMonth--;
    }
    this.setData({ currentYear, currentMonth }, this.generateCalendar);
  },

  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 12) {
      currentMonth = 1;
      currentYear++;
    } else {
      currentMonth++;
    }
    this.setData({ currentYear, currentMonth }, this.generateCalendar);
  }
});
