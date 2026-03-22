# CMS routes
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
import uuid
import io
from database import db
from models.schemas import WebsiteSettings
from utils.auth import get_current_user

router = APIRouter(prefix="/cms", tags=["CMS"])


@router.get("/settings")
async def get_website_settings():
    settings = await db.website_settings.find_one({}, {"_id": 0})
    if not settings:
        settings = WebsiteSettings().model_dump()
    return settings


@router.put("/settings")
async def update_website_settings(settings: WebsiteSettings, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    settings_dict = settings.model_dump()
    await db.website_settings.delete_many({})
    await db.website_settings.insert_one(settings_dict)
    
    return {"message": "Settings updated successfully"}


# Navigation Menu Management
@router.get("/menus")
async def get_menus():
    menus = await db.menus.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(100)
    return {"menus": menus}


@router.post("/menus")
async def create_menu(menu_data: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    menu_data['id'] = str(uuid.uuid4())
    menu_data['created_at'] = datetime.now(timezone.utc).isoformat()
    menu_data['is_active'] = True
    await db.menus.insert_one(menu_data)
    
    return {"message": "Menu created", "menu_id": menu_data['id']}


@router.put("/menus/{menu_id}")
async def update_menu(menu_id: str, menu_data: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.menus.update_one({"id": menu_id}, {"$set": menu_data})
    return {"message": "Menu updated"}


@router.delete("/menus/{menu_id}")
async def delete_menu(menu_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.menus.update_one({"id": menu_id}, {"$set": {"is_active": False}})
    return {"message": "Menu deleted"}


# Bulk update menus order
@router.put("/menus/reorder")
async def reorder_menus(menu_orders: List[Dict[str, Any]], current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    for item in menu_orders:
        await db.menus.update_one({"id": item['id']}, {"$set": {"order": item['order']}})
    
    return {"message": "Menus reordered"}


@router.get("/categories")
async def get_cms_categories():
    categories = await db.categories.find({"is_active": True}, {"_id": 0}).to_list(100)
    return {"categories": categories}


@router.post("/categories")
async def create_cms_category(category_data: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    category_data['id'] = str(uuid.uuid4())
    category_data['created_at'] = datetime.now(timezone.utc).isoformat()
    category_data['is_active'] = True
    await db.categories.insert_one(category_data)
    
    return {"message": "Category created", "category_id": category_data['id']}


@router.delete("/categories/{category_id}")
async def delete_cms_category(category_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.categories.update_one({"id": category_id}, {"$set": {"is_active": False}})
    return {"message": "Category deleted"}


@router.get("/brands")
async def get_cms_brands():
    brands = await db.brands.find({"is_active": True}, {"_id": 0}).to_list(100)
    return {"brands": brands}


@router.post("/brands")
async def create_cms_brand(brand_data: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    brand_data['id'] = str(uuid.uuid4())
    brand_data['created_at'] = datetime.now(timezone.utc).isoformat()
    brand_data['is_active'] = True
    await db.brands.insert_one(brand_data)
    
    return {"message": "Brand created", "brand_id": brand_data['id']}


@router.get("/banners")
async def get_cms_banners(placement: Optional[str] = None):
    query = {"is_active": True}
    if placement:
        query["placement"] = placement
    
    banners = await db.banners.find(query, {"_id": 0}).to_list(100)
    return {"banners": banners}


@router.post("/banners")
async def create_cms_banner(banner_data: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    banner_data['id'] = str(uuid.uuid4())
    banner_data['created_at'] = datetime.now(timezone.utc).isoformat()
    banner_data['is_active'] = True
    await db.banners.insert_one(banner_data)
    
    return {"message": "Banner created", "banner_id": banner_data['id']}


# SEO Routes
@router.get("/sitemap.xml")
async def generate_sitemap():
    base_url = "https://www.ayushmednest.com"
    
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap += f'<url><loc>{base_url}/</loc><priority>1.0</priority></url>\n'
    
    products = await db.products.find({"is_active": True}, {"_id": 0, "id": 1}).to_list(1000)
    for product in products:
        sitemap += f'<url><loc>{base_url}/products/{product["id"]}</loc><priority>0.8</priority></url>\n'
    
    sitemap += '</urlset>'
    
    return StreamingResponse(io.BytesIO(sitemap.encode()), media_type="application/xml")


@router.get("/robots.txt")
async def get_robots_txt():
    robots = """User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Sitemap: https://www.ayushmednest.com/api/sitemap.xml
"""
    return StreamingResponse(io.BytesIO(robots.encode()), media_type="text/plain")
