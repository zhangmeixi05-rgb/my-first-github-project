Page({
  data: {
    currentYear: 0,
    currentMonth: 0,
    emotionTypes: ['😊', '😞', '😠', '😱', '😌'],
    emotionLabels: ['开心', '难过', '生气', '害怕', '平静'],
    emotionCounts: [0, 0, 0, 0, 0],
    analysisText: ''
  },

  onLoad() {
    const today = new Date();
    this.setData({
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth() + 1
    }, this.loadDataAndDraw);
  },

  loadDataAndDraw() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo._id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    wx.showLoading({ title: '加载中...' });

    wx.cloud.callFunction({
      name: 'getEmotions',
      data: { userId: userInfo._id }
    }).then(res => {
      wx.hideLoading();
      if (res.result && res.result.errorCode === 0) {
        this.processEmotionData(res.result.data);
      } else {
        wx.showToast({
          title: res.result.errorMessage || '数据加载失败',
          icon: 'none'
        });
      }
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({
        title: '网络异常，请重试',
        icon: 'none'
      });
    });
  },

  processEmotionData(data) {
    const { currentYear, currentMonth, emotionTypes } = this.data;
    const counts = Array(emotionTypes.length).fill(0);

    // 数据库中记录的日期字段格式假设为 yyyy-mm-dd 或类似，需要根据实际调整
    data.forEach(item => {
      if (!item.date || !item.emotion) return;
      // 解析日期年月
      const dateParts = item.date.split('-');
      if (dateParts.length < 2) return;
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]);
      if (year === currentYear && month === currentMonth) {
        const index = emotionTypes.indexOf(item.emotion);
        if (index !== -1) {
          counts[index]++;
        }
      }
    });

    const analysisText = this.generateAnalysis(counts);

    this.setData({
      emotionCounts: counts,
      analysisText
    }, this.drawChart);
  },

  drawChart() {
    const ctx = wx.createCanvasContext('trendCanvas', this);

    const { emotionCounts, emotionTypes } = this.data;
    const canvasWidth = 300;
    const canvasHeight = 300;
    const margin = 40;
    const barWidth = 30;
    const gap = 20;
    const maxCount = Math.max(...emotionCounts, 1);

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (let i = 0; i < emotionCounts.length; i++) {
      const x = margin + i * (barWidth + gap);
      const barHeight = (emotionCounts[i] / maxCount) * (canvasHeight - 2 * margin);
      const y = canvasHeight - margin - barHeight;

      ctx.setFillStyle('#7EC8E3');
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.setFillStyle('#000000');
      ctx.setFontSize(14);
      ctx.fillText(emotionCounts[i], x + 5, y - 5);

      // 显示 emoji 表情
      ctx.setFontSize(20);
      ctx.fillText(emotionTypes[i], x + 5, canvasHeight - 10);
    }

    ctx.draw();
  },

  generateAnalysis(counts) {
    const { emotionTypes, emotionLabels } = this.data;
    const total = counts.reduce((a, b) => a + b, 0);
    if (total === 0) return '本月尚未记录任何情绪。';

    const maxCount = Math.max(...counts);
    const maxIndexes = counts.map((c, i) => c === maxCount ? i : -1).filter(i => i !== -1);
    const dominantEmotions = maxIndexes.map(i => `${emotionTypes[i]}（${emotionLabels[i]}）`).join('、');

    // 简单分析逻辑
    const positiveIndex = emotionTypes.indexOf('😊');
    const negativeIndex = emotionTypes.indexOf('😞');

    const positive = counts[positiveIndex] || 0;
    const negative = counts[negativeIndex] || 0;

    let trend = '';
    if (positive > negative + 3) {
      trend = '整体情绪倾向积极，继续保持良好心态！';
    } else if (negative > positive + 3) {
      trend = '负面情绪较多，建议适当放松，寻求支持。';
    } else {
      trend = '情绪较为平稳，保持自我调节。';
    }

    return `你本月共记录情绪 ${total} 次。\n出现最多的是：${dominantEmotions}（共 ${maxCount} 次）。\n${trend}`;
  },

  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 1) {
      currentMonth = 12;
      currentYear--;
    } else {
      currentMonth--;
    }
    this.setData({ currentYear, currentMonth }, this.loadDataAndDraw);
  },

  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 12) {
      currentMonth = 1;
      currentYear++;
    } else {
      currentMonth++;
    }
    this.setData({ currentYear, currentMonth }, this.loadDataAndDraw);
  }
});
