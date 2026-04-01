# nuxtblog-plugin-auto-excerpt

Automatically generates a post excerpt from the body content when the excerpt field is empty.

[中文文档](README.zh.md)

## What it does

- Intercepts `filter:post.create` and `filter:post.update`
- Strips Markdown syntax and HTML tags from the content
- Truncates to the configured max length and appends an ellipsis

## Settings

| Key | Type | Default | Description |
|---|---|---|---|
| `mode` | select | `auto` | `auto` = only fill when excerpt is empty; `always` = overwrite every time |
| `max_length` | number | `160` | Maximum characters in the generated excerpt |
| `ellipsis` | string | `…` | String appended when the content is truncated |

## Example

Given a post with this content:

```markdown
## Introduction

Welcome to my blog. Today we'll explore **Go concurrency** patterns
and how to apply them in real-world services.
```

The generated excerpt (max_length=80):

```
Introduction Welcome to my blog. Today we'll explore Go concurrency patterns and…
```

## Installation

Build and package:

```bash
pnpm install
pnpm build
zip plugin.zip package.json index.js
```

Then upload the ZIP in the admin panel under **Plugins → Install**.
