// pages/index/index.js
Page({
  data: {
    arr: [],
    Imgs: [
      {
        url: '/pages/images/swiper/1.jpg'
      },
      {
        url: '/pages/images/swiper/2.jpg'
      },
      {
        url: '/pages/images/swiper/3.jpg'
      }
    ],
  },

   yuyue:function(){
    wx.switchTab({
      url: '',
    })
   },

   zixun:function() {
    wx.switchTab({
      url: '/pages/date',
    })
  },

  wode:function() {
    wx.switchTab({
      url: '/pages/my',
    })
  },

  1:function(){
    wx.navigateTo({
      url: '/pages/my_join',
    })
  },

  2:function(){
    wx.navigateTo({
      url: '/pages/my_join',
    })
  },

  3:function(){
    wx.navigateTo({
      url: '/pages/my_join',
    })
  },

})
 

 