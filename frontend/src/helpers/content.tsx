import React from 'react';
import DOMPurify from 'dompurify';

interface HtmlContentProps {
  htmlContent: string;
}

const HtmlContent: React.FC<HtmlContentProps> = ({ htmlContent }) => {
  // Unescape the HTML content
  const unescapeHtml = (escapedHtml: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = escapedHtml;
    return txt.value;
  };

  // Sanitize the HTML content to ensure proper nesting
  const sanitizeHtml = (rawHtml: string) => {
    // Use DOMPurify to sanitize the HTML content
    return DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
  };

  // Use the unescaped and sanitized description content
  const rawDescription = sanitizeHtml(unescapeHtml(htmlContent));

  return (
    <span
      dangerouslySetInnerHTML={{
        __html: rawDescription, // Inject the raw HTML
      }}
    />
  );
};

export default HtmlContent;
