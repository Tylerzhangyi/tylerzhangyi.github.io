# 数据库 UML 图说明

本文档包含个人作品集网站的数据库 UML 图，包括 ER 图和类图。

## 文件说明

1. **DATABASE_UML.puml** - ER 图（实体关系图）
   - 展示所有数据库表及其关系
   - 使用 PlantUML 格式
   - 包含所有字段定义和外键关系

2. **DATABASE_CLASS_DIAGRAM.puml** - 类图
   - 展示实体类及其方法
   - 使用 PlantUML 格式
   - 包含实体分组和方法定义

## 如何查看 UML 图

### 方法 1: 使用在线工具

1. 访问 [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
2. 复制 `.puml` 文件内容
3. 粘贴到在线编辑器中
4. 查看生成的图表

### 方法 2: 使用 VS Code 插件

1. 安装 VS Code 插件：`PlantUML`
2. 打开 `.puml` 文件
3. 按 `Alt + D` 预览图表

### 方法 3: 使用 IntelliJ IDEA

1. 安装 PlantUML 插件
2. 打开 `.puml` 文件
3. 自动显示预览

### 方法 4: 使用命令行工具

```bash
# 安装 PlantUML
npm install -g node-plantuml

# 生成 PNG 图片
puml generate DATABASE_UML.puml -o database_er.png
puml generate DATABASE_CLASS_DIAGRAM.puml -o database_class.png

# 或使用 Java 版本
java -jar plantuml.jar DATABASE_UML.puml
```

## 数据库设计说明

### 核心设计原则

1. **多语言支持**
   - 所有内容相关的表都有对应的翻译表
   - 使用 `language_id` 外键关联到 `languages` 表
   - 支持动态语言切换

2. **规范化设计**
   - 遵循第三范式（3NF）
   - 避免数据冗余
   - 使用关联表处理多对多关系

3. **可扩展性**
   - 使用 `display_order` 字段控制显示顺序
   - 预留扩展字段（如 `created_at`, `updated_at`）
   - 支持 JSON 字段存储复杂数据

### 主要实体关系

#### 项目相关
- `projects` ← `project_translations` → `languages`
- `projects` ← `project_technologies` → `technologies`
- `projects` ← `project_screenshots`

#### 博客相关
- `blog_posts` ← `blog_post_translations` → `languages`
- `blog_posts` ← `blog_post_tags` → `tags`

#### 个人资料相关
- `personal_info` ← `personal_info_translations` → `languages`
- `skills`, `education`, `courses`, `awards` 为独立表

#### 链接相关
- `links` ← `link_translations` → `languages`

#### 翻译系统
- `translation_keys` ← `translation_values` → `languages`

## 数据填充顺序

### 1. 基础数据
```sql
-- 首先填充语言表
INSERT INTO languages (code, name, is_default) VALUES
('zh', '中文', TRUE),
('en', 'English', FALSE);

-- 填充技术栈表
INSERT INTO technologies (name) VALUES
('Vue'), ('Python'), ('JavaScript'), ('CSS');
```

### 2. 项目数据
```sql
-- 1. 插入项目基本信息
INSERT INTO projects (image, demo_url, github_url) VALUES
('/photos/remindu.png', 'http://remindu.net/#/', NULL);

-- 2. 插入项目翻译
INSERT INTO project_translations (project_id, language_id, name, intro, description) VALUES
(1, 1, 'Remindu', '使用Vue.js搭建...', '项目背景：...'),
(1, 2, 'Remindu', 'A Vue.js app...', 'Project Background:...');

-- 3. 关联技术栈
INSERT INTO project_technologies (project_id, technology_id) VALUES
(1, 1), (1, 2);

-- 4. 插入截图
INSERT INTO project_screenshots (project_id, image_url, display_order) VALUES
(1, '/photos/remindu1.png', 1);
```

### 3. 博客数据
```sql
-- 1. 插入文章基本信息
INSERT INTO blog_posts (date, category) VALUES
('2024-12-25', '人物故事');

-- 2. 插入文章翻译
INSERT INTO blog_post_translations (post_id, language_id, title, excerpt, content) VALUES
(1, 1, '超越代码的力量', '提到木酱老师...', '# 超越代码的力量...'),
(1, 2, 'The Power Beyond Code', 'When people think...', '# The Power Beyond Code...');

-- 3. 插入标签
INSERT INTO tags (name) VALUES ('教育'), ('公益');

-- 4. 关联标签
INSERT INTO blog_post_tags (post_id, tag_id) VALUES
(1, 1), (1, 2);
```

### 4. 个人资料数据
```sql
-- 1. 插入个人信息
INSERT INTO personal_info (email, github, phone, qq, location, avatar_url) VALUES
('Tyler.zhang.cn@hotmail.com', 'Tylerzhangyi', '+86 15618003850', '2894936641', 'Hangzhou · CN', '/photos/tyler.png');

-- 2. 插入个人简介翻译
INSERT INTO personal_info_translations (language_id, intro_text, interests, hobbies, goals_text) VALUES
(1, '我是一名热衷于新技术的学生...', '["人机交互", "机器学习"]', '素描,油画', '我的目标是...'),
(2, 'I am a student passionate...', '["Human-Computer Interaction", "Machine Learning"]', 'Sketching, Oil painting', 'My goal is...');

-- 3. 插入技能
INSERT INTO skills (name, level, display_order) VALUES
('Vue.js', 85, 1),
('JS', 80, 2);

-- 4. 插入教育经历
INSERT INTO education (degree, institution, period, description, display_order) VALUES
('计算机科学', '杭州云谷学校', '2023 - 2026', '主修计算机科学...', 1);

-- 5. 插入课程
INSERT INTO courses (name, display_order) VALUES
('CL/AP Computer Science A', 1);

-- 6. 插入奖项
INSERT INTO awards (name, display_order) VALUES
("2024, 2025 Dean's List, Overall Academic Performance Top 3%", 1);
```

### 5. 链接数据
```sql
-- 1. 插入链接
INSERT INTO links (url, display_order) VALUES
('https://github.com/yungu', 1);

-- 2. 插入链接翻译
INSERT INTO link_translations (link_id, language_id, title, description) VALUES
(1, 1, 'Yungu\'s GitHub', 'Yungu 的 GitHub 仓库...'),
(1, 2, 'Yungu\'s GitHub', 'Yungu\'s GitHub repository...');
```

### 6. 翻译系统数据
```sql
-- 1. 插入翻译键
INSERT INTO translation_keys (key_path, category) VALUES
('nav.home', 'nav'),
('home.greeting', 'home');

-- 2. 插入翻译值
INSERT INTO translation_values (key_id, language_id, value) VALUES
(1, 1, '首页'),
(1, 2, 'Home'),
(2, 1, '你好，我是'),
(2, 2, 'Hello, I am');
```

## 查询示例

### 获取项目列表（中文）
```sql
SELECT 
    p.id,
    pt.name,
    pt.intro,
    p.image,
    p.demo_url,
    p.github_url,
    GROUP_CONCAT(t.name SEPARATOR ', ') as technologies
FROM projects p
INNER JOIN project_translations pt ON p.id = pt.project_id
LEFT JOIN project_technologies pt_rel ON p.id = pt_rel.project_id
LEFT JOIN technologies t ON pt_rel.technology_id = t.id
WHERE pt.language_id = 1
GROUP BY p.id, pt.id
ORDER BY p.created_at DESC;
```

### 获取博客文章列表（中文，带标签）
```sql
SELECT 
    bp.id,
    bp.date,
    bp.category,
    bpt.title,
    bpt.excerpt,
    GROUP_CONCAT(t.name SEPARATOR ', ') as tags
FROM blog_posts bp
INNER JOIN blog_post_translations bpt ON bp.id = bpt.post_id
LEFT JOIN blog_post_tags bpt_rel ON bp.id = bpt_rel.post_id
LEFT JOIN tags t ON bpt_rel.tag_id = t.id
WHERE bpt.language_id = 1
GROUP BY bp.id, bpt.id
ORDER BY bp.date DESC;
```

### 获取个人完整资料（中文）
```sql
SELECT 
    pi.*,
    pit.intro_text,
    pit.interests,
    pit.hobbies,
    pit.goals_text
FROM personal_info pi
LEFT JOIN personal_info_translations pit ON pit.language_id = 1
LIMIT 1;
```

## 注意事项

1. **外键约束**：确保在插入关联数据前，被引用的主表数据已存在
2. **唯一约束**：注意 `UNIQUE` 约束，避免重复数据
3. **多语言一致性**：确保所有语言版本的数据结构一致
4. **事务处理**：建议使用事务来保证数据一致性
5. **索引优化**：根据查询频率创建适当的索引

## 扩展建议

1. **软删除**：添加 `deleted_at` 字段支持软删除
2. **版本控制**：为内容表添加版本号字段
3. **审核状态**：添加 `status` 字段控制内容发布状态
4. **访问统计**：添加 `views` 字段记录访问次数
5. **用户系统**：如需多用户，添加用户表和权限表

