import { Helmet } from 'react-helmet';
import { Product } from '../../../types/types';

const ProductMetaTags: React.FC<{ product: Product }> = ({ product }) => (
  <Helmet>
    <meta property="og:title" content={product.title} />
    <meta property="og:description" content={product.description} />
    <meta property="og:image" content={product.images[0]?.image_path} />
    <meta
      property="og:url"
      content={`${window.location.origin}/product/${product.id}`}
    />
    <meta property="og:type" content="product" />
  </Helmet>
);

export default ProductMetaTags;
