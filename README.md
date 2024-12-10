# Voice Notion

基于 Dify 构建的语音笔记应用，支持将语音转换为文字并保存到 Notion 中。

## 功能特点

- 🎙️ 语音转文字：支持实时语音识别
- 📝 自动保存：将转换后的文字自动保存到 Notion
- 🤖 智能优化：使用 AI 优化文本格式和内容
- 💫 便捷操作：简单的用户界面，一键式操作

## 使用前准备

1. Notion API Token
   - 访问 [Notion Developers](https://www.notion.so/my-integrations)
   - 创建一个新的 integration
   - 复制 API Token

2. Dify API Token
   - 登录 [Dify](https://dify.ai)
   - 创建应用并获取 API Token

## 安装

```bash
git clone https://github.com/your-username/voice-notion.git
cd voice-notion
npm install
```

## 环境配置

1. 复制环境变量示例文件：
```bash
cp .env.example .env
```

2. 在 `.env` 文件中填入你的配置：
- `NOTION_TOKEN`: Notion API 密钥
- `NOTION_DATABASE_ID`: Notion 数据库 ID
- `DIFY_API_KEY`: Dify API 密钥
- `DIFY_API_ENDPOINT`: Dify API 地址
- `SPEECH_LANGUAGE`: 语音识别语言（可选，默认中文）
- `MAX_RECORDING_TIME`: 最大���音时长（可选，默认 3 分钟）

## 使用方法

1. 启动开发服务器：
```bash
npm run dev
```

2. 打开浏览器访问 `http://localhost:5858`
