const { Pool } = require('pg');

// PostgreSQL 连接池配置
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'homedocs',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // 连接池最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 数据库初始化 - 创建所需表
async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔍 检查数据库连接...');
    
    // 测试数据库连接
    await client.query('SELECT NOW()');
    console.log('✅ 数据库连接成功');
    
    // 创建评论表
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id BIGSERIAL PRIMARY KEY,
        page_url VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        website VARCHAR(200),
        ip VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        parent_id BIGINT REFERENCES comments(id) ON DELETE CASCADE
      )
    `);
    
    // 创建评论表索引
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_comments_page_url ON comments(page_url)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id)
    `);
    console.log('✅ 评论表检查/创建完成');
    
    // 创建点赞表
    await client.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id BIGSERIAL PRIMARY KEY,
        page_url VARCHAR(500) NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(page_url, user_id)
      )
    `);
    
    // 创建点赞表索引
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_likes_page_url ON likes(page_url)
    `);
    console.log('✅ 点赞表检查/创建完成');
    
    // 创建访问记录表
    await client.query(`
      CREATE TABLE IF NOT EXISTS page_views (
        id BIGSERIAL PRIMARY KEY,
        page_url VARCHAR(500) NOT NULL,
        visitor_id VARCHAR(100),
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建访问记录表索引
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_page_views_page_url ON page_views(page_url)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_page_views_ip_created ON page_views(ip_address, created_at)
    `);
    console.log('✅ 访问记录表检查/创建完成');
    
    console.log('🎉 数据库初始化完成');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// 评论数据库操作
const commentsDb = {
  async getAll() {
    const result = await pool.query(
      'SELECT * FROM comments WHERE parent_id IS NULL ORDER BY created_at DESC'
    );
    
    // 获取所有回复
    const comments = [];
    for (const comment of result.rows) {
      const replies = await pool.query(
        'SELECT * FROM comments WHERE parent_id = $1 ORDER BY created_at ASC',
        [comment.id]
      );
      comments.push({
        id: comment.id.toString(),
        pageUrl: comment.page_url,
        content: comment.content,
        author: comment.author,
        email: comment.email,
        website: comment.website,
        ip: comment.ip,
        createdAt: comment.created_at,
        replies: replies.rows.map(r => ({
          id: r.id.toString(),
          content: r.content,
          author: r.author,
          email: r.email,
          createdAt: r.created_at
        }))
      });
    }
    return comments;
  },
  
  async getByPage(pageUrl) {
    const result = await pool.query(
      'SELECT * FROM comments WHERE page_url = $1 AND parent_id IS NULL ORDER BY created_at DESC',
      [pageUrl]
    );
    
    const comments = [];
    for (const comment of result.rows) {
      const replies = await pool.query(
        'SELECT * FROM comments WHERE parent_id = $1 ORDER BY created_at ASC',
        [comment.id]
      );
      comments.push({
        id: comment.id.toString(),
        pageUrl: comment.page_url,
        content: comment.content,
        author: comment.author,
        email: comment.email,
        website: comment.website,
        ip: comment.ip,
        createdAt: comment.created_at,
        replies: replies.rows.map(r => ({
          id: r.id.toString(),
          content: r.content,
          author: r.author,
          email: r.email,
          createdAt: r.created_at
        }))
      });
    }
    return comments;
  },
  
  async add(comment) {
    const result = await pool.query(
      `INSERT INTO comments (page_url, content, author, email, website, ip)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [comment.pageUrl, comment.content, comment.author, comment.email, comment.website, comment.ip]
    );
    
    const newComment = result.rows[0];
    return {
      id: newComment.id.toString(),
      pageUrl: newComment.page_url,
      content: newComment.content,
      author: newComment.author,
      email: newComment.email,
      website: newComment.website,
      ip: newComment.ip,
      createdAt: newComment.created_at,
      replies: []
    };
  },
  
  async addReply(commentId, reply) {
    // 检查父评论是否存在
    const parentCheck = await pool.query(
      'SELECT id, page_url FROM comments WHERE id = $1',
      [commentId]
    );
    
    if (parentCheck.rows.length === 0) {
      throw new Error('评论不存在');
    }
    
    const parentComment = parentCheck.rows[0];
    const result = await pool.query(
      `INSERT INTO comments (page_url, content, author, email, ip, parent_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [parentComment.page_url, reply.content, reply.author, reply.email, reply.ip, commentId]
    );
    
    const newReply = result.rows[0];
    return {
      id: newReply.id.toString(),
      content: newReply.content,
      author: newReply.author,
      email: newReply.email,
      createdAt: newReply.created_at
    };
  },
  
  async delete(commentId) {
    await pool.query(
      'DELETE FROM comments WHERE id = $1',
      [commentId]
    );
  }
};

// 点赞数据库操作
const likesDb = {
  async getAll() {
    const result = await pool.query(
      'SELECT page_url, COUNT(*) as count FROM likes GROUP BY page_url'
    );
    
    const likes = {};
    for (const row of result.rows) {
      const users = await pool.query(
        'SELECT user_id FROM likes WHERE page_url = $1',
        [row.page_url]
      );
      likes[row.page_url] = {
        count: parseInt(row.count),
        users: users.rows.map(u => u.user_id)
      };
    }
    return likes;
  },
  
  async getByPage(pageUrl) {
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM likes WHERE page_url = $1',
      [pageUrl]
    );
    
    const usersResult = await pool.query(
      'SELECT user_id FROM likes WHERE page_url = $1',
      [pageUrl]
    );
    
    return {
      count: parseInt(countResult.rows[0].count),
      users: usersResult.rows.map(r => r.user_id)
    };
  },
  
  async toggle(pageUrl, userId) {
    const existing = await pool.query(
      'SELECT id FROM likes WHERE page_url = $1 AND user_id = $2',
      [pageUrl, userId]
    );
    
    if (existing.rows.length > 0) {
      // 取消点赞
      await pool.query(
        'DELETE FROM likes WHERE page_url = $1 AND user_id = $2',
        [pageUrl, userId]
      );
    } else {
      // 点赞
      await pool.query(
        'INSERT INTO likes (page_url, user_id) VALUES ($1, $2)',
        [pageUrl, userId]
      );
    }
    
    return await this.getByPage(pageUrl);
  }
};

