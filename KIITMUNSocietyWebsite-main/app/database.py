# app/database.py - Clean Turso-focused database module
# Following MUN Society coding patterns: simple email:password auth, async operations

import os
import logging
import asyncio
from typing import Optional, Dict, Any, List, Tuple
from contextlib import asynccontextmanager

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    logging.warning("python-dotenv not available - environment variables from .env file won't be loaded")

# Import libsql client for Turso
try:
    from libsql_client import create_client
    LIBSQL_AVAILABLE = True
except ImportError:
    LIBSQL_AVAILABLE = False
    logging.error("libsql_client not available - install with: uv add libsql_client")

logger = logging.getLogger(__name__)

# Environment configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
TURSO_DATABASE_URL = os.getenv("TURSO_DATABASE_URL", "")
TURSO_AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN", "")

# Global database client
turso_client = None

class TursoDatabase:
    """Turso database connection handler following MUN Society patterns"""
    
    def __init__(self, client):
        self.client = client
        self.is_connected = True
    
    async def execute(self, query: str, params: Optional[Tuple] = None) -> Any:
        """Execute a query (INSERT, UPDATE, DELETE)"""
        try:
            logger.info(f"🔄 EXECUTING QUERY: {query}")
            logger.info(f"🔄 WITH PARAMS: {params}")
            
            if params:
                result = await self.client.execute(query, params)
            else:
                result = await self.client.execute(query)
            
            logger.info(f"✅ QUERY EXECUTED SUCCESSFULLY")
            logger.info(f"✅ AFFECTED ROWS: {getattr(result, 'changes', 'unknown')}")
            
            return result
        except Exception as e:
            logger.error(f"❌ Error executing query: {e}")
            logger.error(f"❌ Query: {query}")
            logger.error(f"❌ Params: {params}")
            raise
    
    async def execute_with_lastrowid(self, query: str, params: Optional[Tuple] = None) -> int:
        """Execute a query and return the last row ID"""
        try:
            if params:
                result = await self.client.execute(query, params)
            else:
                result = await self.client.execute(query)
            
            # For Turso/libSQL, the last insert rowid is available
            return result.last_insert_rowid if hasattr(result, 'last_insert_rowid') else 0
        except Exception as e:
            logger.error(f"❌ Error executing query with lastrowid: {e}")
            logger.error(f"❌ Query: {query}")
            logger.error(f"❌ Params: {params}")
            raise
    
    async def fetchone(self, query: str, params: Optional[Tuple] = None) -> Optional[Tuple]:
        """Fetch one row from query result"""
        try:
            if params:
                result = await self.client.execute(query, params)
            else:
                result = await self.client.execute(query)
            
            if result.rows:
                return result.rows[0]
            return None
        except Exception as e:
            logger.error(f"❌ Error fetching one row: {e}")
            raise
    
    async def fetchall(self, query: str, params: Optional[Tuple] = None) -> List[Tuple]:
        """Fetch all rows from query result"""
        try:
            if params:
                result = await self.client.execute(query, params)
            else:
                result = await self.client.execute(query)
            
            return result.rows if result.rows else []
        except Exception as e:
            logger.error(f"❌ Error fetching all rows: {e}")
            raise
    
    async def commit(self):
        """Commit transaction (libsql handles this automatically)"""
        pass
    
    async def rollback(self):
        """Rollback transaction (libsql handles this automatically)"""
        pass

async def init_db() -> bool:
    """Initialize Turso database connection"""
    global turso_client
    
    try:
        logger.info("🚀 Initializing Turso database connection...")
        
        # Debug environment variables
        logger.info(f"🔍 Environment: {ENVIRONMENT}")
        logger.info(f"🔍 TURSO_DATABASE_URL configured: {bool(TURSO_DATABASE_URL)}")
        logger.info(f"🔍 TURSO_AUTH_TOKEN configured: {bool(TURSO_AUTH_TOKEN)}")
        if TURSO_DATABASE_URL:
            logger.info(f"🔍 Database URL: {TURSO_DATABASE_URL[:50]}...")
        
        # Check prerequisites
        if not LIBSQL_AVAILABLE:
            logger.error("❌ libsql_client not available")
            return False
        
        if not TURSO_DATABASE_URL or not TURSO_AUTH_TOKEN:
            logger.error("❌ Missing Turso credentials - check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN")
            return False
        
        # Create Turso client - DO NOT AWAIT (create_client is sync)
        logger.info(f"🔗 Connecting to Turso: {TURSO_DATABASE_URL[:50]}...")
        
        turso_client = create_client(
            url=TURSO_DATABASE_URL,
            auth_token=TURSO_AUTH_TOKEN
        )
        
        # Test connection
        logger.info("🧪 Testing connection with SELECT 1...")
        test_result = await turso_client.execute("SELECT 1")
        logger.info(f"🧪 Test result: {test_result}")
        
        logger.info("✅ Turso database connection successful")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize Turso database: {type(e).__name__}: {e}")
        
        # Try alternative client creation (sync version)
        try:
            logger.info("🔄 Trying sync client creation...")
            turso_client = create_client(
                url=TURSO_DATABASE_URL,
                auth_token=TURSO_AUTH_TOKEN
            )
            
            # If this works, test it
            test_result = await turso_client.execute("SELECT 1")
            logger.info("✅ Sync client creation successful")
            return True
            
        except Exception as e2:
            logger.error(f"❌ Sync client also failed: {e2}")
            import traceback
            logger.error(f"❌ Full traceback: {traceback.format_exc()}")
            turso_client = None
            return False

