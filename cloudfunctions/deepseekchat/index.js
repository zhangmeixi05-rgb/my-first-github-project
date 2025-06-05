const axios = require('axios');

exports.main = async (event, context) => {
  try {
    // 虽然变量名是 DASHSCOPE_API_KEY，这里其实是 DeepSeek 的 key
    const apiKey = process.env.DASHSCOPE_API_KEY;

    const systemPrompt = `作为情感专家，请按以下步骤响应：
1. 分析情绪（积极/消极/中性）+ 简要理由
2. 提供3条具体建议（使用emoji图标）
3. 保持回答在150字以内
4. 中文回复，语气温暖专业`;

    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions', // ✅ DeepSeek 的正确 URL
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: event.text }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`, // ✅ 使用 DeepSeek 的 API key
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const rawReply = response.data.choices[0].message.content;
    const formattedReply = rawReply.replace(/\n/g, '\n\n');

    return { reply: formattedReply };

  } catch (error) {
    console.error('DeepSeek API Error:', error.response?.data || error);
    return {
      error: true,
      reply: "深度分析服务暂时不可用，请尝试重新提问"
    };
  }
};
