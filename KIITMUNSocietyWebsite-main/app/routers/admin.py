from fastapi import APIRouter, Depends, HTTPException, Query, Request, File, UploadFile, Form
from fastapi.responses import FileResponse
from typing import List, Optional
from datetime import datetime, timedelta
import json
import os
import uuid
import aiofiles
from pathlib import Path
from pydantic import ValidationError

from app.database import get_db
from app.schemas import (
    DashboardStats, MemberManagement, MemberUpdate, 
    AddMemberEmail, SuccessResponse, AuthorCreate, Author
)
from app.auth import require_admin, get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Upload configuration
UPLOAD_PATH = os.getenv("UPLOAD_PATH", "./uploads")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "52428800"))  # 50MB
RESOURCES_DIR = os.path.join(UPLOAD_PATH, "resources")

# File validation
ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.txt', '.zip', '.rar', '.png', '.jpg', '.jpeg'}
ALLOWED_MIME_TYPES = {
    'application/pdf',
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'image/png',
    'image/jpeg'
}

# Ensure directories exist
os.makedirs(RESOURCES_DIR, exist_ok=True)

def validate_file(file: UploadFile) -> tuple[bool, str]:
    """Validate uploaded file"""
    # Check file extension
    if not file.filename:
        return False, "No filename provided"
    
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False, f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
    
    # Check file size
    if hasattr(file, 'size') and file.size and file.size > MAX_FILE_SIZE:
        return False, f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
    
    return True, "Valid"

def get_file_type_from_extension(filename: str) -> tuple[str, str]:
    """Get file type and MIME type from filename"""
    ext = Path(filename).suffix.lower()
    
    type_mapping = {
        '.pdf': ('pdf', 'application/pdf'),
        '.doc': ('doc', 'application/msword'),
        '.docx': ('docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
        '.txt': ('txt', 'text/plain'),
        '.zip': ('zip', 'application/zip'),
        '.rar': ('rar', 'application/x-rar-compressed'),
        '.png': ('png', 'image/png'),
        '.jpg': ('jpg', 'image/jpeg'),
        '.jpeg': ('jpeg', 'image/jpeg')
    }
    
    return type_mapping.get(ext, ('unknown', 'application/octet-stream'))

def generate_unique_filename(original_filename: str) -> str:
    """Generate unique filename while preserving extension"""
    ext = Path(original_filename).suffix
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    return f"resource_{timestamp}_{unique_id}{ext}"

# Simple test endpoint without authentication
@router.get("/test")
async def test_endpoint():
    """Simple test endpoint to verify connectivity"""
    print("🔍 TEST endpoint called successfully!")
    return {"message": "Admin router is working!", "status": "success"}

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    admin_user: dict = Depends(require_admin),
):
    """Get admin dashboard statistics"""
    
    try:
        from ..database import get_db
        db = await get_db()
        
        # Get total counts
        member_result = await db.fetchone("SELECT COUNT(*) FROM users WHERE role = 'member'")
        total_members = member_result[0] if member_result else 0
        
        blog_result = await db.fetchone("SELECT COUNT(*) FROM blogs")
        total_blogs = blog_result[0] if blog_result else 0
        
        resource_result = await db.fetchone("SELECT COUNT(*) FROM resources")
        total_resources = resource_result[0] if resource_result else 0
        
        # Get recent registrations (last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_result = await db.fetchone(
            "SELECT COUNT(*) FROM users WHERE created_at >= ?", 
            (thirty_days_ago,)
        )
        recent_registrations = recent_result[0] if recent_result else 0
        
        return DashboardStats(
            total_members=total_members,
            total_blogs=total_blogs,
            total_resources=total_resources,
            recent_registrations=recent_registrations
        )
        
    except Exception as e:
        print(f"❌ Error fetching dashboard stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard statistics")

