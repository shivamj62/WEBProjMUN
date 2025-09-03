#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI application with Uvicorn
# Bind to 0.0.0.0 and use PORT environment variable (default 10000 on Render)
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}
