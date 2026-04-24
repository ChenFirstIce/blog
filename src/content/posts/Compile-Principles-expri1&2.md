---
title: 编译原理实验1&2
date: 2026-04-23
category: 编译原理
tags: ["Course", "Notes", "Test"]
excerpt: 从编译原理实验1&2学会Flex——神游版——梦到哪里说哪里
draft: true
---
# Lex
## 文件结构

```lex
第一部分：定义区
1.{%C语言定义%}
2.正规式定义
3.状态定义
%%
第二部分：规则区
%%
第三部分：C辅助函数区
```
- 第一部分
## 状态

最

```Lex
<INITIAL>"//".*               {;}
<INITIAL>"/*"                 {BEGIN COMMENT;}  
<COMMENT>"*/"                 {BEGIN INITIAL;}
<COMMENT>.|\n                 {;}
```


![[Pasted image 20260423113707.png]]死活不能分出STRING来
