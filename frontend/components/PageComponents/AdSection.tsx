import React from 'react';
import NextImage from 'next/image';
import Link from 'next/link';

interface AdSectionProps {
  imageUrl: string;
  altText: string;
  linkHref: string;
  title?: string;
  description?: string;
}

const AdSection: React.FC<AdSectionProps> = ({
  imageUrl,
  altText,
  linkHref,
  title,
  description,
}) => {
  return (
    <section className="py-12 bg-gray-50 mb-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row flex-wrap justify-center">
          <Link href={linkHref} className="block w-full">
            <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg group">
              <NextImage
                src={imageUrl}
                alt={altText}
                width={1200}
                height={600}
                layout="responsive"
                className="transition-transform duration-500 ease-in-out group-hover:scale-105"
              />
              {(title || description) && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-8 text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div>
                    {title && (
                      <h3 className="text-3xl font-bold mb-2">{title}</h3>
                    )}
                    {description && (
                      <p className="text-lg opacity-90">{description}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AdSection;
