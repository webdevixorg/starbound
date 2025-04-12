import { useState } from 'react';

const TopBar = () => {
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(
    localStorage.getItem('currency') || 'USD'
  );
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem('language') || 'EN'
  );

  return (
    <nav className="relative text-gray-500 py-3 border-b z-50">
      <div className="container mx-auto flex justify-between items-center px-8">
        <div className="flex items-center space-x-4">
          <span className="text-red-600 font-semibold">
            Limited-Time Offers:
          </span>
          <span>
            Mid-Summer Season Sale On Selected Items -{' '}
            <a href="#" className="underline hover:text-red-600">
              Shop Now
            </a>
          </span>
        </div>

        <div className="flex items-center space-x-6">
          {/* Help & Order Tracking */}
          <div className="flex space-x-4">
            <a href="#" className="hover:underline">
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
              <img
                src={`https://demos.codezeel.com/prestashop/PRS21/PRS210514/img/l/${
                  selectedLanguage === 'EN'
                    ? '1'
                    : selectedLanguage === 'FR'
                    ? '2'
                    : selectedLanguage === 'ES'
                    ? '3'
                    : '1'
                }.jpg`}
                className="w-5 h-5 rounded-full"
                alt={selectedLanguage}
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
