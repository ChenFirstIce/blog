import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Components } from 'react-markdown';
import { getUniqueHeadingId } from '../lib/headings';
import 'katex/dist/katex.min.css';

const isExternalHref = (href: string) => /^(https?:)?\/\//i.test(href);
const obsidianHighlightClasses = [
  'hltr-red',
  'hltr-orange',
  'hltr-yellow',
  'hltr-green',
  'hltr-blue',
  'hltr-purple',
  'hltr-pink',
];

const markdownSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'mark'],
  attributes: {
    ...defaultSchema.attributes,
    mark: [
      ...(defaultSchema.attributes?.mark ?? []),
      'style',
      ['className', ...obsidianHighlightClasses],
    ],
  },
};

const getNodeText = (node: any): string => {
  if (!node) return '';
  if (node.type === 'text') return node.value ?? '';
  if (!Array.isArray(node.children)) return '';
  return node.children.map(getNodeText).join('');
};

const getCodeLanguage = (className = ''): string => {
  const languageClass = className.split(/\s+/).find((name) => name.startsWith('language-'));
  return languageClass?.replace(/^language-/, '') || 'code';
};

const rehypeTerminalHeadings = () => (tree: any) => {
  const counts = new Map<string, number>();

  const visit = (node: any) => {
    if (node?.type === 'element' && /^h[1-6]$/.test(node.tagName)) {
      const id = getUniqueHeadingId(getNodeText(node), counts);
      node.properties = { ...node.properties, id };
      node.children = [
        ...(node.children ?? []),
        {
          type: 'element',
          tagName: 'a',
          properties: {
            href: `#${id}`,
            className: ['markdown-heading-anchor'],
            ariaLabel: 'Link to heading',
            title: 'Link to heading',
          },
          children: [],
        },
      ];
    }

    if (Array.isArray(node?.children)) {
      node.children.forEach(visit);
    }
  };

  visit(tree);
};

const MarkdownComponents: Components = {
  h1: ({ children, node: _node, ...props }) => <h1 className="scroll-mt-24" {...props}>{children}</h1>,
  h2: ({ children, node: _node, ...props }) => <h2 className="scroll-mt-24" {...props}>{children}</h2>,
  h3: ({ children, node: _node, ...props }) => <h3 className="scroll-mt-24" {...props}>{children}</h3>,
  h4: ({ children, node: _node, ...props }) => <h4 className="scroll-mt-24" {...props}>{children}</h4>,
  h5: ({ children, node: _node, ...props }) => <h5 className="scroll-mt-24" {...props}>{children}</h5>,
  h6: ({ children, node: _node, ...props }) => <h6 className="scroll-mt-24" {...props}>{children}</h6>,
  a: ({ href = '', children, node: _node, ...props }) => {
    const external = isExternalHref(href);

    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
      </a>
    );
  },
  table: ({ children }) => (
    <div className="markdown-table-wrap">
      <table>{children}</table>
    </div>
  ),
  pre: ({ children, node: _node, ...props }) => {
    const child = React.isValidElement<{ className?: string }>(children) ? children : undefined;
    const language = getCodeLanguage(child?.props.className);

    return (
      <div className="markdown-code-frame">
        <div className="markdown-code-toolbar" aria-hidden="true">
          <span className="markdown-code-controls">
            <span />
            <span />
            <span />
          </span>
          <span className="markdown-code-language">{language}</span>
        </div>
        <pre {...props}>{children}</pre>
      </div>
    );
  },
  code: ({ children, className, node: _node, ...props }) => (
    <code className={className} {...props}>
      {children}
    </code>
  ),
  img: ({ src, alt, node: _node, ...props }) => (
    <span className="markdown-image">
      <img
        src={src}
        alt={alt ?? ''}
        referrerPolicy="no-referrer"
        {...props}
      />
      {alt && <span className="markdown-image-caption">{alt}</span>}
    </span>
  ),
};

export const MarkdownRenderer: React.FC<{ children: string }> = ({ children }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm, remarkMath]}
    rehypePlugins={[
      rehypeRaw,
      [rehypeSanitize, markdownSanitizeSchema],
      [rehypeKatex, { throwOnError: false, strict: false }],
      rehypeHighlight,
      rehypeTerminalHeadings,
    ]}
    components={MarkdownComponents}
  >
    {children}
  </ReactMarkdown>
);
