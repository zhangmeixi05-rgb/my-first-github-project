const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const usersCollection = db.collection('fellow')

exports.main = async (event, context) => {
  const { userId, friendId,reason,isAgree} = event
  try {
     // 查询是否存在相同班级名
  const user = await usersCollection.where({
    userId: userId
  }).get()

  // 如果账户名不存在，返回账户名不存在
  if (user.data.length !== 0) {
    return {
      code: 500,
      message: '已经发送过好友请求'
    }
  }

    await usersCollection.add({
      data:{
        userId,
        friendId,
        reason,
        isAgree
      }
    })

  // 如果账户名存在且密码正确，返回用户id
  return {
    code: 200,
    message: '请求发送成功'
  }
  } catch (error) {
    return {
      code: 500,
      message: '请求发送失败'
    }
  }
 
}