# 网站数据结构文档

本文档描述了个人作品集网站的数据结构设计。

## 相关文档

- **数据库设计文档**：`DATABASE_DESIGN.md` - 详细的数据库表结构设计
- **UML 图**：
  - `DATABASE_UML.puml` - ER 图（实体关系图）
  - `DATABASE_CLASS_DIAGRAM.puml` - 类图
  - `DATABASE_UML_README.md` - UML 图使用说明

## 目录结构

```
public/data/
├── projects.json          # 项目数据（默认/中文）
├── projects.zh.json       # 项目数据（中文）
├── projects.en.json       # 项目数据（英文）
├── blog.json              # 博客数据（默认/中文）
├── blog.zh.json           # 博客数据（中文）
└── blog.en.json           # 博客数据（英文）
```

## 1. 项目数据结构 (Projects)

### 文件位置
- `public/data/projects.json`
- `public/data/projects.zh.json`
- `public/data/projects.en.json`

### 数据结构

```typescript
interface ProjectsData {
  projects: Project[]
}

interface Project {
  id: number                    // 项目唯一标识符
  name: string                  // 项目名称
  intro: string                 // 项目简介（简短描述）
  technologies: string[]        // 使用的技术栈数组
  description: string           // 详细描述（支持多行文本，使用 \n 换行）
  image: string                 // 项目主图片路径（相对路径或完整URL）
  screenshots?: string[]        // 项目截图数组（可选）
  demo?: string                 // 演示链接（可选）
  github?: string               // GitHub 仓库链接（可选）
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | number | ✅ | 项目唯一ID，用于路由和识别 |
| `name` | string | ✅ | 项目名称 |
| `intro` | string | ✅ | 项目简介，用于卡片展示 |
| `technologies` | string[] | ✅ | 技术栈标签数组，如 `["Vue", "Python", "AWS DB"]` |
| `description` | string | ✅ | 详细描述，支持 Markdown 格式，使用 `\n` 换行 |
| `image` | string | ✅ | 主图片路径，支持相对路径（如 `/photos/remindu.png`）或完整URL |
| `screenshots` | string[] | ❌ | 项目截图数组，用于详情页展示 |
| `demo` | string | ❌ | 在线演示链接 |
| `github` | string | ❌ | GitHub 仓库链接 |

### 示例

```json
{
  "projects": [
    {
      "id": 1,
      "name": "Remindu",
      "intro": "使用Vue.js搭建一个解决食物过期问题的应用",
      "technologies": ["Vue", "Python", "AWS DB", "CSS"],
      "description": "项目背景：\n在日常生活中，我们经常因为忘记食物的保质期而导致食物浪费...",
      "demo": "http://remindu.net/#/",
      "image": "/photos/remindu.png",
      "screenshots": [
        "/photos/remindu1.png",
        "/photos/remindu2.png",
        "/photos/remindu3.png"
      ]
    }
  ]
}
```

## 2. 博客数据结构 (Blog)

### 文件位置
- `public/data/blog.json`
- `public/data/blog.zh.json`
- `public/data/blog.en.json`

### 数据结构

```typescript
interface BlogData {
  posts: BlogPost[]
}

