#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GLM-4 MCP 服务（Python 版，基于 Model Context Protocol）
- 通过 httpx 直接调用智谱 OpenAI 兼容接口，减少依赖兼容问题
- 提供两个工具：glm4_chat、glm4_embedding
环境变量：
  ZHIPU_API_KEY  必填，智谱 API Key
  ZHIPU_BASE_URL 选填，默认 https://open.bigmodel.cn/api/paas/v4/
"""

import os
import json
from typing import Any, Dict, List

import asyncio
import httpx

from mcp.server import Server
from mcp.server.stdio import stdio_server

API_KEY = os.getenv("ZHIPU_API_KEY")
BASE_URL = os.getenv("ZHIPU_BASE_URL", "https://open.bigmodel.cn/api/paas/v4/").rstrip("/") + "/"

if not API_KEY:
    raise RuntimeError("ZHIPU_API_KEY 环境变量未设置")

# 常用模型默认值
DEFAULT_MODEL = os.getenv("ZHIPU_MODEL", "glm-4-flash")

app = Server("glm4-mcp-server")

@app.list_tools()
async def list_tools() -> List[Dict[str, Any]]:
    return [
        {
            "name": "glm4_chat",
            "description": "与 GLM-4 系列模型进行对话（OpenAI 兼容接口）",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "messages": {
                        "type": "array",
                        "description": "OpenAI 风格的消息数组",
                        "items": {
                            "type": "object",
                            "properties": {
                                "role": {"type": "string"},
                                "content": {"type": "string"}
                            },
                            "required": ["role", "content"]
                        }
                    },
                    "model": {
                        "type": "string",
                        "description": "模型名称，如 glm-4-flash / glm-4-plus / glm-4-long",
                        "default": DEFAULT_MODEL
                    },
                    "temperature": {"type": "number", "default": 0.7},
                    "top_p": {"type": "number", "default": 0.9},
                    "max_tokens": {"type": "integer", "default": 1024},
                    "stream": {"type": "boolean", "default": False}
                },
                "required": ["messages"]
            }
        },
        {
            "name": "glm4_embedding",
            "description": "生成文本嵌入向量（OpenAI 兼容接口）",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "input": {"type": "string", "description": "要嵌入的文本"},
                    "model": {"type": "string", "default": "embedding-2"}
                },
                "required": ["input"]
            }
        }
    ]

async def _post_json(client: httpx.AsyncClient, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    url = BASE_URL + path.lstrip("/")
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    resp = await client.post(url, headers=headers, json=payload, timeout=60)
    resp.raise_for_status()
    return resp.json()

@app.call_tool()
async def call_tool(name: str, arguments: Dict[str, Any]) -> List[Dict[str, Any]]:
    try:
        async with httpx.AsyncClient() as client:
            if name == "glm4_chat":
                messages = arguments.get("messages")
                if not messages:
                    raise ValueError("参数 messages 不能为空（需要 OpenAI 风格的消息数组）")
                model = arguments.get("model", DEFAULT_MODEL)
                temperature = arguments.get("temperature", 0.7)
                top_p = arguments.get("top_p", 0.9)
                max_tokens = arguments.get("max_tokens", 1024)
                stream = arguments.get("stream", False)

                payload = {
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "top_p": top_p,
                    "max_tokens": max_tokens,
                    "stream": stream
                }

                data = await _post_json(client, "chat/completions", payload)

                # 兼容常见 OpenAI 响应结构
                text = None
                try:
                    # 非流式：choices[0].message.content
                    text = data["choices"][0]["message"]["content"]
                except Exception:
                    # 兜底：直接转字符串
                    text = json.dumps(data, ensure_ascii=False)

                return [{"type": "text", "text": text}]

            elif name == "glm4_embedding":
                text = arguments.get("input")
                if not text:
                    raise ValueError("参数 input 不能为空")
                model = arguments.get("model", "embedding-2")

                payload = {
                    "model": model,
                    "input": text
                }
                data = await _post_json(client, "embeddings", payload)

                # 兼容常见 OpenAI 响应结构
                vec = None
                try:
                    vec = data["data"][0]["embedding"]
                except Exception:
                    vec = []

                return [{
                    "type": "text",
                    "text": json.dumps({
                        "dimension": len(vec),
                        "preview": vec[:8]
                    }, ensure_ascii=False)
                }]

            else:
                raise ValueError(f"未知工具: {name}")

    except httpx.HTTPStatusError as e:
        return [{"type": "text", "text": f"HTTP 错误 {e.response.status_code}: {e.response.text}"}]
    except Exception as e:
        return [{"type": "text", "text": f"错误: {repr(e)}"}]


async def main() -> None:
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())

if __name__ == "__main__":
    asyncio.run(main())
