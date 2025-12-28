import { viteBundler } from '@vuepress/bundler-vite'
import { hopeTheme } from 'vuepress-theme-hope'
import { defineUserConfig } from 'vuepress'
import autoArticleFooter from './plugins/auto-article-footer.js'

export default defineUserConfig({
  // 站点配置
  lang: 'zh-CN',
  title: 'Akun',
  description: '这是我的第一个 VuePress 站点',
  base: '/', // 如果部署到 https://username.github.io/repo/ 则设置为 '/repo/'

  // 主题配置
  theme: hopeTheme({
    // 主机名
    hostname: 'https://your-domain.com',

    // 作者信息
    author: {
      name: '博主',
      url: 'https://your-domain.com',
      email: 'your-email@example.com',
    },

    // 图标库
    // iconAssets: 'fontawesome-with-brands',

    // 导航栏图标
    logo: '/avatar.jpg',

    // 仓库配置
    repo: 'https://github.com/akun533',

    // 文档目录
    docsDir: 'docs',

    // 导航栏
    navbar: [
      {
        text: '首页',
        link: '/',
        icon: 'home',
      },
      {
        text: '前端技术',
        children: [
          {
            text: 'Vue.js',
            children: [
              { text: 'Vue 2', link: '/category/vue2/' },
              { text: 'Vue 3', link: '/category/vue3/' },
            ],
          },
          {
            text: '前端工程化',
            children: [
              { text: '构建工具', link: '/category/构建工具/' },
              { text: '前端架构', link: '/category/前端架构/' },
            ],
          },
        ],
      },
      {
        text: '后端技术',
        children: [
          { text: 'Node.js/Express', link: '/category/express/' },
          { text: 'Java', link: '/category/java/' },
          { text: '数据库', link: '/category/数据库/' },
        ],
      },
      {
        text: '服务器运维',
        children: [
          { text: 'Linux', link: '/category/linux/' },
          { text: 'Docker', link: '/category/docker/' },
          { text: 'Jenkins', link: '/category/jenkins/' },
          { text: 'NAS', link: '/category/nas/' },
        ],
      },
      {
        text: '游戏攻略',
        link: '/category/游戏攻略/',
      },
      {
        text: '分类',
        link: '/category/',
      },
      {
        text: '关于我',
        link: '/about/',
      }
    ],

    // 侧边栏
    sidebar: {
      '/articles/': 'structure',
      '/': false,
    },

    // 页脚
    footer: 'MIT Licensed | Copyright © 2025-present',
    displayFooter: true,

    // 博客配置
    blog: {
      name: '博主',
      description: '一个技术博客',
      intro: '/portfolio.html',
      avatar: '/avatar.jpg',
      roundAvatar: true,
      medias: {
        GitHub: 'https://github.com/akun533',
        Email: '122915623@qq.com',
      },
    },

    // 加密配置
    encrypt: {
      config: {},
    },

    // 多语言配置
    metaLocales: {
      editLink: '在 GitHub 上编辑此页',
    },

    // 插件配置
    plugins: {
      // 图标插件
      icon: {
        assets: 'fontawesome-with-brands',
      },

      // 博客插件
      blog: true,

      // 组件插件
      components: {
        components: ['Badge', 'VPCard'],
      },
    },

    // Markdown 配置
    markdown: {
      align: true,
      attrs: true,
      codeTabs: true,
      component: true,
      demo: true,
      figure: true,
      imgLazyload: true,
      imgSize: true,
      include: true,
      mark: true,
      stylize: [
        {
          matcher: 'Recommended',
          replacer: ({ tag }) => {
            if (tag === 'em')
              return {
                tag: 'Badge',
                attrs: { type: 'tip' },
                content: 'Recommended',
              }
          },
        },
      ],
      sub: true,
      sup: true,
      tabs: true,
      tasklist: true,
      vPre: true,
    },
  }),

  // 打包工具
  bundler: viteBundler(),
  
  // 插件
  plugins: [
    autoArticleFooter,
  ],
  
  // 定义全局常量，可在客户端使用
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
})
