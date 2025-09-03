from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date

# Authentication Schemas
class EmailCheck(BaseModel):
    email: EmailStr

class EmailCheckResponse(BaseModel):
    success: bool = True  # Add success field for frontend compatibility
    allowed: bool
    name: Optional[str] = None
    role: Optional[str] = None
    account_exists: bool = False

class CreateAccount(BaseModel):
    email: EmailStr
    password: str

class Login(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    email: str
    name: str
    role: str

class LoginResponse(BaseModel):
    success: bool
    user: Optional[User] = None
    message: Optional[str] = None

# Blog Schemas
class BlogBase(BaseModel):
    title: str
    content: str
    competition_date: Optional[date] = None

class BlogCreate(BlogBase):
    pass

class BlogUpdate(BlogBase):
    title: Optional[str] = None
    content: Optional[str] = None
    competition_date: Optional[date] = None

class Blog(BlogBase):
    id: int
    image1_url: Optional[str] = None
    image2_url: Optional[str] = None
    author: str
    created_at: datetime
    updated_at: datetime
    published: bool = True

    class Config:
        from_attributes = True

    @classmethod
    def from_db(cls, row):
        """Create Blog instance from database row"""
        # Handle date conversion safely
        comp_date = None
        if row[3]:  # competition_date is at index 3
            if isinstance(row[3], str):
                # If it's a string, try to parse it
                try:
                    from datetime import datetime
                    comp_date = datetime.strptime(row[3], "%Y-%m-%d").date()
                except:
                    comp_date = None
            else:
                comp_date = row[3]
        
        return cls(
            id=row[0],
            title=row[1],
            content=row[2],
            competition_date=comp_date,
            image1_url=f"/uploads/images/{row[4]}" if row[4] else None,  # image1_path is at index 4
            image2_url=f"/uploads/images/{row[5]}" if row[5] else None,  # image2_path is at index 5
            created_at=row[6],  # created_at is at index 6
            updated_at=row[7],  # updated_at is at index 7
            author=row[8] if len(row) > 8 else "Admin"  # author name from join is at index 8
        )

class BlogList(BaseModel):
    blogs: List[Blog]
    total: int
    page: int
    pages: int

# Resource Schemas
class ResourceBase(BaseModel):
    title: str
    description: Optional[str] = None

class ResourceCreate(ResourceBase):
    pass

class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class Resource(ResourceBase):
    id: int
    filename: str
    original_filename: str
    file_path: str
    file_size: int
    file_type: str
    mime_type: str
    upload_date: datetime
    uploaded_by: int
    download_count: int = 0
    is_active: bool = True

    class Config:
        from_attributes = True

class PublicResource(BaseModel):
    """Public view of resource (excludes file_path)"""
    id: int
    title: str
    description: Optional[str] = None
    original_filename: str
    file_size: int
    file_type: str
    upload_date: datetime
    download_count: int = 0

class ResourceList(BaseModel):
    resources: List[Resource]
    total: int
    page: int
    pages: int

class PublicResourceList(BaseModel):
    resources: List[PublicResource]
    total: int
    page: int
    pages: int

# Public Access Schemas
class PublicResourceCheck(BaseModel):
    email: EmailStr

class PublicResourceResponse(BaseModel):
    permitted: bool
    message: str
    name: Optional[str] = None
    account_exists: Optional[bool] = None
    contact_info: Optional[str] = None

# General Response Schemas
class HealthResponse(BaseModel):
    status: str
    message: str

class SuccessResponse(BaseModel):
    success: bool
    message: str

# Admin Dashboard Schemas
class DashboardStats(BaseModel):
    total_members: int
    total_blogs: int
    total_resources: int
    recent_registrations: int

class MemberManagement(BaseModel):
    id: int
    email: str
    name: str
    role: str
    created_at: datetime

class MemberUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None

class AddMemberEmail(BaseModel):
    email: EmailStr
    name: str
    role: str = "member"

# Author Schemas
class AuthorBase(BaseModel):
    username: str
    bio: Optional[str] = None

class AuthorCreate(AuthorBase):
    user_id: int

class Author(AuthorBase):
    id: int
    user_id: int
    created_at: datetime
    user_name: str
    user_email: str

# Carousel Schemas
class CarouselImage(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    image_url: str
    display_order: int
    active: bool
    created_at: datetime
    
    @classmethod
    def from_db(cls, row):
        return cls(
            id=row[0],
            title=row[1], 
            description=row[2],
            image_url=f"/uploads/carousel/{row[3]}" if row[3] else None,
            display_order=row[4],
            active=bool(row[5]),
            created_at=row[6]
        )

class CarouselImageCreate(BaseModel):
    title: str
    description: Optional[str] = None
    display_order: int = 0

# Enhanced Blog Schema with Author
class BlogWithAuthor(BlogBase):
    id: int
    image1_url: Optional[str] = None
    image2_url: Optional[str] = None
    author: str  # Author username
    author_name: str  # Author real name
    created_at: datetime
    updated_at: datetime
    published: bool = True

    @classmethod
    def from_db(cls, row):
        """Create Blog instance from database row"""
        return cls(
            id=row[0],
            title=row[1],
            content=row[2],
            competition_date=row[3],
            image1_url=f"/uploads/images/{row[4]}" if row[4] else None,
            image2_url=f"/uploads/images/{row[5]}" if row[5] else None,
            created_at=row[6],
            updated_at=row[7],
            author=row[8] if len(row) > 8 else "Admin",
            author_name=row[9] if len(row) > 9 else "Admin"
        )
