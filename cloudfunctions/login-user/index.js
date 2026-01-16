const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const usersCollection = db.collection('users')

exports.main = async (event, context) => {
  const { username, password } = event
  
  // 查询是否存在相同账户名
  const user = await usersCollection.where({
    username: username
  }).get()

  // 如果账户名不存在，返回账户名不存在
  if (user.data.length === 0) {
    return {
      code: 1,
      message: '账户名不存在'
    }
  }

  // 查询账户名和密码是否匹配
  const matchedUser = await usersCollection.where({
    username: username,
    password: password
  }).get()

  // 如果密码不正确，返回密码不正确
  if (matchedUser.data.length === 0) {
    return {
      code: 2,
      message: '密码不正确'
    }
  }

  // 如果账户名存在且密码正确，返回用户id
  return {
    code: 200,
    message: '验证成功',
    data: matchedUser.data[0]
  }
}