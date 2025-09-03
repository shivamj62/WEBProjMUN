import os
import sqlite3
from contextlib import asynccontextmanager
import asyncio
import functools
import threading

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./munsociety_dev.db")

# Global database path
db_path = None

async def init_sqlite():
    """Initialize SQLite database with complete schema"""
    global db_path
    print("🔄 Using SQLite directly (PostgreSQL disabled)")
    
    db_path = DATABASE_URL.replace("sqlite:///", "./")
    
    # Use a simple connection without async context manager for initialization
    conn = await aiosqlite.connect(db_path)
    
    try:
        # Create allowed_emails table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS allowed_emails (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create users table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (email) REFERENCES allowed_emails (email)
            )
        """)
        
        # Create blogs table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS blogs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                author_id INTEGER NOT NULL,
                competition_date DATE,
                image1_path TEXT,
                image2_path TEXT,
                published BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (author_id) REFERENCES users (id)
            )
        """)
        
        # Add published column if it doesn't exist (for existing databases)
        try:
            await conn.execute("ALTER TABLE blogs ADD COLUMN published BOOLEAN DEFAULT 1")
        except Exception:
            # Column already exists or other error, ignore
            pass
        
        # Create resources table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS resources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                file_path TEXT NOT NULL,
                original_filename TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                uploaded_by INTEGER NOT NULL,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (uploaded_by) REFERENCES users (id)
            )
        """)
        
        # Create authors table for blog authoring
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS authors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                user_id INTEGER UNIQUE NOT NULL,
                bio TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # Create carousel images table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS carousel_images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                image_path TEXT NOT NULL,
                display_order INTEGER DEFAULT 0,
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Insert test data
        await conn.execute("""
            INSERT OR IGNORE INTO allowed_emails (email, role, name) 
            VALUES ('admin@munsociety.edu', 'admin', 'MUN Admin')
        """)
        
        await conn.execute("""
            INSERT OR IGNORE INTO allowed_emails (email, role, name) 
            VALUES ('22053278@kiit.ac.in', 'member', 'KIIT Student')
        """)
        
        # Create test admin user account
        await conn.execute("""
            INSERT OR IGNORE INTO users (email, password, role, name) 
            VALUES ('admin@munsociety.edu', 'admin123', 'admin', 'MUN Admin')
        """)
        
        # Create author for admin
        await conn.execute("""
            INSERT OR IGNORE INTO authors (username, user_id, bio) 
            VALUES ('admin', 1, 'MUN Society Administrator')
        """)
        
        await conn.commit()
        
    finally:
        await conn.close()
    
    print("✅ SQLite database initialized successfully")
    return db_path

async def init_db():
    """Initialize database connection - SQLite only"""
    global db_path
    db_path = await init_sqlite()
    return db_path

async def close_db():
    """Close database connections"""
    print("✅ Database connections closed")

@asynccontextmanager
async def get_db_connection():
    """Synchronous database connection for scripts"""
    import sqlite3
    db_path = DATABASE_URL.replace("sqlite:///", "./")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

async def get_db():
    """Async database connection for FastAPI endpoints"""
    global db_path
    if not db_path:
        await init_db()
    
    # Create a fresh connection for each request
    conn = await aiosqlite.connect(db_path)
    conn.row_factory = aiosqlite.Row
    
    # Enable foreign key constraints by default
    await conn.execute("PRAGMA foreign_keys = ON")
    
    try:
        yield conn
    finally:
        if conn:
            await conn.close()
