from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form, Request
from fastapi.responses import FileResponse
from typing import Optional, List
import os
import uuid
from datetime import datetime
from math import ceil
import aiofiles
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

# Ensure upload directory exists
os.makedirs(RESOURCES_DIR, exist_ok=True)

def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    return Path(filename).suffix.lower()

def validate_file(file: UploadFile) -> bool:
    """Validate uploaded file"""
    extension = get_file_extension(file.filename)
    return (
        extension in ALLOWED_EXTENSIONS and
        file.content_type in ALLOWED_MIME_TYPES and
        file.size <= MAX_FILE_SIZE
    )

def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename while preserving the extension"""
    extension = get_file_extension(original_filename)
    unique_id = str(uuid.uuid4())
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"resource_{timestamp}_{unique_id}{extension}"

# PUBLIC ENDPOINTS (no authentication required)

@router.get("/public", response_model=PublicResourceList)
async def get_public_resources(
    search: Optional[str] = Query(None),
    file_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
):
    """List publicly available resources (limited view)"""
    try:
        from ..database import get_db
        db = await get_db()
        
        offset = (page - 1) * limit
        
        # Build query with filters (only public resources)
        where_conditions = ["r.is_active = 1", "r.is_public = 1"]
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
        
        # Get resources (limited view for public)
        query = f"""
            SELECT r.id, r.title, r.description, r.file_type, r.file_size, r.created_at, r.download_count
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
                file_type=row[3],
                file_size=row[4],
                created_at=row[5],
                download_count=row[6]
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
        raise HTTPException(status_code=500, detail="Failed to fetch public resources")

# MEMBER ENDPOINTS (require authentication)

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
                created_at=row[9],
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

@router.get("/{resource_id}")
async def get_resource(
    resource_id: int,
    user: dict = Depends(get_current_user)
):
    """Get a specific resource by ID"""
    try:
        from ..database import get_db
        db = await get_db()
        
        query = """
            SELECT id, title, description, filename, original_filename, file_path, 
                   file_size, file_type, mime_type, created_at, uploaded_by, 
                   download_count, is_active
            FROM resources 
            WHERE id = ? AND is_active = 1
        """
        row = await db.fetchone(query, [resource_id])
        
        if not row:
            raise HTTPException(status_code=404, detail="Resource not found")
        
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
            created_at=row[9],
            uploaded_by=row[10],
            download_count=row[11],
            is_active=row[12]
        )
        
        return resource
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching resource: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch resource")

@router.get("/{resource_id}/download")
async def download_resource(
    resource_id: int,
    user: dict = Depends(get_current_user)
):
    """Download a resource file"""
    try:
        from ..database import get_db
        db = await get_db()
        
        # Get resource details
        query = """
            SELECT filename, original_filename, file_path, download_count 
            FROM resources 
            WHERE id = ? AND is_active = 1
        """
        row = await db.fetchone(query, [resource_id])
        
        if not row:
            raise HTTPException(status_code=404, detail="Resource not found")
        
        filename, original_filename, file_path, download_count = row
        
        # Check if file exists
        full_path = os.path.join(RESOURCES_DIR, filename)
        if not os.path.exists(full_path):
            raise HTTPException(status_code=404, detail="File not found on server")
        
        # Update download count
        update_query = "UPDATE resources SET download_count = ? WHERE id = ?"
        await db.execute(update_query, [download_count + 1, resource_id])
        
        # Return file
        return FileResponse(
            path=full_path,
            filename=original_filename,
            media_type='application/octet-stream'
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error downloading resource: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to download resource")

# ADMIN ENDPOINTS (require admin role)

@router.post("", response_model=Resource)
async def create_resource(
    title: str = Form(...),
    description: str = Form(...),
    is_public: bool = Form(False),
    file: UploadFile = File(...),
    user: dict = Depends(require_admin)
):
    """Upload a new resource (admin only)"""
    try:
        from ..database import get_db
        db = await get_db()
        
        # Validate file
        if not validate_file(file):
            raise HTTPException(
                status_code=400, 
                detail="Invalid file type, size, or format"
            )
        
        # Generate unique filename
        filename = generate_unique_filename(file.filename)
        file_path = os.path.join(RESOURCES_DIR, filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as buffer:
            content = await file.read()
            await buffer.write(content)
        
        # Get file info
        file_size = len(content)
        file_type = get_file_extension(file.filename)
        
        # Insert into database
        query = """
            INSERT INTO resources (
                title, description, filename, original_filename, file_path,
                file_size, file_type, mime_type, uploaded_by, is_public
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        params = [
            title, description, filename, file.filename, filename,
            file_size, file_type, file.content_type, user["email"], is_public
        ]
        
        result = await db.execute(query, params)
        resource_id = result  # Turso returns the inserted ID
        
        # Return the created resource
        get_query = """
            SELECT id, title, description, filename, original_filename, file_path,
                   file_size, file_type, mime_type, created_at, uploaded_by,
                   download_count, is_active
            FROM resources WHERE id = ?
        """
        row = await db.fetchone(get_query, [resource_id])
        
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
            created_at=row[9],
            uploaded_by=row[10],
            download_count=row[11],
            is_active=row[12]
        )
        
        return resource
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating resource: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create resource")

@router.put("/{resource_id}", response_model=Resource)
async def update_resource(
    resource_id: int,
    update_data: ResourceUpdate,
    user: dict = Depends(require_admin)
):
    """Update a resource (admin only)"""
    try:
        from ..database import get_db
        db = await get_db()
        
        # Check if resource exists
        check_query = "SELECT id FROM resources WHERE id = ?"
        existing = await db.fetchone(check_query, [resource_id])
        
        if not existing:
            raise HTTPException(status_code=404, detail="Resource not found")
        
        # Update resource
        query = """
            UPDATE resources 
            SET title = ?, description = ?, is_public = ?
            WHERE id = ?
        """
        params = [update_data.title, update_data.description, update_data.is_public, resource_id]
        await db.execute(query, params)
        
        # Return updated resource
        get_query = """
            SELECT id, title, description, filename, original_filename, file_path,
                   file_size, file_type, mime_type, created_at, uploaded_by,
                   download_count, is_active
            FROM resources WHERE id = ?
        """
        row = await db.fetchone(get_query, [resource_id])
        
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
            created_at=row[9],
            uploaded_by=row[10],
            download_count=row[11],
            is_active=row[12]
        )
        
        return resource
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating resource: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update resource")

@router.delete("/{resource_id}", response_model=SuccessResponse)
async def delete_resource(
    resource_id: int,
    user: dict = Depends(require_admin)
):
    """Delete a resource (admin only)"""
    try:
        from ..database import get_db
        db = await get_db()
        
        # Get resource details before deletion
        query = """
            SELECT filename FROM resources 
            WHERE id = ? AND is_active = 1
        """
        row = await db.fetchone(query, [resource_id])
        
        if not row:
            raise HTTPException(status_code=404, detail="Resource not found")
        
        filename = row[0]
        
        # Soft delete in database
        delete_query = "UPDATE resources SET is_active = 0 WHERE id = ?"
        await db.execute(delete_query, [resource_id])
        
        # Optionally delete the actual file
        file_path = os.path.join(RESOURCES_DIR, filename)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"⚠️ Could not delete file {filename}: {str(e)}")
        
        return SuccessResponse(message="Resource deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting resource: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete resource")
