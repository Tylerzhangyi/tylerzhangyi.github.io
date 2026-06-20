# Personal Portfolio

Next.js 15 个人作品集，源码在 [`personal-portfolio/`](personal-portfolio/)。

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
- 页面与组件：`personal-portfolio/app/`、`personal-portfolio/components/`

## 构建与预览

```bash
npm run build
npm run preview
```

## GitHub Pages 部署

推送 `main` 分支后，`.github/workflows/deploy.yml` 会自动：

1. 在 `personal-portfolio/` 执行 `npm ci` 并 `npm run build`
2. 将 `personal-portfolio/out` 上传并发布到 GitHub Pages

请确保仓库 Settings → Pages 使用 **GitHub Actions** 作为来源。

站点使用自定义域名（如 `tyler.yunguhs.com`）时，无需配置 `basePath`。若改为 `username.github.io/仓库名` 子路径部署，需在 `next.config.mjs` 中设置 `basePath` 与 `assetPrefix`。
