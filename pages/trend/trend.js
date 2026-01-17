Page({
  data: {
    currentYear: 0,
    currentMonth: 0,

    emotionTypes: ['😊', '😞', '😠', '😱', '😌'],
    emotionLabels: ['开心', '难过', '生气', '害怕', '平静'],
    emotionColors: ['#FFB6C1', '#B0C4DE', '#FFA500', '#98FB98', '#DDA0DD'],
    emotionCounts: [0, 0, 0, 0, 0],
    analysisText: '',
    chartType: 'bar'


    emotionTypes: ['😊', '😞', '😠', '😱', '😌'],
    emotionLabels: ['开心', '难过', '生气', '害怕', '平静'],
    emotionCounts: [0, 0, 0, 0, 0],

    analysisText: '',
    chartType: 'bar', // bar | pie
    emotionColors: ['#FFD700', '#6495ED', '#FF6347', '#9370DB', '#98FB98'],
    hasData: false

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

    data.forEach(item => {
      if (!item.date || !item.emotion) return;

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


    const total = counts.reduce((a, b) => a + b, 0);
    const hasData = total > 0;

    const analysisText = this.generateAnalysis(counts);

    this.setData({
      emotionCounts: counts,

      analysisText

      analysisText,
      hasData

    }, this.drawChart);
  },

  drawChart() {

    const ctx = wx.createCanvasContext('trendCanvas', this);
    const { emotionCounts, emotionTypes, emotionLabels, emotionColors, chartType } = this.data;
    const canvasWidth = 300;
    const canvasHeight = 300;
    const margin = 40;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const total = emotionCounts.reduce((a, b) => a + b, 0);
    if (total === 0) {
      ctx.setFillStyle('#000000');
      ctx.setFontSize(16);
      ctx.fillText('本月暂无情绪记录', canvasWidth / 2 - 70, canvasHeight / 2);
      ctx.draw();

    const { hasData, chartType } = this.data;

    if (!hasData) {
      this.drawEmptyState();

      return;
    }

    if (chartType === 'bar') {

      this.drawBarChart(ctx, canvasWidth, canvasHeight, margin);
    } else {
      this.drawPieChart(ctx, canvasWidth, canvasHeight);

      this.drawBarChart();
    } else {
      this.drawPieChart();
    }
  },

  drawEmptyState() {
    const ctx = wx.createCanvasContext('trendCanvas', this);
    const canvasWidth = 350;
    const canvasHeight = 400;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.setFillStyle('#999999');
    ctx.setFontSize(20);
    ctx.setTextAlign('center');
    ctx.fillText('本月暂无情绪记录', canvasWidth / 2, canvasHeight / 2);

    ctx.draw();
  },

  drawBarChart() {
    const ctx = wx.createCanvasContext('trendCanvas', this);

    const { emotionCounts, emotionTypes, emotionLabels, emotionColors } = this.data;
    const canvasWidth = 350;
    const canvasHeight = 400;
    const margin = { top: 40, right: 35, bottom: 100, left: 45 };
    const barWidth = 35;
    const gap = 20;

    const maxCount = Math.max(...emotionCounts, 1);
    const chartHeight = canvasHeight - margin.top - margin.bottom;
    const chartWidth = canvasWidth - margin.left - margin.right;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (let i = 0; i < emotionCounts.length; i++) {
      const x =
        margin.left +
        i * (barWidth + gap) +
        (chartWidth - emotionCounts.length * (barWidth + gap)) / 2;

      const barHeight = (emotionCounts[i] / maxCount) * chartHeight;
      const y = canvasHeight - margin.bottom - barHeight;

      ctx.setFillStyle(emotionColors[i]);
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.setFillStyle('#000000');
      ctx.setFontSize(16);
      ctx.setTextAlign('center');
      ctx.fillText(emotionCounts[i], x + barWidth / 2, y - 5);

      ctx.setFontSize(24);
      ctx.fillText(emotionTypes[i], x + barWidth / 2, canvasHeight - margin.bottom + 30);

      ctx.setFontSize(14);
      ctx.fillText(emotionLabels[i], x + barWidth / 2, canvasHeight - margin.bottom + 55);

    }

    ctx.draw();
  },


  drawBarChart(ctx, canvasWidth, canvasHeight, margin) {
    const { emotionCounts, emotionTypes, emotionLabels } = this.data;
    const barWidth = 30;
    const gap = 20;
    const maxCount = Math.max(...emotionCounts, 1);

    for (let i = 0; i < emotionCounts.length; i++) {
      const x = margin + i * (barWidth + gap);
      const barHeight = (emotionCounts[i] / maxCount) * (canvasHeight - 2 * margin - 30);
      const y = canvasHeight - margin - barHeight;

      ctx.setFillStyle('#7EC8E3');
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.setFillStyle('#000000');
      ctx.setFontSize(14);
      ctx.fillText(emotionCounts[i], x + 5, y - 5);

      ctx.setFontSize(16);
      ctx.fillText(emotionTypes[i], x + 8, canvasHeight - margin + 5);

      ctx.setFontSize(12);
      ctx.fillText(emotionLabels[i], x + 5, canvasHeight - margin + 25);
    }
  },

  drawPieChart(ctx, canvasWidth, canvasHeight) {
    const { emotionCounts, emotionColors, emotionLabels } = this.data;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = Math.min(canvasWidth, canvasHeight) / 2 - 40;

    const total = emotionCounts.reduce((a, b) => a + b, 0);
    let currentAngle = -Math.PI / 2;

    for (let i = 0; i < emotionCounts.length; i++) {
      const angle = (emotionCounts[i] / total) * 2 * Math.PI;
      const endAngle = currentAngle + angle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
      ctx.closePath();
      ctx.setFillStyle(emotionColors[i]);
      ctx.fill();

      const labelAngle = currentAngle + angle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius / 2);
      const labelY = centerY + Math.sin(labelAngle) * (radius / 2);

      const percentage = ((emotionCounts[i] / total) * 100).toFixed(1);
      ctx.setFillStyle('#000000');
      ctx.setFontSize(12);
      ctx.fillText(`${percentage}%`, labelX - 15, labelY);

      currentAngle = endAngle;
    }

    const legendY = canvasHeight - 20;
    for (let i = 0; i < emotionLabels.length; i++) {
      const legendX = 40 + i * 50;
      ctx.setFillStyle(emotionColors[i]);
      ctx.fillRect(legendX, legendY - 10, 15, 15);
      ctx.setFillStyle('#000000');
      ctx.setFontSize(12);
      ctx.fillText(emotionLabels[i], legendX + 20, legendY - 2);
    }
  },

  switchChartType() {
    const chartType = this.data.chartType === 'bar' ? 'pie' : 'bar';
    this.setData({ chartType }, this.drawChart);

  drawPieChart() {
    const ctx = wx.createCanvasContext('trendCanvas', this);

    const { emotionCounts, emotionTypes, emotionLabels, emotionColors } = this.data;
    const canvasWidth = 350;
    const canvasHeight = 450;
    const centerX = canvasWidth / 2;
    const centerY = 160;
    const radius = 100;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const total = emotionCounts.reduce((a, b) => a + b, 0);
    let startAngle = -Math.PI / 2;

    for (let i = 0; i < emotionCounts.length; i++) {
      if (emotionCounts[i] === 0) continue;

      const sliceAngle = (emotionCounts[i] / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.setFillStyle(emotionColors[i]);
      ctx.fill();

      const midAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.7;
      const labelX = centerX + Math.cos(midAngle) * labelRadius;
      const labelY = centerY + Math.sin(midAngle) * labelRadius;

      const percentage = ((emotionCounts[i] / total) * 100).toFixed(1);
      ctx.setFillStyle('#FFFFFF');
      ctx.setFontSize(16);
      ctx.setTextAlign('center');
      ctx.setTextBaseline('middle');
      ctx.fillText(percentage + '%', labelX, labelY);

      startAngle = endAngle;
    }

    const legendStartY = 310;
    const legendRowHeight = 35;
    const itemsPerRow = 3;
    const legendItemWidth = canvasWidth / itemsPerRow;

    for (let i = 0; i < emotionTypes.length; i++) {
      const rowIndex = Math.floor(i / itemsPerRow);
      const colIndex = i % itemsPerRow;
      const legendX = colIndex * legendItemWidth + legendItemWidth / 2;
      const legendY = legendStartY + rowIndex * legendRowHeight;

      ctx.beginPath();
      ctx.arc(legendX - 35, legendY, 8, 0, 2 * Math.PI);
      ctx.setFillStyle(emotionColors[i]);
      ctx.fill();

      ctx.setFillStyle('#000000');
      ctx.setFontSize(14);
      ctx.setTextAlign('left');
      ctx.setTextBaseline('middle');
      ctx.fillText(`${emotionTypes[i]} ${emotionLabels[i]}`, legendX - 18, legendY);
    }

    ctx.draw();
  },

  switchChartType(e) {
    const newChartType = e.currentTarget.dataset.type;
    this.setData({
      chartType: newChartType
    }, this.drawChart);

  },

  generateAnalysis(counts) {
    const { emotionTypes, emotionLabels } = this.data;
    const total = counts.reduce((a, b) => a + b, 0);
    if (total === 0) return '本月尚未记录任何情绪。';

    const maxCount = Math.max(...counts);

    const maxIndexes = counts.map((c, i) => c === maxCount ? i : -1).filter(i => i !== -1);
    const dominantEmotions = maxIndexes.map(i => `${emotionTypes[i]}（${emotionLabels[i]}）`).join('、');

    // 简单分析逻辑

    const maxIndexes = counts
      .map((c, i) => (c === maxCount ? i : -1))
      .filter(i => i !== -1);

    const dominantEmotions = maxIndexes
      .map(i => `${emotionTypes[i]}（${emotionLabels[i]}）`)
      .join('、');


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
