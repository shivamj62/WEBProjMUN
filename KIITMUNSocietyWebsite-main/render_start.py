#!/usr/bin/env python3
"""
Render deployment startup script for KIIT MUN Society FastAPI backend
"""

import os
import uvicorn

if __name__ == "__main__":
    # Get port from Render's environment variable
    port = int(os.getenv("PORT", 10000))
    
    print(f"🚀 Starting FastAPI server on 0.0.0.0:{port}")
    print(f"🌍 Environment: {os.getenv('ENVIRONMENT', 'production')}")
    
    # Start the server
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True,
        reload=False
    )
