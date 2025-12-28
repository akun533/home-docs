const express = require('express');
const router = express.Router();
const { likesDb } = require('../db');

// 获取指定页面的点赞数据
router.get('/', async (req, res, next) => {
  try {
    const { pageUrl } = req.query;
    if (!pageUrl) {
      return res.status(400).json({ error: '缺少 pageUrl 参数' });
    }
    
    const likes = await likesDb.getByPage(pageUrl);
    res.json({
      success: true,
      data: {
        count: likes.count,
        hasLiked: false // 前端需要传递 userId 来判断
      }
    });
  } catch (error) {
    next(error);
  }
});

// 切换点赞状态（点赞/取消点赞）
router.post('/toggle', async (req, res, next) => {
  try {
    const { pageUrl, userId } = req.body;
    
    if (!pageUrl || !userId) {
      return res.status(400).json({ error: '缺少必填字段' });
    }
    
    const result = await likesDb.toggle(pageUrl, userId);
    
    res.json({
      success: true,
      data: {
        count: result.count,
        hasLiked: result.users.includes(userId)
      }
    });
  } catch (error) {
    next(error);
  }
});

// 检查用户是否已点赞
router.get('/check', async (req, res, next) => {
  try {
    const { pageUrl, userId } = req.query;
    
    if (!pageUrl || !userId) {
      return res.status(400).json({ error: '缺少参数' });
    }
    
    const likes = await likesDb.getByPage(pageUrl);
    
    res.json({
      success: true,
      data: {
        count: likes.count,
        hasLiked: likes.users.includes(userId)
      }
    });
  } catch (error) {
    next(error);
  }
});

// 获取总点赞数
router.get('/total', async (req, res, next) => {
  try {
    const allLikes = await likesDb.getAll();
    const totalLikes = Object.values(allLikes).reduce((sum, page) => sum + (page.count || 0), 0);
    
    res.json({
      success: true,
      data: {
        totalLikes
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