@router.get("/members")
async def get_all_members(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    role_filter: Optional[str] = Query(None),
    # admin_user: dict = Depends(require_admin),  # Temporarily disable auth
):
    """Get all members with pagination and filtering"""
    
    # Write debug info to file
    with open("admin_debug.txt", "a") as f:
        f.write(f"GET /admin/members called - page={page}, limit={limit}, search={search}\n")
    
    print(f"🔍 GET /admin/members called - page={page}, limit={limit}, search={search}")
    
    try:
        from ..database import get_db
        db = await get_db()
        
        # Calculate offset
        offset = (page - 1) * limit
        
        # Build base query - Include password field
        base_query = "SELECT u.id, u.email, u.name, u.role, u.password, u.created_at FROM users u"
        count_query = "SELECT COUNT(*) FROM users u"
        
        conditions = []
        params = []
        
        # Add search filter
        if search:
            conditions.append("(u.email LIKE ? OR u.name LIKE ?)")
            search_param = f"%{search}%"
            params.extend([search_param, search_param])
        
        # Add role filter
        if role_filter:
            conditions.append("u.role = ?")
            params.append(role_filter)
        
        # Add WHERE clause if conditions exist
        if conditions:
            where_clause = " WHERE " + " AND ".join(conditions)
            base_query += where_clause
            count_query += where_clause
        
        # Get total count
        total_result = await db.fetchone(count_query, params)
        total = total_result[0] if total_result else 0
        
        # Calculate total pages
        total_pages = (total + limit - 1) // limit
        
        # Get members with pagination
        base_query += " ORDER BY u.created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        members_data = await db.fetchall(base_query, params)
        
        members = [
            {
                "id": row[0],
                "email": row[1],
                "name": row[2],
                "role": row[3],
                "password": row[4],  # Added password field
                "created_at": row[5]  # Updated index for created_at
            }
            for row in members_data
        ]
        
        return {
            "members": members,
            "total": total,
            "total_pages": total_pages,
            "current_page": page,
            "limit": limit
        }
    
    except Exception as e:
        error_msg = f"Error fetching members: {str(e)}"
        print(f"❌ {error_msg}")
        
        # Write error to file
        with open("admin_debug.txt", "a") as f:
            f.write(f"ERROR in get_all_members: {error_msg}\n")
            import traceback
            f.write(f"Traceback: {traceback.format_exc()}\n")
        
        raise HTTPException(status_code=500, detail="Failed to fetch members")

