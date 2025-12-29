<template>
  <ClientOnly>
    <div class="article-footer">
      <div class="interaction-section">
        <!-- 访问量和点赞在同一行 -->
        <div class="views-likes">
          <PageViews />
          <LikeButton />
        </div>
        
        <!-- 评论区 -->
        <CommentSection />
      </div>
    </div>
  </ClientOnly>
</template>

<script>
export default {
  name: 'ArticleFooter'
}
</script>

<style scoped>
.article-footer {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 2px solid var(--c-border, #e2e2e3);
}

.interaction-section {
  max-width: 100%;
}

.views-likes {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--c-border-light, #f0f0f0);
}

@media (max-width: 768px) {
  .views-likes {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
