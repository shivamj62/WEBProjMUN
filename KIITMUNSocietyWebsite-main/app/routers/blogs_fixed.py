from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Query
from typing import List, Optional
import os
import uuid
from datetime import datetime
import aiofiles

from app.database import get_db
from app.schemas import Blog, BlogList
from app.auth import require_admin

router = APIRouter(prefix="/api/blogs", tags=["blogs"])

# File upload settings
UPLOAD_DIR = "uploads/images"
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

async def save_image_file(file: UploadFile) -> Optional[str]:
    """Save uploaded image file and return filename"""
    try:
        if not file.filename:
            return None
        
        # Check file extension
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            return None
        
        # Create unique filename
        unique_filename = f"blog_image_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Ensure upload directory exists
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Save file
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise ValueError("File too large")
        
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        return unique_filename
    except Exception as e:
        print(f"❌ Error saving file: {str(e)}")
        return None

@router.get("", response_model=dict)
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
                   created_at, updated_at, published, author_id
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
                    "author": "Admin",
                    "published": bool(blog[8])
                }
                blog_objects.append(blog_obj)
                print(f"✅ Successfully converted blog: {blog_obj['title']}")
            except Exception as e:
                print(f"❌ Error converting blog {blog[0] if blog else 'unknown'}: {e}")
        
        # Calculate pagination
        total = len(blog_objects)
        
        return {
            "blogs": blog_objects,
            "total": total,
            "page": page,
            "pages": max(1, (total + limit - 1) // limit)
        }
        
    except Exception as e:
        print(f"❌ Error in get_blogs: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch blog posts: {str(e)}")

@router.get("/{blog_id}", response_model=dict)
async def get_blog(blog_id: int, cur = Depends(get_db)):
    """Get single MUN blog post by ID"""
    
    print(f"📖 GET_BLOG: Fetching blog ID {blog_id}")
    
    try:
        # Simple query without author joins
        await cur.execute("""
            SELECT id, title, content, competition_date, image1_path, image2_path, 
                   created_at, updated_at, published, author_id
            FROM blogs
            WHERE id = ?
        """, (blog_id,))
        
        blog = await cur.fetchone()
        
        if not blog:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
        print(f"📖 Blog found: {blog[1]}")
        
        # Manual blog object creation
        blog_obj = {
            "id": blog[0],
            "title": blog[1],
            "content": blog[2],
            "competition_date": blog[3],
            "image1_url": f"/uploads/images/{blog[4]}" if blog[4] else None,
            "image2_url": f"/uploads/images/{blog[5]}" if blog[5] else None,
            "created_at": blog[6],
            "updated_at": blog[7],
            "author": "Admin",
            "published": bool(blog[8])
        }
        
        return blog_obj
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in get_blog: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch blog post: {str(e)}")

@router.post("", response_model=dict)
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
                raise HTTPException(status_code=400, detail="Invalid image2 file type or size")
        
        # Insert new blog
        await cur.execute("""
            INSERT INTO blogs (title, content, competition_date, image1_path, image2_path, 
                             author_id, created_at, updated_at, published)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            title,
            content,
            parsed_date,
            image1_filename,
            image2_filename,
            admin_user["id"],
            datetime.now(),
            datetime.now(),
            True
        ))
        
        await cur.commit()
        blog_id = cur.lastrowid
        
        print(f"✅ Blog created successfully: {title}")
        
        return {
            "id": blog_id,
            "title": title,
            "content": content,
            "competition_date": parsed_date,
            "image1_url": f"/uploads/images/{image1_filename}" if image1_filename else None,
            "image2_url": f"/uploads/images/{image2_filename}" if image2_filename else None,
            "author": "Admin",
            "published": True,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating blog: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create blog post: {str(e)}")

@router.put("/{blog_id}", response_model=dict)
async def update_blog(
    blog_id: int,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    competition_date: Optional[str] = Form(None),
    image1: Optional[UploadFile] = File(None),
    image2: Optional[UploadFile] = File(None),
    admin_user: dict = Depends(require_admin),
    cur = Depends(get_db)
):
    """Update existing blog post (Admin only)"""
    
    print(f"📝 UPDATE_BLOG: Updating blog ID {blog_id}")
    
    try:
        # Check if blog exists
        await cur.execute("SELECT * FROM blogs WHERE id = ?", (blog_id,))
        existing_blog = await cur.fetchone()
        
        if not existing_blog:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
        # Build update query dynamically
        update_fields = []
        update_values = []
        
        if title is not None:
            update_fields.append("title = ?")
            update_values.append(title)
        
        if content is not None:
            update_fields.append("content = ?")
            update_values.append(content)
        
        if competition_date is not None:
            try:
                parsed_date = datetime.strptime(competition_date, "%Y-%m-%d").date()
                update_fields.append("competition_date = ?")
                update_values.append(parsed_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid competition_date format. Use YYYY-MM-DD")
        
        # Handle image uploads
        if image1:
            image1_filename = await save_image_file(image1)
            if image1_filename:
                update_fields.append("image1_path = ?")
                update_values.append(image1_filename)
        
        if image2:
            image2_filename = await save_image_file(image2)
            if image2_filename:
                update_fields.append("image2_path = ?")
                update_values.append(image2_filename)
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Add updated_at
        update_fields.append("updated_at = ?")
        update_values.append(datetime.now())
        
        # Execute update
        update_values.append(blog_id)
        query = f"UPDATE blogs SET {', '.join(update_fields)} WHERE id = ?"
        await cur.execute(query, update_values)
        await cur.commit()
        
        print(f"✅ Blog updated successfully: ID {blog_id}")
        
        # Return updated blog
        return await get_blog(blog_id, cur)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating blog: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update blog post: {str(e)}")

@router.delete("/{blog_id}")
async def delete_blog(
    blog_id: int,
    admin_user: dict = Depends(require_admin),
    cur = Depends(get_db)
):
    """Delete blog post and associated images (Admin only)"""
    
    print(f"🗑️ DELETE_BLOG: Deleting blog ID {blog_id}")
    
    try:
        # Get blog info before deletion
        await cur.execute("SELECT image1_path, image2_path, title FROM blogs WHERE id = ?", (blog_id,))
        blog = await cur.fetchone()
        
        if not blog:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
        # Delete the blog record
        await cur.execute("DELETE FROM blogs WHERE id = ?", (blog_id,))
        await cur.commit()
        
        # Clean up image files
        if blog[0]:  # image1_path
            try:
                os.remove(os.path.join(UPLOAD_DIR, blog[0]))
            except:
                pass
        
        if blog[1]:  # image2_path
            try:
                os.remove(os.path.join(UPLOAD_DIR, blog[1]))
            except:
                pass
        
        print(f"✅ Blog deleted successfully: {blog[2]}")
        return {"success": True, "message": "Blog post deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting blog: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete blog post: {str(e)}")
