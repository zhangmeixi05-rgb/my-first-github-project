const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const usersCollection = db.collection('users')
// const personCollection = db.collection('person_list')

exports.main = async (event, context) => {
  const { username, password,nickName } = event
  try {
     // 查询是否存在相同账户名
  const user = await usersCollection.where({
    username: username
  }).get()

  // 如果账户名不存在，返回账户名不存在
  if (user.data.length !== 0) {
    return {
      code: 500,
      message: '账户名重复'
    }
  }

   const res =  await usersCollection.add({
      data:{
        username,
        password, 
        avatarUrl:'',
        gender:1,
        studentId:'',
        phoneNumber:'',
        nickName,
      }
    })
  // 如果账户名存在且密码正确，返回用户id
  return {
    code: 200,
    message: '注册成功'
  }
  } catch (error) {
    return {
      code: 500,
      message: '注册失败'
    }
  }
 
}