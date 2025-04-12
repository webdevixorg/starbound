// src/components/Rating.tsx
import React from 'react';
import StarIcon from '../UI/Icons/Star';

const Rating: React.FC<{ reviews: number }> = ({ reviews }) => {
  return (
    <ul className="flex space-x-1">
      <li className="text-red-500 items-center ">
        <StarIcon />
      </li>
      <li className="text-red-500">
        <StarIcon />
      </li>
      <li className="text-red-500">
        <StarIcon />
      </li>
      <li className="text-red-500">
        <StarIcon />
      </li>
      <li className="text-red-500">
        <StarIcon />
      </li>
      <li>
        <span className="text-gray-600">({reviews}) Review</span>
      </li>
    </ul>
  );
};

export default Rating;
