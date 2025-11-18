#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""快速测试GLM-4 API"""

from zhipuai import ZhipuAI

# 初始化客户端（请改为你的临时测试Key，勿提交仓库）
client = ZhipuAI(api_key="<YOUR_API_KEY>")

print("🚀 开始测试 GLM-4 API...")
print("=" * 60)

try:
    response = client.chat.completions.create(
        model="glm-4-flash",
        messages=[{"role": "user", "content": "简单自我介绍一下"}],
        max_tokens=100
    )
    result = response.choices[0].message.content
    print("\n✓ API连接成功！")
    print(f"\n模型回复：\n{result}")
    print("\n" + "=" * 60)
    print("✅ GLM-4 配置成功。")
except Exception as e:
    print(f"\n✗ 连接失败：{e}")
    print("\n请检查：1) API Key 2) 网络 3) 额度")
