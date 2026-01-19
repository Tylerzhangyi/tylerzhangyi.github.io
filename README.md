# 个人作品集网站

一个使用 Vue 3 + Vite 构建的现代化个人作品集网站，支持中英文双语，展示项目、博客、技能等信息。

## 功能特性

- 📱 响应式设计，支持移动端和桌面端
- 🌐 中英文双语切换
- 🎨 现代化 UI 设计
- 📝 博客系统（支持 Markdown）
- 💼 项目作品集展示
- 🛠️ 技能和教育背景展示

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 `http://localhost:8805` 查看网站。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vue Router** - Vue.js 官方路由管理器
- **Heroicons** - SVG 图标库
- **marked** - Markdown 解析器

## 自定义内容

### 修改个人信息

编辑相应的视图组件：
- 首页：`src/views/Home.vue`
- 关于我：`src/views/About.vue`
- 技能：`src/views/Skills.vue`

或修改国际化文件 `src/utils/i18n.js` 中的文本内容。

### 添加项目

编辑 `public/data/projects.json`（或 `projects.zh.json` / `projects.en.json`），添加新项目：

```json
{
  "id": 4,
  "name": "项目名称",
  "intro": "项目简介",
  "description": "详细描述",
  "technologies": ["Vue.js", "JavaScript"],
  "github": "https://github.com/username/repo",
  "demo": "https://demo-url.com",
  "image": "/photos/project.png"
}
```

### 添加博客文章

编辑 `public/data/blog.json`（或 `blog.zh.json` / `blog.en.json`），添加新文章：

```json
{
  "id": 4,
  "title": "文章标题",
  "excerpt": "文章摘要",
  "content": "文章内容（支持 Markdown）",
  "date": "2024-03-01",
  "category": "分类",
  "tags": ["标签1", "标签2"]
}
```

### 添加图片

将图片文件放入 `public/photos/` 目录，然后在 JSON 文件中引用。

## 项目结构

项目采用标准的 Vue 3 + Vite 项目结构：

- `src/components/` - 可复用组件（导航栏、页脚等）
- `src/views/` - 页面视图组件
- `src/router/` - 路由配置
- `src/utils/` - 工具函数（国际化等）
- `public/data/` - 数据文件（JSON）
- `public/photos/` - 静态图片资源

> 详细的代码库结构和文件说明请查看 [REPORT.md](./REPORT.md)

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 许可证

MIT License
