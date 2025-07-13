import { useEffect } from 'react';

/**
 * Custom React hook to register additional UI fields for 'product' posts.
 * It uses the provided `addHook` function to inject a price input field when the content type is 'product'.
 *
 * @param addHook - Function that registers a UI hook with a name and callback to render content.
 */
const useProductHooks = (
  addHook: (hookName: string, callback: Function) => void
) => {
  useEffect(() => {
    // Register a new hook named 'addPostFields' to add custom UI components
    addHook(
      'addPostFields',
      ({
        contentType,
        postData,
      }: {
        contentType: string;
        postData: {
          price: number;
          setPrice: (price: number) => void;
        };
      }) => {
        // Only inject the price input field if the content type is 'product'
        if (contentType === 'product') {
          return (
            <div>
              <input
                type="number"
                name="price"
                value={postData.price}
                onChange={(e) => postData.setPrice(Number(e.target.value))}
                placeholder="Price"
              />
            </div>
          );
        }

        // Return null if content type is not 'product'
        return null;
      }
    );
  }, [addHook]); // Only re-run effect if addHook changes
};

export default useProductHooks;