@router.put("/members/{member_id}", response_model=SuccessResponse)
async def update_member(
    member_id: int,
    member_update: MemberUpdate,
    # admin_user: dict = Depends(require_admin),  # Temporarily disable auth
):
    """Update member information"""
    
    # Add debug logging
    with open("admin_debug.txt", "a") as f:
        f.write(f"PUT /admin/members/{member_id} called\n")
        f.write(f"Update data: {member_update}\n")
    
    try:
        from ..database import get_db
        db = await get_db()
        
        # Check if member exists
        existing_member = await db.fetchone("SELECT id, email FROM users WHERE id = ?", (member_id,))
        
        if not existing_member:
            raise HTTPException(status_code=404, detail="Member not found")
        
        current_email = existing_member[1]
        
        # Build update query
        update_fields = []
        update_values = []
        
        # Handle email update with uniqueness check
        if member_update.email is not None and member_update.email != current_email:
            # Check if new email already exists for another user
            existing_email = await db.fetchone("SELECT id FROM users WHERE email = ? AND id != ?", (member_update.email, member_id))
            
            if existing_email:
                raise HTTPException(status_code=400, detail="Email already exists for another user")
            
            update_fields.append("email = ?")
            update_values.append(member_update.email)
        
        # Handle name update
        if member_update.name is not None:
            update_fields.append("name = ?")
            update_values.append(member_update.name)
        
        # Handle role update
        if member_update.role is not None:
            if member_update.role not in ["admin", "member"]:
                raise HTTPException(status_code=400, detail="Invalid role. Must be 'admin' or 'member'")
            update_fields.append("role = ?")
            update_values.append(member_update.role)
        
        # Handle password update (only if provided and not empty)
        if member_update.password is not None and member_update.password.strip():
            update_fields.append("password = ?")
            update_values.append(member_update.password.strip())
        
        # Check if there are any fields to update
        if not update_fields:
            raise HTTPException(status_code=400, detail="No valid fields provided for update")
        
        # Execute update
        update_values.append(member_id)
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
        
        await db.execute(query, tuple(update_values))
        
        # Log success
        with open("admin_debug.txt", "a") as f:
            f.write(f"SUCCESS: Member {member_id} updated successfully\n")
        
        return SuccessResponse(
            success=True,
            message="Member updated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Error updating member: {str(e)}"
        print(f"❌ {error_msg}")
        
        # Write error to file
        with open("admin_debug.txt", "a") as f:
            f.write(f"ERROR in update_member: {error_msg}\n")
            import traceback
            f.write(f"Traceback: {traceback.format_exc()}\n")
        
        raise HTTPException(status_code=500, detail="Failed to update member")

@router.delete("/members/{member_id}", response_model=SuccessResponse)
async def delete_member(
    member_id: int,
    admin_user: dict = Depends(require_admin),
    cur = Depends(get_db)
):
    """Delete member account with proper cascade handling"""
    
    try:
        # Log the delete attempt
        with open("admin_debug.txt", "a") as f:
            f.write(f"DELETE /admin/members/{member_id} called\n")
        
        # Check if member exists
        async with cur.execute("SELECT id, email, name, role FROM users WHERE id = ?", (member_id,)) as cursor:
            member = await cursor.fetchone()
        
        if not member:
            with open("admin_debug.txt", "a") as f:
                f.write(f"ERROR: Member {member_id} not found\n")
            raise HTTPException(status_code=404, detail="Member not found")
        
        member_data = {
            "id": member[0],
            "email": member[1], 
            "name": member[2],
            "role": member[3]
        }
        
        # Log member details
        with open("admin_debug.txt", "a") as f:
            f.write(f"Member to delete: {member_data}\n")
        
        # Prevent deletion of admin users
        if member_data["role"] == "admin":
            with open("admin_debug.txt", "a") as f:
                f.write(f"ERROR: Cannot delete admin user {member_id}\n")
            raise HTTPException(status_code=400, detail="Cannot delete admin users")
        
        # Handle dependent records manually (more reliable than CASCADE)
        
        # 1. Handle authors and their blogs
        async with cur.execute("SELECT id FROM authors WHERE user_id = ?", (member_id,)) as cursor:
            author_records = await cursor.fetchall()
        
        if author_records:
            with open("admin_debug.txt", "a") as f:
                f.write(f"Found {len(author_records)} author records for user {member_id}\n")
            
            # Check if author has blogs and transfer them to admin
            async with cur.execute("SELECT id, title FROM blogs WHERE author_id = ?", (member_id,)) as cursor:
                blog_records = await cursor.fetchall()
            
            if blog_records:
                with open("admin_debug.txt", "a") as f:
                    f.write(f"Found {len(blog_records)} blogs by user {member_id}\n")
                
                # Find an admin user to transfer to
                async with cur.execute("SELECT id FROM users WHERE role = 'admin' AND id != ? LIMIT 1", (member_id,)) as cursor:
                    admin_user_result = await cursor.fetchone()
                
                if admin_user_result:
                    admin_user_id = admin_user_result[0]
                    with open("admin_debug.txt", "a") as f:
                        f.write(f"Transferring {len(blog_records)} blogs to admin user {admin_user_id}\n")
                    
                    # Update blogs to point to admin user
                    await cur.execute("UPDATE blogs SET author_id = ? WHERE author_id = ?", 
                                    (admin_user_id, member_id))
                else:
                    # If no admin found, delete the blogs (last resort)
                    with open("admin_debug.txt", "a") as f:
                        f.write(f"No admin found, deleting {len(blog_records)} blogs\n")
                    await cur.execute("DELETE FROM blogs WHERE author_id = ?", (member_id,))
            
            # Delete the author record
            await cur.execute("DELETE FROM authors WHERE user_id = ?", (member_id,))
        
        # 2. Handle resources - transfer to admin or delete
        async with cur.execute("SELECT id, title FROM resources WHERE uploaded_by = ?", (member_id,)) as cursor:
            resource_records = await cursor.fetchall()
        
        if resource_records:
            with open("admin_debug.txt", "a") as f:
                f.write(f"Found {len(resource_records)} resources uploaded by user {member_id}\n")
            
            # Find an admin user to transfer to
            async with cur.execute("SELECT id FROM users WHERE role = 'admin' AND id != ? LIMIT 1", (member_id,)) as cursor:
                admin_user_result = await cursor.fetchone()
            
            if admin_user_result:
                admin_user_id = admin_user_result[0]
                with open("admin_debug.txt", "a") as f:
                    f.write(f"Transferring {len(resource_records)} resources to admin user {admin_user_id}\n")
                
                await cur.execute("UPDATE resources SET uploaded_by = ? WHERE uploaded_by = ?", 
                                (admin_user_id, member_id))
            else:
                # If no admin found, delete the resources
                with open("admin_debug.txt", "a") as f:
                    f.write(f"No admin found, deleting {len(resource_records)} resources\n")
                await cur.execute("DELETE FROM resources WHERE uploaded_by = ?", (member_id,))
        
        # 3. Now safe to delete the user
        await cur.execute("DELETE FROM users WHERE id = ?", (member_id,))
        await cur.commit()
        
        # Log success
        with open("admin_debug.txt", "a") as f:
            f.write(f"SUCCESS: Member {member_id} ({member_data['name']}) deleted successfully\n")
        
        return SuccessResponse(
            success=True,
            message=f"Member '{member_data['name']}' deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Error deleting member {member_id}: {str(e)}"
        print(f"❌ {error_msg}")
        
        # Log detailed error information
        with open("admin_debug.txt", "a") as f:
            f.write(f"ERROR in delete_member: {error_msg}\n")
            import traceback
            f.write(f"Traceback: {traceback.format_exc()}\n")
        
        # Rollback any changes
        try:
            await cur.rollback()
        except:
            pass
        
        # Provide more specific error message based on the error type
        if "FOREIGN KEY constraint failed" in str(e):
            raise HTTPException(
                status_code=400, 
                detail="Cannot delete member: User has associated data that could not be transferred"
            )
        elif "database is locked" in str(e):
            raise HTTPException(
                status_code=503, 
                detail="Database is temporarily busy, please try again"
            )
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to delete member: {str(e)[:100]}..."  # Truncate long error messages
            )

@router.post("/members/add-email", response_model=SuccessResponse)
async def add_allowed_email(
    request: Request
    # admin_user: dict = Depends(require_admin),  # Temporarily disable auth
):
    """Add email to allowed_emails list"""
    
    # Handle both application/json and text/plain content types
    content_type = request.headers.get('content-type', '').lower()
    
    try:
        if 'application/json' in content_type:
            # Standard JSON parsing
            body = await request.json()
        else:
            # Handle text/plain or other content types
            body_text = await request.body()
            body = json.loads(body_text.decode('utf-8'))
        
        # Validate the parsed data using Pydantic
        email_data = AddMemberEmail(**body)
        
    except json.JSONDecodeError as e:
        with open("admin_debug.txt", "a") as f:
            f.write(f"JSON Decode Error: {str(e)}\n")
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except ValidationError as e:
        with open("admin_debug.txt", "a") as f:
            f.write(f"Validation Error: {str(e)}\n")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        with open("admin_debug.txt", "a") as f:
            f.write(f"Request parsing error: {str(e)}\n")
        raise HTTPException(status_code=400, detail="Failed to parse request")
    """Add email to allowed_emails list"""
    
    # Write debug info to file
    with open("admin_debug.txt", "a") as f:
        f.write(f"POST /admin/members/add-email called\n")
        f.write(f"Raw request headers: {dict(request.headers)}\n")
        f.write(f"email_data: {email_data}\n")
        f.write(f"Content-Type: {request.headers.get('content-type', 'Not set')}\n")
        f.write(f"Authorization: {request.headers.get('authorization', 'Not set')}\n")
    
    print(f"🔍 POST /admin/members/add-email called")
    print(f"🔍 Raw request headers: {dict(request.headers)}")
    print(f"🔍 Parsed email_data: {email_data}")
    print(f"🔍 email_data.email: {email_data.email}")
    print(f"🔍 email_data.name: {email_data.name}")
    print(f"🔍 email_data.role: {email_data.role}")
    
    try:
        from ..database import get_db
        db = await get_db()
        
        # Check if email already exists
        existing_email = await db.fetchone("SELECT email FROM allowed_emails WHERE email = ?", (email_data.email,))
        
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already in allowed list")
        
        # Add to allowed_emails
        await db.execute("""
            INSERT INTO allowed_emails (email, name, role)
            VALUES (?, ?, ?)
        """, (email_data.email, email_data.name, email_data.role))
        
        # Write success to debug file
        with open("admin_debug.txt", "a") as f:
            f.write(f"SUCCESS: Email {email_data.email} added to allowed list\n")
        
        return SuccessResponse(
            success=True,
            message=f"Email {email_data.email} added to allowed list"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Error adding email: {str(e)}"
        print(f"❌ {error_msg}")
        
        # Write error to file
        with open("admin_debug.txt", "a") as f:
            f.write(f"ERROR in add_allowed_email: {error_msg}\n")
            import traceback
            f.write(f"Traceback: {traceback.format_exc()}\n")
        
        raise HTTPException(status_code=500, detail="Failed to add email")

@router.get("/authors", response_model=List[Author])
async def get_all_authors(
    admin_user: dict = Depends(require_admin),
    cur = Depends(get_db)
):
    """Get all blog authors"""
    
    try:
        await cur.execute("""
            SELECT a.id, a.username, a.user_id, a.bio, a.created_at,
                   u.name, u.email
            FROM authors a
            JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
        """)
        authors_data = await cur.fetchall()
        
        authors = [
            Author(
                id=row[0],
                username=row[1],
                user_id=row[2],
                bio=row[3],
                created_at=row[4],
                user_name=row[5],
                user_email=row[6]
            )
            for row in authors_data
        ]
        
        return authors
        
    except Exception as e:
        print(f"❌ Error fetching authors: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch authors")

@router.post("/authors", response_model=SuccessResponse)
async def create_author(
    author: AuthorCreate,
    admin_user: dict = Depends(require_admin),
    cur = Depends(get_db)
):
    """Create new blog author"""
    
    try:
        # Check if user exists
        async with cur.execute("SELECT id FROM users WHERE id = ?", (author.user_id,)) as cursor:
            user_exists = await cursor.fetchone()
        if not user_exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if username is unique
        async with cur.execute("SELECT id FROM authors WHERE username = ?", (author.username,)) as cursor:
            username_exists = await cursor.fetchone()
        if username_exists:
            raise HTTPException(status_code=400, detail="Username already exists")
        
        # Create author
        await cur.execute("""
            INSERT INTO authors (username, user_id, bio)
            VALUES (?, ?, ?)
        """, (author.username, author.user_id, author.bio))
        await cur.commit()
        
        return SuccessResponse(
            success=True,
            message="Author created successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating author: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create author")

@router.get("/blogs")
async def get_all_blogs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    admin_user: dict = Depends(require_admin),
):
    """Get all blogs with pagination and filtering"""
    
    # Write debug info to file
    with open("admin_debug.txt", "a") as f:
        f.write(f"GET /admin/blogs called - page={page}, limit={limit}, search={search}\n")
    
    print(f"🔍 GET /admin/blogs called - page={page}, limit={limit}, search={search}")
    
    try:
        from ..database import get_db
        db = await get_db()
        
        # Calculate offset
        offset = (page - 1) * limit
        
        # Build base query with author information
        base_query = """
            SELECT b.id, b.title, b.content, b.competition_date, 
                   b.image_path, b.image1_path, b.image2_path, b.published,
                   b.created_at, b.updated_at,
                   u.name as author_name, u.email as author_email
            FROM blogs b
            LEFT JOIN users u ON b.author_id = u.id
        """
        count_query = "SELECT COUNT(*) FROM blogs b"
        
        conditions = []
        params = []
        
        # Add search filter (search in title and content)
        if search:
            conditions.append("""
                (b.title LIKE ? OR b.content LIKE ? OR u.name LIKE ?)
            """)
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param])
            # Also need to join users table in count query for search
            count_query = "SELECT COUNT(*) FROM blogs b LEFT JOIN users u ON b.author_id = u.id"
        
        # Add WHERE clause if conditions exist
        if conditions:
            where_clause = " WHERE " + " AND ".join(conditions)
            base_query += where_clause
            count_query += where_clause
        
        # Get total count
        total_result = await db.fetchone(count_query, params)
        total = total_result[0] if total_result else 0
        
        # Calculate total pages
        total_pages = (total + limit - 1) // limit
        
        # Get blogs with pagination
        base_query += " ORDER BY b.created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        blogs_data = await db.fetchall(base_query, params)
        
        blogs = [
            {
                "id": row[0],
                "title": row[1],
                "content": row[2],
                "competition_date": row[3],
                "image_path": row[4],
                "image1_path": row[5],
                "image2_path": row[6],
                "published": row[7],
                "created_at": row[8],
                "updated_at": row[9],
                "author_name": row[10] or "Unknown Author",
                "author_email": row[11] or "No Email"
            }
            for row in blogs_data
        ]
        
        return {
            "blogs": blogs,
            "total": total,
            "total_pages": total_pages,
            "current_page": page,
            "limit": limit
        }
    
    except Exception as e:
        error_msg = f"Error fetching blogs: {str(e)}"
        print(f"❌ {error_msg}")
        
        # Write error to file
        with open("admin_debug.txt", "a") as f:
            f.write(f"ERROR in get_all_blogs: {error_msg}\n")
            import traceback
            f.write(f"Traceback: {traceback.format_exc()}\n")
        
        raise HTTPException(status_code=500, detail="Failed to fetch blogs")

