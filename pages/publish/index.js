Page({
  data: {
    title: '',
    content: '',
    images: [],
    username: '', // 添加用户名
    avatar: '', // 添加头像
    isEditing: false,
    postId: null
  },

  onLoad(options) {

    // console.log(userInfo);
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
        images: post.images,
        username: post.username,
        avatar: post.avatar
      });
    }
  },

  chooseImage() {
    const self = this;
    wx.chooseMedia().then(res=>{
      this.uploadImageToCloud(res.tempFiles[0])
    }).catch(err=>{
      console.log("用户取消了上传");
    })
    // wx.chooseImage({
    //   count: 9,
    //   sizeType: ['original', 'compressed'],
    //   sourceType: ['album', 'camera'],
    //   success(res) {
    //     self.setData({
    //       images: res.tempFilePaths
    //     });
    //   }
    // });
  },
  uploadImageToCloud(file) {
    wx.showLoading({
      title: '上传中...', // 加载提示框的标题
      mask: true // 是否显示透明蒙层，防止触摸穿透
    });
    const cloudPath = 'images/' + Date.now() + '-' + Math.floor(Math.random() * 1000); // 云存储路径
    // 上传图片
    // const { phone, sex, nickName } = this.data.info; 
    wx.cloud.uploadFile({
      cloudPath: cloudPath +'.png',
      filePath: file.tempFilePath, // 小程序临时文件路径
      success: (res) => {
        const imageUrl = res.fileID; // 获取上传成功后的图片在云存储中的地址
        wx.showToast({
          title: '上传成功',
          icon: 'success',
          duration: 2000 // 提示持续时间为 2 秒
        });
        let arr = this.data.images;
        arr.push(imageUrl);
        console.log(arr);
        // 更新图片列表
        this.setData({
          images:arr,
        });

      },
      fail: (err) => {
        console.error('上传失败', err);
        // 可以根据业务需求进行错误处理
      },
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
    const { title, content, images, username, avatar, isEditing, postId } = this.data;

    if (!title || !content ||  images.length === 0) {
      wx.showToast({
        title: '请填写所有字段并上传至少一张图片',
        icon: 'none'
      });
      return;
    }
    let userInfo = wx.getStorageSync('userInfo');
    console.log(userInfo);
    let posts = wx.getStorageSync('posts') || [];

    if (isEditing) {
      const index = posts.findIndex(p => p.id === Number(postId));
      if (index !== -1) {
        posts[index] = {
          ...posts[index],
          title,
          content,
          images,
          nickName:userInfo.nickName,
          avatar:userInfo.avatarUrl,
          userId:userInfo._id
        };
        wx.cloud.callFunction({
          name:"card-list",
          data:{
            title,
            content,
            images,
            nickName:userInfo.nickName,
            avatar:userInfo.avatarUrl,
            userId:userInfo._id
          }
        }).then(res=>{
          console.log(res);
        })
      }
    } else {
      posts.push({
        title,
        content,
        images,
        nickName:userInfo.nickName,
        avatar:userInfo.avatarUrl,
        userId:userInfo._id,
        favorites: 0,
        userId: wx.getStorageSync('userId') // 存储用户ID
      });
      wx.cloud.callFunction({
        name:"card-list",
        data:{
          title,
          content,
          images,

          nickName:userInfo.nickName,
          avatar:userInfo.avatarUrl,
          userId:userInfo._id
        }
      }).then(res=>{
        console.log(res);
      })
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
