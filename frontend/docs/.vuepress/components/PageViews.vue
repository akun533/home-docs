<template>
  <ClientOnly>
    <div class="page-views">
      <span class="icon">👁️</span>
      <span class="count">{{ views }}</span>
      <span class="text">次阅读</span>
      <span v-if="uniqueVisitors > 0" class="unique">
        ({{ uniqueVisitors }} 位访客)
      </span>
    </div>
  </ClientOnly>
</template>

<script>
export default {
  name: 'PageViews',
  data() {
    return {
      views: 0,
      uniqueVisitors: 0
    }
  },
  mounted() {
    this.trackAndLoadViews();
  },
  methods: {
    async trackAndLoadViews() {
      const pageUrl = window.location.pathname;
      const API_BASE = window.__API_BASE_URL__ || 'http://localhost:43000/api';
      
      try {
        // 生成访客 ID
        let visitorId = localStorage.getItem('visitorId');
        if (!visitorId) {
          visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('visitorId', visitorId);
        }
        
        // 记录访问
        const response = await fetch(`${API_BASE}/analytics/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageUrl, visitorId })
        });
        
        const data = await response.json();
        if (data.success) {
          this.views = data.data.views;
          this.uniqueVisitors = data.data.uniqueVisitors;
          
          // 如果本次访问没有被计数，可以在控制台显示提示
          if (!data.data.counted) {
            console.log('ℹ️ 10分钟内已访问过，本次不重复计数');
          }
        }
      } catch (error) {
        console.error('加载访问量失败:', error);
      }
    }
  }
}
</script>

<style scoped>
.page-views {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--c-text-lighter, #666);
  padding: 4px 12px;
  background: var(--c-bg-lighter, #f5f5f5);
  border-radius: 4px;
  margin: 8px 0;
}

.icon {
  font-size: 16px;
}

.count {
  font-weight: 600;
  color: var(--c-brand, #3eaf7c);
}

.text {
  color: var(--c-text-lighter, #666);
}

.unique {
  font-size: 12px;
  color: var(--c-text-lighter, #999);
  margin-left: 4px;
}
</style>
