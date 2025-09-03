import os
from dotenv import load_dotenv
import aiosqlite
from contextlib import asynccontextmanager
import asyncio

# Load environment variables
load_dotenv()

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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (author_id) REFERENCES users (id)
            )
        """)
        
        # Create resources table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS resources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                filename TEXT NOT NULL UNIQUE,
                original_filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                file_type TEXT NOT NULL,
                mime_type TEXT NOT NULL,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                uploaded_by INTEGER NOT NULL,
                download_count INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
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

class DatabaseWrapper:
    """Wrapper to provide both direct execute and async context manager execute"""
    def __init__(self, conn):
        self.conn = conn
    
    async def execute(self, query, params=None):
        """Direct execute method for auth.py compatibility"""
        return await self.conn.execute(query, params or ())
    
    async def commit(self):
        """Commit transaction"""
        await self.conn.commit()
    
    async def rollback(self):
        """Rollback transaction"""
        await self.conn.rollback()
    
    def __getattr__(self, name):
        """Delegate other attributes to the underlying connection"""
        return getattr(self.conn, name)

class DatabaseExecuteContextManager:
    """Context manager for admin router compatibility"""
    def __init__(self, conn, query, params):
        self.conn = conn
        self.query = query
        self.params = params
        self.cursor = None
    
    async def __aenter__(self):
        self.cursor = await self.conn.execute(self.query, self.params)
        return self.cursor
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        # No need to close cursor in aiosqlite
        pass

class SmartExecuteResult:
    """A smart wrapper that can be either awaited or used as context manager"""
    def __init__(self, conn, query, params):
        self.conn = conn
        self.query = query
        self.params = params
        self._cursor = None
    
    async def __aenter__(self):
        """Context manager entry for admin router"""
        self._cursor = await self.conn.execute(self.query, self.params)
        return self._cursor
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit for admin router"""
        pass
    
    def __await__(self):
        """Awaitable for auth.py compatibility"""
        return self.conn.execute(self.query, self.params).__await__()

class AdminDatabaseWrapper:
    """Enhanced wrapper for both admin router and auth compatibility"""
    def __init__(self, conn):
        self.conn = conn
    
    def execute(self, query, params=None):
        """Return a smart result that works for both patterns"""
        return SmartExecuteResult(self.conn, query, params or ())
    
    async def commit(self):
        """Commit transaction"""
        await self.conn.commit()
    
    async def rollback(self):
        """Rollback transaction"""
        await self.conn.rollback()
    
    def __getattr__(self, name):
        """Delegate other attributes to the underlying connection"""
        return getattr(self.conn, name)

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
        yield AdminDatabaseWrapper(conn)
    finally:
        await conn.close()
