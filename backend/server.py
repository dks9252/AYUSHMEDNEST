# Main application entry point - Refactored modular architecture
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
import sys

# Add the current directory to sys.path for Vercel deployment
# This allows 'from routers import ...' to work
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI(title="AYUSHMEDNEST API", version="2.0.0")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import routers
from routers import auth, products, cart, orders, admin, cms, public, ai, user_features

# Include routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(cart.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(cms.router, prefix="/api")
app.include_router(public.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(user_features.router, prefix="/api")


# Redirect doctor-related requests
from fastapi.responses import RedirectResponse
from fastapi import Request

@app.get("/api/doctors{full_path:path}")
async def redirect_doctors(request: Request, full_path: str):
    query_params = request.query_params
    redirect_url = f"https://consult.ayushmednest.com/doctors{full_path}"
    if query_params:
        redirect_url += f"?{query_params}"
    return RedirectResponse(url=redirect_url, status_code=301)


# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}


# Shutdown event
@app.on_event("shutdown")
async def shutdown_db_client():
    from database import close_db
    await close_db()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
