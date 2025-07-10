import { useEffect } from "react";

const useProductHooks = (addHook: (hookName: string, callback: Function) => void) => {
  useEffect(() => {
    addHook("addPostFields", ({ contentType, postData }: { contentType: string; postData: { price: number; setPrice: (price: number) => void } }) => {
      if (contentType === "product") {
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
      return null;
    });
  }, [addHook]); // Only re-run if `addHook` changes
};

export default useProductHooks;
