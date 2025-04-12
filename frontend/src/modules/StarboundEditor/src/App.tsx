import React, { useState, useEffect } from 'react';
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
  const [htmlContent, setHtmlContent] = useState<string>(value);

  const handleToggleView = () => {
    setIsHtmlView(!isHtmlView);
  };

  const unescapeHtml = (escapedHtml: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = escapedHtml;
    return txt.value;
  };

  useEffect(() => {
    setHtmlContent(unescapeHtml(value));
  }, [value]);

  const handleHtmlChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlContent(event.target.value);
    onChange(event.target.value);
  };

  useEffect(() => {
    if (isHtmlView && value) {
      onChange(DOMPurify.sanitize(unescapeHtml(value)));
    }
  }, [isHtmlView, value, onChange]);

  const handleGetStyledTextHtml = (html: string) => {
    onChange(html);
  };

  return (
    <div className="starbound-editor">
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={handleToggleView}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 focus:outline-none focus:shadow-outline"
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
            className="w-full h-full resize-none border-none focus:outline-none"
            value={htmlContent}
            onChange={handleHtmlChange}
          />
        </div>
      ) : (
        <div className="h-96">
          {/* Tailwind CSS class for height */}
          <TextEditor content={htmlContent} getHtml={handleGetStyledTextHtml} />
        </div>
      )}
    </div>
  );
};

export default StarBoundTextEditor;
