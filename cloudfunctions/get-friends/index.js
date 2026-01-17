// 云函数：get-friends.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const res = await db.collection('friend').where({
    isAgreed: true,
    $or: [
      { applicantId: openid },
      { targetId: openid }
    ]
  }).get()

  // 获取好友 openid 列表（排除自己）
  const friendIds = res.data.map(item =>
    item.applicantId === openid ? item.targetId : item.applicantId
  )

  if (friendIds.length === 0) {
    return { friends: [] }
  }

  // 查询用户信息
  const users = await db.collection('users')
    .where({ _openid: db.command.in(friendIds) })
    .get()

  return {
    friends: users.data
  }
}
