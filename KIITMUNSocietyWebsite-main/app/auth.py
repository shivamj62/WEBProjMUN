from fastapi import HTTPException, Header, Depends
from typing import Optional
from app.database import get_db
from app.schemas import User
import os



async def verify_user_credentials(email: str, password: str, db) -> Optional[dict]:
    """Verify user email and password against database (Turso)"""
    try:
        # Use fetchone directly (no async context manager needed)
        user = await db.fetchone(
            "SELECT id, email, name, role FROM users WHERE email = ? AND password = ?",
            (email, password)
        )
        
        if user:
            return {
                "id": user[0],
                "email": user[1],
                "name": user[2],
                "role": user[3]
            }
        return None
        
    except Exception as e:
        print(f"❌ Error verifying user credentials: {e}")
        return None

async def get_current_user(authorization: Optional[str] = Header(None), db = Depends(get_db)):
    """Get current authenticated user from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")
    
    try:
        # Expected format: "email:password"
        if ":" not in authorization:
            raise HTTPException(status_code=401, detail="Invalid authorization format")
        
        email, password = authorization.split(":", 1)
        user = await verify_user_credentials(email, password, db)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        return user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid credentials")

async def require_admin(user: dict = Depends(get_current_user)):
    """Require admin role for access"""
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def check_email_allowed(email: str, db) -> Optional[dict]:
    """Check if email is in allowed_emails table (Turso)"""
    try:
        allowed = await db.fetchone(
            "SELECT email, role, name FROM allowed_emails WHERE email = ?",
            (email,)
        )
        
        if allowed:
            return {"email": allowed[0], "role": allowed[1], "name": allowed[2]}
        return None
    except Exception as e:
        print(f"❌ Error checking allowed email: {e}")
        return None

async def check_user_exists(email: str, db) -> bool:
    """Check if user account already exists (Turso)"""
    try:
        user = await db.fetchone(
            "SELECT id FROM users WHERE email = ?",
            (email,)
        )
        return user is not None
    except Exception as e:
        print(f"❌ Error checking user exists: {e}")
        return False

async def create_user_account(email: str, password: str, name: str, role: str, db) -> bool:
    """Create new user account (Turso)"""
    try:
        await db.execute(
            "INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)",
            (email, password, name, role)
        )
        # No need to commit with Turso - it's automatic
        return True
    except Exception as e:
        print(f"❌ Error creating user account: {e}")
        return False

async def get_user_by_id(user_id: int, db) -> Optional[dict]:
    """Get user by ID (Turso)"""
    try:
        user = await db.fetchone(
            "SELECT id, email, name, role FROM users WHERE id = ?",
            (user_id,)
        )
        if user:
            return {
                "id": user[0],
                "email": user[1],
                "name": user[2],
                "role": user[3]
            }
        return None
    except Exception as e:
        print(f"❌ Error getting user by ID: {e}")
        return None
