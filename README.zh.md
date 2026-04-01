# nuxtblog-plugin-auto-excerpt

发布或修改文章时，自动从正文生成摘要。

[English](README.md)

## 功能

- 拦截 `filter:post.create` 和 `filter:post.update`
- 自动剥离 Markdown 语法和 HTML 标签，提取纯文本
- 按配置长度截断，末尾追加省略符

## 设置

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `mode` | select | `auto` | `auto` = 仅摘要为空时生成；`always` = 每次都覆盖 |
| `max_length` | number | `160` | 生成摘要的最大字符数 |
| `ellipsis` | string | `…` | 内容被截断时追加的省略符 |

## 示例

文章正文：

```markdown
## 简介

欢迎来到我的博客。今天我们来聊聊 **Go 并发**模式，
以及如何在实际项目中应用它们。
```

生成的摘要（max_length=40）：

```
简介 欢迎来到我的博客。今天我们来聊聊 Go 并发模式，以及如何在…
```

## 安装

```bash
pnpm install
pnpm build
zip plugin.zip package.json index.js
```

在管理后台 **插件 → 安装** 上传 ZIP 文件即可。
