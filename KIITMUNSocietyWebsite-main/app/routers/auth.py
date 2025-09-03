from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
import json
from app.database import get_db
from app.schemas import (
    EmailCheck, EmailCheckResponse, CreateAccount, Login, 
    LoginResponse, SuccessResponse, User
)
from app.auth import (
    check_email_allowed, check_user_exists, create_user_account, 
    verify_user_credentials
)

router = APIRouter(prefix="/api/auth", tags=["authentication"])

@router.post("/check-email", response_model=EmailCheckResponse)
async def check_email(request: EmailCheck, cur = Depends(get_db)):
    """Check if email is allowed to create account"""
    allowed_email = await check_email_allowed(request.email, cur)
    
    if not allowed_email:
        return EmailCheckResponse(
            success=True,  # API call succeeded, but email not allowed
            allowed=False,
            account_exists=False
        )
    
    account_exists = await check_user_exists(request.email, cur)
    
    return EmailCheckResponse(
        success=True,  # API call succeeded
        allowed=True,
        name=allowed_email["name"],
        role=allowed_email["role"],
        account_exists=account_exists
    )

@router.post("/create-account", response_model=SuccessResponse)
async def create_account(request: CreateAccount, cur = Depends(get_db)):
    """Create account with password (only if email is pre-approved)"""
    # Check if email is allowed
    allowed_email = await check_email_allowed(request.email, cur)
    if not allowed_email:
        raise HTTPException(status_code=403, detail="Email not permitted to create account")
    
    # Check if account already exists
    if await check_user_exists(request.email, cur):
        raise HTTPException(status_code=409, detail="Account already exists")
    
    # Create the account
    success = await create_user_account(
        request.email, 
        request.password,
        allowed_email["name"],
        allowed_email["role"],
        cur
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to create account")
    
    return SuccessResponse(
        success=True,
        message="Account created successfully"
    )

@router.post("/login", response_model=LoginResponse)
async def login(request: Request, cur = Depends(get_db)):
    """Login with email and password - handles both JSON and text/plain content types"""
    try:
        content_type = request.headers.get("content-type", "").lower()
        print(f"🔍 LOGIN DEBUG - Content-Type: {content_type}")
        
        # Handle different content types
        if "application/json" in content_type:
            data = await request.json()
        elif "text/plain" in content_type:
            body = await request.body()
            data = json.loads(body.decode('utf-8'))
        else:
            # Fallback: try to parse as JSON
            body = await request.body()
            data = json.loads(body.decode('utf-8'))
            
        print(f"🔍 LOGIN DEBUG - Parsed data: {data}")
        
        email = data.get("email")
        password = data.get("password")
        
        if not email or not password:
            return JSONResponse(
                status_code=400,
                content={"detail": "Email and password are required"}
            )
        
        user = await verify_user_credentials(email, password, cur)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        return LoginResponse(
            success=True,
            user=User(
                id=user["id"],
                email=user["email"],
                name=user["name"],
                role=user["role"]
            )
        )
        
    except json.JSONDecodeError as e:
        return JSONResponse(
            status_code=400,
            content={"detail": f"Invalid JSON format: {str(e)}"}
        )
    except Exception as e:
        print(f"❌ LOGIN ERROR: {str(e)}")
        return JSONResponse(
            status_code=400,
            content={"detail": f"Invalid request format: {str(e)}"}
        )
