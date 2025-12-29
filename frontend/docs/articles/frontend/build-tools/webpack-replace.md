---
title: Webpack 文件路径替换 方案
icon: docker
date: 2025-12-29
category:
  - 前端
  - Webpack
tag:
  - 前端
  - Webpack
  - build-tools
---

# NormalModuleReplacementPlugin 详解

**NormalModuleReplacementPlugin** 是 Webpack 提供的核心插件之一，用于实现模块路径的动态替换。通过正则表达式匹配开发者代码中的模块引用路径，实现：

- 跨环境配置切换
- 条件模块加载
- 模块路径重定向
- A/B 测试功能集成

## 基本用法

```javascript
new webpack.NormalModuleReplacementPlugin(resourceRegExp, newResource)
```

## 核心特性

### 1. 基本替换模式

```javascript
new webpack.NormalModuleReplacementPlugin(
  /原路径正则表达式/,
  '新路径' // 字符串或函数
)
```

### 2. 路径解析规则

- **相对路径**：以被替换模块为基准路径解析
- **绝对路径**：按 Webpack 解析规则处理
- **函数模式**：接收 resource 对象进行动态处理

### 3. 系统兼容性

- 自动处理 Windows/Mac 路径分隔符差异
- 推荐使用 `[\\/]` 通配符格式

## 典型应用场景

### 场景一：多环境配置

```javascript
// webpack.prod.js
const path = require('path');

module.exports = {
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /config\.development\.js$/,
      path.resolve(__dirname, 'config.production.js')
    )
  ]
};
```

### 场景二：动态版本控制

```javascript
// 动态替换版本号
new webpack.NormalModuleReplacementPlugin(
  /-v(\d+)/,
  (resource) => {
    const version = process.env.VERSION || '1.0.0';
    return `app/version-${version}.js`;
  }
)
```

### 场景三：条件功能模块

```javascript
// 根据环境启用/禁用调试模块
new webpack.NormalModuleReplacementPlugin(
  /^debug-module$/,
  (resource) => {
    return env.DEBUG ? 'modules/debug.js' : 'modules/noop.js';
  }
)
```

## 高级用法

### 1. 函数式替换

```javascript
new webpack.NormalModuleReplacementPlugin(
  /app\/config-/,
  (resource) => {
    const target = resource.request.replace(/^app\/config-/, '');
    return `app/config-${process.env.APP_TARGET}-${target}`;
  }
)
```

### 2. 完整资源对象操作

```javascript
plugin.apply(compiler) {
  compiler.hooks.normalModuleFactory.tap('NMRE', (nmf) => {
    nmf.hooks.resourceResolve.tap('NMRE-resolve', (resolveContext) => {
      // 获取完整请求路径
      const request = resolveContext.request;

      if (/^app\/config-/.test(request)) {
        const newRequest = request.replace(/^app\/config-/, `app/config-${process.env.TARGET}`);
        resolveContext.resolve(newRequest);
      }
    });
  });
}
```

### 3. 跨平台路径处理

```javascript
// Windows兼容写法
/new\/src\/environments\/environment\.ts$/

// 跨平台通用写法
/new[\\/]src[\\/]environments[\\/]environment\.ts$/
```

## 开发调试技巧

### 1. 验证替换是否生效

```bash
npx webpack --display-modules
```

检查输出模块树中是否存在预期的替换路径

### 2. 调试正则表达式

使用在线正则测试工具（如 regex101.com）验证匹配规则：

- 测试输入：`app/config-VERSION_A.js`
- 正确模式：`/^app\/config-.*\.js$/`

### 3. 环境变量注入

```json
// package.json
{
  "scripts": {
    "build:prod": "WEBPACK_ENV=production webpack",
    "build:test": "WEBPACK_ENV=test webpack"
  }
}
```

```javascript
// webpack.config.js
const env = process.env.WEBPACK_ENV || '';

new webpack.DefinePlugin({
  'process.env.APP_TARGET': JSON.stringify(env)
});
```

## 注意事项

### 匹配优先级

- 插件按照配置顺序执行
- 后配置的规则会覆盖先前的规则

### 路径解析机制

- 始终匹配原始请求路径（未解析的）
- 不影响 Webpack 的内部解析机制

### 缓存处理

- 修改规则后需清除缓存
- 建议添加 `--cache-dir=false` 进行测试

### 性能优化

- 复杂正则表达式可能导致构建性能下降
- 建议使用 include/exclude 限定作用范围

## 最佳实践

### 结构化配置方案

```javascript
// webpack.config.js
const environments = {
  development: {
    replacements: [
      { test: /config\.development/, replacement: 'config.development.js' }
    ]
  },
  production: {
    replacements: [
      {
        test: /config\.development/,
        replacement: (resource) => {
          const env = resource.getIssuer().request;
          return `config.${env.split('/')[3]}.js`;
        }
      }
    ]
  }
};

module.exports = (env) => {
  const config = environments[env];
  return {
    plugins: config.replacements.map(r =>
      new webpack.NormalModuleReplacementPlugin(r.test, r.replacement)
    )
  };
};
```

### 条件加载策略

```javascript
// 模块入口文件
import config from '@/config/config-${process.env.NODE_ENV}.js';

export default {
  ...config,
  runtime: {
    version: require('./version.json').version
  }
};
```

## 常见问题

### Q1: 如何替换动态生成的路径？

```javascript
// 使用函数处理动态路径
new webpack.NormalModuleReplacementPlugin(
  /^api\/(.*)$/,
  (resource) => {
    const endpoint = resource.request.replace(/^api\//, '');
    return `./services/${endpoint}.service.js`;
  }
)
```

### Q2: 替换后模块无法找到怎么办？

1. 检查正则表达式是否匹配正确请求路径
2. 确认新路径存在且符合 Webpack 解析规则
3. 使用 `--display-reasons` 查看模块解析过程

### Q3: 如何在 Windows 和 Mac 上保持正则兼容性？

```javascript
// 推荐使用通配符格式
/new[\\/]src[\\/]components[\\/]Button$/
```

通过合理使用 **NormalModuleReplacementPlugin**，开发者可以构建出高度可配置的 Webpack 构建流程，实现复杂的环境适配和模块策略管理。建议结合 DefinePlugin 和 EnvironmentPlugin 使用，获得更完整的构建控制能力。