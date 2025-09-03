from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
import aiofiles
import os
import uuid
from datetime import datetime
from typing import List, Optional
from ..auth import get_current_user, require_admin
from ..database import get_db_connection
from ..schemas import CarouselImage, CarouselImageCreate

router = APIRouter(prefix="/api/carousel", tags=["carousel"])

# Directory for carousel images
CAROUSEL_UPLOAD_DIR = "uploads/carousel"
os.makedirs(CAROUSEL_UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[CarouselImage])
async def get_carousel_images():
    """Get all active carousel images ordered by display_order"""
    async with get_db_connection() as db:
        async with db.execute(
            "SELECT id, title, description, image_path, display_order, active, created_at FROM carousel_images WHERE active = 1 ORDER BY display_order ASC"
        ) as cursor:
            rows = await cursor.fetchall()
            return [CarouselImage.from_db(row) for row in rows]

@router.post("/", response_model=CarouselImage)
async def create_carousel_image(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    display_order: int = Form(0),
    image: UploadFile = File(...),
    current_user=Depends(require_admin)
):
    """Create a new carousel image (admin only)"""
    
    # Validate image file
    if not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_extension = os.path.splitext(image.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(CAROUSEL_UPLOAD_DIR, unique_filename)
    
    # Save image file
    try:
        async with aiofiles.open(file_path, 'wb') as f:
            content = await image.read()
            await f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")
    
    # Save to database
    async with get_db_connection() as db:
        await db.execute(
            """INSERT INTO carousel_images (title, description, image_path, display_order, active, created_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (title, description, unique_filename, display_order, True, datetime.now())
        )
        await db.commit()
        
        # Get the created record
        async with db.execute(
            "SELECT id, title, description, image_path, display_order, active, created_at FROM carousel_images WHERE image_path = ?",
            (unique_filename,)
        ) as cursor:
            row = await cursor.fetchone()
            if row:
                return CarouselImage.from_db(row)
    
    raise HTTPException(status_code=500, detail="Failed to create carousel image")

@router.put("/{image_id}", response_model=CarouselImage)
async def update_carousel_image(
    image_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    display_order: Optional[int] = Form(None),
    active: Optional[bool] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user=Depends(require_admin)
):
    """Update carousel image (admin only)"""
    
    async with get_db_connection() as db:
        # Check if image exists
        async with db.execute(
            "SELECT id, title, description, image_path, display_order, active, created_at FROM carousel_images WHERE id = ?",
            (image_id,)
        ) as cursor:
            existing_row = await cursor.fetchone()
            if not existing_row:
                raise HTTPException(status_code=404, detail="Carousel image not found")
        
        # Prepare update data
        update_fields = []
        update_values = []
        
        if title is not None:
            update_fields.append("title = ?")
            update_values.append(title)
            
        if description is not None:
            update_fields.append("description = ?")
            update_values.append(description)
            
        if display_order is not None:
            update_fields.append("display_order = ?")
            update_values.append(display_order)
            
        if active is not None:
            update_fields.append("active = ?")
            update_values.append(active)
        
        # Handle image upload if provided
        if image:
            if not image.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail="File must be an image")
            
            # Delete old image
            old_image_path = os.path.join(CAROUSEL_UPLOAD_DIR, existing_row[3])
            if os.path.exists(old_image_path):
                try:
                    os.remove(old_image_path)
                except:
                    pass  # Continue if deletion fails
            
            # Save new image
            file_extension = os.path.splitext(image.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(CAROUSEL_UPLOAD_DIR, unique_filename)
            
            try:
                async with aiofiles.open(file_path, 'wb') as f:
                    content = await image.read()
                    await f.write(content)
                
                update_fields.append("image_path = ?")
                update_values.append(unique_filename)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")
        
        # Update database if there are changes
        if update_fields:
            update_values.append(image_id)
            await db.execute(
                f"UPDATE carousel_images SET {', '.join(update_fields)} WHERE id = ?",
                tuple(update_values)
            )
            await db.commit()
        
        # Return updated record
        async with db.execute(
            "SELECT id, title, description, image_path, display_order, active, created_at FROM carousel_images WHERE id = ?",
            (image_id,)
        ) as cursor:
            row = await cursor.fetchone()
            if row:
                return CarouselImage.from_db(row)
    
    raise HTTPException(status_code=500, detail="Failed to update carousel image")

@router.delete("/{image_id}")
async def delete_carousel_image(
    image_id: int,
    current_user=Depends(require_admin)
):
    """Delete carousel image (admin only)"""
    
    async with get_db_connection() as db:
        # Get image info before deletion
        async with db.execute(
            "SELECT image_path FROM carousel_images WHERE id = ?",
            (image_id,)
        ) as cursor:
            row = await cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Carousel image not found")
        
        image_path = row[0]
        
        # Delete from database
        await db.execute("DELETE FROM carousel_images WHERE id = ?", (image_id,))
        await db.commit()
        
        # Delete image file
        file_path = os.path.join(CAROUSEL_UPLOAD_DIR, image_path)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass  # Continue if deletion fails
    
    return {"message": "Carousel image deleted successfully"}

@router.get("/admin", response_model=List[CarouselImage])
async def get_all_carousel_images(current_user=Depends(require_admin)):
    """Get all carousel images including inactive ones (admin only)"""
    async with get_db_connection() as db:
        async with db.execute(
            "SELECT id, title, description, image_path, display_order, active, created_at FROM carousel_images ORDER BY display_order ASC"
        ) as cursor:
            rows = await cursor.fetchall()
            return [CarouselImage.from_db(row) for row in rows]

@router.post("/{image_id}/toggle")
async def toggle_carousel_image(
    image_id: int,
    current_user=Depends(require_admin)
):
    """Toggle active status of carousel image (admin only)"""
    
    async with get_db_connection() as db:
        # Check if image exists and get current status
        async with db.execute(
            "SELECT active FROM carousel_images WHERE id = ?",
            (image_id,)
        ) as cursor:
            row = await cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Carousel image not found")
        
        current_active = bool(row[0])
        new_active = not current_active
        
        # Update status
        await db.execute(
            "UPDATE carousel_images SET active = ? WHERE id = ?",
            (new_active, image_id)
        )
        await db.commit()
    
    return {"message": f"Carousel image {'activated' if new_active else 'deactivated'} successfully"}
