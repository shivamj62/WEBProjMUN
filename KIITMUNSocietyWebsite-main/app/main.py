from fastapi import FastAPI, Depends, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import os
import time
import logging
from datetime import datetime

from app.database import init_db, close_db, get_db
from app.routers import auth, blogs, resources, public, admin, carousel
from app.schemas import HealthResponse, PublicResourceResponse, PublicResourceCheck
from app.auth import check_email_allowed, check_user_exists

# Set up comprehensive logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

print("=== FASTAPI APP STARTING ===")

# Create FastAPI app
app = FastAPI(
    title="MUN Society Website API",
    description="API for Model United Nations Society website with blog and resource management (SQLite)",
    version="0.1.0"
)

print("=== FASTAPI APP CREATED ===")

# Add validation error handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"❌ VALIDATION ERROR on {request.method} {request.url}")
    print(f"❌ Errors: {exc.errors()}")
    print(f"❌ Body: {exc.body}")
    
    # Convert bytes to string for JSON serialization
    body_str = exc.body.decode('utf-8') if isinstance(exc.body, bytes) else exc.body
    
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(), 
            "body": body_str
        }
    )

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("=== CORS MIDDLEWARE ADDED ===")

# Add request middleware for debugging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"🚀 INCOMING REQUEST: {request.method} {request.url}")
    print(f"🚀 Headers: {dict(request.headers)}")
    
    # Capture request body for POST requests
    if request.method == "POST":
        body = await request.body()
        
        # Safe decoding for both text and binary data
        if body:
            # Get content type to determine how to handle the data
            content_type = request.headers.get("content-type", "")
            
            if content_type.startswith("multipart/form-data"):
                print(f"🚀 REQUEST BODY: Multipart form data ({len(body)} bytes) - Contains file uploads, content not displayed")
            else:
                try:
                    decoded_body = body.decode('utf-8')
                    print(f"🚀 REQUEST BODY: {decoded_body}")
                except UnicodeDecodeError:
                    print(f"🚀 REQUEST BODY: Binary data ({len(body)} bytes) - Content not displayed")
        else:
            print("🚀 REQUEST BODY: Empty")
    
    response = await call_next(request)
    print(f"🚀 RESPONSE STATUS: {response.status_code}")
    return response

print("=== DEBUG MIDDLEWARE ADDED ===")

# Create upload directories
UPLOAD_PATH = os.getenv("UPLOAD_PATH", "./uploads")
os.makedirs(os.path.join(UPLOAD_PATH, "images"), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_PATH, "resources"), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_PATH, "carousel"), exist_ok=True)

# Mount static files for blog images (public access)
app.mount("/uploads/images", StaticFiles(directory=os.path.join(UPLOAD_PATH, "images")), name="blog_images")
app.mount("/uploads/carousel", StaticFiles(directory=os.path.join(UPLOAD_PATH, "carousel")), name="carousel_images")

# Include routers
print("=== INCLUDING ROUTERS ===")
app.include_router(auth.router)
print("✓ Auth router included")
app.include_router(public.router)
print("✓ Public router included")
app.include_router(blogs.router)
print("✓ Blogs router included")
app.include_router(resources.router)
print("✓ Resources router included")
app.include_router(admin.router)
print("✓ Admin router included")
app.include_router(carousel.router)
print("✓ Carousel router included")

# Print all registered routes
print("=== REGISTERED ROUTES ===")
for route in app.routes:
    methods = getattr(route, 'methods', 'N/A')
    print(f"Route: {route.path} - Methods: {methods}")

print("=== ROUTERS INCLUDED ===")

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize SQLite database on startup"""
    await init_db()

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connections on shutdown"""
    await close_db()

# Health check endpoint - Support both GET and HEAD for Render
@app.get("/api/health", response_model=HealthResponse)
@app.head("/api/health")
async def health_check():
    """Basic health check endpoint - supports HEAD for monitoring"""
    print("🔍 HEALTH CHECK endpoint called!")
    return HealthResponse(
        status="healthy",
        message="MUN Society API is running (SQLite)"
    )

# Simple connectivity test
@app.get("/api/test")
async def connectivity_test():
    """Simple connectivity test"""
    print("=== TEST ENDPOINT HIT ===")
    
    # Write to file to ensure we capture this
    with open("debug_log.txt", "a") as f:
        f.write(f"ENDPOINT CALLED: /api/test at {datetime.now()}\n")
    
    print("🔍 CONNECTIVITY TEST endpoint called!")
    print("🔍 This should definitely appear in the logs!")
    print("🔍 Testing 1, 2, 3...")
    
    return {"message": "Backend is reachable!", "timestamp": str(datetime.now())}

# Additional test endpoint
@app.get("/test")
async def simple_test():
    """Even simpler test endpoint"""
    print("=== SIMPLE TEST ENDPOINT HIT ===")
    return {"message": "Simple test successful", "timestamp": time.time()}

# Public resource access check endpoint
@app.post("/api/public/resources/access-check", response_model=PublicResourceResponse)
async def check_resource_access(request: PublicResourceCheck, cur = Depends(get_db)):
    """Check if user can access resources (for login prompt)"""
    
    allowed_email = await check_email_allowed(request.email, cur)
    
    if not allowed_email:
        return PublicResourceResponse(
            permitted=False,
            message="You are not permitted to access resources. Please contact coordinator.",
            contact_info="coordinator@munsociety.edu"
        )
    
    account_exists = await check_user_exists(request.email, cur)
    
    return PublicResourceResponse(
        permitted=True,
        message="Please login to access resources",
        name=allowed_email["name"],
        account_exists=account_exists
    )

# Public resources endpoint (shows login form)
@app.get("/api/public/resources")
async def public_resources():
    """Public access to resources route (shows login form)"""
    return {
        "message": "Authentication required to access resources",
        "login_required": True
    }

# Root endpoint - Support both GET and HEAD for Render health checks
@app.get("/")
@app.head("/")
async def root():
    """Root endpoint with basic information - supports HEAD for health checks"""
    return {
        "message": "MUN Society Website API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/api/health"
    }

# For Render deployment - use PORT environment variable
if __name__ == "__main__":
    import uvicorn
    # Render provides PORT environment variable
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)