from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Query
from typing import List, Optional
import os
import uuid
from datetime import datetime
import aiofiles

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
        print(f"🔍 Starting save_image_file for: {file.filename}")
        
        if not file.filename:
            print("❌ No filename provided")
            return None
        
        # Check file extension
        file_ext = os.path.splitext(file.filename)[1].lower()
        print(f"🔍 File extension: {file_ext}")
        
        if file_ext not in ALLOWED_EXTENSIONS:
            print(f"❌ Invalid file extension: {file_ext}. Allowed: {ALLOWED_EXTENSIONS}")
            return None
        
        # Create unique filename
        unique_filename = f"blog_image_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        print(f"🔍 Will save to: {file_path}")
        
        # Ensure upload directory exists
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        print(f"🔍 Upload directory exists: {os.path.exists(UPLOAD_DIR)}")
        
        # Read file content
        print(f"🔍 Reading file content...")
        content = await file.read()
        print(f"🔍 Read {len(content)} bytes")
        
        if len(content) == 0:
            print(f"❌ File is empty")
            return None
        
        if len(content) > MAX_FILE_SIZE:
            print(f"❌ File too large: {len(content)} > {MAX_FILE_SIZE}")
            return None
        
        # Write file using regular file operations
        print(f"🔍 Writing file to disk...")
        with open(file_path, 'wb') as f:
            f.write(content)
        
        print(f"🔍 Checking if file was written...")
        if os.path.exists(file_path):
            saved_size = os.path.getsize(file_path)
            print(f"✅ File saved successfully: {unique_filename} ({saved_size} bytes)")
            return unique_filename
        else:
            print(f"❌ File was not saved to disk")
            return None
        
    except Exception as e:
        print(f"❌ Error in save_image_file: {str(e)}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        return None

@router.get("", response_model=dict)
async def get_blogs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
):
    """Get list of MUN blog posts"""
    
    print(f"📚 GET_BLOGS: Fetching blog list")
    
    try:
        from ..database import get_db
        db = await get_db()
        
        # Simple query without author joins
        blogs = await db.fetchall("""
            SELECT id, title, content, competition_date, image1_path, image2_path, 
                   created_at, updated_at, published, author_id
            FROM blogs
            ORDER BY created_at DESC
        """)
        
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
async def get_blog(blog_id: int):
    """Get single MUN blog post by ID"""
    
    print(f"📖 GET_BLOG: Fetching blog ID {blog_id}")
    
    try:
        from ..database import get_db
        db = await get_db()
        
        # Simple query without author joins
        blog = await db.fetchone("""
            SELECT id, title, content, competition_date, image1_path, image2_path, 
                   created_at, updated_at, published, author_id
            FROM blogs
            WHERE id = ?
        """, (blog_id,))
        
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

@router.post("/debug-test", response_model=dict)
async def debug_blog_creation():
    """Super simple debug endpoint"""
    print("📝 DEBUG: Simple endpoint called successfully!")
    return {"message": "Debug endpoint works", "status": "success"}

