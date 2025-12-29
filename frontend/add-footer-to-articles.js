const fs = require('fs');
const path = require('path');

// 文章目录
const articlesDir = path.join(__dirname, 'docs/articles');

// 递归遍历目录
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 递归处理子目录
      walkDir(filePath);
    } else if (file.endsWith('.md') && file !== 'README.md') {
      // 处理 markdown 文件（排除 README.md）
      addFooterToFile(filePath);
    }
  });
}

function addFooterToFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 检查是否已经有 ArticleFooter
  if (content.includes('<ArticleFooter')) {
    console.log(`跳过 (已存在): ${filePath}`);
    return;
  }
  
  // 检查是否已经有旧的组件
  if (content.includes('<PageViews') || content.includes('<LikeButton') || content.includes('<CommentSection')) {
    console.log(`清理旧组件: ${filePath}`);
    // 移除旧的组件标签
    content = content.replace(/<!--\s*访问量统计\s*-->[\s\S]*?<PageViews\s*\/>/g, '');
    content = content.replace(/<!--\s*点赞按钮\s*-->[\s\S]*?<LikeButton\s*\/>/g, '');
    content = content.replace(/<!--\s*评论区\s*-->[\s\S]*?<CommentSection\s*\/>/g, '');
    content = content.replace(/<PageViews\s*\/>/g, '');
    content = content.replace(/<LikeButton\s*\/>/g, '');
    content = content.replace(/<CommentSection\s*\/>/g, '');
  }
  
  // 在文件末尾添加 ArticleFooter
  content = content.trimEnd() + '\n\n<ArticleFooter />\n';
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ 已添加: ${filePath}`);
}

console.log('开始批量添加 ArticleFooter 组件...\n');
walkDir(articlesDir);
console.log('\n✨ 完成！');
