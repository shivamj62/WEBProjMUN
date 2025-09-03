import pytest
import asyncio
from httpx import AsyncClient
from app.main import app

@pytest.fixture
def anyio_backend():
    return "asyncio"

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.mark.anyio
async def test_health_check(client):
    """Test health check endpoint"""
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "message" in data

@pytest.mark.anyio
async def test_root_endpoint(client):
    """Test root endpoint"""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data

@pytest.mark.anyio
async def test_public_resources_endpoint(client):
    """Test public resources endpoint"""
    response = await client.get("/api/public/resources")
    assert response.status_code == 200
    data = response.json()
    assert data["login_required"] is True

# Add more tests as needed
