// pages/chat/chat.js
Page({
  data: {
    messages: [],
    inputContent: '',
    userInfo: {},
    friendInfo: {},
  },

  onLoad(options) {
    // 接收传入的好友信息（假设id和nickName）
    const { id, nickName } = options;
    this.setData({ friendInfo: { id, nickName } });

    // 获取当前用户信息（需先登录并存储）
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({ userInfo });

    // 加载历史聊天记录
    this.loadMessages();
  },

  // 生成唯一 chat_id，保证两边都能用同一个ID
  generateChatId(userId1, userId2) {
    return [userId1, userId2].sort().join('_');
  },

<<<<<<< HEAD
  onShow() {
    this.loadMessages();
  },

=======
>>>>>>> origin/main
  loadMessages() {
    const { userInfo, friendInfo } = this.data;
    if (!userInfo._id || !friendInfo.id) return;

    const chat_id = this.generateChatId(userInfo._id, friendInfo.id);

    wx.cloud.database().collection('chat').where({ chat_id }).get()
      .then(res => {
        if (res.data.length > 0) {
          this.setData({ messages: res.data[0].list });
        } else {
          this.setData({ messages: [] });
        }
      })
      .catch(err => {
        console.error('加载聊天记录失败', err);
      });
  },

  sendMessage() {
    const content = this.data.inputContent.trim();
    if (!content) return;

    const { userInfo, friendInfo } = this.data;
    const chat_id = this.generateChatId(userInfo._id, friendInfo.id);

    const newMessage = {
      from: userInfo.nickName,
      content,
      type: 'text',
      time: new Date().toLocaleTimeString(),
      avatar: userInfo.avatarUrl
    };

    // 先本地更新显示
    const messages = [...this.data.messages, newMessage];
    this.setData({ messages, inputContent: '' });

    // 调用云函数存储消息
    wx.cloud.callFunction({
      name: 'chat',
      data: { chat_id, message: newMessage },
      success: res => {
        console.log('消息上传成功', res);
      },
      fail: err => {
        console.error('消息上传失败', err);
      }
    });
  },

  onInput(e) {
    this.setData({ inputContent: e.detail.value });
  },

  chooseImage() {
    const { userInfo, friendInfo } = this.data;
    if (!userInfo._id || !friendInfo.id) return;

    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const tempFilePath = res.tempFilePaths[0];
        const cloudPath = `chat_images/${Date.now()}-${Math.floor(Math.random() * 10000)}.jpg`;

        // 上传到云存储
        wx.cloud.uploadFile({
          cloudPath,
          filePath: tempFilePath,
          success: uploadRes => {
            const imageUrl = uploadRes.fileID;

            const newMessage = {
              from: userInfo.nickName,
              content: imageUrl,
              type: 'image',
              time: new Date().toLocaleTimeString(),
              avatar: userInfo.avatarUrl
            };

            // 本地显示
            const messages = [...this.data.messages, newMessage];
            this.setData({ messages });

            const chat_id = this.generateChatId(userInfo._id, friendInfo.id);

            // 云函数存储消息
            wx.cloud.callFunction({
              name: 'chat',
              data: { chat_id, message: newMessage },
              success: res => {
                console.log('图片消息上传成功', res);
              },
              fail: err => {
                console.error('图片消息上传失败', err);
              }
            });
          },
          fail: err => {
            console.error('上传图片失败', err);
          }
        });
      }
    });
  }
});
