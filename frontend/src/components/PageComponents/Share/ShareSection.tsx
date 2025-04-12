import React from 'react';
import ShareButton from './ShareButton';
import FaceBookIcon from '../../UI/Icons/FaceBook';
import GoogleIcon from '../../UI/Icons/Google';
import { Product } from '../../../types/types';

interface ShareSectionProps {
  product: Product;
}

const ShareSection: React.FC<ShareSectionProps> = ({ product }) => {
  const currentUrl = `${window.location.origin}/product/${product.id}`;

  return (
    <div className="share-section mt-4">
      <p className="text-sm text-gray-600 mb-2">Share this product:</p>

      <div className="flex gap-4">
        {/* Facebook */}
        <ShareButton
          platform="Facebook"
          url={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            currentUrl
          )}`}
          icon={<FaceBookIcon className="w-5 h-5" />}
        />

        {/* Twitter */}
        <ShareButton
          platform="Twitter"
          url={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `Check out this product: ${product.title}`
          )}&url=${encodeURIComponent(currentUrl)}`}
          icon={<GoogleIcon className="w-5 h-5" />}
        />
      </div>
    </div>
  );
};

export default ShareSection;
