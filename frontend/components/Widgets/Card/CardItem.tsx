import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CardItemProps {
  path: string;
  label: string;
  src: string | string[];
  text: React.ReactNode;
}

const CardItem: React.FC<CardItemProps> = ({ path, label, src, text }) => {
  const renderImages = (src: string | string[]) => {
    if (Array.isArray(src)) {
      return src.map((image_url, index) => (
        <Image
          key={index}
          src={image_url}
          alt="Travel destination"
          fill
          className="object-cover transition-transform duration-200 hover:scale-110"
        />
      ));
    } else {
      return (
        <Image
          src={src}
          alt="Travel destination"
          fill
          className="object-cover transition-transform duration-200 hover:scale-110"
        />
      );
    }
  };

  return (
    <li className="flex flex-1 m-4 rounded-lg shadow-lg overflow-hidden">
      <Link href={path} className="flex flex-col w-full no-underline">
        <figure
          data-category={label}
          className="relative w-full pt-[67%] overflow-hidden"
        >
          {renderImages(src)}
          <figcaption className="absolute bottom-0 left-0 ml-2 mb-2 px-2 py-1 bg-blue-500 text-white text-xs font-bold">
            {label}
          </figcaption>
        </figure>
        <div className="p-5">
          <h5 className="text-gray-900 text-lg leading-6">{text}</h5>
        </div>
      </Link>
    </li>
  );
};

export default CardItem;
