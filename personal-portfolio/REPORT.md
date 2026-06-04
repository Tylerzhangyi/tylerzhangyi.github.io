# 代码库报告 (Code Report)

本文档描述个人作品集网站代码库中每个主要文件和文件夹的用途。

## 项目概述

这是一个使用 Vue 3 + Vue Router + Vite 构建的个人作品集网站，支持中英文双语切换，展示个人项目、博客文章、技能和教育背景等信息。

---

## 项目结构

```
Personal Portfolio/
├── public/                    # 公共资源目录
│   ├── data/                  # 数据文件（JSON）
│   │   ├── projects.json      # 项目数据（默认）
│   │   ├── projects.zh.json   # 项目数据（中文）
│   │   ├── projects.en.json   # 项目数据（英文）
│   │   ├── blog.json          # 博客数据（默认）
│   │   ├── blog.zh.json       # 博客数据（中文）
│   │   └── blog.en.json       # 博客数据（英文）
│   ├── photos/                # 静态图片资源
│   └── 404.html               # 404 错误页面
├── src/                       # 源代码目录
│   ├── components/            # 可复用组件
│   │   ├── Navbar.vue         # 导航栏组件
│   │   ├── Footer.vue         # 页脚组件
│   │   └── MatrixRain.vue     # 数字雨背景效果组件
│   ├── views/                 # 页面视图组件
│   │   ├── Home.vue           # 首页
│   │   ├── About.vue          # 关于我
│   │   ├── Skills.vue         # 技能与简历
│   │   ├── Projects.vue       # 项目列表
│   │   ├── ProjectDetail.vue  # 项目详情
│   │   ├── Blog.vue           # 博客列表
│   │   ├── BlogDetail.vue     # 博客详情
│   │   ├── Links.vue          # 链接页面
│   │   └── Contact.vue        # 联系我
│   ├── router/                # 路由配置
│   │   └── index.js           # 路由定义
│   ├── utils/                 # 工具函数
│   │   └── i18n.js            # 国际化工具
│   ├── App.vue                # 根组件
│   ├── main.js                # 应用入口文件
│   └── style.css              # 全局样式
├── index.html                 # HTML 入口文件
├── vite.config.js             # Vite 配置文件
├── package.json               # 项目依赖配置
├── README.md                  # 项目说明文档
├── REPORT.md                  # 代码库报告（本文档）
└── PROMPTS.md                 # 项目提示文档
```

---

## 根目录文件

### `package.json`
项目的依赖管理文件，定义了项目名称、版本、npm 脚本和依赖包。
- **主要依赖**：Vue 3, Vue Router, marked（Markdown 解析）, @heroicons/vue（图标库）
- **开发依赖**：Vite, @vitejs/plugin-vue
- **脚本命令**：`dev`（开发服务器）、`build`（构建生产版本）、`preview`（预览构建结果）

### `vite.config.js`
Vite 构建工具的配置文件，定义了 Vue 插件的使用和基础路径设置。

### `index.html`
项目的入口 HTML 文件，定义了页面基本结构、标题和图标，并引入了 Vue 应用的入口脚本（`src/main.js`）。

---

## 源代码目录 (`src/`)

### `src/main.js`
Vue 应用的入口文件，负责：
- 创建 Vue 应用实例
- 引入并注册 Vue Router
- 引入全局样式文件
- 将应用挂载到 DOM 元素上

### `src/App.vue`
应用的根组件，定义了整个应用的基本布局结构：
- 包含固定的导航栏（`Navbar`）
- 包含路由视图区域（`router-view`），用于显示不同页面的内容
- 包含固定的页脚（`Footer`）
- 定义了主内容区域的样式（flex 布局）

### `src/style.css`
全局样式文件，定义了：
- CSS 变量（颜色主题、阴影等）
- 全局重置样式
- 通用布局类（`.container`, `.page`）
- 通用按钮样式
- 响应式设计的基础规则

---

## 组件目录 (`src/components/`)

### `src/components/Navbar.vue`
顶部导航栏组件，功能包括：
- 显示网站 Logo 和标题
- 提供导航链接（首页、关于我、技能、项目、博客、链接、联系我）
- 支持移动端响应式菜单（汉堡菜单）
- 集成语言切换功能（中英文）
- 使用 Vue Router 进行路由导航
- 固定在页面顶部，具有毛玻璃效果

### `src/components/Footer.vue`
页脚组件，功能包括：
- 显示快速导航链接
- 显示版权信息
- 点击链接后自动滚动到页面顶部
- 响应式设计，适配不同屏幕尺寸

### `src/components/MatrixRain.vue`
矩阵雨（数字雨）视觉效果组件，用于首页背景动画：
- 使用 HTML5 Canvas 绘制动态数字雨效果
- 实现垂直滚动的数字列（0 和 1）
- 支持响应式调整，自动适应容器大小
- 性能优化：控制帧率、简化颜色计算、批量绘制
- 作为背景层显示，不影响用户交互

---

## 视图目录 (`src/views/`)

