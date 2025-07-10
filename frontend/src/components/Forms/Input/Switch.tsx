import React from 'react';

interface SwitchProps {
  id: string;
  name: string;
  label: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (name: string, value: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({
  id,
  name,
  label,
  icon,
  checked,
  onChange,
}) => {
  return (
    <div className="flex items-center">
      <span className="mr-2">{icon}</span>
      <span className="mr-2">{label}</span>
      <label
        htmlFor={id}
        className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in"
      >
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={(e) => onChange(name, e.target.checked)}
          className="sr-only"
        />
        <div
          className={`block w-10 h-6 rounded-full ${
            checked ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        ></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
            checked ? 'transform translate-x-full' : ''
          }`}
        ></div>
      </label>
    </div>
  );
};

export default Switch;
