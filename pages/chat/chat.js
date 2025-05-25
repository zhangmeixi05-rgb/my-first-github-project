Page({
  data: {
    messages: [],
    inputContent: '',
    userInfo: {},
    friendInfo: {},
    inputWidth: '60%',
    sendImageWidth: '20%',
    sendButtonWidth: '20%'
  },

  onLoad(options) {
    const { id, nickName } = options;
    this.setData({ friendInfo: { id, nickName } });

    const userInfo = wx.getStorageSync('userInfo');
    this.setData({ userInfo });

    this.loadMessages(id);
  },

  loadMessages(friendId) {
    const messages = wx.getStorageSync(`chat_${friendId}`) || [];
    this.setData({ messages });
  },

  sendMessage() {
    const content = this.data.inputContent;
    if (!content) return;

    const newMessage = {
      from: this.data.userInfo.nickName,
      content,
      type: 'text',
      time: new Date().toLocaleTimeString(),
      avatar: this.data.userInfo.avatarUrl
    };

    const messages = [...this.data.messages, newMessage];
    this.setData({ messages, inputContent: '' });
    wx.setStorageSync(`chat_${this.data.friendInfo.id}`, messages);

    if (this.data.friendInfo.id === 'system') {
      const systemReply = {
        from: '系统消息',
        content: '欢迎来到小情绪事务所！',
        type: 'text',
        time: new Date().toLocaleTimeString(),
        avatar: '/img/xtxx.jpg'
      };
      const updatedMessages = [...messages, systemReply];
      this.setData({ messages: updatedMessages });
      wx.setStorageSync(`chat_${this.data.friendInfo.id}`, updatedMessages);
    }
  },

  onInput(e) {
    this.setData({ inputContent: e.detail.value });
    if (e.detail.value.length * 14 > 0.7 * wx.getSystemInfoSync().windowWidth) {
      this.setData({ inputWidth: '100%' });
    } else {
      this.setData({ inputWidth: '60%' });
    }
  },

  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newMessage = {
          from: this.data.userInfo.nickName,
          content: res.tempFilePaths[0],
          type: 'image',
          time: new Date().toLocaleTimeString(),
          avatar: this.data.userInfo.avatarUrl
        };

        const messages = [...this.data.messages, newMessage];
        this.setData({ messages });
        wx.setStorageSync(`chat_${this.data.friendInfo.id}`, messages);
      }
    });
  }
});
