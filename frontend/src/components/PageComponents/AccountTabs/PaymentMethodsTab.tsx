import React, { useState } from 'react';

const PaymentMethodsTab: React.FC = () => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      cardNumber: '**** **** **** 1234',
      cardHolder: 'John Doe',
      expiryDate: '12/23',
      isDefault: true,
    },
    {
      id: 2,
      cardNumber: '**** **** **** 5678',
      cardHolder: 'Jane Doe',
      expiryDate: '11/22',
      isDefault: false,
    },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    // Add new payment method logic
    const newPaymentMethod = {
      id: paymentMethods.length + 1,
      cardNumber: `**** **** **** ${formData.cardNumber.slice(-4)}`,
      cardHolder: formData.cardHolder,
      expiryDate: formData.expiryDate,
      isDefault: false,
    };
    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    setFormData({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
  };

  const handleSetDefault = (id: number) => {
    setPaymentMethods(
      paymentMethods.map((method) =>
        method.id === id
          ? { ...method, isDefault: true }
          : { ...method, isDefault: false }
      )
    );
  };

  return (
    <>
      <h3 className="text-2xl font-bold mb-6 text-gray-900">Payment Methods</h3>
      <form onSubmit={handleAddPaymentMethod} className="mb-6">
        <div className="mb-4">
          <label
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="cardNumber"
          >
            Card Number
          </label>
          <input
            id="cardNumber"
            name="cardNumber"
            type="text"
            value={formData.cardNumber}
            onChange={handleChange}
            className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="cardHolder"
          >
            Card Holder
          </label>
          <input
            id="cardHolder"
            name="cardHolder"
            type="text"
            value={formData.cardHolder}
            onChange={handleChange}
            className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
            <label
              className="block text-gray-700 font-semibold mb-2"
              htmlFor="expiryDate"
            >
              Expiry Date
            </label>
            <input
              id="expiryDate"
              name="expiryDate"
              type="text"
              value={formData.expiryDate}
              onChange={handleChange}
              className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="MM/YY"
              required
            />
          </div>
          <div className="w-1/2">
            <label
              className="block text-gray-700 font-semibold mb-2"
              htmlFor="cvv"
            >
              CVV
            </label>
            <input
              id="cvv"
              name="cvv"
              type="text"
              value={formData.cvv}
              onChange={handleChange}
              className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Payment Method
          </button>
        </div>
      </form>
      <div>
        <h4 className="text-xl font-bold mb-4 text-gray-800">
          Your Payment Methods
        </h4>
        {paymentMethods.map((method) => (
          <div key={method.id} className="mb-4 p-4 border rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="text-gray-700 font-semibold">
                  {method.cardNumber}
                </div>
                <div className="text-gray-500 text-sm">{method.cardHolder}</div>
                <div className="text-gray-500 text-sm">
                  Expires {method.expiryDate}
                </div>
              </div>
              <button
                onClick={() => handleSetDefault(method.id)}
                className={`px-3 py-1 text-sm rounded ${
                  method.isDefault
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {method.isDefault ? 'Default' : 'Set as Default'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default PaymentMethodsTab;
