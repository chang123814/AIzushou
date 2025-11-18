// backend/server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = 3000; // 您可以选择其他端口，例如 80 或 443（如果配置HTTPS）

// 允许所有来源的CORS请求
app.use(cors());
app.use(express.json());

app.post('/api/translate', async (req, res) => {
    const { text } = req.body;
    const ZhipuAI_API_KEY = process.env.ZHIPUAI_API_KEY ? process.env.ZHIPUAI_API_KEY.trim() : undefined;
    const ZhipuAI_BASE_URL = process.env.ZHIPUAI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions'; // 确保这里是正确的智谱AI API Base URL

    if (!text) {
        return res.status(400).json({ error: 'Missing text for translation' });
    }
    if (!ZhipuAI_API_KEY) {
        console.error('ZHIPUAI_API_KEY is not set');
        return res.status(500).json({ error: 'Server configuration error: ZhipuAI API Key is missing.' });
    }

    try {
        const response = await axios.post(ZhipuAI_BASE_URL, {
            model: "glm-4", // 或您使用的智谱AI模型
            messages: [
                {
                    "role": "user",
                    "content": `Translate the following Chinese text to English, just give the translation result, do not include any other information: "${text}"`
                }
            ],
            max_tokens: 100,
            temperature: 0.7,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ZhipuAI_API_KEY}`
            }
        });

        const translatedText = response.data.choices[0]?.message?.content?.trim();
        res.json({ translated: translatedText });
    } catch (error) {
        console.error('Error calling ZhipuAI API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Translation failed', details: error.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', pid: process.pid, uptime: process.uptime() });
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
