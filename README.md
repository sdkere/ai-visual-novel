# 幻境 - AI 视觉小说

一个基于 AI 大模型驱动的视觉小说游戏平台。玩家可以通过自然语言与游戏世界互动，AI 实时生成剧情和角色对话。

## ✨ 特性

- 🤖 **AI 驱动叙事**：使用大语言模型实时生成剧情，每次游玩都是独特体验
- 🎭 **情感系统**：根据剧情发展动态调整背景氛围和情感基调
- 🔀 **分支选择**：提供多个选择支，也支持自由输入
- 🌲 **完整世界观**：内置"迷雾森林"奇幻世界，包含丰富的人物和剧情

## 🛠️ 技术栈

- **前端**：React 18 + TypeScript + Tailwind CSS + Framer Motion
- **后端**：Node.js + Express
- **AI**：OpenAI 兼容 API（支持任何兼容 API）
- **构建**：Vite

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 AI API

编辑 `.env` 文件，填入你的 AI API 配置：

```env
AI_API_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your-api-key-here
AI_MODEL=gpt-4o
```

### 3. 启动开发服务器

```bash
npm run dev
```

这会同时启动：
- 前端：http://localhost:5173
- 后端：http://localhost:3001

### 4. 开始游戏

打开浏览器访问 http://localhost:5173，选择世界开始冒险！

## 📁 项目结构

```
ai-visual-novel/
├── server/                 # 后端服务
│   ├── index.ts           # Express 服务器入口
│   ├── routes/
│   │   ├── chat.ts        # AI 对话 API
│   │   └── story.ts       # 故事数据 API
│   └── services/
│       ├── ai.ts          # LLM API 集成
│       └── story-engine.ts # 故事引擎
├── src/                    # 前端源码
│   ├── main.tsx           # 入口文件
│   ├── App.tsx            # 根组件
│   ├── components/
│   │   ├── MainMenu.tsx   # 主菜单
│   │   ├── GameScreen.tsx # 游戏画面
│   │   ├── DialogBox.tsx  # 对话框
│   │   └── ChoicePanel.tsx # 选择面板
│   ├── store/
│   │   └── gameStore.ts   # Zustand 状态管理
│   ├── types/
│   │   └── game.ts        # 类型定义
│   └── styles/
│       └── game.css       # 游戏样式
├── .env                    # 环境变量
├── package.json
└── README.md
```

## 🎮 当前世界

### 幻境·迷雾森林

在一片被永恒迷雾笼罩的古老森林中，隐藏着一个鲜为人知的精灵王国。千年来，森林的守护结界保护着这里的和平。但最近，结界开始出现裂痕，黑暗生物开始渗透进来...

**角色：**
- 🧝 **艾拉** - 森林守护者，银发绿瞳的精灵少女
- ⚔️ **凯尔** - 流浪的暗影猎人，带着神秘的过去
- 🔮 **露娜** - 神秘的占星师，知道关于结界裂痕的秘密

## 🔧 生产部署

```bash
npm run build
npm run preview
```

## 📝 添加新世界

在 `server/routes/story.ts` 中添加新的世界定义，并在 `server/services/story-engine.ts` 中添加对应的系统提示词。

## 📄 许可证

MIT
