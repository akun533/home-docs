<template>
  <ClientOnly>
    <div class="site-stats">
      <h3 class="stats-title">📊 博客统计</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">👁️</div>
          <div class="stat-info">
            <div class="stat-value">{{ totalViews.toLocaleString() }}</div>
            <div class="stat-label">总访问量</div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">❤️</div>
          <div class="stat-info">
            <div class="stat-value">{{ totalLikes.toLocaleString() }}</div>
            <div class="stat-label">总点赞数</div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">💬</div>
          <div class="stat-info">
            <div class="stat-value">{{ totalComments.toLocaleString() }}</div>
            <div class="stat-label">总评论数</div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">📄</div>
          <div class="stat-info">
            <div class="stat-value">{{ totalPages.toLocaleString() }}</div>
            <div class="stat-label">文章页面</div>
          </div>
        </div>
      </div>
      
      <div v-if="topPages.length > 0" class="top-pages">
        <h4>🔥 热门文章 Top 5</h4>
        <div class="top-page-list">
          <div v-for="(page, index) in topPages.slice(0, 5)" :key="page.url" class="top-page-item">
            <span class="rank">{{ index + 1 }}</span>
            <a :href="page.url" class="page-title">{{ page.url }}</a>
            <span class="page-views">{{ page.views }} 次</span>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script>
export default {
  name: 'SiteStats',
  data() {
    return {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalPages: 0,
      topPages: [],
      loading: true
    }
  },
  mounted() {
    this.loadStats();
  },
  methods: {
    async loadStats() {
      const API_BASE = window.__API_BASE_URL__ || 'http://localhost:43000/api';
      
      try {
        // 获取访问量统计
        const analyticsRes = await fetch(`${API_BASE}/analytics/stats`);
        const analyticsData = await analyticsRes.json();
        
        if (analyticsData.success) {
          this.totalViews = analyticsData.data.totalViews || 0;
          this.totalPages = analyticsData.data.totalPages || 0;
          this.topPages = analyticsData.data.topPages || [];
        }
        
        // 获取点赞总数
        const likesRes = await fetch(`${API_BASE}/likes/total`);
        const likesData = await likesRes.json();
        if (likesData.success) {
          this.totalLikes = likesData.data.totalLikes || 0;
        }
        
        // 获取评论总数
        const commentsRes = await fetch(`${API_BASE}/comments/total`);
        const commentsData = await commentsRes.json();
        if (commentsData.success) {
          this.totalComments = commentsData.data.totalComments || 0;
        }
        
      } catch (error) {
        console.error('加载统计数据失败:', error);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.site-stats {
  margin: 32px 0;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.stats-title {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 32px;
  line-height: 1;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: white;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 4px;
}

.top-pages {
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.top-pages h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: white;
}

.top-page-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.top-page-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.top-page-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  font-weight: 700;
  font-size: 12px;
}

.page-title {
  flex: 1;
  color: white;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-title:hover {
  text-decoration: underline;
}

.page-views {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}

@media (max-width: 768px) {
  .site-stats {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .stat-icon {
    font-size: 28px;
  }
}
</style>
