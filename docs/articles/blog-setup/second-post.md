---
title: VuePress 使用指南
icon: circle-info
date: 2025-12-28
category:
  - 博客搭建
tag:
  - VuePress
  - 教程
  - 静态站点
---

# VuePress 使用指南

VuePress 是一个以 Markdown 为中心的静态网站生成器，你可以使用它来编写文档或博客。

<!-- more -->

> 发布日期：2025-12-28

## 什么是 VuePress？

VuePress 是一个以 Markdown 为中心的静态网站生成器，你可以使用它来编写文档或博客。

## 安装

```bash
npm install -D vuepress@next @vuepress/client@next @vuepress/bundler-vite@next
```

## 项目结构

一个基本的 VuePress 项目结构如下：

```
├── docs
│   ├── .vuepress
│   │   └── config.js    # 配置文件
│   ├── README.md        # 首页
│   └── articles         # 文章目录
│       └── README.md
└── package.json
```

## 配置文件

在 `.vuepress/config.js` 中配置站点：

```javascript
import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'

export default defineUserConfig({
  lang: 'zh-CN',
  title: '我的博客',
  description: '个人技术博客',
  
  theme: defaultTheme({
    navbar: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/articles/' },
    ],
  }),
})
```

## Markdown 扩展

VuePress 扩展了 Markdown 语法，支持：

### 自定义容器

::: tip 提示
这是一个提示
:::

::: warning 警告
这是一个警告
:::

::: danger 危险
这是一个危险警告
:::

### 代码块

支持代码高亮和行号：

```javascript{1,3-5}
export default {
  data() {
    return {
      msg: 'Hello VuePress'
    }
  }
}
```

## 部署

构建静态文件：

```bash
npm run docs:build
```

生成的静态文件在 `docs/.vuepress/dist` 目录中，可以部署到任何静态网站托管服务。

## 总结

VuePress 是一个强大且易用的静态站点生成器，非常适合搭建技术博客和文档站点。

---

*标签：VuePress, 教程, 静态站点*
