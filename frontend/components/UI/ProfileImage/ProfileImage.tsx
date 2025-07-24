import React from 'react';
import './ProfileImage.css';

interface ProfileImageProps {
  src: string;
  alt: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ src, alt }) => {
  return (
    <img
      alt={alt}
      src={src}
      className="mx-auto object-cover rounded-full h-10 w-10"
    />
  );
};

export default ProfileImage;
