// 云函数 getUserFavorites
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { userId } = event

  try {
    // 查询收藏记录
    const favRes = await db.collection('favorites').where({ userId }).get()
    const postIds = favRes.data.map(item => item.postId)

    if (postIds.length === 0) {
      return { code: 200, data: [] }
    }

    // 查询帖子详情（重点！）
    const postRes = await db.collection('posts').where({
      _id: _.in(postIds)
    }).get()

    return {
      code: 200,
      data: postRes.data
    }
  } catch (err) {
    return {
      code: 500,
      message: '获取收藏列表失败',
      error: err
    }
  }
}
