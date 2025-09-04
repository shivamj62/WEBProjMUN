from fastapi import APIRouter, Depends, HTTPException, Query, Form, Request
from fastapi.responses import FileResponse
from typing import Optional, List
import os
import uuid
from datetime import datetime
from math import ceil
from pathlib import Path

from app.schemas import ResourceList, Resource, SuccessResponse, PublicResourceList, PublicResource, ResourceUpdate
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/resources", tags=["resources"])

# Configuration
UPLOAD_PATH = os.getenv("UPLOAD_PATH", "./uploads")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "52428800"))  # 50MB
RESOURCES_DIR = os.path.join(UPLOAD_PATH, "resources")

# File validation
ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.txt', '.zip'}
ALLOWED_MIME_TYPES = {
    'application/pdf',
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
}

# Ensure directories exist
os.makedirs(RESOURCES_DIR, exist_ok=True)

def get_file_type_from_extension(filename: str) -> tuple[str, str]:
    """Get file type and MIME type from filename"""
    ext = Path(filename).suffix.lower()
    
    type_mapping = {
        '.pdf': ('pdf', 'application/pdf'),
        '.doc': ('doc', 'application/msword'),
        '.docx': ('docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
        '.txt': ('txt', 'text/plain'),
        '.zip': ('zip', 'application/zip')
    }
    
    return type_mapping.get(ext, ('unknown', 'application/octet-stream'))

def generate_unique_filename(original_filename: str) -> str:
    """Generate unique filename while preserving extension"""
    ext = Path(original_filename).suffix
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    return f"resource_{timestamp}_{unique_id}{ext}"

# Public endpoints (no authentication required)
@router.get("/public", response_model=PublicResourceList)
async def get_public_resources(
    search: Optional[str] = Query(None),
    file_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
):
    """Get public list of resources (no authentication required)"""
    
    try:
        from ..database import get_db
        db = await get_db()
        
        offset = (page - 1) * limit
        
        # Build query with filters
        where_conditions = ["r.is_active = 1"]
        params = []
        
        if search:
            where_conditions.append("(r.title LIKE ? OR r.description LIKE ?)")
            search_term = f"%{search}%"
            params.extend([search_term, search_term])
        
        if file_type:
            where_conditions.append("r.file_type = ?")
            params.append(file_type)
        
        where_clause = " AND ".join(where_conditions)
        
        # Get total count
        count_query = f"SELECT COUNT(*) FROM resources r WHERE {where_clause}"
        total_result = await db.fetchone(count_query, params)
        total = total_result[0] if total_result else 0
        
        # Get resources (public view - excludes file_path)
        query = f"""
            SELECT r.id, r.title, r.description, r.original_filename, 
                   r.file_size, r.file_type, r.created_at, r.download_count
            FROM resources r
            WHERE {where_clause}
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?
        """
        resource_rows = await db.fetchall(query, params + [limit, offset])

        resources = []
        for row in resource_rows:
            resource = PublicResource(
                id=row[0],
                title=row[1],
                description=row[2],
                original_filename=row[3],
                file_size=row[4],
                file_type=row[5],
                upload_date=row[6],  # created_at as upload_date
                download_count=row[7]
            )
            resources.append(resource)
        
        return PublicResourceList(
            resources=resources,
            total=total,
            page=page,
            pages=ceil(total / limit) if total > 0 else 1
        )
        
    except Exception as e:
        print(f"❌ Error in get_public_resources: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch resources")

# Member endpoints (authentication required)
@router.get("", response_model=ResourceList)
async def get_resources(
    search: Optional[str] = Query(None),
    file_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    user: dict = Depends(get_current_user),
):
    """List all available resources for authenticated members"""
    
    try:
        from ..database import get_db
        db = await get_db()
        
        offset = (page - 1) * limit
        
        # Build query with filters
        where_conditions = ["r.is_active = 1"]
        params = []
        
        if search:
            where_conditions.append("(r.title LIKE ? OR r.description LIKE ?)")
            search_term = f"%{search}%"
            params.extend([search_term, search_term])
        
        if file_type:
            where_conditions.append("r.file_type = ?")
            params.append(file_type)
        
        where_clause = " AND ".join(where_conditions)
        
        # Get total count
        count_query = f"SELECT COUNT(*) FROM resources r WHERE {where_clause}"
        total_result = await db.fetchone(count_query, params)
        total = total_result[0] if total_result else 0
        
        # Get resources (full view for authenticated users)
        query = f"""
            SELECT r.id, r.title, r.description, r.filename, r.original_filename, 
                   r.file_path, r.file_size, r.file_type, r.mime_type, r.created_at, 
                   r.uploaded_by, r.download_count, r.is_active
            FROM resources r
            WHERE {where_clause}
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?
        """
        resource_rows = await db.fetchall(query, params + [limit, offset])
        
        resources = []
        for row in resource_rows:
            resource = Resource(
                id=row[0],
                title=row[1],
                description=row[2],
                filename=row[3],
                original_filename=row[4],
                file_path=row[5],
                file_size=row[6],
                file_type=row[7],
                mime_type=row[8],
                upload_date=row[9],  # created_at as upload_date
                uploaded_by=row[10],
                download_count=row[11],
                is_active=row[12]
            )
            resources.append(resource)
        
        return ResourceList(
            resources=resources,
            total=total,
            page=page,
            pages=ceil(total / limit) if total > 0 else 1
        )
        
    except Exception as e:
        print(f"❌ Error fetching resources: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch resources")

@router.get("/{resource_id}", response_model=Resource)
async def get_resource_details(
    resource_id: int,
    user: dict = Depends(get_current_user)
):
    """Get detailed information about a specific resource"""
    from ..database import get_db
    db = await get_db()
    
    query = """
        SELECT r.id, r.title, r.description, r.filename, r.original_filename, 
               r.file_path, r.file_size, r.file_type, r.mime_type, r.created_at, 
               r.uploaded_by, r.download_count, r.is_active
        FROM resources r
        WHERE r.id = ? AND r.is_active = 1
    """
    resource = await db.fetchone(query, (resource_id,))
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return Resource(
        id=resource[0],
        title=resource[1],
        description=resource[2],
        filename=resource[3],
        original_filename=resource[4],
        file_path=resource[5],
        file_size=resource[6],
        file_type=resource[7],
        mime_type=resource[8],
        upload_date=resource[9],  # created_at as upload_date
        uploaded_by=resource[10],
        download_count=resource[11],
        is_active=resource[12]
    )

@router.get("/{resource_id}/download")
async def download_resource(
    resource_id: int,
    user: dict = Depends(get_current_user)
):
    """Download specific resource file"""
    print(f"🔽 Download request for resource {resource_id} by user {user.get('email', 'unknown')}")
    
    from ..database import get_db
    db = await get_db()
    
    # Get resource info
    query = """
        SELECT r.title, r.original_filename, r.file_path, r.mime_type 
        FROM resources r 
        WHERE r.id = ? AND r.is_active = 1
    """
    resource = await db.fetchone(query, (resource_id,))
    
    if not resource:
        print(f"❌ Resource {resource_id} not found in database")
        raise HTTPException(status_code=404, detail="Resource not found")
    
    file_path = resource[2]  # file_path
    original_filename = resource[1]  # original_filename
    mime_type = resource[3]  # mime_type
    
    print(f"📁 Looking for file at: {file_path}")
    print(f"📄 Original filename: {original_filename}")
    print(f"🎯 MIME type: {mime_type}")
    
    if not os.path.exists(file_path):
        print(f"❌ File not found on disk: {file_path}")
        print(f"📂 Current working directory: {os.getcwd()}")
        print(f"📂 Upload path from env: {os.getenv('UPLOAD_PATH', './uploads')}")
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    # Increment download count
    await db.execute(
        "UPDATE resources SET download_count = download_count + 1 WHERE id = ?",
        (resource_id,)
    )
    
    print(f"✅ Serving file: {file_path}")
    return FileResponse(
        path=file_path,
        filename=original_filename,
        media_type=mime_type or 'application/octet-stream'
    )

# Admin endpoints
@router.put("/{resource_id}", response_model=SuccessResponse)
async def update_resource(
    resource_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    admin_user: dict = Depends(require_admin)
):
    """Update resource metadata (Admin only)"""
    print(f"🔄 UPDATE REQUEST: resource_id={resource_id}, title={title}, description={description}")
    print(f"🔄 ADMIN USER: {admin_user.get('email', 'unknown')}")
    
    from ..database import get_db
    db = await get_db()
    
    # Check if resource exists
    resource = await db.fetchone("SELECT id, title FROM resources WHERE id = ? AND is_active = 1", (resource_id,))
    if not resource:
        print(f"❌ Resource {resource_id} not found")
        raise HTTPException(status_code=404, detail="Resource not found")
    
    print(f"✅ Found resource: {resource}")
    
    # Build update query
    updates = []
    params = []
    
    if title:
        # Check if new title conflicts with existing resources
        existing = await db.fetchone("SELECT id FROM resources WHERE title = ? AND id != ? AND is_active = 1", (title, resource_id))
        if existing:
            print(f"❌ Title conflict: {title}")
            raise HTTPException(status_code=409, detail="A resource with this title already exists")
        updates.append("title = ?")
        params.append(title)
        print(f"✅ Will update title to: {title}")
    
    if description is not None:  # Allow empty string
        updates.append("description = ?")
        params.append(description)
        print(f"✅ Will update description to: {description}")
    
    if not updates:
        print("ℹ️ No changes to update")
        return SuccessResponse(success=True, message="No changes to update")
    
    # Execute update - FIX: Don't add created_at update and fix params order
    params.append(resource_id)
    query = f"UPDATE resources SET {', '.join(updates)} WHERE id = ?"
    
    print(f"🔄 EXECUTING UPDATE: {query}")
    print(f"🔄 WITH PARAMS: {params}")
    
    result = await db.execute(query, params)
    
    print(f"✅ UPDATE COMPLETED")
    
    return SuccessResponse(
        success=True,
        message=f"Resource updated successfully"
    )

@router.delete("/{resource_id}", response_model=SuccessResponse)
async def delete_resource(
    resource_id: int,
    admin_user: dict = Depends(require_admin)
):
    """Delete resource file (Admin only) - Soft delete"""
    print(f"🗑️ DELETE REQUEST: resource_id={resource_id}")
    print(f"🗑️ ADMIN USER: {admin_user.get('email', 'unknown')}")
    
    from ..database import get_db
    db = await get_db()
    
    # Get resource info
    resource = await db.fetchone(
        "SELECT file_path, title, is_active FROM resources WHERE id = ?",
        (resource_id,)
    )
    
    if not resource or not resource[2]:  # Check if exists and is active
        print(f"❌ Resource {resource_id} not found or inactive")
        raise HTTPException(status_code=404, detail="Resource not found")
    
    print(f"✅ Found resource: {resource[1]}")
    
    # Soft delete - mark as inactive
    print(f"🔄 EXECUTING SOFT DELETE")
    result = await db.execute("UPDATE resources SET is_active = 0 WHERE id = ?", (resource_id,))
    
    print(f"✅ DELETE COMPLETED")
    
    title = resource[1]
    
    return SuccessResponse(
        success=True,
        message=f"Resource '{title}' deleted successfully"
    )

@router.delete("/{resource_id}/permanent", response_model=SuccessResponse)
async def permanently_delete_resource(
    resource_id: int,
    admin_user: dict = Depends(require_admin)
):
    """Permanently delete resource file and remove from disk (Admin only)"""
    from ..database import get_db
    db = await get_db()
    
    # Get resource info
    resource = await db.fetchone(
        "SELECT file_path, title FROM resources WHERE id = ?",
        (resource_id,)
    )
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    # Delete from database
    await db.execute("DELETE FROM resources WHERE id = ?", (resource_id,))
    
    file_path = resource[0]  # file_path
    title = resource[1]  # title
    
    # Delete file from disk
    if os.path.exists(file_path):
        os.remove(file_path)
    
    return SuccessResponse(
        success=True,
        message=f"Resource '{title}' permanently deleted"
    )

# Direct file serving endpoint (alternative to download with tracking)
@router.get("/files/{filename}")
async def serve_resource_file(
    filename: str,
    user: dict = Depends(get_current_user)
):
    """Serve resource file directly by filename"""
    from ..database import get_db
    db = await get_db()
    
    # Get resource info by filename
    resource = await db.fetchone(
        "SELECT file_path, original_filename, mime_type FROM resources WHERE filename = ? AND is_active = 1",
        (filename,)
    )
    
    if not resource:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = resource[0]
    original_filename = resource[1]
    mime_type = resource[2]
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(
        path=file_path,
        filename=original_filename,
        media_type=mime_type or 'application/octet-stream'
    )