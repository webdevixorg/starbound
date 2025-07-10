import React, { useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalAlertContext';

import { formatCurrency } from '../../helpers/common';

interface SidebarCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarCart: React.FC<SidebarCartProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();

  const { showModal } = useModal();

  const handleShowModal = () => {
    showModal('CONFIRM_ACTION', handleClearCart);
  };

  const handleIncrement = (id: number) => {
    dispatch({ type: 'INCREMENT_QUANTITY', payload: { id } });
  };

  const handleDecrement = (id: number) => {
    dispatch({ type: 'DECREMENT_QUANTITY', payload: { id } });
  };

  const handleRemove = (id: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id } });
  };

  const totalPrice = useMemo(
    () =>
      state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [state.items]
  );

  const handleClearCart = () => {
    localStorage.removeItem('cart');
    dispatch({
      type: 'CLEAR_CART',
      payload: {}, // Pass an empty object as the payload
    });
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } z-50`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-bold">Your Cart</h2>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
          &times;
        </button>
      </div>
      <div className="p-4">
        {state.items.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col space-y-4">
              {state.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12 rounded"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="text-gray-500 hover:text-gray-800"
                      onClick={() => handleDecrement(item.id)}
                    >
                      -
                    </button>
                    <p>{item.quantity}</p>
                    <button
                      className="text-gray-500 hover:text-gray-800"
                      onClick={() => handleIncrement(item.id)}
                    >
                      +
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemove(item.id)}
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-bold">{formatCurrency(totalPrice)}</span>
              </div>

              <div className="actions-wrapper flex justify-between my-2">
                <a
                  onClick={handleShowModal}
                  className="mb-4 text-blue-500 underline hover:text-blue-700 cursor-pointer"
                >
                  Clear All
                </a>
              </div>

              <div className="flex justify-between">
                <div className="flex justify-center">
                  <button
                    onClick={() => navigate('/cart')}
                    className="bg-blue-500 text-white text-sm text-center py-2 px-4 rounded mt-4 w-full"
                  >
                    View Cart
                  </button>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => navigate('/checkout')}
                    className="bg-blue-500 text-white text-sm text-center py-2 px-4 rounded mt-4 w-full"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SidebarCart;
