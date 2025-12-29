<template>
  <ClientOnly>
    <div class="comment-section">
      <h3 class="comment-title">
        <span class="icon">💬</span>
        评论区
        <span class="count">({{ comments.length }})</span>
      </h3>
    </div>

    <!-- 评论表单 -->
    <div class="comment-form">
      <textarea
        v-model="newComment.content"
        placeholder="写下你的评论..."
        rows="4"
        :maxlength="500"
      ></textarea>
      <div class="form-footer">
        <div class="user-info">
          <input
            v-model="newComment.author"
            type="text"
            placeholder="昵称 *"
            required
          />
          <input
            v-model="newComment.email"
            type="email"
            placeholder="邮箱（可选）"
          />
          <input
            v-model="newComment.website"
            type="url"
            placeholder="网站（可选）"
          />
        </div>
        <button
          class="submit-btn"
          @click="submitComment"
          :disabled="!canSubmit || isSubmitting"
        >
          {{ isSubmitting ? '发送中...' : '发表评论' }}
        </button>
      </div>
      <div class="char-count">{{ newComment.content.length }} / 500</div>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="comments.length === 0" class="empty">
        暂无评论，来抢个沙发吧！
      </div>
      <div v-else>
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="comment-item"
        >
          <div class="comment-header">
            <span class="author">{{ comment.author }}</span>
            <span class="time">{{ formatTime(comment.createdAt) }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>

          <!-- 回复列表 -->
          <div v-if="comment.replies && comment.replies.length > 0" class="replies">
            <div
              v-for="reply in comment.replies"
              :key="reply.id"
              class="reply-item"
            >
              <div class="comment-header">
                <span class="author">{{ reply.author }}</span>
                <span class="time">{{ formatTime(reply.createdAt) }}</span>
              </div>
              <div class="comment-content">{{ reply.content }}</div>
            </div>
          </div>

          <!-- 回复按钮 -->
          <button
            class="reply-btn"
            @click="toggleReplyForm(comment.id)"
          >
            {{ replyingTo === comment.id ? '取消回复' : '回复' }}
          </button>

          <!-- 回复表单 -->
          <div v-if="replyingTo === comment.id" class="reply-form">
            <textarea
              v-model="replyContent"
              placeholder="写下你的回复..."
              rows="3"
            ></textarea>
            <div class="reply-footer">
              <input
                v-model="replyAuthor"
                type="text"
                placeholder="昵称 *"
              />
              <button
                class="submit-btn small"
                @click="submitReply(comment.id)"
                :disabled="!replyContent || !replyAuthor"
              >
                发表回复
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script>
export default {
  name: 'CommentSection',
  data() {
    return {
      comments: [],
      loading: false,
      isSubmitting: false,
      newComment: {
        content: '',
        author: '',
        email: '',
        website: ''
      },
      replyingTo: null,
      replyContent: '',
      replyAuthor: ''
    }
  },
  computed: {
    canSubmit() {
      return this.newComment.content.trim() && this.newComment.author.trim();
    }
  },
  mounted() {
    this.loadComments();
    this.loadUserInfo();
  },
  methods: {
    loadUserInfo() {
      const author = localStorage.getItem('commentAuthor');
      const email = localStorage.getItem('commentEmail');
      const website = localStorage.getItem('commentWebsite');

      if (author) this.newComment.author = author;
      if (email) this.newComment.email = email;
      if (website) this.newComment.website = website;
    },

    saveUserInfo() {
      localStorage.setItem('commentAuthor', this.newComment.author);
      localStorage.setItem('commentEmail', this.newComment.email || '');
      localStorage.setItem('commentWebsite', this.newComment.website || '');
    },

    async loadComments() {
      this.loading = true;
      const pageUrl = window.location.pathname;
      const API_BASE = window.__API_BASE_URL__ || '/api';

      try {
        const response = await fetch(
          `${API_BASE}/comments?pageUrl=${encodeURIComponent(pageUrl)}`
        );
        
        if (!response.ok) {
          console.warn('加载评论失败: HTTP', response.status);
          return;
        }
        
        const data = await response.json();

        if (data.success) {
          this.comments = data.data.reverse(); // 最新的在前
        }
      } catch (error) {
        console.error('加载评论失败:', error);
      } finally {
        this.loading = false;
      }
    },

    async submitComment() {
      if (!this.canSubmit || this.isSubmitting) return;

      this.isSubmitting = true;
      const pageUrl = window.location.pathname;
      const API_BASE = window.__API_BASE_URL__ || '/api';

      try {
        const response = await fetch(`${API_BASE}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageUrl,
            ...this.newComment
          })
        });

        if (!response.ok) {
          alert('评论失败: HTTP ' + response.status);
          return;
        }
        
        const data = await response.json();

        if (data.success) {
          this.saveUserInfo();
          this.newComment.content = '';
          await this.loadComments();
        } else {
          alert('评论失败: ' + (data.error || '未知错误'));
        }
      } catch (error) {
        console.error('发表评论失败:', error);
        alert('评论失败，请稍后重试');
      } finally {
        this.isSubmitting = false;
      }
    },

    toggleReplyForm(commentId) {
      this.replyingTo = this.replyingTo === commentId ? null : commentId;
      this.replyContent = '';
      this.replyAuthor = this.newComment.author || '';
    },

    async submitReply(commentId) {
      if (!this.replyContent || !this.replyAuthor) return;

      const API_BASE = window.__API_BASE_URL__ || '/api';

      try {
        const response = await fetch(`${API_BASE}/comments/${commentId}/reply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: this.replyContent,
            author: this.replyAuthor
          })
        });

        if (!response.ok) {
          alert('回复失败: HTTP ' + response.status);
          return;
        }
        
        const data = await response.json();

        if (data.success) {
          this.replyingTo = null;
          this.replyContent = '';
          await this.loadComments();
        } else {
          alert('回复失败: ' + (data.error || '未知错误'));
        }
      } catch (error) {
        console.error('回复失败:', error);
        alert('回复失败，请稍后重试');
      }
    },

    formatTime(time) {
      const date = new Date(time);
      const now = new Date();
      const diff = now - date;

      const minute = 60 * 1000;
      const hour = 60 * minute;
      const day = 24 * hour;

      if (diff < minute) return '刚刚';
      if (diff < hour) return Math.floor(diff / minute) + ' 分钟前';
      if (diff < day) return Math.floor(diff / hour) + ' 小时前';
      if (diff < 30 * day) return Math.floor(diff / day) + ' 天前';

      return date.toLocaleDateString('zh-CN');
    }
  }
}
</script>

