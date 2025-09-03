from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from app.database import get_db
from app.schemas import BlogList, Blog
from math import ceil
import os



router = APIRouter(prefix="/api", tags=["public"])

@router.get("/blogs", response_model=BlogList)
async def get_blogs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    cur = Depends(get_db)
):
    """Get all MUN competition blogs (PUBLIC ACCESS)"""
    offset = (page - 1) * limit
    
    # Get total count (Turso pattern)
    total_result = await cur.fetchone("SELECT COUNT(*) FROM blogs WHERE published = 1")
    total = total_result[0] if total_result else 0
    
    # Get blogs with author info (Turso pattern)
    blog_rows = await cur.fetchall("""
        SELECT b.id, b.title, b.content, b.image1_path, b.image2_path,
               b.competition_date, b.created_at, b.updated_at, b.published,
               u.name as author_name
        FROM blogs b
        JOIN users u ON b.author_id = u.id
        WHERE b.published = 1
        ORDER BY b.competition_date DESC, b.created_at DESC
        LIMIT ? OFFSET ?
    """, (limit, offset))
    blogs = []
    for row in blog_rows:
        blog_data = {
            "id": row[0],
            "title": row[1],
            "content": row[2],
            "image1_path": row[3],
            "image2_path": row[4],
            "competition_date": row[5],
            "created_at": row[6],
            "updated_at": row[7],
            "published": row[8],
            "author_name": row[9]
        }
        blog = Blog(
            id=blog_data["id"],
            title=blog_data["title"],
            content=blog_data["content"],
            image1_url=f"/uploads/images/{blog_data['image1_path']}" if blog_data.get("image1_path") else None,
            image2_url=f"/uploads/images/{blog_data['image2_path']}" if blog_data.get("image2_path") else None,
            competition_date=blog_data.get("competition_date"),
            author=blog_data["author_name"],
            created_at=blog_data["created_at"],
            updated_at=blog_data["updated_at"],
            published=blog_data["published"]
        )
        blogs.append(blog)
    return BlogList(
        blogs=blogs,
        total=total,
        page=page,
        pages=ceil(total / limit) if total > 0 else 1
    )

@router.get("/blogs/{blog_id}", response_model=Blog)
async def get_blog(blog_id: int, cur = Depends(get_db)):
    """Get specific MUN blog post (PUBLIC ACCESS)"""
    row = await cur.fetchone("""
        SELECT b.id, b.title, b.content, b.image1_path, b.image2_path,
               b.competition_date, b.created_at, b.updated_at, b.published,
               u.name as author_name
        FROM blogs b
        JOIN users u ON b.author_id = u.id
        WHERE b.id = ? AND b.published = 1
    """, (blog_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Blog post not found")
    blog_data = {
        "id": row[0],
        "title": row[1],
        "content": row[2],
        "image1_path": row[3],
        "image2_path": row[4],
        "competition_date": row[5],
        "created_at": row[6],
        "updated_at": row[7],
        "published": row[8],
        "author_name": row[9]
    }
    return Blog(
        id=blog_data["id"],
        title=blog_data["title"],
        content=blog_data["content"],
        image1_url=f"/uploads/images/{blog_data['image1_path']}" if blog_data.get("image1_path") else None,
        image2_url=f"/uploads/images/{blog_data['image2_path']}" if blog_data.get("image2_path") else None,
        competition_date=blog_data.get("competition_date"),
        author=blog_data["author_name"],
        created_at=blog_data["created_at"],
        updated_at=blog_data["updated_at"],
        published=blog_data["published"]
    )