@router.post("", response_model=dict)
async def create_blog(
    title: str = Form(...),
    content: str = Form(...),
    competition_date: Optional[str] = Form(None),
    image1: Optional[UploadFile] = File(None),
    image2: Optional[UploadFile] = File(None),
    admin_user: dict = Depends(require_admin),
):
    """Create new blog post with optional image uploads (Admin only)"""
    
    # Wrap everything in a comprehensive try-catch
    try:
        from ..database import get_db
        db = await get_db()
        
        print(f"📝 ==> STARTING BLOG CREATION")
        print(f"📝 Function parameters received successfully")
        print(f"📝 Title: '{title}' (type: {type(title)})")
        print(f"📝 Content length: {len(content)} (type: {type(content)})")
        print(f"📝 Competition date: {competition_date} (type: {type(competition_date)})")
        print(f"📝 Admin user: {admin_user} (type: {type(admin_user)})")
        print(f"📝 Database object: {type(db)}")
        
        if image1:
            print(f"📝 Image1: {image1.filename} (type: {type(image1)})")
        if image2:
            print(f"📝 Image2: {image2.filename} (type: {type(image2)})")
            
        print(f"📝 ==> ALL PARAMETERS VALIDATED, PROCEEDING...")
        
        return await process_blog_creation(title, content, competition_date, image1, image2, admin_user, db)
        
    except Exception as e:
        print(f"❌ CRITICAL ERROR in create_blog: {e}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        print("❌ Full traceback:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Blog creation failed: {str(e)}")

async def process_blog_creation(title, content, competition_date, image1, image2, admin_user, db):
    """Separate function to handle the actual blog creation logic"""
    print(f"📝 ==> STARTING BLOG PROCESSING")
    
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
        
        print(f"📝 Starting image processing...")
        
        try:
            if image1 and image1.filename:
                print(f"📝 Processing image1: {image1.filename}")
                print(f"📝 Image1 content type: {image1.content_type}")
                print(f"📝 Image1 size: {image1.size if hasattr(image1, 'size') else 'unknown'}")
                
                image1_filename = await save_image_file(image1)
                if not image1_filename:
                    print(f"❌ Failed to save image1: {image1.filename}")
                    raise HTTPException(status_code=400, detail="Invalid image1 file type or size")
                print(f"✅ Image1 saved as: {image1_filename}")
            else:
                print(f"📝 No image1 provided")
                
        except HTTPException:
            print(f"❌ HTTPException in image1 processing")
            raise
        except Exception as e:
            print(f"❌ Exception processing image1: {e}")
            print(f"❌ Exception type: {type(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Error processing image1: {str(e)}")
        
        try:
            if image2 and image2.filename:
                print(f"📝 Processing image2: {image2.filename}")
                print(f"📝 Image2 content type: {image2.content_type}")
                print(f"📝 Image2 size: {image2.size if hasattr(image2, 'size') else 'unknown'}")
                
                image2_filename = await save_image_file(image2)
                if not image2_filename:
                    print(f"❌ Failed to save image2: {image2.filename}")
                    raise HTTPException(status_code=400, detail="Invalid image2 file type or size")
                print(f"✅ Image2 saved as: {image2_filename}")
            else:
                print(f"📝 No image2 provided")
                
        except HTTPException:
            print(f"❌ HTTPException in image2 processing")
            raise
        except Exception as e:
            print(f"❌ Exception processing image2: {e}")
            print(f"❌ Exception type: {type(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Error processing image2: {str(e)}")
        
        # Insert new blog
        print(f"📝 Inserting blog into database...")
        print(f"📝 Title: {title}")
        print(f"📝 Content length: {len(content)}")
        print(f"📝 Parsed date: {parsed_date}")
        print(f"📝 Image1 filename: {image1_filename}")
        print(f"📝 Image2 filename: {image2_filename}")
        print(f"📝 Author ID: {admin_user['id']}")
        
        # Get current timestamp as string for SQLite
        now_str = datetime.now().isoformat()
        
        try:
            result = await db.execute("""
                INSERT INTO blogs (title, content, competition_date, image1_path, image2_path, 
                                 author_id, created_at, updated_at, published)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                title,
                content,
                str(parsed_date) if parsed_date else None,
                image1_filename,
                image2_filename,
                admin_user["id"],
                now_str,
                now_str,
                1  # Use 1 instead of True for SQLite
            ))
            
            # Get the blog ID from the result
            blog_id = result.last_insert_rowid if hasattr(result, 'last_insert_rowid') else 0
            
            print(f"📝 Blog inserted, committing...")
            await db.commit()
            print(f"📝 Blog created with ID: {blog_id}")
            
        except Exception as db_error:
            print(f"❌ Database error: {db_error}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")
        
        print(f"✅ Blog created successfully: {title}")
        
        # Convert datetime objects to strings for JSON serialization
        now = datetime.now()
        
        return {
            "id": blog_id,
            "title": title,
            "content": content,
            "competition_date": str(parsed_date) if parsed_date else None,
            "image1_url": f"/uploads/images/{image1_filename}" if image1_filename else None,
            "image2_url": f"/uploads/images/{image2_filename}" if image2_filename else None,
            "author": "Admin",
            "published": True,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating blog: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create blog post: {str(e)}")

@router.post("/simple", response_model=dict)
async def create_blog_simple(
    title: str = Form(...),
    content: str = Form(...),
    admin_user: dict = Depends(require_admin),
):
    """Simple blog creation for debugging"""
    
    print(f"📝 SIMPLE_CREATE_BLOG: Creating blog '{title}'")
    
    try:
        from ..database import get_db
        db = await get_db()
        # Insert new blog without images or dates
        result = await db.execute("""
            INSERT INTO blogs (title, content, author_id, created_at, updated_at, published)
            VALUES (?, ?, ?, datetime('now'), datetime('now'), 1)
        """, (
            title,
            content,
            admin_user["id"]
        ))
        blog_id = result.last_insert_rowid if hasattr(result, 'last_insert_rowid') else 0
        
        await db.commit()
        
        print(f"✅ Simple blog created with ID: {blog_id}")
        
        return {
            "success": True,
            "id": blog_id,
            "title": title,
            "content": content[:100] + "..." if len(content) > 100 else content,
            "author": "Admin",
            "published": True
        }
        
    except Exception as e:
        print(f"❌ Error creating simple blog: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create blog: {str(e)}")

@router.put("/{blog_id}", response_model=dict)
async def update_blog(
    blog_id: int,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    competition_date: Optional[str] = Form(None),
    image1: Optional[UploadFile] = File(None),
    image2: Optional[UploadFile] = File(None),
    admin_user: dict = Depends(require_admin),
):
    """Update existing blog post (Admin only)"""
    
    print(f"📝 UPDATE_BLOG: Updating blog ID {blog_id}")
    
    try:
        from ..database import get_db
        db = await get_db()
        # Check if blog exists
        existing_blog = await db.fetchone("SELECT * FROM blogs WHERE id = ?", (blog_id,))
        
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
        await db.execute(query, update_values)
        await db.commit()
        
        print(f"✅ Blog updated successfully: ID {blog_id}")
        
        # Return updated blog
        return await get_blog(blog_id, db)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating blog: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update blog post: {str(e)}")

@router.delete("/{blog_id}")
async def delete_blog(
    blog_id: int,
    admin_user: dict = Depends(require_admin),
):
    """Delete blog post and associated images (Admin only)"""
    
    print(f"🗑️ DELETE_BLOG: Deleting blog ID {blog_id}")
    
    try:
        from ..database import get_db
        db = await get_db()
        # Get blog info before deletion
        blog = await db.fetchone("SELECT image1_path, image2_path, title FROM blogs WHERE id = ?", (blog_id,))
        
        if not blog:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
        # Delete the blog record
        await db.execute("DELETE FROM blogs WHERE id = ?", (blog_id,))
        await db.commit()
        
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
