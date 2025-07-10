import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
}

interface CartAction {
  type:
    | 'ADD_TO_CART'
    | 'REMOVE_FROM_CART'
    | 'INCREMENT_QUANTITY'
    | 'DECREMENT_QUANTITY'
    | 'CLEAR_CART'
    | 'LOAD_CART';
  payload: Partial<CartItem> & { id?: number; items?: CartItem[] };
}

const CartContext = createContext<
  | {
      state: CartState;
      dispatch: React.Dispatch<CartAction>;
      setAlert: (message: string, timeout?: number) => void;
    }
  | undefined
>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? {
                  ...item,
                  quantity: item.quantity + (action.payload.quantity || 1),
                }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            ...action.payload,
            id: action.payload.id!,
            name: action.payload.name || '',
            price: action.payload.price || 0,
            image: action.payload.image || '',
            quantity: action.payload.quantity || 1,
          },
        ],
      };
    case 'REMOVE_FROM_CART':
      const updatedItems = state.items.filter(
        (item) => item.id !== action.payload.id
      );
      // Save the updated cart state to localStorage
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      return {
        ...state,
        items: updatedItems,
      };
    case 'INCREMENT_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };
    case 'DECREMENT_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ),
      };
    case 'CLEAR_CART':
      // Clear localStorage when cart is cleared
      localStorage.removeItem('cart');
      return { ...state, items: [] };
    case 'LOAD_CART':
      return { ...state, items: action.payload.items || [] };
    default:
      return state;
  }
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [alert, setAlert] = useState<string>('');

  // Load cart state from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          dispatch({
            type: 'LOAD_CART',
            payload: { items: parsedCart },
          });
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  }, []);

  // Save cart state to localStorage whenever it changes
  useEffect(() => {
    if (state.items.length > 0) {
      try {
        localStorage.setItem('cart', JSON.stringify(state.items));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [state.items]);

  const setTimedAlert = (message: string, timeout = 3000) => {
    setAlert(message);
    setTimeout(() => setAlert(''), timeout);
  };

  return (
    <CartContext.Provider value={{ state, dispatch, setAlert: setTimedAlert }}>
      {alert && <div className="alert">{alert}</div>}
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
