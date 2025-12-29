// API 基础配置
const API_BASE_URL = 'http://localhost:43000/api';

// 生成用户唯一ID（保存在 localStorage）
function getUserId() {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
  }
  return userId;
}

// ==================== 访问量统计 API ====================

// 记录页面访问
async function trackPageView(pageUrl) {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageUrl,
        visitorId: getUserId()
      })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('记录访问失败:', error);
  }
}

// 获取页面访问量
async function getPageViews(pageUrl) {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/page?pageUrl=${encodeURIComponent(pageUrl)}`);
    const data = await response.json();
    return data.data; // { views: 123, uniqueVisitors: 45 }
  } catch (error) {
    console.error('获取访问量失败:', error);
  }
}

// 获取整站统计
async function getSiteStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/stats`);
    const data = await response.json();
    return data.data; // { totalViews, totalPages, topPages }
  } catch (error) {
    console.error('获取统计失败:', error);
  }
}

// ==================== 点赞功能 API ====================

// 切换点赞状态
async function toggleLike(pageUrl) {
  try {
    const response = await fetch(`${API_BASE_URL}/likes/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageUrl,
        userId: getUserId()
      })
    });
    const data = await response.json();
    return data.data; // { count: 10, hasLiked: true }
  } catch (error) {
    console.error('点赞操作失败:', error);
  }
}

// 检查是否已点赞
async function checkLikeStatus(pageUrl) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/likes/check?pageUrl=${encodeURIComponent(pageUrl)}&userId=${getUserId()}`
    );
    const data = await response.json();
    return data.data; // { count: 10, hasLiked: true }
  } catch (error) {
    console.error('检查点赞状态失败:', error);
  }
}

// ==================== 评论功能 API ====================

// 获取页面评论列表
async function getComments(pageUrl) {
  try {
    const response = await fetch(`${API_BASE_URL}/comments?pageUrl=${encodeURIComponent(pageUrl)}`);
    const data = await response.json();
    return data.data; // 评论数组
  } catch (error) {
    console.error('获取评论失败:', error);
  }
}

// 发表评论
async function postComment(pageUrl, content, author, email = '', website = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageUrl,
        content,
        author,
        email,
        website
      })
    });
    const data = await response.json();
    return data.data; // 新评论对象
  } catch (error) {
    console.error('发表评论失败:', error);
  }
}

// 回复评论
async function replyComment(commentId, content, author, email = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        author,
        email
      })
    });
    const data = await response.json();
    return data.data; // 回复对象
  } catch (error) {
    console.error('回复评论失败:', error);
  }
}

// ==================== 使用示例 ====================

// 页面加载时
async function initPage() {
  const pageUrl = window.location.pathname;
  
  // 1. 记录访问
  await trackPageView(pageUrl);
  
  // 2. 显示访问量
  const viewsData = await getPageViews(pageUrl);
  console.log('页面访问量:', viewsData);
  
  // 3. 显示点赞状态
  const likeData = await checkLikeStatus(pageUrl);
  console.log('点赞数据:', likeData);
  
  // 4. 加载评论
  const comments = await getComments(pageUrl);
  console.log('评论列表:', comments);
}

// 点赞按钮点击事件
async function handleLikeClick() {
  const pageUrl = window.location.pathname;
  const result = await toggleLike(pageUrl);
  console.log('点赞结果:', result);
  // 更新 UI 显示点赞数和状态
}

// 发表评论
async function handleCommentSubmit(content, author, email) {
  const pageUrl = window.location.pathname;
  const comment = await postComment(pageUrl, content, author, email);
  console.log('新评论:', comment);
  // 刷新评论列表
}

// 导出 API 方法
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    trackPageView,
    getPageViews,
    getSiteStats,
    toggleLike,
    checkLikeStatus,
    getComments,
    postComment,
    replyComment
  };
}
