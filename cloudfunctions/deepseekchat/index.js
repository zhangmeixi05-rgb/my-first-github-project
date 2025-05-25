const axios = require('axios');

exports.main = async (event, context) => {
  try {
    // 从环境变量获取通义 DashScope API Key
    const apiKey = process.env.DASHSCOPE_API_KEY;

    // 更专业的 system prompt
    const systemPrompt = `作为情感专家，请按以下步骤响应：
1. 分析情绪（积极/消极/中性）+ 简要理由
2. 提供3条具体建议（使用emoji图标）
3. 保持回答在150字以内
4. 中文回复，语气温暖专业`;

    // 通义 DashScope API 请求
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-plus',
        input: {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: event.text }
          ]
        },
        parameters: {
          temperature: 0.7
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000
      }
    );

    // 获取通义千问的回复
    const rawReply = response.data.output.text;
    const formattedReply = rawReply.replace(/\n/g, '\n\n'); // 美化段落

    return { reply: formattedReply };

  } catch (error) {
    console.error('Tongyi (DashScope) Error:', error.response?.data || error);
    return {
      error: true,
      reply: "深度分析服务暂时不可用，请尝试重新提问"
    };
  }
};
