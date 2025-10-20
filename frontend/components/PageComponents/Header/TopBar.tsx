'use client';
import { useState, useEffect } from 'react';

import SafeImage from '@/components/UI/SafeImage';

const TopBar = () => {
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedLanguage, setSelectedLanguage] = useState('EN');

  // Load values from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSelectedCurrency(localStorage.getItem('currency') || 'USD');
      setSelectedLanguage(localStorage.getItem('language') || 'EN');
    }
  }, []);

  // Save to localStorage when values change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currency', selectedCurrency);
    }
  }, [selectedCurrency]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', selectedLanguage);
    }
  }, [selectedLanguage]);

  return (
    <nav className="relative text-gray-500 py-3 border-b z-50">
      <div className="container mx-auto flex justify-between items-center px-8">
        <div className="flex items-center space-x-4">
          <span className="text-red-600 font-semibold">
            Limited-Time Offers:
          </span>
          <span>
            Mid-Summer Season Sale On Selected Items -{' '}
            <a href="/products" className="underline hover:text-red-600">
              Shop Now
            </a>
          </span>
        </div>

        <div className="flex items-center space-x-6">
          {/* Help & Order Tracking */}
          <div className="flex space-x-4">
            <a href="/help-center" className="hover:underline">
              Help Center
            </a>
            <a href="#" className="hover:underline">
              Order Tracking
            </a>
          </div>
          {/* Currency Selector */}
          <div className="relative">
            <button
              onClick={() => setCurrencyOpen(!currencyOpen)}
              className="flex items-center space-x-1"
            >
              {selectedCurrency} <span>&#9662;</span>
            </button>
            {currencyOpen && (
              <ul className="absolute bg-white text-gray-900 mt-2 shadow-md rounded-md py-2 w-28">
                <li>
                  <button
                    onClick={() => {
                      setSelectedCurrency('EUR');
                      setCurrencyOpen(false);
                    }}
                    className="block px-4 py-1 hover:bg-gray-200 w-full text-left"
                  >
                    EUR
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedCurrency('USD');
                      setCurrencyOpen(false);
                    }}
                    className="block px-4 py-1 hover:bg-gray-200 w-full text-left"
                  >
                    USD
                  </button>
                </li>
              </ul>
            )}
          </div>
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className="flex items-center space-x-1"
            >
              <SafeImage
                alt={selectedLanguage}
                className="w-5 h-5 rounded-full"
                images={[
                  {
                    image_path: `/images/flags/4x3/${
                      selectedLanguage === 'EN'
                        ? 'gb'
                        : selectedLanguage === 'FR'
                          ? 'fr'
                          : selectedLanguage === 'ES'
                            ? 'es'
                            : '1'
                    }.svg`,
                  },
                ]}
                width={300}
                height={300}
              />
              <span>{selectedLanguage}</span> <span>&#9662;</span>
            </button>
            {languageOpen && (
              <ul className="absolute bg-white text-gray-900 mt-2 shadow-md rounded-md py-2 w-36">
                <li>
                  <button
                    onClick={() => {
                      setSelectedLanguage('EN');
                      setLanguageOpen(false);
                    }}
                    className="block px-4 py-1 hover:bg-gray-200 w-full text-left"
                  >
                    English
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedLanguage('FR');
                      setLanguageOpen(false);
                    }}
                    className="block px-4 py-1 hover:bg-gray-200 w-full text-left"
                  >
                    Français
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedLanguage('ES');
                      setLanguageOpen(false);
                    }}
                    className="block px-4 py-1 hover:bg-gray-200 w-full text-left"
                  >
                    Español
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
