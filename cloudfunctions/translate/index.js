// 云函数入口文件
const axios = require('axios');

const BASE_URL = (process.env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/').replace(/\/?$/, '/')

exports.main = async (event, context) => {
  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    return { code: 500, error: 'ZHIPU_API_KEY is not set in environment variables' };
  }

  const text = (event && event.text) ? String(event.text).trim() : '';
  if (!text) {
    return { code: 200, translated: '' };
  }

  try {
    const resp = await axios.post(
      BASE_URL + 'chat/completions',
      {
        model: process.env.ZHIPU_MODEL || 'glm-4-flash',
        messages: [
          { role: 'system', content: 'You are a translator. Translate Chinese into natural English. Output English only without any explanations.' },
          { role: 'user', content: text }
        ],
        temperature: 0.2,
        max_tokens: 200
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const data = resp.data || {};
    let translated = '';
    try {
      translated = data.choices[0].message.content || '';
    } catch (_) {}

    return { code: 200, translated };
  } catch (err) {
    return { code: 500, error: err && err.response ? (err.response.data || err.response.statusText) : String(err) };
  }
};
