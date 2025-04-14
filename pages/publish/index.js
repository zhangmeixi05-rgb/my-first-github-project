Page({
  data: {
    title: '',
    content: '',
    date: '',
    location: null,
    images: [],
    username: '', // 添加用户名
    avatar: '', // 添加头像
    isEditing: false,
    postId: null
  },

  onLoad(options) {
    const currentDate = new Date().toISOString().split('T')[0];
    this.setData({
      currentDate,
      date: currentDate,
      username: wx.getStorageSync('username') || '匿名用户', // 从缓存中获取用户名
      avatar: wx.getStorageSync('avatar') || '/images/default-avatar.png' // 从缓存中获取头像
    });

    if (options.id) {
      this.loadPost(options.id);
      this.setData({
        isEditing: true,
        postId: options.id
      });
    }
  },

  loadPost(postId) {
    const posts = wx.getStorageSync('posts') || [];
    const post = posts.find(p => p.id === Number(postId));
    if (post) {
      this.setData({
        title: post.title,
        content: post.content,
        date: post.date,
        location: post.location,
        images: post.images,
        username: post.username,
        avatar: post.avatar
      });
    }
  },

  chooseImage() {
    const self = this;
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        self.setData({
          images: res.tempFilePaths
        });
      }
    });
  },

  inputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value
    });
  },

  dateChange(e) {
    this.setData({
      date: e.detail.value
    });
  },

  chooseLocation() {
    const self = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              wx.chooseLocation({
                success(locRes) {
                  self.setData({
                    location: locRes
                  });
                },
                fail(err) {
                  console.error('选择位置失败：', err);
                }
              });
            },
            fail(err) {
              console.error('授权失败：', err);
              wx.showModal({
                title: '授权失败',
                content: '您未授权地理位置，无法选择位置。',
                showCancel: false
              });
            }
          });
        } else {
          wx.chooseLocation({
            success(locRes) {
              self.setData({
                location: locRes
              });
            },
            fail(err) {
              console.error('选择位置失败：', err);
            }
          });
        }
      },
      fail(err) {
        console.error('获取设置失败：', err);
      }
    });
  },

  formSubmit() {
    const { title, content, date, location, images, username, avatar, isEditing, postId } = this.data;

    if (!title || !content || !date || !location || images.length === 0) {
      wx.showToast({
        title: '请填写所有字段并选择日期、位置，并上传至少一张图片',
        icon: 'none'
      });
      return;
    }

    let posts = wx.getStorageSync('posts') || [];

    if (isEditing) {
      const index = posts.findIndex(p => p.id === Number(postId));
      if (index !== -1) {
        posts[index] = {
          ...posts[index],
          title,
          content,
          images,
          date,
          location,
          username,
          avatar
        };
      }
    } else {
      posts.push({
        title,
        content,
        images,
        date,
        location,
        username, // 存储用户名
        avatar, // 存储头像
        id: new Date().getTime(),
        favorites: 0,
        userId: wx.getStorageSync('userId') // 存储用户ID
      });
    }

    wx.setStorageSync('posts', posts);

    wx.showToast({
      title: isEditing ? '更新成功' : '发布成功',
      icon: 'success'
    });

    // 清空表单数据
    this.setData({
      title: '',
      content: '',
      date: this.data.currentDate,
      location: null,
      images: [],
      username: wx.getStorageSync('username') || '匿名用户',
      avatar: wx.getStorageSync('avatar') || '/images/default-avatar.png'
    });

    wx.navigateBack();
  }
});
