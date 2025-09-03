from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Query
from typing import List, Optional
import os
import uuid
from datetime import datetime, date
import aiofiles
from math import ceil

from app.database import get_db
from app.schemas import BlogList, Blog, SuccessResponse
from app.auth import require_admin

router = APIRouter(prefix="/api/blogs", tags=["blogs"])

# Configuration
UPLOAD_PATH = os.getenv("UPLOAD_PATH", "./uploads")
IMAGES_DIR = os.path.join(UPLOAD_PATH, "images")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "52428800"))  # 50MB
ALLOWED_IMAGE_TYPES = os.getenv("ALLOWED_IMAGE_TYPES", "jpg,jpeg,png,gif").split(",")

# Ensure directories exist
os.makedirs(IMAGES_DIR, exist_ok=True)

def validate_image_file(file: UploadFile) -> bool:
    """Validate uploaded image file"""
    if not file.filename:
        return False
    
    file_extension = os.path.splitext(file.filename)[1].lower().replace(".", "")
    return file_extension in ALLOWED_IMAGE_TYPES

async def save_image_file(file: UploadFile) -> Optional[str]:
    """Save uploaded image file and return filename"""
    if not file or not validate_image_file(file):
        return None
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(IMAGES_DIR, unique_filename)
    
    try:
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            if len(content) > MAX_FILE_SIZE:
                raise ValueError("File too large")
            await f.write(content)
        return unique_filename
    except Exception as e:
        print(f"❌ Error saving file: {str(e)}")
        # Clean up on failure
        if os.path.exists(file_path):
            os.remove(file_path)
        return None

@router.get("", response_model=BlogList)
async def get_blogs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    cur = Depends(get_db)
):
    """Get list of MUN blog posts"""
    
    print(f"📚 GET_BLOGS: Fetching blog list")
    
    try:
        # First check if authors table exists, if not use a default
        try:
            await cur.execute("""
                SELECT b.id, b.title, b.content, b.image_path, b.author_id, b.created_at, b.updated_at, 
                       b.image1_path, b.image2_path, b.competition_date, b.published, COALESCE(a.username, 'Admin') as username
                FROM blogs b
                LEFT JOIN authors a ON b.author_id = a.id
                ORDER BY b.created_at DESC
            """)
        except Exception:
            # Fallback if authors table doesn't exist
            await cur.execute("""
                SELECT id, title, content, image_path, author_id, created_at, updated_at, 
                       image1_path, image2_path, competition_date, published, 'Admin' as username
                FROM blogs
                ORDER BY created_at DESC
            """)
        
        blogs = await cur.fetchall()
        print(f"🔍 Found {len(blogs)} blogs")
        
        blog_objects = []
        for blog in blogs:
            try:
                blog_obj = Blog.from_db(blog)
                blog_objects.append(blog_obj)
                print(f"✅ Successfully converted blog: {blog_obj.title}")
            except Exception as e:
                print(f"❌ Error converting blog {blog[0] if blog else 'unknown'}: {e}")
        
        # Calculate pagination
        total = len(blog_objects)
        
        return BlogList(
            blogs=blog_objects,
            total=total,
            page=page,
            pages=ceil(total / limit) if total > 0 else 1
        )
    except Exception as e:
        print(f"❌ Error fetching blogs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch blogs")

@router.get("/{blog_id}", response_model=Blog)
async def get_blog(blog_id: int, cur = Depends(get_db)):
    """Get single MUN blog post by ID"""
    
    print(f"📖 GET_BLOG: Fetching blog ID {blog_id}")
    
    try:
        # Try with authors table first, fallback if needed
        try:
            await cur.execute("""
                SELECT b.id, b.title, b.content, b.image_path, b.author_id, b.created_at, b.updated_at, 
                       b.image1_path, b.image2_path, b.competition_date, b.published, COALESCE(a.username, 'Admin') as username
                FROM blogs b
                LEFT JOIN authors a ON b.author_id = a.id
                WHERE b.id = ?
            """, (blog_id,))
        except Exception:
            await cur.execute("""
                SELECT id, title, content, image_path, author_id, created_at, updated_at, 
                       image1_path, image2_path, competition_date, published, 'Admin' as username
                FROM blogs
                WHERE id = ?
            """, (blog_id,))
        
        blog = await cur.fetchone()
        
        if not blog:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
        print(f"📖 Blog found: {blog[1]}")
        return Blog.from_db(blog)
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching blog: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch blog post")

# Add other endpoints here (create, update, delete)...
