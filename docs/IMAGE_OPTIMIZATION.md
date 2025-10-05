# Image Optimization System

This system automatically creates optimized versions of uploaded images using Django and Pillow.

## Features

- **3 Optimized Sizes**:
  - `thumb`: 200x200px, <40KB, WEBP format
  - `medium`: 400x300px, <100KB, WEBP format
  - `full`: 1600x1200px, <500KB, WEBP format

- **Automatic Processing**: Images are optimized immediately after upload
- **Web Optimization**: Progressive JPEG, EXIF stripping, quality optimization
- **Fallback Support**: Graceful fallback to original images if optimization fails

## Usage

### 1. Basic Image Upload (Automatic)

The existing `uploadImage` function now automatically creates optimized versions:

```typescript
import { uploadImage } from '@/services/images';

const result = await uploadImage(file, title, 'product', productId);
// This now creates: original.jpg, original_thumb.webp, original_medium.webp, original_full.webp
```

### 2. Using Optimized Images in Components

#### Option A: ResponsiveImage (Recommended)

Automatically selects the best size based on dimensions:

```tsx
import ResponsiveImage from '@/components/UI/ResponsiveImage';

<ResponsiveImage
  images={[{ image_path: 'filename.jpg' }]}
  alt="Product image"
  width={300}
  height={200}
  contentType="product"
  contentId={123}
  priority={true}
/>;
```

#### Option B: SafeImage with Manual Size Selection

```tsx
import SafeImage from '@/components/UI/SafeImage';

<SafeImage
  images={[{ image_path: 'filename.jpg' }]}
  alt="Product image"
  width={200}
  height={200}
  contentType="product"
  contentId={123}
  optimizedSize="thumb"
  useOptimized={true}
/>;
```

#### Option C: Direct URL Generation

```typescript
import {
  getOptimizedImageUrl,
  getResponsiveImageUrls,
} from '@/services/images';

// Single size
const thumbUrl = getOptimizedImageUrl('filename.jpg', 'thumb', 'product', 123);

// All sizes
const urls = getResponsiveImageUrls('filename.jpg', 'product', 123);
// Returns: { thumb: '...', medium: '...', full: '...', original: '...' }
```

### 3. Advanced Usage

#### Check if Optimized Version Exists

```typescript
import {
  checkOptimizedImageExists,
  getBestAvailableImageUrl,
} from '@/utils/imageOptimization';

const exists = await checkOptimizedImageExists(
  'filename.jpg',
  'medium',
  'product',
  123
);
const bestUrl = await getBestAvailableImageUrl(
  'filename.jpg',
  'medium',
  'product',
  123
);
```

#### Preload Images for Performance

```typescript
import { preloadOptimizedImages } from '@/utils/imageOptimization';

preloadOptimizedImages('filename.jpg', 'product', 123, ['thumb', 'medium']);
```

## Size Guidelines

- **Thumbnail (200x200)**: Product cards, avatars, small previews
- **Medium (400x300)**: Product listings, blog post thumbnails
- **Full (1600x1200)**: Product detail pages, hero images
- **Original**: Lightbox, download, full-screen view

## File Naming Convention

Original: `1234567890_abc123.jpg`
Optimized versions:

- `1234567890_abc123_thumb.webp`
- `1234567890_abc123_medium.webp`
- `1234567890_abc123_full.webp`

## Backend API

### Optimize Image Endpoint

```bash
POST /images/optimize/
Content-Type: application/json

{
  "image_data": "base64_encoded_image_data",
  "filename": "original_filename.jpg"
}
```

Response:

```json
{
  "status": "success",
  "optimized_versions": {
    "thumb": {
      "filename": "original_filename_thumb.webp",
      "data": "base64_data",
      "size": 35840,
      "format": "WEBP",
      "mime_type": "image/webp"
    },
    "medium": { ... },
    "full": { ... }
  }
}
```

## Configuration

Modify `backend/uploads/image_optimizer.py` to adjust:

- Maximum file sizes
- Image dimensions
- Quality settings
- Output formats

## Error Handling

The system is designed to be fault-tolerant:

- If optimization fails, original image is still uploaded
- Components fall back to original images if optimized versions don't exist
- File existence is checked before attempting to load optimized versions

## Performance Benefits

- **Faster Loading**: Smaller file sizes (40KB vs potentially 2MB+)
- **Better UX**: Appropriate image sizes for different contexts
- **Bandwidth Savings**: Significant reduction in data transfer
- **SEO Benefits**: Faster page load times improve search rankings
