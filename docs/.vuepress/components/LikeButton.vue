<template>
  <ClientOnly>
    <div class="like-button-wrapper">
      <button 
        class="like-button" 
        :class="{ liked: hasLiked, loading: isLoading }"
        @click="toggleLike"
        :disabled="isLoading"
      >
        <span class="icon">{{ hasLiked ? '❤️' : '🤍' }}</span>
        <span class="count">{{ count }}</span>
        <span class="text">{{ hasLiked ? '已赞' : '点赞' }}</span>
      </button>
    </div>
  </ClientOnly>
</template>

<script>
export default {
  name: 'LikeButton',
  data() {
    return {
      count: 0,
      hasLiked: false,
      isLoading: false
    }
  },
  mounted() {
    this.loadLikeStatus();
  },
  methods: {
    getUserId() {
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
      }
      return userId;
    },
    
    async loadLikeStatus() {
      const pageUrl = window.location.pathname;
      const userId = this.getUserId();
      const API_BASE = window.__API_BASE_URL__ || 'http://localhost:3000/api';
      
      try {
        const response = await fetch(
          `${API_BASE}/likes/check?pageUrl=${encodeURIComponent(pageUrl)}&userId=${userId}`
        );
        const data = await response.json();
        
        if (data.success) {
          this.count = data.data.count;
          this.hasLiked = data.data.hasLiked;
        }
      } catch (error) {
        console.error('加载点赞状态失败:', error);
      }
    },
    
    async toggleLike() {
      if (this.isLoading) return;
      
      this.isLoading = true;
      const pageUrl = window.location.pathname;
      const userId = this.getUserId();
      const API_BASE = window.__API_BASE_URL__ || 'http://localhost:3000/api';
      
      try {
        const response = await fetch(`${API_BASE}/likes/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageUrl, userId })
        });
        
        const data = await response.json();
        
        if (data.success) {
          this.count = data.data.count;
          this.hasLiked = data.data.hasLiked;
          
          // 动画效果
          this.$el.querySelector('.like-button').classList.add('bounce');
          setTimeout(() => {
            this.$el.querySelector('.like-button')?.classList.remove('bounce');
          }, 600);
        }
      } catch (error) {
        console.error('点赞操作失败:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.like-button-wrapper {
  display: inline-block;
  margin: 16px 0;
}

.like-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: 2px solid var(--c-border, #e2e2e3);
  border-radius: 24px;
  background: var(--c-bg, #fff);
  color: var(--c-text, #2c3e50);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.like-button:hover {
  border-color: var(--c-brand, #3eaf7c);
  background: var(--c-brand-light, #f0fdf4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(62, 175, 124, 0.15);
}

.like-button.liked {
  border-color: #ff4757;
  background: #fff5f7;
  color: #ff4757;
}

.like-button.liked:hover {
  background: #ffe5e9;
  border-color: #ff3344;
}

.like-button.loading {
  opacity: 0.6;
  cursor: not-allowed;
}

.like-button.bounce {
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.2); }
  50% { transform: scale(0.95); }
  75% { transform: scale(1.1); }
}

.icon {
  font-size: 20px;
  line-height: 1;
}

.count {
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.text {
  font-size: 14px;
}

@media (max-width: 768px) {
  .like-button {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .icon {
    font-size: 18px;
  }
}
</style>
