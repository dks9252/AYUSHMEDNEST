# Public routes (health concerns, testimonials, newsletter, wishlist)
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict
from datetime import datetime, timezone
from database import db
from models.schemas import Newsletter, Wishlist
from utils.auth import get_current_user

router = APIRouter(tags=["Public"])


# Health Concerns
@router.get("/health-concerns")
async def get_health_concerns():
    return {
        "concerns": [
            {"id": "cold-cough", "name": "Cold & Cough", "icon": "thermometer"},
            {"id": "cholesterol", "name": "Cholesterol", "icon": "heart-pulse"},
            {"id": "bp", "name": "Blood Pressure", "icon": "activity"},
            {"id": "diabetes", "name": "Diabetes", "icon": "droplet"},
            {"id": "skin", "name": "Skin Problems", "icon": "user"},
            {"id": "hair", "name": "Hair Loss", "icon": "scissors"},
            {"id": "immunity", "name": "Immunity", "icon": "shield"},
            {"id": "joint-pain", "name": "Joint Pain", "icon": "bone"},
            {"id": "digestion", "name": "Digestion", "icon": "utensils"},
            {"id": "stress", "name": "Stress & Anxiety", "icon": "brain"},
            {"id": "sleep", "name": "Sleep Issues", "icon": "moon"},
            {"id": "weight", "name": "Weight Management", "icon": "scale"}
        ]
    }


# Testimonials
@router.get("/testimonials")
async def get_testimonials(featured: bool = False):
    query = {"is_active": True}
    if featured:
        query["is_featured"] = True
    
    testimonials = await db.testimonials.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return {"testimonials": testimonials}


# Newsletter
@router.post("/newsletter/subscribe")
async def subscribe_newsletter(email_data: Dict[str, str]):
    email = email_data.get('email')
    if not email:
        raise HTTPException(status_code=400, detail="Email required")
    
    existing = await db.newsletter.find_one({"email": email})
    if existing:
        return {"message": "Already subscribed"}
    
    newsletter = Newsletter(email=email)
    doc = newsletter.model_dump()
    doc['subscribed_at'] = doc['subscribed_at'].isoformat()
    await db.newsletter.insert_one(doc)
    
    return {"message": "Subscribed successfully"}


# Wishlist
@router.get("/wishlist")
async def get_wishlist(current_user: dict = Depends(get_current_user)):
    
    wishlist = await db.wishlists.find_one({"user_id": current_user['user_id']}, {"_id": 0})
    if not wishlist:
        return {"product_ids": [], "products": []}
    
    products = []
    for product_id in wishlist.get('product_ids', []):
        product = await db.products.find_one({"id": product_id}, {"_id": 0})
        if product:
            products.append(product)
    
    return {"product_ids": wishlist.get('product_ids', []), "products": products}


@router.post("/wishlist/add/{product_id}")
async def add_to_wishlist(product_id: str, current_user: dict = Depends(get_current_user)):
    
    wishlist = await db.wishlists.find_one({"user_id": current_user['user_id']}, {"_id": 0})
    
    if not wishlist:
        wishlist = Wishlist(user_id=current_user['user_id'], product_ids=[product_id])
        doc = wishlist.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.wishlists.insert_one(doc)
    else:
        if product_id not in wishlist.get('product_ids', []):
            await db.wishlists.update_one(
                {"user_id": current_user['user_id']},
                {"$push": {"product_ids": product_id}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
            )
    
    return {"message": "Added to wishlist"}


@router.delete("/wishlist/remove/{product_id}")
async def remove_from_wishlist(product_id: str, current_user: dict = Depends(get_current_user)):
    
    await db.wishlists.update_one(
        {"user_id": current_user['user_id']},
        {"$pull": {"product_ids": product_id}}
    )
    
    return {"message": "Removed from wishlist"}
