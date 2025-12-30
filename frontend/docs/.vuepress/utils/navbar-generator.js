import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 目录名称映射配置
const DIR_NAME_MAP = {
  'frontend': '前端技术',
  'backend': '后端技术',
  'server-ops': '服务器运维',
  'game-guide': '游戏攻略',
  'vue2': 'Vue 2',
  'vue3': 'Vue 3',
  'build-tools': '构建工具',
  'database': '数据库',
  'express': 'Node.js/Express',
  'java': 'Java',
  'docker': 'Docker',
  'jenkins': 'Jenkins',
  'linux': 'Linux',
  'nas': 'NAS',
}

// 图标配置
const DIR_ICON_MAP = {
  'frontend': 'code',
  'backend': 'server',
  'server-ops': 'cog',
  'game-guide': 'gamepad',
}

/**
 * 获取目录的显示名称
 * @param {string} dirName - 目录名称
 * @returns {string} 显示名称
 */
function getDisplayName(dirName) {
  return DIR_NAME_MAP[dirName] || dirName
}

/**
 * 读取目录结构并生成导航配置
 * @param {string} dirPath - 目录路径
 * @param {number} maxDepth - 最大深度,默认2层
 * @returns {Array} 子目录配置数组
 */
function generateNavbarFromDir(dirPath, maxDepth = 2, currentDepth = 0) {
  if (!fs.existsSync(dirPath) || currentDepth >= maxDepth) {
    return []
  }

  const items = fs.readdirSync(dirPath)
  const children = []

  items.forEach(item => {
    const fullPath = path.join(dirPath, item)
    const stat = fs.statSync(fullPath)

    // 只处理目录,忽略文件和隐藏目录
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'images') {
      const displayName = getDisplayName(item)
      const subChildren = generateNavbarFromDir(fullPath, maxDepth, currentDepth + 1)

      if (subChildren.length > 0) {
        // 如果有子目录,创建嵌套结构
        children.push({
          text: displayName,
          children: subChildren,
        })
      } else {
        // 如果没有子目录,直接链接到分类页面
        children.push({
          text: displayName,
          link: `/category/${item}/`,
        })
      }
    }
  })

  return children
}

/**
 * 生成导航栏配置
 * @returns {Array} 完整的导航栏配置
 */
export function generateNavbar() {
  const articlesPath = path.resolve(__dirname, '../../articles')
  
  // 固定的首页导航项
  const navbar = [
    {
      text: '首页',
      link: '/',
      icon: 'home',
    },
  ]

  if (!fs.existsSync(articlesPath)) {
    console.warn('Articles directory not found:', articlesPath)
    return navbar
  }

  // 读取 articles 目录下的一级分类
  const categories = fs.readdirSync(articlesPath)

  categories.forEach(category => {
    const categoryPath = path.join(articlesPath, category)
    const stat = fs.statSync(categoryPath)

    // 只处理目录
    if (stat.isDirectory() && !category.startsWith('.')) {
      const children = generateNavbarFromDir(categoryPath, 2, 0)
      const displayName = getDisplayName(category)
      const icon = DIR_ICON_MAP[category]

      if (children.length > 0) {
        // 有子目录,创建下拉菜单
        navbar.push({
          text: displayName,
          ...(icon && { icon }),
          children: children,
        })
      } else {
        // 没有子目录,直接链接
        navbar.push({
          text: displayName,
          ...(icon && { icon }),
          link: `/category/${category}/`,
        })
      }
    }
  })

  // 添加固定的"关于我"导航项
  navbar.push({
    text: '关于我',
    link: '/about/',
  })

  return navbar
}
