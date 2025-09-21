'use client'

import { useMemo } from 'react'
import DOMPurify from 'isomorphic-dompurify'
import { cn } from '@/lib/utils'

interface HtmlRendererProps {
  html: string
  className?: string
  allowedTags?: string[]
  allowedAttributes?: Record<string, string[]>
}

export function HtmlRenderer({
  html,
  className,
  allowedTags = [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 's',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'code', 'pre',
    'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span'
  ],
  allowedAttributes = {
    'a': ['href', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height', 'class'],
    'table': ['class', 'style'],
    'th': ['class', 'style', 'colspan', 'rowspan'],
    'td': ['class', 'style', 'colspan', 'rowspan'],
    'div': ['class', 'style'],
    'span': ['class', 'style'],
    '*': ['class', 'style', 'align']
  }
}: HtmlRendererProps) {
  const sanitizedHtml = useMemo(() => {
    // Convert allowedAttributes object to flat array of attributes
    const allowedAttrArray = Array.from(new Set(
      Object.values(allowedAttributes).flat()
    ))

    // Configure DOMPurify
    const config = {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttrArray,
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onkeydown', 'onkeyup', 'onkeypress']
    }

    return DOMPurify.sanitize(html, config)
  }, [html, allowedTags, allowedAttributes])

  if (!sanitizedHtml || sanitizedHtml.trim() === '<p></p>' || sanitizedHtml.trim() === '') {
    return (
      <div className={cn('text-gray-500 italic', className)}>
        No content available
      </div>
    )
  }

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:font-semibold prose-headings:text-gray-900 prose-headings:mb-2',
        'prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-3',
        'prose-strong:text-gray-900 prose-strong:font-semibold',
        'prose-em:text-gray-700 prose-em:italic',
        'prose-u:underline',
        'prose-s:line-through',
        'prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono',
        'prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:rounded prose-pre:p-3 prose-pre:overflow-x-auto',
        'prose-blockquote:border-l-4 prose-blockquote:border-blue-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-blue-50 prose-blockquote:py-2',
        'prose-ul:list-disc prose-ul:ml-4 prose-ul:mb-3',
        'prose-ol:list-decimal prose-ol:ml-4 prose-ol:mb-3',
        'prose-li:text-gray-700 prose-li:mb-1',
        'prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 prose-a:cursor-pointer',
        'prose-img:rounded-lg prose-img:shadow-sm prose-img:max-w-full prose-img:h-auto',
        'prose-table:border-collapse prose-table:border prose-table:border-gray-300 prose-table:w-full prose-table:mb-3',
        'prose-thead:bg-gray-50',
        'prose-th:border prose-th:border-gray-300 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold',
        'prose-td:border prose-td:border-gray-300 prose-td:px-3 prose-td:py-2 prose-td:text-gray-700',
        'prose-tr:hover:bg-gray-50',
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}

// Specialized component for job descriptions
export function JobDescriptionRenderer({ html, className }: { html: string; className?: string }) {
  return (
    <HtmlRenderer
      html={html}
      className={className}
      allowedTags={[
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 's',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'code', 'pre',
        'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span'
      ]}
      allowedAttributes={{
        'a': ['href', 'target', 'rel'],
        'table': ['class'],
        'th': ['class', 'colspan', 'rowspan'],
        'td': ['class', 'colspan', 'rowspan'],
        'div': ['class'],
        'span': ['class'],
        '*': ['class', 'align']
      }}
    />
  )
}

// Specialized component for requirements and responsibilities
export function JobRequirementsRenderer({ html, className }: { html: string; className?: string }) {
  return (
    <HtmlRenderer
      html={html}
      className={className}
      allowedTags={[
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 's',
        'ul', 'ol', 'li',
        'blockquote', 'code',
        'div', 'span'
      ]}
      allowedAttributes={{
        'div': ['class'],
        'span': ['class'],
        '*': ['class']
      }}
    />
  )
}