import React, { useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import BreadcrumbsComponent from '../components/Common/Breadcrumbs';
import { formatCurrency } from '../helpers/common';
import { useModal } from '../context/ModalAlertContext';

const CartPage: React.FC = () => {
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
    <div className="container mx-auto p-4">
      <div className="mx-auto px-4 mt-6 ">
        <BreadcrumbsComponent />
      </div>
      {/* Title */}
      <div className="flex justify-between mx-auto px-4 mt-6">
        <h1 className="font-normal text-gray-900 dark:text-gray-100 mb-6 mt-6 text-left text-4xl leading-tight font-gliko">
          Shopping Cart
        </h1>
        <a
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-500 underline hover:text-blue-700 cursor-pointer"
        >
          Go Back
        </a>
      </div>

      <div className="mx-auto px-4 mb-8">
        {state.items.length === 0 ? (
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <img
                src="https://i.imgur.com/dCdflKN.png"
                alt="Empty Cart"
                className="w-32 h-32 mb-6"
              />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Your Cart is Empty
              </h3>
              <h4 className="text-gray-600 mb-4">
                Add something to make me happy :)
              </h4>
              <button
                onClick={() => navigate('/')}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
              >
                Browse Products
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row justify-between">
            {/* Left Column: Cart Items */}
            <div className="lg:w-2/3 pr-4 mb-6 lg:mb-0">
              <div className="w-full">
                <div className="flex flex-col">
                  <div className="flex bg-gray-50 p-2 border-b">
                    <div className="flex-1 font-medium text-gray-500">
                      Product
                    </div>
                    <div className="flex-1 font-medium text-gray-500 text-right">
                      Price
                    </div>
                    <div className="flex-1 font-medium text-gray-500 text-right">
                      Quantity
                    </div>
                    <div className="flex-1 font-medium text-gray-500 text-right">
                      Total
                    </div>
                  </div>

                  {state.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex p-2 border-b items-center"
                    >
                      {/* Remove button */}
                      <button
                        className="remove flex items-center justify-center w-5 h-5 border-2 border-gray-600 rounded-full text-gray-600 hover:text-red-600 hover:border-red-600"
                        aria-label={item.name}
                        data-product_id={item.id}
                        onClick={() => handleRemove(item.id)}
                      >
                        <span className="text-lg">&#10005;</span>
                      </button>

                      {/* Product image and name */}
                      <div className="flex-1 flex items-center ml-4">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={item.image}
                            alt={item.name}
                          />
                        </div>
                        <div className="ml-4 text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex-1 text-right text-sm text-gray-900">
                        ${item.price}
                      </div>

                      {/* Quantity controls */}
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            className="minus bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2"
                            onClick={() => handleDecrement(item.id)}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="input-text qty bg-gray-200 text-center py-1 px-1 w-10 mx-2"
                            value={item.quantity}
                            readOnly
                          />
                          <button
                            type="button"
                            className="plus bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2"
                            onClick={() => handleIncrement(item.id)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Total price */}
                      <div className="flex-1 text-right text-sm text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="actions-wrapper flex justify-between my-2">
                <a
                  onClick={handleShowModal}
                  className="mb-4 text-blue-500 underline hover:text-blue-700 cursor-pointer"
                >
                  Clear All
                </a>
              </div>
            </div>

            {/* Right Column: Total and Checkout */}
            <div className="w-full lg:w-1/3 lg:pl-4">
              <div className="bg-white-50 p-6 border">
                <h2 className="text-lg font-bold mb-4">Cart Summary</h2>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-400">Subtotal</span>
                    <span className="text-gray-900">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
                {/* Move total below */}
                <div className="my-4 pt-2 border-t">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-400">Total</span>
                    <span className="text-gray-900">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
                <div className="mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">Note</h3>
                  <p className="text-sm text-gray-600">
                    Add special instructions for your seller...
                  </p>
                  <textarea
                    className="mt-2 p-3 border border-gray-300 rounded-lg w-full"
                    placeholder="Enter special instructions here..."
                  ></textarea>
                </div>

                <p className="cart-summary-footer-desc text-gray-400">
                  Shipping &amp; taxes calculated at checkout
                </p>

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
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
