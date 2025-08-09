import React from 'react';
import Image from 'next/image';
import './ProfileImage.css';

interface ProfileImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  src,
  alt,
  width = 40,
  height = 40,
}) => {
  return (
    <Image
      alt={alt}
      src={src}
      width={width}
      height={height}
      className="mx-auto object-cover rounded-full h-10 w-10"
    />
  );
};

export default ProfileImage;
