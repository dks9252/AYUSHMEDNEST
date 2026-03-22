# Admin routes
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from typing import Dict, Any
import logging
import csv
import io
import requests
from database import db
from models.schemas import Product, AdminSettings, Testimonial
from models.enums import AYUSHSystem, PaymentStatus, OrderStatus
from utils.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])

shiprocket_token = None


async def init_shiprocket_token():
    global shiprocket_token
    settings = await db.admin_settings.find_one({}, {"_id": 0})
    if settings and settings.get('shiprocket_email') and settings.get('shiprocket_password'):
        try:
            response = requests.post(
                "https://apiv2.shiprocket.in/v1/external/auth/login",
                json={
                    "email": settings['shiprocket_email'],
                    "password": settings['shiprocket_password']
                },
                timeout=10
            )
            if response.status_code == 200:
                shiprocket_token = response.json().get('token')
        except Exception as e:
            logging.error(f"Shiprocket auth failed: {e}")


@router.get("/dashboard")
async def admin_dashboard(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_users = await db.users.count_documents({})
    total_products = await db.products.count_documents({"is_active": True})
    total_orders = await db.orders.count_documents({})
    
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    
    pipeline = [
        {"$match": {"payment_status": PaymentStatus.SUCCESS.value}},
        {"$group": {"_id": None, "total_revenue": {"$sum": "$total"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]['total_revenue'] if revenue_result else 0
    
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "recent_orders": recent_orders
    }


@router.get("/settings")
async def get_admin_settings(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    settings = await db.admin_settings.find_one({}, {"_id": 0})
    if not settings:
        settings = AdminSettings().model_dump()
    
    if settings.get('razorpay_key_secret'):
        settings['razorpay_key_secret'] = "*" * 20
    if settings.get('shiprocket_password'):
        settings['shiprocket_password'] = "*" * 20
    
    return settings


@router.put("/settings")
async def update_admin_settings(settings: AdminSettings, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    settings_dict = settings.model_dump()
    
    existing = await db.admin_settings.find_one({}, {"_id": 0})
    if existing:
        if settings_dict.get('razorpay_key_secret') == "*" * 20:
            settings_dict['razorpay_key_secret'] = existing.get('razorpay_key_secret')
        if settings_dict.get('shiprocket_password') == "*" * 20:
            settings_dict['shiprocket_password'] = existing.get('shiprocket_password')
        
        await db.admin_settings.update_one({}, {"$set": settings_dict})
    else:
        await db.admin_settings.insert_one(settings_dict)
    
    return {"message": "Settings updated"}


@router.post("/products/bulk-import")
async def bulk_import_products(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")
    
    content = await file.read()
    decoded = content.decode('utf-8')
    csv_reader = csv.DictReader(io.StringIO(decoded))
    
    imported = 0
    errors = []
    
    for row in csv_reader:
        try:
            product = Product(
                vendor_id=current_user['user_id'],
                name=row.get('name', ''),
                description=row.get('description', ''),
                brand=row.get('brand', ''),
                ayush_system=AYUSHSystem(row.get('ayush_system', 'ayurveda')),
                category=row.get('category', ''),
                sku=row.get('sku', ''),
                price=float(row.get('price', 0)),
                stock=int(row.get('stock', 0)),
                health_concerns=row.get('health_concerns', '').split('|') if row.get('health_concerns') else [],
                benefits=row.get('benefits', '').split('|') if row.get('benefits') else [],
                ingredients=row.get('ingredients', '').split('|') if row.get('ingredients') else []
            )
            
            doc = product.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.products.insert_one(doc)
            imported += 1
        except Exception as e:
            errors.append(f"Row {row.get('name', 'unknown')}: {str(e)}")
    
    return {
        "message": "Bulk import completed",
        "imported": imported,
        "errors": errors
    }


@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: Dict[str, str], current_user: dict = Depends(get_current_user)):
    global shiprocket_token
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    await db.orders.update_one({"id": order_id}, {"$set": {"order_status": status.get('order_status')}})
    
    if status.get('order_status') == OrderStatus.CONFIRMED.value and not order.get('shiprocket_order_id'):
        await init_shiprocket_token()
        if shiprocket_token:
            try:
                response = requests.post(
                    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
                    headers={"Authorization": f"Bearer {shiprocket_token}", "Content-Type": "application/json"},
                    json={
                        "order_id": order_id,
                        "order_date": order['created_at'],
                        "pickup_location": "Primary",
                        "billing_customer_name": order['billing_address'].get('name', ''),
                        "billing_address": order['billing_address'].get('address', ''),
                        "billing_city": order['billing_address'].get('city', ''),
                        "billing_pincode": order['billing_address'].get('postal_code', ''),
                        "billing_state": order['billing_address'].get('state', ''),
                        "billing_country": "India",
                        "billing_email": order['billing_address'].get('email', ''),
                        "billing_phone": order['billing_address'].get('phone', ''),
                        "shipping_is_billing": True,
                        "order_items": [{
                            "name": item['product_name'],
                            "sku": item['product_id'],
                            "units": item['quantity'],
                            "selling_price": item['price']
                        } for item in order['items']],
                        "payment_method": "Prepaid" if order['payment_method'] == "razorpay" else "COD",
                        "sub_total": order['subtotal'],
                        "length": 10,
                        "breadth": 10,
                        "height": 10,
                        "weight": 0.5
                    },
                    timeout=30
                )
                
                if response.status_code == 200:
                    shiprocket_data = response.json()
                    await db.orders.update_one(
                        {"id": order_id},
                        {"$set": {"shiprocket_order_id": shiprocket_data.get('order_id')}}
                    )
            except Exception as e:
                logging.error(f"Shiprocket push failed: {e}")
    
    return {"message": "Order status updated"}


# Testimonials
@router.post("/testimonials")
async def create_testimonial(testimonial: Testimonial, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    doc = testimonial.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.testimonials.insert_one(doc)
    
    return {"message": "Testimonial created", "id": testimonial.id}


# Newsletter
@router.get("/newsletter")
async def get_newsletter_subscribers(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    subscribers = await db.newsletter.find({"is_active": True}, {"_id": 0}).to_list(10000)
    return {"subscribers": subscribers, "total": len(subscribers)}


# Audit Logs
@router.get("/audit-logs")
async def get_audit_logs(skip: int = 0, limit: int = 50, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    logs = await db.audit_logs.find({}, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.audit_logs.count_documents({})
    
    return {"logs": logs, "total": total}


# Integration Settings
@router.get("/integrations")
async def get_integration_settings(current_user: dict = Depends(get_current_user)):
    from models.schemas import IntegrationSettings
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    settings = await db.integration_settings.find_one({}, {"_id": 0})
    if not settings:
        settings = IntegrationSettings().model_dump()
    
    if settings.get('razorpay_key_secret'):
        settings['razorpay_key_secret'] = "*" * 20
    if settings.get('shiprocket_password'):
        settings['shiprocket_password'] = "*" * 20
    if settings.get('msg91_auth_key'):
        settings['msg91_auth_key'] = "*" * 20
    if settings.get('smtp_password'):
        settings['smtp_password'] = "*" * 20
    
    return settings


@router.put("/integrations")
async def update_integration_settings(settings: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    existing = await db.integration_settings.find_one({}, {"_id": 0})
    if existing:
        if settings.get('razorpay_key_secret') == "*" * 20:
            settings['razorpay_key_secret'] = existing.get('razorpay_key_secret')
        if settings.get('shiprocket_password') == "*" * 20:
            settings['shiprocket_password'] = existing.get('shiprocket_password')
        if settings.get('msg91_auth_key') == "*" * 20:
            settings['msg91_auth_key'] = existing.get('msg91_auth_key')
        if settings.get('smtp_password') == "*" * 20:
            settings['smtp_password'] = existing.get('smtp_password')
        
        await db.integration_settings.update_one({}, {"$set": settings})
    else:
        await db.integration_settings.insert_one(settings)
    
    return {"message": "Integration settings updated"}


# Email Templates
@router.get("/email-templates")
async def get_email_templates(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    templates = await db.email_templates.find({"is_active": True}, {"_id": 0}).to_list(100)
    return {"templates": templates}


@router.post("/email-templates")
async def create_email_template(template: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    from models.schemas import EmailTemplate
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    email_template = EmailTemplate(**template)
    doc = email_template.model_dump()
    await db.email_templates.insert_one(doc)
    
    return {"message": "Email template created", "id": email_template.id}


# SMS Templates
@router.get("/sms-templates")
async def get_sms_templates(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    templates = await db.sms_templates.find({"is_active": True}, {"_id": 0}).to_list(100)
    return {"templates": templates}


@router.post("/sms-templates")
async def create_sms_template(template: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    from models.schemas import SMSTemplate
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    sms_template = SMSTemplate(**template)
    doc = sms_template.model_dump()
    await db.sms_templates.insert_one(doc)
    
    return {"message": "SMS template created", "id": sms_template.id}



# Review Approval
@router.get("/reviews/pending")
async def get_pending_reviews(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    reviews = await db.reviews.find({"is_approved": False}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"reviews": reviews}


@router.put("/reviews/{review_id}/approve")
async def approve_review(review_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.reviews.update_one({"id": review_id}, {"$set": {"is_approved": True}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Update product rating
    review = await db.reviews.find_one({"id": review_id}, {"_id": 0})
    if review:
        reviews = await db.reviews.find({"product_id": review['product_id'], "is_approved": True}, {"_id": 0}).to_list(1000)
        if reviews:
            avg_rating = sum(r['rating'] for r in reviews) / len(reviews)
            await db.products.update_one(
                {"id": review['product_id']},
                {"$set": {"rating": round(avg_rating, 1), "reviews_count": len(reviews)}}
            )
    
    return {"message": "Review approved"}


@router.delete("/reviews/{review_id}")
async def delete_review(review_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.reviews.delete_one({"id": review_id})
    return {"message": "Review deleted"}


# Question Approval
@router.get("/questions/pending")
async def get_pending_questions(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    questions = await db.product_questions.find({"is_approved": False}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"questions": questions}


@router.put("/questions/{question_id}/approve")
async def approve_question(question_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.product_questions.update_one({"id": question_id}, {"$set": {"is_approved": True}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return {"message": "Question approved"}


@router.delete("/questions/{question_id}")
async def delete_question(question_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.product_questions.delete_one({"id": question_id})
    return {"message": "Question deleted"}


# Vendor Management
@router.get("/vendors")
async def get_vendors(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    vendors = await db.users.find({"role": "vendor"}, {"_id": 0, "password_hash": 0}).to_list(100)
    return {"vendors": vendors}


@router.put("/vendors/{vendor_id}/approve")
async def approve_vendor(vendor_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.users.update_one({"id": vendor_id, "role": "vendor"}, {"$set": {"is_approved": True}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    return {"message": "Vendor approved"}


# Affiliate Management
@router.get("/affiliates")
async def get_affiliates(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    affiliates = await db.affiliates.find({}, {"_id": 0}).to_list(100)
    
    # Get user details for each affiliate
    for aff in affiliates:
        user = await db.users.find_one({"id": aff['user_id']}, {"_id": 0, "password_hash": 0})
        if user:
            aff['user'] = user
    
    return {"affiliates": affiliates}


@router.put("/affiliates/{affiliate_id}/settings")
async def update_affiliate_settings(affiliate_id: str, settings: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.affiliates.update_one({"id": affiliate_id}, {"$set": settings})
    return {"message": "Affiliate settings updated"}


# Shiprocket Connection Test
@router.post("/shiprocket/test-connection")
async def test_shiprocket_connection(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    settings = await db.integration_settings.find_one({}, {"_id": 0})
    if not settings or not settings.get('shiprocket_email') or not settings.get('shiprocket_password'):
        raise HTTPException(status_code=400, detail="Shiprocket credentials not configured")
    
    try:
        response = requests.post(
            "https://apiv2.shiprocket.in/v1/external/auth/login",
            json={
                "email": settings['shiprocket_email'],
                "password": settings['shiprocket_password']
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('token'):
                return {
                    "success": True,
                    "message": "Shiprocket connection successful!",
                    "company_name": data.get('company_name', 'Connected')
                }
        
        return {
            "success": False,
            "message": f"Connection failed: {response.json().get('message', 'Invalid credentials')}"
        }
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=408, detail="Connection timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection error: {str(e)}")


# Razorpay Connection Test
@router.post("/razorpay/test-connection")
async def test_razorpay_connection(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    settings = await db.integration_settings.find_one({}, {"_id": 0})
    if not settings or not settings.get('razorpay_key_id') or not settings.get('razorpay_key_secret'):
        raise HTTPException(status_code=400, detail="Razorpay credentials not configured")
    
    try:
        import razorpay
        client = razorpay.Client(auth=(settings['razorpay_key_id'], settings['razorpay_key_secret']))
        # Try to fetch orders to validate credentials
        client.order.all({"count": 1})
        return {
            "success": True,
            "message": "Razorpay connection successful!",
            "key_id": settings['razorpay_key_id'][:15] + "..."
        }
    except Exception as e:
        error_msg = str(e)
        if "Authentication" in error_msg or "401" in error_msg:
            return {"success": False, "message": "Invalid API credentials"}
        return {"success": False, "message": f"Connection error: {error_msg}"}


# Get Razorpay Key ID for frontend
@router.get("/razorpay/key")
async def get_razorpay_key():
    """Public endpoint to get Razorpay key ID for frontend checkout"""
    settings = await db.integration_settings.find_one({}, {"_id": 0})
    if settings and settings.get('razorpay_key_id'):
        return {"key_id": settings['razorpay_key_id']}
    return {"key_id": None}
