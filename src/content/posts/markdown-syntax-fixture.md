---
title: "Markdown Syntax Fixture"
date: "2026-04-25"
category: "Test Fixtures"
tags: ["Markdown", "Fixture", "中文"]
excerpt: "Covers the Markdown syntax supported by the blog renderer."
draft: true
---

# Markdown 功能测试

这是一个包含 **粗体**、*斜体*、~~删除线~~、`inline code` 和中文文本的段落。

## Lists

- unordered item
  - nested unordered item
- another unordered item

1. ordered item
   1. nested ordered item
2. second ordered item

## Task List

- [x] completed task
- [ ] pending task

## Quote

> A blockquote with **strong text**.

## Code

```ts
const message = 'hello markdown';
console.log(message);
```

## Links And Images

[Local link](/blog) and [External link](https://example.com).

![Sample image](/logo.svg)

## Table

| Feature | Status |
| --- | --- |
| Tables | supported |
| 中文 | 支持 |
