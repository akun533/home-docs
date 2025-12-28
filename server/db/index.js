const fs = require('fs').promises;
const path = require('path');

const DB_DIR = path.join(__dirname, 'data');
const COMMENTS_FILE = path.join(DB_DIR, 'comments.json');
const LIKES_FILE = path.join(DB_DIR, 'likes.json');
const ANALYTICS_FILE = path.join(DB_DIR, 'analytics.json');

// 确保数据目录存在
async function ensureDbDir() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
  } catch (error) {
    console.error('创建数据目录失败:', error);
  }
}

// 读取 JSON 文件
async function readJSON(filePath, defaultValue = []) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeJSON(filePath, defaultValue);
      return defaultValue;
    }
    throw error;
  }
}

// 写入 JSON 文件
async function writeJSON(filePath, data) {
  await ensureDbDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// 评论数据库操作
const commentsDb = {
  async getAll() {
    return await readJSON(COMMENTS_FILE, []);
  },
  
  async getByPage(pageUrl) {
    const comments = await this.getAll();
    return comments.filter(c => c.pageUrl === pageUrl);
  },
  
  async add(comment) {
    const comments = await this.getAll();
    const newComment = {
      id: Date.now().toString(),
      ...comment,
      createdAt: new Date().toISOString(),
      replies: []
    };
    comments.push(newComment);
    await writeJSON(COMMENTS_FILE, comments);
    return newComment;
  },
  
  async addReply(commentId, reply) {
    const comments = await this.getAll();
    const comment = comments.find(c => c.id === commentId);
    if (!comment) throw new Error('评论不存在');
    
    const newReply = {
      id: Date.now().toString(),
      ...reply,
      createdAt: new Date().toISOString()
    };
    comment.replies.push(newReply);
    await writeJSON(COMMENTS_FILE, comments);
    return newReply;
  },
  
  async delete(commentId) {
    let comments = await this.getAll();
    comments = comments.filter(c => c.id !== commentId);
    await writeJSON(COMMENTS_FILE, comments);
  }
};

// 点赞数据库操作
const likesDb = {
  async getAll() {
    return await readJSON(LIKES_FILE, {});
  },
  
  async getByPage(pageUrl) {
    const likes = await this.getAll();
    return likes[pageUrl] || { count: 0, users: [] };
  },
  
  async toggle(pageUrl, userId) {
    const likes = await this.getAll();
    if (!likes[pageUrl]) {
      likes[pageUrl] = { count: 0, users: [] };
    }
    
    const userIndex = likes[pageUrl].users.indexOf(userId);
    if (userIndex > -1) {
      // 取消点赞
      likes[pageUrl].users.splice(userIndex, 1);
      likes[pageUrl].count--;
    } else {
      // 点赞
      likes[pageUrl].users.push(userId);
      likes[pageUrl].count++;
    }
    
    await writeJSON(LIKES_FILE, likes);
    return likes[pageUrl];
  }
};

// 访问量数据库操作
const analyticsDb = {
  async getAll() {
    return await readJSON(ANALYTICS_FILE, {});
  },
  
  async getByPage(pageUrl) {
    const analytics = await this.getAll();
    return analytics[pageUrl] || { views: 0, uniqueVisitors: [], viewRecords: [] };
  },
  
  async incrementView(pageUrl, visitorId, ipAddress) {
    const analytics = await this.getAll();
    if (!analytics[pageUrl]) {
      analytics[pageUrl] = { views: 0, uniqueVisitors: [], viewRecords: [] };
    }
    
    // 确保 viewRecords字段存在（兼容旧数据）
    if (!analytics[pageUrl].viewRecords) {
      analytics[pageUrl].viewRecords = [];
    }
    
    const now = Date.now();
    const tenMinutesAgo = now - 10 * 60 * 1000; // 10分钟前的时间戳
    
    // 清理超过10分钟的旧记录（保持数据文件精简）
    analytics[pageUrl].viewRecords = analytics[pageUrl].viewRecords.filter(
      record => record.timestamp > tenMinutesAgo
    );
    
    // 检查该IP是否在10分钟内访问过此页面
    const existingRecord = analytics[pageUrl].viewRecords.find(
      record => record.ip === ipAddress && record.timestamp > tenMinutesAgo
    );
    
    // 如果10分钟内没有访问记录，才增加访问量
    if (!existingRecord) {
      analytics[pageUrl].views++;
      
      // 记录本次访问
      analytics[pageUrl].viewRecords.push({
        ip: ipAddress,
        timestamp: now
      });
    }
    
    // 记录唯一访客（不受10分钟限制影响）
    if (visitorId && !analytics[pageUrl].uniqueVisitors.includes(visitorId)) {
      analytics[pageUrl].uniqueVisitors.push(visitorId);
    }
    
    await writeJSON(ANALYTICS_FILE, analytics);
    return {
      views: analytics[pageUrl].views,
      uniqueVisitors: analytics[pageUrl].uniqueVisitors.length,
      counted: !existingRecord // 表示本次访问是否被计数
    };
  },
  
  async getStats() {
    const analytics = await this.getAll();
    const totalViews = Object.values(analytics).reduce((sum, page) => sum + page.views, 0);
    const totalPages = Object.keys(analytics).length;
    const topPages = Object.entries(analytics)
      .map(([url, data]) => ({ url, views: data.views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
    
    return {
      totalViews,
      totalPages,
      topPages
    };
  }
};

module.exports = {
  commentsDb,
  likesDb,
  analyticsDb
};
