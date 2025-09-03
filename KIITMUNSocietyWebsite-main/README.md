# MUN Society Website

A comprehensive website for Model United Nations (MUN) society with FastAPI backend and SQLite database. Features email-based authentication, blog management for MUN competition reports, and resource sharing with role-based access control.

## Features

- **Email-based Authentication**: Simple login system with pre-populated allowed emails
- **MUN Competition Blogs**: Public access to MUN competition reports with images
- **Resource Management**: Protected file sharing for society members
- **Role-based Access**: Admin and member roles with different permissions
- **File Upload**: Support for images (blogs) and documents (resources)
- **Scalable**: Supports ~100 concurrent users with 10GB file storage

## Quick Start

### Prerequisites

- Python 3.8+
- SQLite 3+
- UV package manager (recommended) or pip

### Installation

1. **Clone and setup environment:**
   ```bash
   git clone <repository-url>
   cd munsoc-website
   ```

2. **Install dependencies with UV:**
   ```bash
   uv sync
   ```

   Or with pip:
   ```bash
   pip install -e .
   ```

3. **Setup SQLite database:**
   ```bash
   # Create database
   createdb munsociety_db
   
   # Run database setup script
   python scripts/setup_database.py
   ```

4. **Configure environment variables:**
   ```bash
   copy .env.example .env
   # Edit .env file with your database credentials
   ```

5. **Run the application:**
   ```bash
   uv run uvicorn app.main:app --reload
   ```

   Or:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

The application will be available at `http://localhost:8000`

## Project Structure

```
munsoc-website/
├── app/                    # FastAPI application
│   ├── __init__.py
│   ├── main.py            # Main FastAPI app
│   ├── database.py        # Database connection
│   ├── models.py          # SQLAlchemy models
│   ├── schemas.py         # Pydantic schemas
│   ├── auth.py            # Authentication logic
│   └── routers/           # API route modules
│       ├── __init__.py
│       ├── auth.py        # Authentication routes
│       ├── blogs.py       # Blog management routes
│       ├── resources.py   # Resource management routes
│       └── public.py      # Public access routes
├── scripts/               # Database and utility scripts
│   ├── setup_database.py  # Database initialization
│   └── populate_emails.py # Pre-populate allowed emails
├── uploads/               # File storage directory
│   ├── images/           # Blog images
│   └── resources/        # Member resources
├── static/               # Static assets (CSS, JS)
├── templates/            # HTML templates (if needed)
├── tests/                # Test files
├── .env.example          # Environment variables template
├── .gitignore
├── pyproject.toml        # Project configuration
└── README.md
```

## API Documentation

Once the server is running, visit:
- **Interactive API docs**: `http://localhost:8000/docs`
- **Alternative docs**: `http://localhost:8000/redoc`

## Database Schema

### Core Tables

1. **allowed_emails**: Pre-populated emails with roles
2. **users**: Account information for registered users  
3. **blogs**: MUN competition reports with images
4. **resources**: Shared files for members

## Authentication

The system uses simple email:password authentication:
- Emails must be pre-approved in the `allowed_emails` table
- No JWT tokens - verification per request
- Two roles: `admin` and `member`

## File Storage

- **Local filesystem storage** (suitable for 100+ users)
- **Blog images**: Publicly accessible via `/uploads/images/`
- **Resources**: Protected access for authenticated members
- **File size limit**: 50MB per file
- **Total storage**: 10GB capacity

## Development

### Running Tests
```bash
uv run pytest
```

### Database Migrations
```bash
python scripts/setup_database.py
```

### Adding Sample Data
```bash
python scripts/populate_emails.py
```

## Deployment

### Environment Variables

Create `.env` file with:
```
SQLITE_DB_PATH=./munsociety_dev.db
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=52428800
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,gif
DEBUG=False
```

### Production Setup

1. **Database backup strategy:**
   ```bash
   pg_dump munsociety_db > backup_$(date +%Y%m%d).sql
   tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
   ```

2. **Run with production server:**
   ```bash
   uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, contact: admin@munsociety.edu
