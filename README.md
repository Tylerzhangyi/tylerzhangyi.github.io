# Personal Portfolio

Vue 3 + Vite 个人作品集，源码与部署产物均在 [`personal-portfolio/`](personal-portfolio/)。

## 本地开发

```bash
npm run install:all
npm run dev       # http://localhost:8806
```

或在 `personal-portfolio/` 目录：

```bash
npm install
npm run dev
```

## 编辑内容

- 项目 / 博客数据：`personal-portfolio/public/data/*.json`
- 图片 / 视频：`personal-portfolio/public/photos/`、`public/videos/`
- 页面与组件：`personal-portfolio/src/`

## 构建与预览

```bash
npm run build
npm run preview
```

## GitHub Pages 部署

推送 `main` 分支后，`.github/workflows/deploy.yml` 会自动：

1. 在 `personal-portfolio/` 安装依赖并 `npm run build`
2. 将 `personal-portfolio/dist` 上传并发布到 GitHub Pages

无需修改 workflow；请确保仓库 Settings → Pages 使用 **GitHub Actions** 作为来源。
