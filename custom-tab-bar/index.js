// custom-tab-bar/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
selected:null,//当前选中
//tabbar列表 与app.json定义一致
list:[
  {
    'pagePath':"/pages/index/index",
    "iconPath":"/img/img1.jpg",
    "text":'首页'
  },
  {
    'pagePath':"/pages/date/index",
    "iconPath":"/img/img2.jpg",
    "text":'圈子'
  },
  {
    'pagePath':"/pages/publish/index",
    "iconPath":"/img/img3.jpg",
    "text":'发布'
  },
  {
    'pagePath':"/pages/message/index",
    "iconPath":"/img/img4.jpg",
    "text":'私信'
  },
  {
    'pagePath':"/pages/my/index",
    "iconPath":"/img/img5.jpg",
    "text":'我的'
  }
]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    switchTab(e){
      const{index,url}=e.currentTarget.dataset;
      if(this.data.selected==index || index==undefined) return;
      wx.switchTab(
        {
          url,
        }
      )

    }
  }
})
