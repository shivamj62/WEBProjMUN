"""
Cloud Storage Service for MUN Society Website
Handles file uploads to Cloudinary for production deployment
"""

import os
import logging
from typing import Optional, Tuple
from pathlib import Path
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

# Environment detection
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
USE_CLOUD_STORAGE = ENVIRONMENT == "production"

# Cloudinary configuration (optional)
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")

# Local storage fallback
LOCAL_UPLOAD_PATH = os.getenv("UPLOAD_PATH", "./uploads")

class FileStorageService:
    """Unified file storage service - local for dev, cloud for production"""
    
    def __init__(self):
        self.use_cloud = USE_CLOUD_STORAGE and self._cloudinary_configured()
        self.local_path = LOCAL_UPLOAD_PATH
        
        if self.use_cloud:
            logger.info("🌩️ Using Cloudinary for file storage")
            self._init_cloudinary()
        else:
            logger.info(f"📁 Using local file storage: {self.local_path}")
            os.makedirs(os.path.join(self.local_path, "resources"), exist_ok=True)
    
    def _cloudinary_configured(self) -> bool:
        """Check if Cloudinary is properly configured"""
        return bool(CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET)
    
    def _init_cloudinary(self):
        """Initialize Cloudinary client"""
        try:
            import cloudinary
            import cloudinary.uploader
            
            cloudinary.config(
                cloud_name=CLOUDINARY_CLOUD_NAME,
                api_key=CLOUDINARY_API_KEY,
                api_secret=CLOUDINARY_API_SECRET
            )
            
            self.cloudinary = cloudinary
            logger.info("✅ Cloudinary initialized successfully")
            
        except ImportError:
            logger.error("❌ Cloudinary not installed. Install with: pip install cloudinary")
            self.use_cloud = False
        except Exception as e:
            logger.error(f"❌ Failed to initialize Cloudinary: {e}")
            self.use_cloud = False
    
    def generate_unique_filename(self, original_filename: str, file_type: str = "resource") -> str:
        """Generate unique filename with timestamp"""
        ext = Path(original_filename).suffix
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        return f"{file_type}_{timestamp}_{unique_id}{ext}"
    
    async def upload_file(self, file_content: bytes, original_filename: str, file_type: str = "resource") -> Tuple[str, str]:
        """
        Upload file to storage (cloud or local)
        Returns: (file_url, file_path)
        """
        try:
            unique_filename = self.generate_unique_filename(original_filename, file_type)
            
            if self.use_cloud:
                return await self._upload_to_cloudinary(file_content, unique_filename, original_filename)
            else:
                return await self._upload_to_local(file_content, unique_filename, file_type)
                
        except Exception as e:
            logger.error(f"❌ File upload failed: {e}")
            raise
    
    async def _upload_to_cloudinary(self, file_content: bytes, unique_filename: str, original_filename: str) -> Tuple[str, str]:
        """Upload file to Cloudinary"""
        try:
            # Upload to Cloudinary
            result = self.cloudinary.uploader.upload(
                file_content,
                public_id=f"mun-resources/{unique_filename}",
                resource_type="auto",  # Auto-detect file type
                display_name=original_filename
            )
            
            file_url = result['secure_url']
            file_path = result['public_id']  # Store Cloudinary public_id as path
            
            logger.info(f"✅ File uploaded to Cloudinary: {file_url}")
            return file_url, file_path
            
        except Exception as e:
            logger.error(f"❌ Cloudinary upload failed: {e}")
            raise
    
    async def _upload_to_local(self, file_content: bytes, unique_filename: str, file_type: str) -> Tuple[str, str]:
        """Upload file to local storage"""
        try:
            # Create directory path
            type_dir = os.path.join(self.local_path, f"{file_type}s")  # resources, images, etc.
            os.makedirs(type_dir, exist_ok=True)
            
            # Full file path
            file_path = os.path.join(type_dir, unique_filename)
            
            # Write file
            with open(file_path, 'wb') as f:
                f.write(file_content)
            
            # Generate URL (for local development)
            file_url = f"/uploads/{file_type}s/{unique_filename}"
            
            logger.info(f"✅ File uploaded locally: {file_path}")
            return file_url, file_path
            
        except Exception as e:
            logger.error(f"❌ Local upload failed: {e}")
            raise
    
    async def delete_file(self, file_path: str) -> bool:
        """Delete file from storage"""
        try:
            if self.use_cloud and not file_path.startswith('/'):
                # Cloudinary public_id
                result = self.cloudinary.uploader.destroy(file_path)
                success = result.get('result') == 'ok'
                logger.info(f"🗑️ Cloudinary delete result: {result}")
                return success
            else:
                # Local file path
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"🗑️ Local file deleted: {file_path}")
                    return True
                else:
                    logger.warning(f"⚠️ Local file not found: {file_path}")
                    return False
                    
        except Exception as e:
            logger.error(f"❌ File deletion failed: {e}")
            return False
    
    def get_file_url(self, file_path: str, original_filename: str = "") -> str:
        """Get accessible URL for file"""
        if self.use_cloud and not file_path.startswith('/'):
            # For Cloudinary, file_path is the public_id, transform to URL
            return f"https://res.cloudinary.com/{CLOUDINARY_CLOUD_NAME}/image/upload/{file_path}"
        else:
            # Local file URL
            if file_path.startswith('/uploads'):
                return file_path  # Already a URL path
            else:
                # Convert absolute path to URL path
                rel_path = os.path.relpath(file_path, self.local_path)
                return f"/uploads/{rel_path.replace(os.sep, '/')}"

# Global instance
file_storage = FileStorageService()
