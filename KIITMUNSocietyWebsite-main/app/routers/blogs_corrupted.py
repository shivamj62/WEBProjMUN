from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Query
from typing i        # Calculate pagination
        total = len(blog_objects)
        
        return {
            "blogs": blog_objects,
            "total": total,
            "page": page,
            "pages": max(1, (total + limit - 1) // limit)
        }t, Optional
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
        # Simple query without author joins
        await cur.execute("""
            SELECT id, title, content, competition_date, image1_path, image2_path, 
                   created_at, updated_at, 'Admin' as username, published, author_id
            FROM blogs
            ORDER BY created_at DESC
        """)
        
        blogs = await cur.fetchall()
        print(f"🔍 Found {len(blogs)} blogs")
        
        # Simple response without complex conversion
        blog_objects = []
        for blog in blogs:
            try:
                # Manual blog object creation to avoid Schema issues
                blog_obj = {
                    "id": blog[0],
                    "title": blog[1],
                    "content": blog[2],
                    "competition_date": blog[3],
                    "image1_url": f"/uploads/images/{blog[4]}" if blog[4] else None,
                    "image2_url": f"/uploads/images/{blog[5]}" if blog[5] else None,
                    "created_at": blog[6],
                    "updated_at": blog[7],
                    "author": blog[8],
                    "published": bool(blog[9])
                }
                blog_objects.append(blog_obj)
                print(f"✅ Successfully converted blog: {blog_obj['title']}")
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
        # Simple query without author joins
        await cur.execute("""
            SELECT id, title, content, competition_date, image1_path, image2_path, 
                   created_at, updated_at, 'Admin' as username, published, author_id
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

@router.post("", response_model=Blog)
async def create_blog(
    title: str = Form(...),
    content: str = Form(...),
    competition_date: Optional[str] = Form(None),
    image1: Optional[UploadFile] = File(None),
    image2: Optional[UploadFile] = File(None),
    admin_user: dict = Depends(require_admin),
    cur = Depends(get_db)
):
    """Create new blog post with optional image uploads (Admin only)"""
    
    print(f"📝 CREATE_BLOG: Creating blog '{title}'")
    
    try:
        # Parse competition date if provided
        parsed_date = None
        if competition_date:
            try:
                parsed_date = datetime.strptime(competition_date, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid competition_date format. Use YYYY-MM-DD")
        
        # Handle image uploads
        image1_filename = None
        image2_filename = None
        
        if image1:
            image1_filename = await save_image_file(image1)
            if not image1_filename:
                raise HTTPException(status_code=400, detail="Invalid image1 file type or size")
        
        if image2:
            image2_filename = await save_image_file(image2)
            if not image2_filename:
                # Clean up image1 if image2 fails
                if image1_filename:
                    image1_path = os.path.join(IMAGES_DIR, image1_filename)
                    if os.path.exists(image1_path):
                        os.remove(image1_path)
                raise HTTPException(status_code=400, detail="Invalid image2 file type or size")
        
        # Insert blog into database
        print(f"📝 Inserting blog into database...")
        print(f"   Title: {title}")
        print(f"   Content length: {len(content)}")
        print(f"   Competition date: {parsed_date}")
        print(f"   Author ID: {admin_user['id']}")
        print(f"   Image1: {image1_filename}")
        print(f"   Image2: {image2_filename}")
        
        await cur.execute("""
            INSERT INTO blogs (title, content, competition_date, image1_path, image2_path, author_id, published)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            title,
            content,
            parsed_date,
            image1_filename,
            image2_filename,
            admin_user["id"],
            True
        ))
        print(f"📝 Blog inserted, committing transaction...")
        await cur.commit()
        print(f"📝 Transaction committed successfully")
        
        # Get the created blog
        blog_id = cur.lastrowid
        await cur.execute("""
            SELECT id, title, content, competition_date, image1_path, image2_path, 
                   created_at, updated_at, 'Admin' as username, published, author_id
            FROM blogs
            WHERE id = ?
        """, (blog_id,))
        
        blog = await cur.fetchone()
        if not blog:
            raise HTTPException(status_code=500, detail="Failed to retrieve created blog")
        
        print(f"✅ Blog created successfully: {title}")
        return Blog.from_db(blog)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating blog: {str(e)}")
        # Clean up uploaded files on error
        if 'image1_filename' in locals() and image1_filename:
            image1_path = os.path.join(IMAGES_DIR, image1_filename)
            if os.path.exists(image1_path):
                os.remove(image1_path)
        if 'image2_filename' in locals() and image2_filename:
            image2_path = os.path.join(IMAGES_DIR, image2_filename)
            if os.path.exists(image2_path):
                os.remove(image2_path)
        raise HTTPException(status_code=500, detail="Failed to create blog post")

