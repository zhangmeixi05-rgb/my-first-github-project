// 云函数：addFavorite
const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const favorites = db.collection('favorites')

exports.main = async (event, context) => {
  const { userId, postId } = event

  try {
    // 检查是否已存在
    const existing = await favorites.where({ userId, postId }).get()
    if (existing.data.length > 0) {
      return {
        code: 400,
        message: '已收藏该帖子'
      }
    }

    await favorites.add({
      data: {
        userId,
        postId,
        createdAt: new Date()
      }
    })

    return {
      code: 200,
      message: '收藏成功'
    }
  } catch (error) {
    return {
      code: 500,
      message: '收藏失败',
      error
    }
  }
}
