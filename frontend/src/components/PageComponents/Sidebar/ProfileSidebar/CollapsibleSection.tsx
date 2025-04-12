import React from 'react';
import ArrowUp from '../../../UI/Icons/ArrowUp';
import ArrowDown from '../../../UI/Icons/ArrowDown';

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
        className="flex items-center justify-between cursor-pointer text-gray-800 font-bold mb-2"
        onClick={() => setOpen(!open)}
      >
        {title} {open ? <ArrowUp isOpen={false} /> : <ArrowDown />}
      </div>
      {open && <div>{children}</div>}
    </div>
  );
};

export default CollapsibleSection;
