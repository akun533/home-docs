import { defineClientConfig } from 'vuepress/client'
import PageViews from './components/PageViews.vue'
import LikeButton from './components/LikeButton.vue'
import CommentSection from './components/CommentSection.vue'
import SiteStats from './components/SiteStats.vue'
import ArticleFooter from './components/ArticleFooter.vue'

export default defineClientConfig({
  enhance({ app }) {
    // 注册全局组件
    app.component('PageViews', PageViews)
    app.component('LikeButton', LikeButton)
    app.component('CommentSection', CommentSection)
    app.component('SiteStats', SiteStats)
    app.component('ArticleFooter', ArticleFooter)
  },
  setup() {
    // 在客户端设置 API 基础 URL
    if (typeof window !== 'undefined') {
      // 开发环境
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.__API_BASE_URL__ = 'http://localhost:43000/api'
      } else {
        // 生产环境 - 需要替换为你的实际 API 地址
        window.__API_BASE_URL__ = 'https://api.your-domain.com/api'
      }
    }
  },
})
