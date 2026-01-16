const axios = require('axios');

const API_KEY = 'sk-9be35f6d1d0a4e97be620a22eaf25a8a';

// 延迟函数（用于后续错误重试机制）
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 情感分析请求逻辑（阿里云百炼）
async function analyzeTextWithRetry(text, retries = 3, delay = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await axios.post(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        {
          model: 'text-sentiment-classification-v1', // 假设模型ID，具体以实际为准
          input: {
            text: text
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          }
        }
      );

      console.log("阿里云百炼返回数据:", JSON.stringify(res.data, null, 2));

      // 解析返回结果
      const response = res.data;

      if (response && response.output && response.output.result) {
        return response.output.result;
      }

      // 错误处理重试
      if (res.status >= 500 || !response) {
        console.warn(`服务器错误或无响应，第${attempt}次重试中...`);
        await wait(delay);
        continue;
      }

      throw new Error('接口返回异常或无有效情绪结果');
    } catch (err) {
      console.warn(`调用出错：${err.message}`);
      if (attempt === retries) throw err;
      await wait(delay);
    }
  }

  throw new Error('重试失败，请稍后再试');
}

exports.main = async (event, context) => {
  const { text } = event;

  try {
    const sentimentResult = await analyzeTextWithRetry(text);

    // 简单情绪判断（你可根据阿里具体返回格式修改）
    let sentiment = '中性';
    let emoji = '😐';
    let color = '#faad14';

    if (sentimentResult.includes('积极')) {
      sentiment = '积极';
      emoji = '😊';
      color = '#52c41a';
    } else if (sentimentResult.includes('消极') || sentimentResult.includes('负面')) {
      sentiment = '消极';
      emoji = '😔';
      color = '#ff4d4f';
    }

    const resultText = `【情感分析结果】\n当前情绪: ${sentiment} ${emoji}\n分析内容: ${sentimentResult}`;

    return {
      errorCode: 0,
      result: resultText,
      sentiment,
      emoji,
      color
    };

  } catch (error) {
    console.error("错误信息:", error.message);
    return {
      errorCode: -1,
      errorMessage: error.message
    };
  }
};