<style scoped>
.comment-section {
  margin: 40px 0;
  padding: 24px;
  background: var(--c-bg, #fff);
  border-radius: 8px;
  border: 1px solid var(--c-border, #e2e2e3);
}

.comment-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  margin: 0 0 24px 0;
  color: var(--c-text, #2c3e50);
}

.icon {
  font-size: 24px;
}

.count {
  font-size: 16px;
  color: var(--c-text-lighter, #999);
  font-weight: normal;
}

/* 评论表单 */
.comment-form {
  margin-bottom: 32px;
}

textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--c-border, #e2e2e3);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s;
}

textarea:focus {
  outline: none;
  border-color: var(--c-brand, #3eaf7c);
}

.form-footer {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.user-info {
  display: flex;
  gap: 12px;
  flex: 1;
}

.user-info input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--c-border, #e2e2e3);
  border-radius: 4px;
  font-size: 14px;
}

.user-info input:focus {
  outline: none;
  border-color: var(--c-brand, #3eaf7c);
}

.submit-btn {
  padding: 8px 24px;
  background: var(--c-brand, #3eaf7c);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.submit-btn:hover:not(:disabled) {
  background: var(--c-brand-dark, #2d8659);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn.small {
  padding: 6px 16px;
  font-size: 13px;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: var(--c-text-lighter, #999);
  margin-top: 4px;
}

/* 评论列表 */
.loading, .empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--c-text-lighter, #999);
}

.comment-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--c-border-light, #f0f0f0);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.author {
  font-weight: 600;
  color: var(--c-brand, #3eaf7c);
}

.time {
  font-size: 12px;
  color: var(--c-text-lighter, #999);
}

.comment-content {
  color: var(--c-text, #2c3e50);
  line-height: 1.6;
  margin-bottom: 8px;
  white-space: pre-wrap;
  word-break: break-word;
}

.reply-btn {
  padding: 4px 12px;
  font-size: 12px;
  color: var(--c-brand, #3eaf7c);
  background: transparent;
  border: 1px solid var(--c-brand-light, #c0e9d5);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.reply-btn:hover {
  background: var(--c-brand-light, #f0fdf4);
}

/* 回复 */
.replies {
  margin-top: 12px;
  padding-left: 24px;
  border-left: 2px solid var(--c-border-light, #f0f0f0);
}

.reply-item {
  padding: 12px 0;
}

.reply-form {
  margin-top: 12px;
  padding: 12px;
  background: var(--c-bg-light, #f9f9f9);
  border-radius: 6px;
}

.reply-form textarea {
  background: white;
}

.reply-footer {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.reply-footer input {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid var(--c-border, #e2e2e3);
  border-radius: 4px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .comment-section {
    padding: 16px;
  }

  .form-footer {
    flex-direction: column;
  }

  .user-info {
    flex-direction: column;
  }

  .submit-btn {
    width: 100%;
  }
}
</style>
