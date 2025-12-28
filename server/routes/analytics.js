const express = require('express');
const router = express.Router();
const { analyticsDb } = require('../db');

// 记录页面访问
router.post('/view', async (req, res, next) => {
  try {
    const { pageUrl, visitorId } = req.body;
    
    if (!pageUrl) {
      return res.status(400).json({ error: '缺少 pageUrl 参数' });
    }
    
    // 获取真实IP地址（考虑代理情况）
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                      req.headers['x-real-ip'] ||
                      req.socket.remoteAddress ||
                      req.ip;
    
    const result = await analyticsDb.incrementView(pageUrl, visitorId, ipAddress);
    
    res.json({
      success: true,
      data: {
        views: result.views,
        uniqueVisitors: result.uniqueVisitors,
        counted: result.counted // 返回是否被计数
      }
    });
  } catch (error) {
    next(error);
  }
});

// 获取指定页面的访问数据
router.get('/page', async (req, res, next) => {
  try {
    const { pageUrl } = req.query;
    
    if (!pageUrl) {
      return res.status(400).json({ error: '缺少 pageUrl 参数' });
    }
    
    const result = await analyticsDb.getByPage(pageUrl);
    
    res.json({
      success: true,
      data: {
        views: result.views,
        uniqueVisitors: result.uniqueVisitors?.length || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// 获取整站统计数据
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await analyticsDb.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
