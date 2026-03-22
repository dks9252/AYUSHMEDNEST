# Cart routes
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from database import db
from models.schemas import CartItem, Cart
from utils.auth import get_current_user

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("")
async def get_cart(current_user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user['user_id']}, {"_id": 0})
    
    if not cart:
        return {"items": [], "total": 0}
    
    enriched_items = []
    total = 0
    for item in cart.get('items', []):
        product = await db.products.find_one({"id": item['product_id']}, {"_id": 0})
        if product:
            enriched_items.append({
                **item,
                "product_name": product['name'],
                "product_image": product['images'][0] if product['images'] else None
            })
            total += item['price'] * item['quantity']
    
    return {"items": enriched_items, "total": total}


@router.post("/add")
async def add_to_cart(item: CartItem, current_user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    cart = await db.carts.find_one({"user_id": current_user['user_id']}, {"_id": 0})
    
    if not cart:
        cart = Cart(user_id=current_user['user_id'], items=[item.model_dump()])
        doc = cart.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.carts.insert_one(doc)
    else:
        existing_items = cart.get('items', [])
        found = False
        for existing_item in existing_items:
            if existing_item['product_id'] == item.product_id:
                existing_item['quantity'] += item.quantity
                found = True
                break
        
        if not found:
            existing_items.append(item.model_dump())
        
        await db.carts.update_one(
            {"user_id": current_user['user_id']},
            {"$set": {"items": existing_items, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    return {"message": "Item added to cart"}


@router.delete("/remove/{product_id}")
async def remove_from_cart(product_id: str, current_user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user['user_id']}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = [item for item in cart.get('items', []) if item['product_id'] != product_id]
    
    await db.carts.update_one(
        {"user_id": current_user['user_id']},
        {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Item removed from cart"}
