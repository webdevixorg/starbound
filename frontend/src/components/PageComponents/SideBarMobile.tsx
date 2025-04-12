import React from "react";

const SideBarMobile: React.FC = () => {
  return (
    <div className="md:hidden w-60 bg-white shadow-lg fixed left-0 top-0 h-full p-4">
      <ul className="space-y-2">
        {["Home", "About", "Services", "Contact"].map((text, index) => (
          <li
            key={index}
            className="p-2 hover:bg-gray-200 rounded cursor-pointer"
          >
            {text}
          </li>
        ))}
      </ul>
      <hr className="my-4 border-gray-300" />
      <ul className="space-y-2">
        {["Profile", "Settings", "Logout"].map((text, index) => (
          <li
            key={index}
            className="p-2 hover:bg-gray-200 rounded cursor-pointer"
          >
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideBarMobile;
