import React from 'react';
import DOMPurify from 'dompurify';

interface HtmlContentProps {
  htmlContent: string;
  maxLength?: number;
  showReadMore?: boolean;
  readMoreText?: string;
  readLessText?: string;
  className?: string;
}

const HtmlContent: React.FC<HtmlContentProps> = ({
  htmlContent,
  maxLength,
  showReadMore = false,
  readMoreText = 'Read more',
  readLessText = 'Read less',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!htmlContent) {
    return null;
  }

  // Strip HTML tags for length calculation
  const stripHtml = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const plainText = stripHtml(htmlContent);
  const shouldTruncate = maxLength && plainText.length > maxLength;

  // Create excerpt
  const createExcerpt = (html: string, length: number): string => {
    const plainText = stripHtml(html);
    if (plainText.length <= length) return html;

    // Find a good breaking point (end of sentence, word, etc.)
    const truncated = plainText.substring(0, length);
    const lastSpace = truncated.lastIndexOf(' ');
    const lastPeriod = truncated.lastIndexOf('.');
    const lastExclamation = truncated.lastIndexOf('!');
    const lastQuestion = truncated.lastIndexOf('?');

    // Use the last sentence ending if it's close enough, otherwise use last space
    const breakPoints = [lastPeriod, lastExclamation, lastQuestion];
    const bestBreakPoint = Math.max(...breakPoints);

    let cutPoint: number;
    if (bestBreakPoint > length * 0.7) {
      cutPoint = bestBreakPoint + 1;
    } else if (lastSpace > length * 0.7) {
      cutPoint = lastSpace;
    } else {
      cutPoint = length;
    }

    const excerptText = plainText.substring(0, cutPoint).trim();

    // Convert back to HTML while preserving structure
    // This is a simple approach - for complex HTML, you might need a more sophisticated solution
    if (html.includes('<')) {
      // If original has HTML tags, try to preserve simple formatting
      const words = excerptText.split(' ');
      const originalWords = stripHtml(html).split(' ');

      if (words.length < originalWords.length) {
        // Create a simple HTML excerpt
        return `<span>${excerptText}...</span>`;
      }
    }

    return excerptText + '...';
  };

  let displayContent = htmlContent;

  if (shouldTruncate && !isExpanded) {
    displayContent = createExcerpt(htmlContent, maxLength!);
  }

  // Sanitize the HTML content
  const sanitizedContent = DOMPurify.sanitize(displayContent, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      'span',
      'div',
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
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={className}>
      <div
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        className="prose prose-sm max-w-none"
      />
      {shouldTruncate && showReadMore && (
        <button
          onClick={toggleExpanded}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1 underline"
        >
          {isExpanded ? readLessText : readMoreText}
        </button>
      )}
    </div>
  );
};

export default HtmlContent;
