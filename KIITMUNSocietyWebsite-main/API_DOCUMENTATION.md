# MUN Society Website API Documentation

## Overview
Complete FastAPI backend for Model United Nations Society website with streamlined admin and member management features.

## Features Implemented

### 🔐 Authentication & Authorization
- Email-based registration with pre-approved emails
- Role-based access control (Admin/Member)
- Session-based authentication using Authorization headers

### 👥 Admin Dashboard & Management
- **Dashboard Statistics**: Member counts, blog counts, resource counts, recent registrations
- **Member Management**: View, update, delete members
- **Email Management**: Add pre-approved emails for registration
- **Author Management**: Create blog authors linked to user accounts

### 👤 Member Features
- **Profile Management**: View and update personal profile
- **Resource Access**: Download resources

### 📝 Blog Management
- **CRUD Operations**: Create, read, update, delete blog posts
- **Image Support**: Multiple image uploads per blog post
- **Author Attribution**: Proper author tracking and display
- **Admin-only Creation**: Only admins can create/edit blogs

### 📁 Resource Management
- **File Upload**: Admin can upload resources
- **Download Access**: Members can download resources
- **File Management**: Proper file storage and cleanup
- **Search Functionality**: Search resources by name/description

## API Endpoints

### Authentication
```
POST /api/auth/check-email     - Check if email is pre-approved
POST /api/auth/create-account  - Create account (if email approved)
POST /api/auth/login          - Login with email/password
```

### Admin Dashboard
```
GET  /api/admin/dashboard/stats        - Dashboard statistics
GET  /api/admin/members               - List all members
PUT  /api/admin/members/{id}          - Update member
DELETE /api/admin/members/{id}        - Delete member
POST /api/admin/members/add-email     - Add approved email
GET  /api/admin/authors              - List blog authors
POST /api/admin/authors              - Create blog author
```

### Blog Management
```
GET    /api/blogs                     - List blogs (public)
GET    /api/blogs/{id}               - Get specific blog (public)
POST   /api/blogs                    - Create blog (admin only)
PUT    /api/blogs/{id}               - Update blog (admin only)
DELETE /api/blogs/{id}               - Delete blog (admin only)
```

### Resource Management
```
GET    /api/resources                - List resources (members only)
GET    /api/resources/{id}/download  - Download resource (members only)
POST   /api/resources/upload         - Upload resource (admin only)
DELETE /api/resources/{id}           - Delete resource (admin only)
```

### Public Access
```
GET  /api/health                     - Health check
POST /api/public/resources/access-check  - Check resource access
GET  /api/public/resources           - Public resource info
```

## Database Schema

### Core Tables
- **users**: User accounts with roles
- **allowed_emails**: Pre-approved emails for registration
- **blogs**: Blog posts with author references
- **resources**: Uploaded files and documents
- **authors**: Blog author profiles linked to users

## Authentication
All authenticated endpoints require an `Authorization` header:
```
Authorization: email:password
```

## Role-Based Access
- **Public**: Blog reading, health checks
- **Member**: Resource access
- **Admin**: Full CRUD on blogs/resources, member management, dashboard

## File Handling
- **Blog Images**: Stored in `/uploads/images/`
- **Resources**: Stored in `/uploads/resources/`
- **File Validation**: Size limits and type restrictions
- **Cleanup**: Automatic file cleanup on record deletion

## Error Handling
- Comprehensive HTTP status codes
- Detailed error messages
- File cleanup on operation failures
- Graceful fallbacks for database issues

## Testing
Run the test script to verify functionality:
```bash
python test_api.py
```

## Default Admin Account
- **Email**: admin@munsociety.edu
- **Password**: admin123
- **Role**: admin

## Environment Configuration
- `DATABASE_URL`: SQLite database path
- `UPLOAD_PATH`: File upload directory
- `MAX_FILE_SIZE`: Maximum upload size (50MB default)
- `ALLOWED_IMAGE_TYPES`: Supported image formats

## API Documentation
Interactive documentation available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
