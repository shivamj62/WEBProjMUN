<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# MUN Society Website - Copilot Instructions

This is a FastAPI-based web application for a Model United Nations (MUN) society with the following characteristics:

## Project Context
- **Technology Stack**: FastAPI, PostgreSQL, Python 3.8+
- **Authentication**: Simple email:password based (no JWT, no sessions)
- **User Capacity**: ~100 concurrent users
- **Storage**: 10GB local file storage
- **File Limits**: 50MB max per file

## Key Features
1. **Email-based Authentication**: Users must be pre-approved in `allowed_emails` table
2. **Role-based Access**: `admin` and `member` roles
3. **MUN Competition Blogs**: Public blog posts about MUN competitions with images
4. **Resource Sharing**: Protected file sharing for authenticated members
5. **File Management**: Local filesystem storage for images and documents

## Code Style Preferences
- Use async/await for all database operations
- Follow FastAPI best practices with proper dependency injection
- Use Pydantic models for request/response validation
- Keep authentication simple - verify credentials per request
- Store passwords in plain text as specifically requested
- Use meaningful error messages and HTTP status codes

## Database Schema
- `allowed_emails`: Pre-populated with permitted user emails and roles
- `users`: Created when accounts are set up (references allowed_emails)
- `blogs`: MUN competition reports with title, content, images, competition_date
- `resources`: Uploaded files with metadata for members

## API Structure
- Public routes: `/api/blogs`, `/api/health`, blog images
- Auth routes: `/api/auth/check-email`, `/api/auth/create-account`, `/api/auth/login`
- Member routes: `/api/resources` (requires authentication)
- Admin routes: Blog/resource management (requires admin role)

## File Handling
- Blog images: Publicly accessible via `/uploads/images/`
- Resources: Protected access via authentication
- Use `aiofiles` for async file operations
- Generate unique filenames to avoid conflicts
- Store original filenames in database for display

## Authentication Pattern
```python
# Use this pattern for protected routes
from fastapi import Depends, HTTPException, Header

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")
    
    try:
        email, password = authorization.split(":")
        # Verify credentials against database
        user = await verify_user_credentials(email, password)
        return user
    except:
        raise HTTPException(status_code=401, detail="Invalid credentials")
```

## Common Patterns
- Always use absolute file paths
- Handle multipart form data for file uploads
- Return proper JSON responses with consistent structure
- Use environment variables for configuration
- Include proper error handling for database operations
- Follow the principle of least privilege for access control

## Avoid
- Complex authentication systems (JWT, sessions, etc.)
- Password hashing (store plain text as requested)
- External dependencies for file storage
- Over-engineering simple features
- Breaking the simple email:password auth pattern