@router.put("/{blog_id}", response_model=Blog)
async def update_blog(
    blog_id: int,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    competition_date: Optional[str] = Form(None),
    image1: Optional[UploadFile] = File(None),
    image2: Optional[UploadFile] = File(None),
    remove_image1: bool = Form(False),
    remove_image2: bool = Form(False),
    admin_user: dict = Depends(require_admin),
    cur = Depends(get_db)
):
    """Update existing blog post with optional image replacement (Admin only)"""
    
    print(f"📝 UPDATE_BLOG: Updating blog ID {blog_id}")
    
    try:
        # Check if blog exists
        await cur.execute("SELECT * FROM blogs WHERE id = ?", (blog_id,))
        existing_blog = await cur.fetchone()
        if not existing_blog:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
        # Parse competition date if provided
        parsed_date = existing_blog[9]  # Keep existing if not updated
        if competition_date is not None:
            if competition_date.strip():
                try:
                    parsed_date = datetime.strptime(competition_date, "%Y-%m-%d").date()
                except ValueError:
                    raise HTTPException(status_code=400, detail="Invalid competition_date format. Use YYYY-MM-DD")
            else:
                parsed_date = None
        
        # Handle image updates
        old_image1_path = existing_blog[7]  # image1_path
        old_image2_path = existing_blog[8]  # image2_path
        
        new_image1_filename = old_image1_path
        new_image2_filename = old_image2_path
        
        # Handle image1 updates
        if remove_image1:
            new_image1_filename = None
            if old_image1_path:
                old_image1_full_path = os.path.join(IMAGES_DIR, old_image1_path)
                if os.path.exists(old_image1_full_path):
                    os.remove(old_image1_full_path)
        elif image1:
            new_image1_filename = await save_image_file(image1)
            if not new_image1_filename:
                raise HTTPException(status_code=400, detail="Invalid image1 file type or size")
            # Remove old image1 if new one uploaded successfully
            if old_image1_path:
                old_image1_full_path = os.path.join(IMAGES_DIR, old_image1_path)
                if os.path.exists(old_image1_full_path):
                    os.remove(old_image1_full_path)
        
        # Handle image2 updates
        if remove_image2:
            new_image2_filename = None
            if old_image2_path:
                old_image2_full_path = os.path.join(IMAGES_DIR, old_image2_path)
                if os.path.exists(old_image2_full_path):
                    os.remove(old_image2_full_path)
        elif image2:
            new_image2_filename = await save_image_file(image2)
            if not new_image2_filename:
                # Clean up image1 if it was uploaded but image2 failed
                if image1 and new_image1_filename != old_image1_path:
                    new_image1_full_path = os.path.join(IMAGES_DIR, new_image1_filename)
                    if os.path.exists(new_image1_full_path):
                        os.remove(new_image1_full_path)
                raise HTTPException(status_code=400, detail="Invalid image2 file type or size")
            # Remove old image2 if new one uploaded successfully
            if old_image2_path:
                old_image2_full_path = os.path.join(IMAGES_DIR, old_image2_path)
                if os.path.exists(old_image2_full_path):
                    os.remove(old_image2_full_path)
        
        # Build update query with only provided fields
        update_fields = []
        update_values = []
        
        if title is not None:
            update_fields.append("title = ?")
            update_values.append(title)
        
        if content is not None:
            update_fields.append("content = ?")
            update_values.append(content)
        
        if competition_date is not None:
            update_fields.append("competition_date = ?")
            update_values.append(parsed_date)
        
        # Always update image paths if they were modified
        if remove_image1 or image1:
            update_fields.append("image1_path = ?")
            update_values.append(new_image1_filename)
        
        if remove_image2 or image2:
            update_fields.append("image2_path = ?")
            update_values.append(new_image2_filename)
        
        # Always update the updated_at timestamp
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Execute update
        update_values.append(blog_id)
        query = f"UPDATE blogs SET {', '.join(update_fields)} WHERE id = ?"
        await cur.execute(query, update_values)
        await cur.commit()
        
        # Get the updated blog
        await cur.execute("""
            SELECT id, title, content, competition_date, image1_path, image2_path, 
                   created_at, updated_at, 'Admin' as username, published, author_id
            FROM blogs
            WHERE id = ?
        """, (blog_id,))
        
        blog = await cur.fetchone()
        if not blog:
            raise HTTPException(status_code=500, detail="Failed to retrieve updated blog")
        
        print(f"✅ Blog updated successfully: ID {blog_id}")
        return Blog.from_db(blog)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating blog: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update blog post")

@router.delete("/{blog_id}", response_model=SuccessResponse)
async def delete_blog(
    blog_id: int,
    admin_user: dict = Depends(require_admin),
    cur = Depends(get_db)
):
    """Delete blog post and associated images (Admin only)"""
    
    print(f"🗑️ DELETE_BLOG: Deleting blog ID {blog_id}")
    
    try:
        # Get blog info to clean up images
        await cur.execute("SELECT image1_path, image2_path, title FROM blogs WHERE id = ?", (blog_id,))
        blog = await cur.fetchone()
        
        if not blog:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
        image1_path, image2_path, title = blog
        
        # Delete blog from database
        await cur.execute("DELETE FROM blogs WHERE id = ?", (blog_id,))
        await cur.commit()
        
        # Clean up image files
        if image1_path:
            image1_full_path = os.path.join(IMAGES_DIR, image1_path)
            if os.path.exists(image1_full_path):
                os.remove(image1_full_path)
                print(f"🗑️ Deleted image1: {image1_path}")
        
        if image2_path:
            image2_full_path = os.path.join(IMAGES_DIR, image2_path)
            if os.path.exists(image2_full_path):
                os.remove(image2_full_path)
                print(f"🗑️ Deleted image2: {image2_path}")
        
        print(f"✅ Blog deleted successfully: {title}")
        return SuccessResponse(
            success=True,
            message=f"Blog post '{title}' deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting blog: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete blog post")
