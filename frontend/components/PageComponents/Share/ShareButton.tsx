import React from 'react';

interface ShareButtonProps {
  platform: string;
  url: string;
  icon: React.ReactNode;
}

const ShareButton: React.FC<ShareButtonProps> = ({ platform, url, icon }) => {
  const openPopup = (shareUrl: string, title: string) => {
    window.open(
      shareUrl,
      title,
      'width=600,height=400,scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no'
    );
  };

  return (
    <button
      className="flex items-center gap-2 text-blue-600 hover:underline"
      onClick={() => openPopup(url, `Share on ${platform}`)}
    >
      {icon}
      <span>{`Share on ${platform}`}</span>
    </button>
  );
};

export default ShareButton;
