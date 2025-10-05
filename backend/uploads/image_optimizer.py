"""
Image optimization service for creating optimized versions of uploaded images.
Creates thumbnail, medium, and full-size optimized versions using Pillow.
This service processes images and returns optimized data for frontend to upload.
"""

import os
import io
from PIL import Image as PILImage, ImageOps
from typing import Tuple, Dict, Any
import logging
import base64

logger = logging.getLogger(__name__)

class ImageOptimizer:
    """
    Service for creating optimized image versions with specific size and quality constraints.
    """
    
    # Image size configurations
    SIZES = {
        'thumb': {
            'max_size': (200, 200),
            'max_file_size': 40 * 1024,  # 40 KB
            'quality': 85,
            'suffix': '_thumb'
        },
        'medium': {
            'max_size': (400, 300),
            'max_file_size': 100 * 1024,  # 100 KB
            'quality': 85,
            'suffix': '_medium'
        },
        'full': {
            'max_size': (1600, 1200),
            'max_file_size': 500 * 1024,  # 500 KB
            'quality': 85,
            'suffix': '_full'
        }
    }
    
    @staticmethod
    def optimize_image(image_data: bytes, config: dict, output_format: str = 'WEBP') -> Tuple[bytes, str]:
        """
        Optimize a single image according to the given configuration.
        
        Args:
            image_data: Original image data as bytes
            config: Configuration dict with max_size, max_file_size, quality
            output_format: Output format ('WEBP' or 'JPEG')
            
        Returns:
            Tuple of (optimized_image_bytes, file_extension)
        """
        try:
            # Open and process the image
            with PILImage.open(io.BytesIO(image_data)) as img:
                # Convert to RGB if necessary (handles RGBA, P mode images)
                if img.mode in ('RGBA', 'LA', 'P'):
                    # Create white background for transparent images
                    background = PILImage.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Auto-orient the image based on EXIF data
                img = ImageOps.exif_transpose(img)
                
                # Resize image while maintaining aspect ratio
                img.thumbnail(config['max_size'], PILImage.Resampling.LANCZOS)
                
                # Determine output format and extension
                if output_format == 'WEBP':
                    format_name = 'WEBP'
                    extension = 'webp'
                else:
                    format_name = 'JPEG'
                    extension = 'jpg'
                
                # Start with the configured quality
                quality = config['quality']
                
                # Optimize to meet file size requirements
                for attempt in range(5):  # Max 5 attempts to reduce quality
                    output = io.BytesIO()
                    
                    save_kwargs = {
                        'format': format_name,
                        'quality': quality,
                        'optimize': True
                    }
                    
                    # Add progressive mode for JPEG
                    if format_name == 'JPEG':
                        save_kwargs['progressive'] = True
                    
                    img.save(output, **save_kwargs)
                    
                    output_size = output.tell()
                    
                    # Check if file size is acceptable
                    if output_size <= config['max_file_size'] or quality <= 50:
                        output.seek(0)
                        return output.getvalue(), extension
                    
                    # Reduce quality for next attempt
                    quality = max(50, quality - 10)
                
                # If we still can't meet the size requirement, return the last attempt
                output.seek(0)
                return output.getvalue(), extension
                
        except Exception as e:
            logger.error(f"Error optimizing image: {str(e)}")
            raise
    
    @staticmethod
    def get_optimized_filename(original_filename: str, suffix: str, extension: str) -> str:
        """
        Generate filename for optimized version.
        
        Args:
            original_filename: Original filename (e.g., "1234567890.jpg")
            suffix: Size suffix (e.g., "_thumb")
            extension: New extension (e.g., "webp")
            
        Returns:
            Optimized filename (e.g., "1234567890_thumb.webp")
        """
        # Remove original extension
        name_without_ext = os.path.splitext(original_filename)[0]
        return f"{name_without_ext}{suffix}.{extension}"
    
    @classmethod
    def create_optimized_versions(cls, image_data: bytes, original_filename: str, 
                                content_type: str, content_id: int) -> Dict[str, Any]:
        """
        Create all optimized versions of an image and upload them to Supabase.
        Also uploads the original image.
        
        Args:
            image_data: Original image data as bytes
            original_filename: Original filename
            content_type: Content type (e.g., 'product', 'post')
            content_id: Content ID
            
        Returns:
            Dict with information about uploaded images including the original
        """
        import os
        from django.conf import settings
        
        # Get Supabase credentials from environment
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_ANON_KEY')
        
        if not supabase_url or not supabase_key:
            raise ValueError("Missing Supabase credentials")
        
        # Import supabase here to avoid dependency issues
        from supabase import create_client
        supabase = create_client(supabase_url, supabase_key)
        
        results = {}
        bucket_name = f"{content_type}s"
        
        # Only create and upload optimized versions (no original upload)
        # Then create and upload optimized versions
        for size_name, config in cls.SIZES.items():
            try:
                # Determine output format (prefer WEBP, fallback to JPEG)
                output_format = 'WEBP'
                
                # Optimize the image
                optimized_data, extension = cls.optimize_image(
                    image_data, config, output_format
                )
                
                # Generate filename for optimized version
                optimized_filename = cls.get_optimized_filename(
                    original_filename, config['suffix'], extension
                )
                
                # Upload to Supabase
                file_path = f"{content_id}/{optimized_filename}"
                
                # Check if file already exists
                try:
                    existing_files = supabase.storage.from_(bucket_name).list(str(content_id))
                    existing_filenames = [f['name'] for f in existing_files] if existing_files else []
                except:
                    existing_filenames = []
                
                if optimized_filename not in existing_filenames:
                    # Upload the optimized image
                    try:
                        upload_result = supabase.storage.from_(bucket_name).upload(
                            file_path, optimized_data
                        )
                        logger.info(f"Successfully uploaded {size_name} version: {optimized_filename}")
                    except Exception as upload_error:
                        logger.error(f"Failed to upload {size_name} version: {upload_error}")
                        continue
                else:
                    logger.info(f"Optimized version already exists: {optimized_filename}")
                
                results[size_name] = {
                    'filename': optimized_filename,
                    'size': len(optimized_data),
                    'format': extension.upper(),
                    'uploaded': True
                }
                
            except Exception as e:
                logger.error(f"Failed to create {size_name} version: {str(e)}")
                continue
        
        return results