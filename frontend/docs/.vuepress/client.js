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
      // 通过 Nginx 转发，使用相对路径
      window.__API_BASE_URL__ = '/api'
    }
  },
})
