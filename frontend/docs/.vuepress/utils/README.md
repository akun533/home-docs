# 导航栏自动生成工具

## 功能说明

`navbar-generator.js` 会自动根据 `docs/articles/` 目录结构生成 VuePress 导航栏配置。

## 使用方法

在 `config.js` 中导入并使用:

```javascript
import { generateNavbar } from './utils/navbar-generator.js'

export default defineUserConfig({
  theme: hopeTheme({
    navbar: generateNavbar(),
    // ...其他配置
  }),
})
```

## 工作原理

1. **自动扫描**: 扫描 `docs/articles/` 目录下的所有子目录
2. **递归生成**: 支持两级子目录嵌套
3. **名称映射**: 通过 `DIR_NAME_MAP` 将目录名转换为中文显示名称
4. **图标配置**: 通过 `DIR_ICON_MAP` 为一级分类添加图标

## 目录结构示例

```
docs/articles/
├── frontend/           → "前端技术"
│   ├── vue2/           → "Vue 2"
│   ├── vue3/           → "Vue 3"
│   └── build-tools/    → "构建工具"
├── backend/            → "后端技术"
│   ├── express/        → "Node.js/Express"
│   ├── java/           → "Java"
│   └── database/       → "数据库"
└── server-ops/         → "服务器运维"
    ├── docker/         → "Docker"
    ├── linux/          → "Linux"
    └── jenkins/        → "Jenkins"
```

## 自定义配置

### 添加新的目录名称映射

在 `navbar-generator.js` 中修改 `DIR_NAME_MAP`:

```javascript
const DIR_NAME_MAP = {
  'frontend': '前端技术',
  'backend': '后端技术',
  'your-new-dir': '你的新分类',  // 添加新的映射
}
```

### 添加图标

在 `navbar-generator.js` 中修改 `DIR_ICON_MAP`:

```javascript
const DIR_ICON_MAP = {
  'frontend': 'code',
  'backend': 'server',
  'your-new-dir': 'icon-name',  // 添加新的图标
}
```

图标名称来自 FontAwesome。

## 固定导航项

- **首页**: 固定在第一个位置
- **关于我**: 固定在最后一个位置

其他导航项会根据 `articles` 目录自动生成。

## 注意事项

1. 新增目录后需要重启开发服务器才能生效
2. 目录名使用英文,通过 `DIR_NAME_MAP` 映射为中文
3. `images` 目录会被自动忽略
4. 以 `.` 开头的隐藏目录会被忽略
5. 最多支持 2 级嵌套(可修改 `maxDepth` 参数)