### `src/views/Home.vue`
首页视图组件，包含：
- 英雄区块（Hero Section）：展示个人介绍、头像和行动号召按钮
- 集成 MatrixRain 组件作为背景动画
- 功能卡片网格：快速访问项目、博客和技能页面
- 响应式布局，支持桌面端和移动端

### `src/views/About.vue`
关于我页面，展示：
- 个人简介和介绍
- 学术兴趣列表
- 个人爱好
- 目标与抱负
- 教育经历和学习课程
- 奖项与荣誉

### `src/views/Skills.vue`
技能与简历页面，展示：
- 技能列表（带技能水平进度条）
- 教育背景详细信息
- 相关课程列表
- 奖项与成就列表

### `src/views/Projects.vue`
项目列表页面，功能包括：
- 从 JSON 文件加载项目数据
- 以卡片网格形式展示所有项目
- 每个项目卡片显示：项目名称、技术栈、项目图片、操作按钮（查看详情、访问演示、GitHub 链接）
- 集成 GitHub 仓库信息展示
- 支持中英文数据切换

### `src/views/ProjectDetail.vue`
项目详情页面，展示单个项目的详细信息：
- 项目简介和完整描述
- 技术栈列表
- 项目截图轮播或网格展示
- 项目链接（演示地址、GitHub 仓库等）
- 返回项目列表的导航链接

### `src/views/Blog.vue`
博客列表页面，功能包括：
- 从 JSON 文件加载博客文章数据
- 以卡片形式展示所有博客文章
- 显示文章标题、摘要、发布日期等信息
- 支持点击进入文章详情页

### `src/views/BlogDetail.vue`
博客文章详情页面，展示：
- 文章的完整内容（支持 Markdown 格式）
- 文章元信息（标题、日期等）
- 使用 `marked` 库解析 Markdown 内容
- 返回博客列表的导航链接

### `src/views/Links.vue`
链接页面，展示有用的外部链接：
- 展示推荐网站和资源的链接列表
- 包括个人网站、学习资源、工具网站等
- 每个链接包含标题和描述

### `src/views/Contact.vue`
联系我页面，展示联系方式：
- 显示邮箱、GitHub、所在地等联系信息
- 提供联系方式的快速访问链接
- 展示合作意向说明

---

## 路由配置 (`src/router/`)

### `src/router/index.js`
Vue Router 路由配置文件，定义了：
- 所有页面的路由路径和对应的组件
- 路由历史模式（使用 Web History API）
- 路由与组件的映射关系：
  - `/` → Home
  - `/about` → About
  - `/skills` → Skills
  - `/projects` → Projects
  - `/projects/:id` → ProjectDetail（动态路由）
  - `/blog` → Blog
  - `/blog/:id` → BlogDetail（动态路由）
  - `/links` → Links
  - `/contact` → Contact

---

## 工具目录 (`src/utils/`)

### `src/utils/i18n.js`
国际化（i18n）工具文件，提供多语言支持：
- 定义了中英文两种语言的翻译字典
- 提供语言切换功能（`setLanguage`）
- 提供翻译函数（`t`）和字典获取函数（`getDict`）
- 使用 Vue 的 reactive 系统管理当前语言状态
- 将语言偏好保存到 localStorage
- 支持所有页面和组件的文本翻译

---

## 公共资源目录 (`public/`)

### `public/data/`
存放项目的 JSON 数据文件：
- `projects.json` / `projects.zh.json` / `projects.en.json`：项目数据（默认、中文、英文）
- `blog.json` / `blog.zh.json` / `blog.en.json`：博客文章数据（默认、中文、英文）
- 这些文件被各个视图组件动态加载和显示

### `public/photos/`
存放项目的静态图片资源：
- 个人头像、项目截图、图标等图片文件
- 包括各种格式的图片（.jpg, .png, .svg 等）

### `public/404.html`
404 错误页面，用于处理未找到的路由。

---

## 自动生成文件

### `auto-imports.d.ts`
TypeScript 类型定义文件（自动生成），用于 Vite 的自动导入功能。

### `components.d.ts`
组件类型定义文件（自动生成），用于 Vue 组件的类型检查。

---

## 其他文件

### `README.md`
项目说明文档，通常包含项目介绍、安装和使用说明。

### `PROMPTS.md`
项目提示文档，可能包含开发说明或 AI 助手提示信息。

---

## 项目技术栈总结

- **前端框架**：Vue 3（Composition API）
- **路由**：Vue Router 4
- **构建工具**：Vite
- **样式**：原生 CSS（使用 CSS 变量）
- **图标**：Heroicons
- **Markdown 解析**：marked
- **国际化**：自定义 i18n 方案
- **数据格式**：JSON

---

## 项目结构特点

1. **组件化设计**：将 UI 拆分为可复用的组件
2. **路由分离**：使用 Vue Router 实现单页应用导航
3. **国际化支持**：完整的双语支持系统
4. **响应式设计**：适配不同设备和屏幕尺寸
5. **数据驱动**：使用 JSON 文件管理内容，易于维护和更新
6. **性能优化**：MatrixRain 组件进行了性能优化，控制帧率和渲染效率

---

*最后更新：2025年*