interface BlogPost {
  id: number                    // 文章唯一标识符
  title: string                 // 文章标题
  excerpt: string               // 文章摘要（用于列表页展示）
  content: string               // 文章完整内容（支持 Markdown 格式）
  date: string                  // 发布日期（格式：YYYY-MM-DD）
  category: string             // 文章分类
  tags: string[]                // 标签数组
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | number | ✅ | 文章唯一ID，用于路由和识别 |
| `title` | string | ✅ | 文章标题 |
| `excerpt` | string | ✅ | 文章摘要，用于列表页预览 |
| `content` | string | ✅ | 文章完整内容，支持 Markdown 格式，使用 `\n` 或 `\\n` 换行 |
| `date` | string | ✅ | 发布日期，格式：`YYYY-MM-DD`（如 `2024-12-25`） |
| `category` | string | ✅ | 文章分类，如 "人物故事"、"企业动态"、"设计" 等 |
| `tags` | string[] | ✅ | 标签数组，用于分类和搜索 |

### 示例

```json
{
  "posts": [
    {
      "id": 1,
      "title": "超越代码的力量",
      "excerpt": "提到木酱老师，很多人对他的第一印象便是一位计算机技术高超的老师...",
      "content": "# 超越代码的力量\n\n## ——记一位热衷公益的程序员蜕变成老师的故事\n\n&emsp;&emsp;提到木酱老师...",
      "date": "2024-12-25",
      "category": "人物故事",
      "tags": ["教育", "公益", "程序员", "人物专访"]
    }
  ]
}
```

## 3. 多语言支持

### 语言文件命名规则

- 默认文件：`{type}.json`（通常为中文）
- 中文文件：`{type}.zh.json`
- 英文文件：`{type}.en.json`

其中 `{type}` 可以是 `projects` 或 `blog`。

### 语言加载逻辑

1. 优先加载对应语言文件（如 `projects.zh.json`）
2. 如果语言文件不存在，回退到默认文件（`projects.json`）
3. 所有字段内容都需要根据语言进行本地化

## 4. 图片资源结构

### 图片路径规则

- **相对路径**：以 `/` 开头，如 `/photos/remindu.png`
  - 会被解析为：`{BASE_URL}photos/remindu.png`
- **完整URL**：以 `http://` 或 `https://` 开头
  - 直接使用，不进行路径转换

### 图片目录结构

```
public/photos/
├── remindu.png          # 项目主图
├── remindu1.png        # 项目截图
├── remindu2.png
├── remindu3.png
├── pvz.png
├── tyler.png           # 个人头像
└── ...
```

## 5. 数据验证规则

### Projects 验证

- `id` 必须唯一
- `name` 不能为空
- `technologies` 必须是非空数组
- `image` 路径必须有效
- 如果提供 `demo` 或 `github`，必须是有效的 URL

### Blog 验证

- `id` 必须唯一
- `title` 不能为空
- `date` 必须符合 `YYYY-MM-DD` 格式
- `category` 不能为空
- `tags` 必须是非空数组

## 6. 数据使用场景

### Projects 数据使用

- **列表页** (`/projects`)：显示所有项目卡片
  - 使用字段：`id`, `name`, `intro`, `technologies`, `image`, `demo`, `github`
- **详情页** (`/projects/:id`)：显示项目详细信息
  - 使用字段：所有字段

### Blog 数据使用

- **列表页** (`/blog`)：显示所有文章列表
  - 使用字段：`id`, `title`, `excerpt`, `date`, `category`
- **详情页** (`/blog/:id`)：显示文章完整内容
  - 使用字段：所有字段，`content` 需要渲染为 Markdown

## 7. 扩展建议

### 未来可能添加的字段

**Projects:**
- `status`: 项目状态（进行中/已完成/已归档）
- `startDate`: 开始日期
- `endDate`: 结束日期
- `team`: 团队成员
- `featured`: 是否精选项目

**Blog:**
- `author`: 作者信息
- `readTime`: 阅读时长（分钟）
- `views`: 浏览次数
- `featured`: 是否精选文章
- `coverImage`: 封面图片

### 数据结构优化建议

1. **统一日期格式**：使用 ISO 8601 格式（`YYYY-MM-DD`）
2. **图片路径标准化**：统一使用相对路径或完整URL
3. **内容格式**：统一使用 Markdown 格式
4. **多语言字段**：考虑使用嵌套对象结构，如：
   ```json
   {
     "name": {
       "zh": "项目名称",
       "en": "Project Name"
     }
   }
   ```

## 8. 数据维护指南

### 添加新项目

1. 在对应的语言文件中添加新的项目对象
2. 确保 `id` 唯一且递增
3. 准备项目图片并放置在 `public/photos/` 目录
4. 填写完整的项目信息

### 添加新博客文章

1. 在对应的语言文件中添加新的文章对象
2. 确保 `id` 唯一且递增
3. 使用 Markdown 格式编写内容
4. 设置合适的分类和标签

### 更新现有数据

1. 直接编辑对应的 JSON 文件
2. 确保 JSON 格式正确（可以使用 JSON 验证工具）
3. 更新所有语言版本以保持一致性

## 9. 注意事项

1. **JSON 格式**：确保所有 JSON 文件格式正确，避免语法错误
2. **字符转义**：在 JSON 中，换行符需要使用 `\n` 或 `\\n`
3. **图片路径**：确保图片文件存在于指定路径
4. **多语言一致性**：不同语言版本的数据结构应保持一致
5. **ID 唯一性**：确保所有 `id` 字段在各自的数据集中唯一

