import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { TextEditor } from './TextEditor';
import './starbound-editor.scss';

interface StarBoundTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const StarBoundTextEditor: React.FC<StarBoundTextEditorProps> = ({
  value,
  onChange,
}) => {
  const [isHtmlView, setIsHtmlView] = useState<boolean>(false);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isClient, setIsClient] = useState<boolean>(false);
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
    setIsEditorReady(true);
  }, []);

  // Safe HTML unescaping that works both client and server side
  const unescapeHtml = useCallback((escapedHtml: string) => {
    if (typeof window === 'undefined') {
      // Server-side fallback
      return escapedHtml
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'");
    }

    try {
      const txt = document.createElement('textarea');
      txt.innerHTML = escapedHtml;
      return txt.value;
    } catch (error) {
      console.warn('HTML unescaping failed:', error);
      return escapedHtml;
    }
  }, []);

  // Memoized sanitization
  const sanitizeHtml = useCallback((html: string) => {
    if (typeof window === 'undefined') {
      return html; // Skip sanitization on server
    }

    try {
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'p',
          'br',
          'strong',
          'em',
          'u',
          's',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'ul',
          'ol',
          'li',
          'blockquote',
          'a',
          'img',
          'table',
          'thead',
          'tbody',
          'tr',
          'td',
          'th',
          'div',
          'span',
          'pre',
          'code',
        ],
        ALLOWED_ATTR: [
          'href',
          'src',
          'alt',
          'title',
          'class',
          'id',
          'target',
          'rel',
          'style',
          'width',
          'height',
        ],
      });
    } catch (error) {
      console.warn('HTML sanitization failed:', error);
      return html;
    }
  }, []);

  // Initialize content when component mounts or value changes
  useEffect(() => {
    if (isClient && value !== undefined) {
      const unescapedValue = unescapeHtml(value || '');
      setHtmlContent(unescapedValue);
    }
  }, [value, isClient, unescapeHtml]);

  const handleToggleView = useCallback(() => {
    if (isHtmlView) {
      // Switching from HTML to Rich Text - sanitize the content
      const sanitizedContent = sanitizeHtml(htmlContent);
      if (sanitizedContent !== htmlContent) {
        setHtmlContent(sanitizedContent);
        onChange(sanitizedContent);
      }
    }
    setIsHtmlView(!isHtmlView);
  }, [isHtmlView, htmlContent, sanitizeHtml, onChange]);

  const handleHtmlChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      setHtmlContent(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  const handleGetStyledTextHtml = useCallback(
    (html: string) => {
      const sanitizedHtml = sanitizeHtml(html);
      setHtmlContent(sanitizedHtml);
      onChange(sanitizedHtml);
    },
    [sanitizeHtml, onChange]
  );

  // Loading state for SSR
  if (!isClient || !isEditorReady) {
    return (
      <div className="starbound-editor">
        <div
          className="border border-gray-300 rounded p-4 bg-gray-50"
          style={{ height: '500px' }}
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading editor...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="starbound-editor">
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={handleToggleView}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
          disabled={!isEditorReady}
        >
          {isHtmlView ? 'Switch to Rich Text Editor' : 'Switch to HTML View'}
        </button>
      </div>

      {isHtmlView ? (
        <div
          className="border border-gray-300 rounded p-2 bg-white"
          style={{ height: '500px' }}
        >
          <textarea
            className="w-full h-full resize-none border-none focus:outline-none font-mono text-sm"
            value={htmlContent}
            onChange={handleHtmlChange}
            placeholder="Enter HTML content..."
          />
        </div>
      ) : (
        <div className="h-96 border border-gray-300 rounded">
          <TextEditor
            key={`editor-${isEditorReady}-${htmlContent}`}
            content={htmlContent}
            getHtml={handleGetStyledTextHtml}
          />
        </div>
      )}
    </div>
  );
};

export default StarBoundTextEditor;
