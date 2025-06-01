import React from 'react';
import { useWishlist } from '../context/WishlistContext';

// Define the WishlistItem type to match the actual wishlist data structure
type WishlistItem = {
  id: string | number;
  product: {
    images?: { image_path: string; alt?: string }[];
    title: string;
    description?: string;
    location_name?: string; // Make location_name optional to match possible missing property
    price: number | string;
  };
};

const Wishlist: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();

  if (!wishlist) {
    return <div className="container p-6 bg-white">Loading...</div>;
  }

  const handleRemove = (id: string | number) => {
    if (
      window.confirm(
        'Are you sure you want to remove this item from the wishlist?'
      )
    ) {
      removeFromWishlist(String(id));
    }
  };

  return (
    <div className="p-6 bg-white">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">Wishlist</h3>
      {wishlist.length === 0 ? (
        <p className="text-gray-700">No wishlist items found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                  Image
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                  Title
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                  Description
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                  Location
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                  Price
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {wishlist.map((item: WishlistItem) => (
                <tr key={item.id} className="border-b">
                  <td className="px-4 py-3">
                    {item.product.images?.[0]?.image_path ? (
                      <img
                        src={item.product.images[0].image_path}
                        alt={item.product.images[0].alt || 'Wishlist image'}
                        className="w-20 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {item.product.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.product.description || 'No description'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {item.product.location_name || 'No location'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    ${item.product.price}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
