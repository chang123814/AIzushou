const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const BASE_URL = (process.env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/').replace(/\/?$/, '/');

async function translateText(text) {
  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    const error = new Error('ZHIPU_API_KEY is not set in environment variables');
    error.statusCode = 500;
    throw error;
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
    return data.choices?.[0]?.message?.content || '';
  } catch (err) {
    const error = new Error(err?.response?.data || err?.response?.statusText || String(err));
    error.statusCode = 500;
    throw error;
  }
}

app.post('/translate', async (req, res) => {
  const text = String(req.body?.text || '').trim();
  if (!text) {
    return res.json({ code: 200, translated: '' });
  }

  try {
    const translated = await translateText(text);
    return res.json({ code: 200, translated });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ code: 500, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Translate service listening on port ${PORT}`);
});
