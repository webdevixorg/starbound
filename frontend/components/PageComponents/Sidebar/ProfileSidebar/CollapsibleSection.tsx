import React from 'react';
import ArrowUp from '@/components/UI/Icons/ArrowUp';
import ArrowDown from '@/components/UI/Icons/ArrowDown';

interface CollapsibleSectionProps {
  title: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  open,
  setOpen,
  children,
}) => {
  return (
    <div className="mb-5">
      <div
        className="flex items-center justify-between cursor-pointer text-gray-800 font-bolder text-2xl mb-4" // Updated font size to text-xl
        onClick={() => setOpen(!open)}
      >
        {title} {open ? <ArrowUp isOpen={false} /> : <ArrowDown />}
      </div>
      {open && <div>{children}</div>}
    </div>
  );
};

export default CollapsibleSection;
