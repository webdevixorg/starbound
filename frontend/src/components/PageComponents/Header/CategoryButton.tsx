import { useState } from 'react';
import MenuIcon2 from '../../UI/Icons/Menu2';
import ArrowDownIcon from '../../UI/Icons/ArrowDown';

const categories = [
  {
    name: 'Autoparts',
    subcategories: [
      {
        name: 'Alternator',
        items: [
          'Brakes & Rotors',
          'Wheel Adapters',
          'Headlights',
          'Steering Wheels',
        ],
      },
      {
        name: 'Custom Grilles',
        items: ['Speakers', 'Lubricants', 'Coil Spring', 'Service Tools'],
      },
      {
        name: 'Screw Clamps',
        items: ['Car Jack', 'Engine Fan', 'A/C Compressor', 'Fuel Injector'],
      },
    ],
  },
  { name: 'Radiator' },
  { name: 'Suspension' },
  { name: 'Muffler' },
  { name: 'Front Axle' },
  { name: 'Engine' },
  { name: 'Featured' },
  { name: 'ABS Brakes' },
];

export default function CategoryButton() {
  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [openSubcategory, setOpenSubcategory] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleCategory = (index: number) => {
    setOpenCategory(openCategory === index ? null : index);
    setOpenSubcategory(null);
  };

  const toggleSubcategory = (index: number) => {
    setOpenSubcategory(openSubcategory === index ? null : index);
  };

  return (
    <div className="relative flex items-center">
      <button
        className="w-[279px] text-left font-bold text-lg flex items-center justify-between bg-red-600 hover:bg-red-700 text-white py-4 px-4 rounded-tl rounded-tr"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <MenuIcon2 />
        <span className="ml-2 text-sm">Shop By Categories</span>
        <ArrowDownIcon />
      </button>
      {menuOpen && (
        <ul className="absolute w-[279px] bg-gray-800 text-white p-4 rounded-lg mt-1 shadow-lg">
          {categories.map((category, index) => (
            <li key={index} className="mb-2">
              <button
                className="w-full text-left py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded"
                onClick={() => toggleCategory(index)}
              >
                {category.name}
              </button>
              {category.subcategories && openCategory === index && (
                <ul className="ml-4 mt-2">
                  {category.subcategories.map((sub, subIndex) => (
                    <li key={subIndex}>
                      <button
                        className="w-full text-left py-2 px-3 bg-gray-600 hover:bg-gray-500 rounded"
                        onClick={() => toggleSubcategory(subIndex)}
                      >
                        {sub.name}
                      </button>
                      {sub.items && openSubcategory === subIndex && (
                        <ul className="ml-4 mt-2 text-sm">
                          {sub.items.map((item, i) => (
                            <li
                              key={i}
                              className="py-1 px-3 bg-gray-500 hover:bg-gray-400 rounded"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