// 访问量数据库操作
const analyticsDb = {
  async getAll() {
    const result = await pool.query(`
      SELECT 
        page_url,
        COUNT(*) as views,
        COUNT(DISTINCT visitor_id) FILTER (WHERE visitor_id IS NOT NULL) as unique_visitors
      FROM page_views
      GROUP BY page_url
    `);
    
    const analytics = {};
    for (const row of result.rows) {
      analytics[row.page_url] = {
        views: parseInt(row.views),
        uniqueVisitors: parseInt(row.unique_visitors || 0)
      };
    }
    return analytics;
  },
  
  async getByPage(pageUrl) {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as views,
        COUNT(DISTINCT visitor_id) FILTER (WHERE visitor_id IS NOT NULL) as unique_visitors
      FROM page_views
      WHERE page_url = $1
    `, [pageUrl]);
    
    const row = result.rows[0] || { views: 0, unique_visitors: 0 };
    return {
      views: parseInt(row.views),
      uniqueVisitors: parseInt(row.unique_visitors || 0)
    };
  },
  
  async incrementView(pageUrl, visitorId, ipAddress) {
    // 检查该IP是否在10分钟内访问过此页面
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const existingView = await pool.query(
      `SELECT id FROM page_views 
       WHERE page_url = $1 AND ip_address = $2 AND created_at > $3
       LIMIT 1`,
      [pageUrl, ipAddress, tenMinutesAgo]
    );
    
    let counted = false;
    
    // 如果10分钟内没有访问记录，才增加访问量
    if (existingView.rows.length === 0) {
      await pool.query(
        'INSERT INTO page_views (page_url, visitor_id, ip_address) VALUES ($1, $2, $3)',
        [pageUrl, visitorId, ipAddress]
      );
      counted = true;
    }
    
    // 定期清理超过30天的旧记录（性能优化）
    if (Math.random() < 0.01) { // 1%的概率执行清理
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      await pool.query(
        'DELETE FROM page_views WHERE created_at < $1',
        [thirtyDaysAgo]
      );
    }
    
    const stats = await this.getByPage(pageUrl);
    return {
      views: stats.views,
      uniqueVisitors: stats.uniqueVisitors,
      counted
    };
  },
  
  async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(DISTINCT page_url) as total_pages,
        COUNT(*) as total_views
      FROM page_views
    `);
    
    const topPagesResult = await pool.query(`
      SELECT page_url, COUNT(*) as views
      FROM page_views
      GROUP BY page_url
      ORDER BY views DESC
      LIMIT 10
    `);
    
    const row = result.rows[0];
    return {
      totalViews: parseInt(row.total_views),
      totalPages: parseInt(row.total_pages),
      topPages: topPagesResult.rows.map(r => ({
        url: r.page_url,
        views: parseInt(r.views)
      }))
    };
  }
};

module.exports = {
  pool,
  initDatabase,
  commentsDb,
  likesDb,
  analyticsDb
};
