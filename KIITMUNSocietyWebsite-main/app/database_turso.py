import os
from dotenv import load_dotenv
import aiosqlite
from contextlib import asynccontextmanager
import asyncio

# Load environment variables
load_dotenv()

# Database configuration based on environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./munsociety_dev.db")

# Turso configuration for production
TURSO_DATABASE_URL = os.getenv("TURSO_DATABASE_URL")
TURSO_AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN")

# Global database path and client
db_path = None
turso_client = None

async def init_turso():
    """Initialize Turso database connection"""
    global turso_client
    
    if not TURSO_DATABASE_URL or not TURSO_AUTH_TOKEN:
        raise ValueError("Turso configuration incomplete. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN")
    
    try:
        import libsql_client
        turso_client = libsql_client.create_client(
            url=TURSO_DATABASE_URL,
            auth_token=TURSO_AUTH_TOKEN
        )
        
        print("✅ Turso database connection initialized")
        return turso_client
        
    except ImportError:
        raise ImportError("libsql_client not installed. Run: pip install libsql-client")
    except Exception as e:
        raise ConnectionError(f"Failed to connect to Turso: {e}")

async def init_sqlite():
    """Initialize SQLite database with complete schema"""
    global db_path
    print("🔄 Using SQLite directly")
    
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
        
        # Create resources table with corrected column name
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                uploaded_by INTEGER NOT NULL,
                download_count INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                FOREIGN KEY (uploaded_by) REFERENCES users (id)
            )
        """)
        
        # Create indexes for better performance
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_resources_active ON resources(is_active)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_resources_file_type ON resources(file_type)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs(author_id)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_blogs_date ON blogs(competition_date)")
        
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
    """Initialize database connection based on environment"""
    global db_path, turso_client
    
    if ENVIRONMENT == "production" and TURSO_DATABASE_URL and TURSO_AUTH_TOKEN:
        print("🚀 Initializing Turso database for production")
        turso_client = await init_turso()
        return turso_client
    else:
        print("🔧 Initializing SQLite database for development")
        db_path = await init_sqlite()
        return db_path

async def close_db():
    """Close database connections"""
    global turso_client
    if turso_client:
        try:
            await turso_client.close()
        except:
            pass
    print("✅ Database connections closed")

@asynccontextmanager
async def get_db_connection():
    """Synchronous database connection for scripts (SQLite only)"""
    import sqlite3
    db_path = DATABASE_URL.replace("sqlite:///", "./")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

class TursoWrapper:
    """Wrapper for Turso database operations"""
    def __init__(self, client):
        self.client = client
    
    async def execute(self, query, params=None):
        """Execute query on Turso database"""
        try:
            result = await self.client.execute(query, params or [])
            return result
        except Exception as e:
            print(f"Turso query error: {e}")
            raise
    
    async def commit(self):
        """Commit is handled automatically by Turso"""
        pass
    
    async def rollback(self):
        """Rollback not directly supported, but errors will prevent commits"""
        pass

class DatabaseWrapper:
    """Wrapper to provide both direct execute and async context manager execute"""
    def __init__(self, conn):
        self.conn = conn
        self.is_turso = hasattr(conn, 'client')
    
    async def execute(self, query, params=None):
        """Direct execute method for auth.py compatibility"""
        if self.is_turso:
            return await self.conn.execute(query, params or [])
        else:
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

class SmartExecuteResult:
    """A smart wrapper that can be either awaited or used as context manager"""
    def __init__(self, conn, query, params):
        self.conn = conn
        self.query = query
        self.params = params
        self._cursor = None
        self.is_turso = hasattr(conn, 'client')
    
    async def __aenter__(self):
        """Context manager entry for admin router"""
        if self.is_turso:
            # For Turso, execute immediately and return result
            self._cursor = await self.conn.execute(self.query, self.params or [])
            return self._cursor
        else:
            # For SQLite, return cursor
            self._cursor = await self.conn.execute(self.query, self.params or ())
            return self._cursor
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit for admin router"""
        pass
    
    def __await__(self):
        """Awaitable for auth.py compatibility"""
        if self.is_turso:
            return self.conn.execute(self.query, self.params or []).__await__()
        else:
            return self.conn.execute(self.query, self.params or ()).__await__()

class AdminDatabaseWrapper:
    """Enhanced wrapper for both admin router and auth compatibility"""
    def __init__(self, conn):
        self.conn = conn
        self.is_turso = hasattr(conn, 'client')
    
    def execute(self, query, params=None):
        """Return a smart result that works for both patterns"""
        return SmartExecuteResult(self.conn, query, params)
    
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
    global db_path, turso_client
    
    if not db_path and not turso_client:
        await init_db()
    
    if ENVIRONMENT == "production" and turso_client:
        # Use Turso for production
        yield AdminDatabaseWrapper(TursoWrapper(turso_client))
    else:
        # Use SQLite for development
        conn = await aiosqlite.connect(db_path)
        conn.row_factory = aiosqlite.Row
        
        # Enable foreign key constraints by default
        await conn.execute("PRAGMA foreign_keys = ON")
        
        try:
            yield AdminDatabaseWrapper(conn)
        finally:
            await conn.close()

async def test_database_connection():
    """Test database connection and basic operations"""
    try:
        async for db in get_db():
            # Test basic query
            if ENVIRONMENT == "production":
                result = await db.execute("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'")
                print(f"✅ Turso connection successful. Tables found: {result.rows[0]['count'] if result.rows else 0}")
            else:
                async with db.execute("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'") as cursor:
                    row = await cursor.fetchone()
                    print(f"✅ SQLite connection successful. Tables found: {row['count'] if row else 0}")
            break
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise
