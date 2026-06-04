# 静态资源目录

这个目录用于存放静态资源文件，这些文件可以通过绝对路径直接访问。

## 图片文件

请将以下图片文件放在此目录下：

- `avatar-placeholder.jpg` - 首页头像图片（150x150 像素，圆形显示）
- `placeholder.jpg` - 项目占位图片（用于项目列表和详情页）

## 如何使用

在代码中，使用以 `/` 开头的路径来引用这些文件：

```html
<img src="/avatar-placeholder.jpg" alt="头像" />
```

## 注意事项

- 图片文件名区分大小写
- 如果图片不存在，代码会自动显示占位符或使用错误处理
- 建议使用 JPG 或 PNG 格式
- 头像图片建议使用正方形（1:1 比例）

## 文件结构示例

```
public/
├── avatar-placeholder.jpg
├── placeholder.jpg
├── data/
│   ├── projects.json
│   └── blog.json
└── README.md
```