@router.delete("/blogs/{blog_id}", response_model=SuccessResponse)
async def delete_blog(
    blog_id: int,
    admin_user: dict = Depends(require_admin),
):
    """Delete a blog post"""
    
    try:
        from ..database import get_db
        db = await get_db()
        
        # Log the delete attempt
        with open("admin_debug.txt", "a") as f:
            f.write(f"DELETE /admin/blogs/{blog_id} called\n")
        
        # Check if blog exists
        blog = await db.fetchone("SELECT id, title, image_path FROM blogs WHERE id = ?", (blog_id,))
        
        if not blog:
            with open("admin_debug.txt", "a") as f:
                f.write(f"ERROR: Blog {blog_id} not found\n")
            raise HTTPException(status_code=404, detail="Blog not found")
        
        blog_data = {
            "id": blog[0],
            "title": blog[1],
            "image_path": blog[2]
        }
        
        # Log blog details
        with open("admin_debug.txt", "a") as f:
            f.write(f"Blog to delete: {blog_data}\n")
        
        # Delete the blog
        await db.execute("DELETE FROM blogs WHERE id = ?", (blog_id,))
        
        # Log success
        with open("admin_debug.txt", "a") as f:
            f.write(f"SUCCESS: Blog {blog_id} ({blog_data['title']}) deleted successfully\n")
        
        return SuccessResponse(
            success=True,
            message=f"Blog '{blog_data['title']}' deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Error deleting blog {blog_id}: {str(e)}"
        print(f"❌ {error_msg}")
        
        # Log detailed error information
        with open("admin_debug.txt", "a") as f:
            f.write(f"ERROR in delete_blog: {error_msg}\n")
            import traceback
            f.write(f"Traceback: {traceback.format_exc()}\n")
        
        raise HTTPException(status_code=500, detail=f"Failed to delete blog: {str(e)[:100]}...")

@router.get("/blogs/{blog_id}")
async def get_blog_details(
    blog_id: int,
    admin_user: dict = Depends(require_admin),
):
    """Get detailed information about a specific blog"""
    
    try:
        from ..database import get_db
        db = await get_db()
        blog_data = await db.fetchone("""
            SELECT b.id, b.title, b.content, b.competition_date, 
                   b.image_path, b.image1_path, b.image2_path, b.published,
                   b.created_at, b.updated_at, b.author_id,
                   u.name as author_name, u.email as author_email
            FROM blogs b
            LEFT JOIN users u ON b.author_id = u.id
            WHERE b.id = ?
        """, (blog_id,))
        
        if not blog_data:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        blog = {
            "id": blog_data[0],
            "title": blog_data[1],
            "content": blog_data[2],
            "competition_date": blog_data[3],
            "image_path": blog_data[4],
            "image1_path": blog_data[5],
            "image2_path": blog_data[6],
            "published": blog_data[7],
            "created_at": blog_data[8],
            "updated_at": blog_data[9],
            "author_id": blog_data[10],
            "author_name": blog_data[11] or "Unknown Author",
            "author_email": blog_data[12] or "No Email"
        }
        
        return blog
        
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Error fetching blog details: {str(e)}"
        print(f"❌ {error_msg}")
        raise HTTPException(status_code=500, detail="Failed to fetch blog details")

# Resource Upload Endpoint
@router.post("/resources/upload", response_model=SuccessResponse)
async def upload_resource(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    admin_user: dict = Depends(require_admin)
):
    """Upload new resource file (Admin only)"""
    try:
        from ..database import get_db
        db = await get_db()
        
        # Validate file
        is_valid, error_msg = validate_file(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Read file content to check size
        content = await file.read()
        file_size = len(content)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413, 
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        if file_size == 0:
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Generate unique filename and get file info
        unique_filename = generate_unique_filename(file.filename)
        file_type, mime_type = get_file_type_from_extension(file.filename)
        file_path = os.path.join(RESOURCES_DIR, unique_filename)
        
        # Check if title already exists
        existing = await db.fetchone("SELECT id FROM resources WHERE title = ? AND is_active = 1", (title,))
        if existing:
            raise HTTPException(status_code=409, detail="A resource with this title already exists")
        
        # Save file to disk
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # Save to database
        await db.execute("""
            INSERT INTO resources (
                title, description, filename, original_filename, file_path, 
                file_size, file_type, mime_type, uploaded_by, created_at,
                download_count, is_active
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 0, 1)
        """, (
            title,
            description,
            unique_filename,
            file.filename,
            file_path,
            file_size,
            file_type,
            mime_type,
            admin_user["id"]
        ))
        
        return SuccessResponse(
            success=True,
            message=f"Resource '{title}' uploaded successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        # Clean up file if database insert fails
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        print(f"❌ Error uploading resource: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload resource: {str(e)}")