async def close_db():
    """Close Turso database connection"""
    global turso_client
    
    try:
        if turso_client:
            # For libsql_client, close is typically async
            try:
                await turso_client.close()
            except Exception as close_error:
                logger.warning(f"⚠️ Error closing client gracefully: {close_error}")
                # Force close if needed
                turso_client = None
            else:
                turso_client = None
                logger.info("🔌 Turso database connection closed")
    except Exception as e:
        logger.error(f"❌ Error closing database: {e}")
        turso_client = None

@asynccontextmanager
async def get_db_connection():
    """Context manager for database operations (for router compatibility)"""
    try:
        # Get the database without using async context manager
        if not turso_client:
            raise Exception("Database not initialized. Call init_db() first.")
        
        db = TursoDatabase(turso_client)
        yield db
        
    except Exception as e:
        logger.error(f"❌ Database operation error: {e}")
        raise
    finally:
        # libsql handles cleanup automatically, no async context needed
        pass

async def get_db() -> TursoDatabase:
    """Get database connection for FastAPI dependency injection"""
    global turso_client
    
    if not turso_client:
        # Try to initialize if not connected
        logger.warning("⚠️ Database not initialized, attempting to initialize...")
        success = await init_db()
        if not success:
            raise Exception("Database not initialized and failed to initialize.")
    
    return TursoDatabase(turso_client)

# Health check function
async def check_database_health() -> Dict[str, Any]:
    """Check Turso database health"""
    try:
        if not turso_client:
            return {
                "status": "unhealthy",
                "error": "Database not initialized"
            }
        
        # Test query
        await turso_client.execute("SELECT 1 as test, datetime('now') as timestamp")
        
        return {
            "status": "healthy",
            "connection_type": "turso",
            "database_url": TURSO_DATABASE_URL[:50] + "..." if TURSO_DATABASE_URL else "Not configured",
            "environment": ENVIRONMENT
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

# Database info function
def get_database_info() -> Dict[str, Any]:
    """Get current database configuration info"""
    return {
        "database_type": "turso",
        "environment": ENVIRONMENT,
        "libsql_available": LIBSQL_AVAILABLE,
        "database_configured": bool(TURSO_DATABASE_URL and TURSO_AUTH_TOKEN),
        "connected": turso_client is not None
    }

# Quick test function for development
async def test_connection():
    """Test database connection (for development/debugging)"""
    try:
        logger.info("🧪 Testing Turso database connection...")
        
        if not turso_client:
            logger.error("❌ No database connection")
            return False
        
        # Test with a simple query
        result = await turso_client.execute("SELECT 1 as test, datetime('now') as now")
        logger.info(f"✅ Test query successful: {result.rows[0] if result.rows else 'No data'}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Database test failed: {e}")
        return False

# Development/debugging script
if __name__ == "__main__":
    import asyncio
    
    async def main():
        print("🧪 Testing Turso database connection...")
        
        # Initialize
        success = await init_db()
        if success:
            print("✅ Connection successful")
            
            # Test operations
            try:
                db = await get_db()
                
                # Test fetchone
                result = await db.fetchone("SELECT 1 as test, datetime('now') as now")
                print(f"✅ fetchone test: {result}")
                
                # Test fetchall
                results = await db.fetchall("SELECT 1 as test UNION SELECT 2 as test")
                print(f"✅ fetchall test: {results}")
                
            except Exception as e:
                print(f"❌ Database operations failed: {e}")
            
            await close_db()
        else:
            print("❌ Connection failed")
            print("Check your TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables")
    
    asyncio.run(main())
