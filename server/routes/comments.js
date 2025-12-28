const express = require('express');
const router = express.Router();
const { commentsDb } = require('../db');

// 获取指定页面的所有评论
router.get('/', async (req, res, next) => {
  try {
    const { pageUrl } = req.query;
    if (!pageUrl) {
      return res.status(400).json({ error: '缺少 pageUrl 参数' });
    }
    
    const comments = await commentsDb.getByPage(pageUrl);
    res.json({
      success: true,
      data: comments,
      count: comments.length
    });
  } catch (error) {
    next(error);
  }
});

// 发表新评论
router.post('/', async (req, res, next) => {
  try {
    const { pageUrl, content, author, email, website } = req.body;
    
    // 验证必填字段
    if (!pageUrl || !content || !author) {
      return res.status(400).json({ error: '缺少必填字段' });
    }
    
    // 验证内容长度
    if (content.length > 500) {
      return res.status(400).json({ error: '评论内容不能超过 500 字' });
    }
    
    const comment = await commentsDb.add({
      pageUrl,
      content: content.trim(),
      author: author.trim(),
      email: email?.trim(),
      website: website?.trim(),
      ip: req.ip || req.connection.remoteAddress
    });
    
    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
});

// 回复评论
router.post('/:commentId/reply', async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content, author, email } = req.body;
    
    if (!content || !author) {
      return res.status(400).json({ error: '缺少必填字段' });
    }
    
    const reply = await commentsDb.addReply(commentId, {
      content: content.trim(),
      author: author.trim(),
      email: email?.trim(),
      ip: req.ip || req.connection.remoteAddress
    });
    
    res.status(201).json({
      success: true,
      data: reply
    });
  } catch (error) {
    if (error.message === '评论不存在') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

// 删除评论（需要验证权限，这里简化处理）
router.delete('/:commentId', async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { adminKey } = req.headers;
    
    // 简单的管理员验证
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ error: '无权限删除' });
    }
    
    await commentsDb.delete(commentId);
    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    next(error);
  }
});

// 获取总评论数
router.get('/total', async (req, res, next) => {
  try {
    const allComments = await commentsDb.getAll();
    const totalComments = allComments.reduce((sum, comment) => {
      return sum + 1 + (comment.replies?.length || 0);
    }, 0);
    
    res.json({
      success: true,
      data: {
        totalComments
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
