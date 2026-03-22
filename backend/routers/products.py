# Product routes
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Dict, Any
from database import db
from models.schemas import Product, ProductCreate
from utils.auth import get_current_user

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("")
async def get_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    ayush_system: Optional[str] = None,
    health_concern: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    skip: int = 0,
    limit: int = 20
):
    query = {"is_active": True}
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"brand": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    if category:
        query["category"] = category
    
    if ayush_system:
        query["ayush_system"] = ayush_system
    
    if health_concern:
        query["health_concerns"] = {"$in": [health_concern]}
    
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    
    total = await db.products.count_documents(query)
    products = await db.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    return {"products": products, "total": total, "skip": skip, "limit": limit}


@router.get("/search")
async def advanced_product_search(
    q: Optional[str] = None,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    rating: Optional[int] = None,
    sort_by: str = "relevance",
    in_stock: bool = True,
    skip: int = 0,
    limit: int = 20
):
    query = {"is_active": True}
    
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"brand": {"$regex": q, "$options": "i"}},
            {"health_concerns": {"$in": [q]}}
        ]
    
    if category:
        query["category"] = category
    
    if brand:
        query["brand"] = brand
    
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price:
            query["price"]["$gte"] = min_price
        if max_price:
            query["price"]["$lte"] = max_price
    
    if rating:
        query["rating"] = {"$gte": rating}
    
    if in_stock:
        query["stock"] = {"$gt": 0}
    
    sort_field = "created_at"
    sort_order = -1
    if sort_by == "price_low":
        sort_field = "price"
        sort_order = 1
    elif sort_by == "price_high":
        sort_field = "price"
        sort_order = -1
    elif sort_by == "rating":
        sort_field = "rating"
        sort_order = -1
    
    total = await db.products.count_documents(query)
    products = await db.products.find(query, {"_id": 0}).sort(sort_field, sort_order).skip(skip).limit(limit).to_list(limit)
    
    return {"products": products, "total": total, "skip": skip, "limit": limit}


@router.get("/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id, "is_active": True}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("")
async def create_product(product: ProductCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] not in ['vendor', 'admin']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    product_obj = Product(**product.model_dump(), vendor_id=current_user['user_id'])
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    
    return {"message": "Product created", "product_id": product_obj.id}


@router.put("/{product_id}")
async def update_product(product_id: str, product_update: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if current_user['role'] != 'admin' and existing['vendor_id'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.products.update_one({"id": product_id}, {"$set": product_update})
    return {"message": "Product updated"}


@router.delete("/{product_id}")
async def delete_product(product_id: str, current_user: dict = Depends(get_current_user)):
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if current_user['role'] != 'admin' and existing['vendor_id'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.products.update_one({"id": product_id}, {"$set": {"is_active": False}})
    return {"message": "Product deleted"}


# Product Variants
@router.get("/{product_id}/variants")
async def get_product_variants(product_id: str):
    variants = await db.product_variants.find({"parent_product_id": product_id}, {"_id": 0}).to_list(100)
    
    grouped = {}
    for variant in variants:
        variant_type = variant['variant_type']
        if variant_type not in grouped:
            grouped[variant_type] = []
        grouped[variant_type].append(variant)
    
    return {"variants": variants, "grouped": grouped}


# Product Reviews
@router.post("/{product_id}/reviews")
async def create_review(product_id: str, review_data: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    from models.schemas import ProductReview
    
    existing = await db.reviews.find_one({
        "product_id": product_id,
        "user_id": current_user['user_id']
    })
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this product")
    
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    
    review = ProductReview(
        product_id=product_id,
        user_id=current_user['user_id'],
        user_name=user['full_name'],
        rating=review_data['rating'],
        title=review_data.get('title', ''),
        comment=review_data['comment'],
        is_approved=False  # Requires admin approval
    )
    
    doc = review.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.reviews.insert_one(doc)
    
    # Update product rating
    reviews = await db.reviews.find({"product_id": product_id, "is_approved": True}, {"_id": 0}).to_list(1000)
    if reviews:
        avg_rating = sum(r['rating'] for r in reviews) / len(reviews)
        await db.products.update_one(
            {"id": product_id},
            {"$set": {"rating": round(avg_rating, 1), "reviews_count": len(reviews)}}
        )
    
    return {"message": "Review submitted", "review_id": review.id}


@router.get("/{product_id}/reviews")
async def get_product_reviews(product_id: str, skip: int = 0, limit: int = 20):
    reviews = await db.reviews.find(
        {"product_id": product_id, "is_approved": True},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {"reviews": reviews}


# Product Q&A
@router.post("/{product_id}/questions")
async def create_question(product_id: str, question_data: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    import uuid
    from datetime import datetime, timezone
    
    question = {
        "id": str(uuid.uuid4()),
        "product_id": product_id,
        "user_id": current_user['user_id'],
        "question": question_data['question'],
        "answers": [],
        "is_approved": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.product_questions.insert_one(question)
    return {"message": "Question submitted for approval", "question_id": question['id']}


@router.get("/{product_id}/questions")
async def get_product_questions(product_id: str, skip: int = 0, limit: int = 20):
    questions = await db.product_questions.find(
        {"product_id": product_id, "is_approved": True},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {"questions": questions}


@router.post("/{product_id}/questions/{question_id}/answer")
async def answer_question(product_id: str, question_id: str, answer_data: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    from datetime import datetime, timezone
    import uuid
    
    # Only admin or the user who asked can answer
    question = await db.product_questions.find_one({"id": question_id}, {"_id": 0})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    answer = {
        "id": str(uuid.uuid4()),
        "user_id": current_user['user_id'],
        "answer": answer_data['answer'],
        "is_admin": current_user['role'] == 'admin',
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.product_questions.update_one(
        {"id": question_id},
        {"$push": {"answers": answer}}
    )
    
    return {"message": "Answer added", "answer_id": answer['id']}

