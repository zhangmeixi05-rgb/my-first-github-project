// pages/index/zixun/zixun.js
const app = getApp();

Page({
  data: {
    messages: [],
    inputValue: '',
    isSending: false,
    scrollTop: 0,
    userAvatar: '',
    apiError: false
  },

  onLoad: function() {
    this.getUserAvatar();
    this.addWelcomeMessage();
  },

  onShow: function() {
    this.getUserAvatar();
  },

  // 获取用户头像
  getUserAvatar: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo?.avatarUrl) {
      this.setData({ userAvatar: userInfo.avatarUrl });
    } else {
      this.setData({ userAvatar: '/images/moren.png' });
    }
  },

  // 输入处理
  onInput: function(e) {
    this.setData({ inputValue: e.detail.value });
  },

  // 发送消息
  sendMessage: function() {
    const content = this.data.inputValue.trim();
    if (!content || this.data.isSending) return;

    // 添加用户消息
    this.addUserMessage(content);
    this.setData({ inputValue: '', isSending: true });

    // 模拟API调用（实际使用时取消注释下面的真实API调用）
    setTimeout(() => {
      const mockData = {
        Response: {
          Sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
          Confidence: Math.random() * 0.5 + 0.5, // 0.5-1.0之间的随机数
          RequestId: 'mock-' + Date.now()
        }
      };
      this.handleAPIResponse(mockData);
    }, 1500);
    
    // 真实API调用（使用时取消注释）
    // this.callTencentNLPAPI(content);
  },

  // 调用腾讯云情感分析API
  callTencentNLPAPI: function(content) {
    const thinkingId = this.addThinkingMessage();
    
    wx.cloud.callFunction({
      name: 'tencentNLP',
      data: {
        text: content
      },
      success: (res) => {
        this.removeThinkingMessage(thinkingId);
        if (res.result.Response.Sentiment) {
          const analysis = this.formatTencentResult(res.result.Response);
          this.addBotMessage(analysis, true);
        } else {
          this.showAPIError("情感分析失败");
        }
      },
      fail: (err) => {
        this.removeThinkingMessage(thinkingId);
        this.showAPIError("请求失败，请检查网络");
        console.error("API调用失败:", err);
      },
      complete: () => {
        this.setData({ isSending: false });
      }
    });
  },

  // 处理API响应
  handleAPIResponse: function(res) {
    if (res.Response.Sentiment) {
      const analysis = this.formatTencentResult(res.Response);
      this.addBotMessage(analysis, true);
    } else {
      this.showAPIError("情感分析失败");
    }
    this.setData({ isSending: false });
  },

  // 格式化分析结果
  formatTencentResult: function(data) {
    const sentimentMap = {
      'negative': '消极 😔',
      'neutral': '中性 😐',
      'positive': '积极 😊'
    };

    let result = `【情感分析结果】\n`;
    result += `当前情绪: ${sentimentMap[data.Sentiment]}\n`;
    result += `分析可信度: ${(data.Confidence * 100).toFixed(1)}%\n\n`;

    if (data.Sentiment === 'negative') {
      result += `📌 检测到负面情绪，建议您：\n`;
      result += `1. 深呼吸放松心情\n`;
      result += `2. 与信任的人倾诉\n`;
      result += `3. 尝试正念冥想`;
    } else if (data.Sentiment === 'positive') {
      result += `🎉 保持积极心态！可以：\n`;
      result += `1. 记录开心的小事\n`;
      result += `2. 分享给他人传递快乐`;
    } else {
      result += `🔄 情绪平稳，建议：\n`;
      result += `1. 保持规律作息\n`;
      result += `2. 规划下一步目标`;
    }

    return result;
  },

  // 消息管理方法
  addWelcomeMessage: function() {
    this.addMessage({
      role: 'assistant',
      content: '这里是小情绪事务所。请告诉我您的情感问题，我将为您进行专业分析。',
      time: this.formatTime(new Date()),
      id: Date.now()
    });
  },

  addUserMessage: function(content) {
    this.addMessage({
      role: 'user',
      content: content,
      time: this.formatTime(new Date()),
      id: Date.now(),
      isThinking: false,
      isAnalysisResult: false
    });
  },

  addBotMessage: function(content, isAnalysis = false) {
    this.addMessage({
      role: 'assistant',
      content: content,
      time: this.formatTime(new Date()),
      id: Date.now(),
      isThinking: false,
      isAnalysisResult: isAnalysis
    });
  },

  addThinkingMessage: function() {
    const id = 'thinking_' + Date.now();
    this.addMessage({
      role: 'assistant',
      content: '',
      time: this.formatTime(new Date()),
      id: id,
      isThinking: true,
      isAnalysisResult: false
    });
    return id;
  },

  removeThinkingMessage: function(id) {
    this.setData({
      messages: this.data.messages.filter(msg => msg.id !== id)
    });
  },

  addMessage: function(message) {
    this.setData({
      messages: [...this.data.messages, message]
    }, this.scrollToBottom);
  },

  scrollToBottom: function() {
    this.setData({ scrollTop: 99999 }); // 确保滚动到底部
  },

  showAPIError: function(message) {
    this.addMessage({
      role: 'assistant',
      content: `⚠️ ${message}`,
      time: this.formatTime(new Date()),
      id: Date.now(),
      isThinking: false,
      isAnalysisResult: false
    });
    this.setData({ apiError: true });
  },

  // 格式化时间
  formatTime: function(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
});