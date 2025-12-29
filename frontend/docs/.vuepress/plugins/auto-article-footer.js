export default {
  name: 'auto-article-footer',
  
  extendsPage: (page) => {
    // 只处理 articles 目录下的页面
    if (page.path && page.path.includes('/articles/') && !page.path.endsWith('/')) {
      // 排除目录页
      if (!page.path.endsWith('README/') && page.filePathRelative) {
        // 在页面内容末尾添加组件
        const originalContent = page.content || '';
        page.content = originalContent + '\n\n<ArticleFooter />\n';
      }
    }
  }
}
