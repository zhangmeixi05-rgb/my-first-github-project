// 云函数：removeFavorite
const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const favorites = db.collection('favorites')

exports.main = async (event, context) => {
  const { userId, postId } = event

  try {
    const res = await favorites.where({
      userId,
      postId
    }).remove()

    return {
      code: 200,
      message: '取消收藏成功'
    }
  } catch (error) {
    return {
      code: 500,
      message: '取消收藏失败',
      error
    }
  }
}
