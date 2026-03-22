# Order routes
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
import logging
import os
from database import db
from models.schemas import Order, OrderItem, OrderCreate
from models.enums import PaymentMethod, PaymentStatus, OrderStatus
from utils.auth import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])

# Global clients
razorpay_client = None


async def init_razorpay_client():
    global razorpay_client
    # First try integration_settings from DB
    settings = await db.integration_settings.find_one({}, {"_id": 0})
    key_id = None
    key_secret = None
    
    if settings:
        key_id = settings.get('razorpay_key_id')
        key_secret = settings.get('razorpay_key_secret')
    
    # Fallback to environment variables
    if not key_id:
        key_id = os.environ.get('RAZORPAY_KEY_ID')
    if not key_secret:
        key_secret = os.environ.get('RAZORPAY_KEY_SECRET')
    
    if key_id and key_secret:
        import razorpay
        razorpay_client = razorpay.Client(auth=(key_id, key_secret))
        return True
    return False


@router.post("/create")
async def create_order(order_create: OrderCreate, current_user: dict = Depends(get_current_user)):
    global razorpay_client
    
    settings = await db.integration_settings.find_one({}, {"_id": 0}) or {}
    tax_rate = settings.get('tax_rate', 18.0)
    shipping_charge = settings.get('shipping_charge', 50.0)
    
    order_items = []
    subtotal = 0
    
    for item in order_create.items:
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        price = product.get('discount_price', product['price'])
        total = price * item.quantity
        
        order_items.append(OrderItem(
            product_id=item.product_id,
            product_name=product['name'],
            quantity=item.quantity,
            price=price,
            total=total
        ))
        subtotal += total
    
    tax = (subtotal * tax_rate) / 100
    total = subtotal + tax + shipping_charge
    
    razorpay_order_id = None
    if order_create.payment_method == PaymentMethod.RAZORPAY:
        initialized = await init_razorpay_client()
        if initialized and razorpay_client:
            try:
                razorpay_order = razorpay_client.order.create({
                    "amount": int(total * 100),
                    "currency": "INR",
                    "payment_capture": 1
                })
                razorpay_order_id = razorpay_order['id']
            except Exception as e:
                logging.error(f"Razorpay error: {e}")
                raise HTTPException(status_code=500, detail="Payment gateway error. Please try again.")
        else:
            raise HTTPException(status_code=500, detail="Payment gateway not configured. Please contact support.")
    
    order = Order(
        user_id=current_user['user_id'],
        items=[item.model_dump() for item in order_items],
        subtotal=subtotal,
        tax=tax,
        shipping_charge=shipping_charge,
        discount=0,
        total=total,
        payment_method=order_create.payment_method,
        payment_status=PaymentStatus.PENDING if order_create.payment_method == PaymentMethod.RAZORPAY else PaymentStatus.SUCCESS,
        order_status=OrderStatus.PLACED,
        shipping_address=order_create.shipping_address,
        billing_address=order_create.billing_address,
        prescription_url=order_create.prescription_url,
        razorpay_order_id=razorpay_order_id
    )
    
    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.orders.insert_one(doc)
    
    await db.carts.delete_one({"user_id": current_user['user_id']})
    
    return {
        "message": "Order created",
        "order_id": order.id,
        "razorpay_order_id": razorpay_order_id,
        "total": total
    }


@router.post("/{order_id}/payment")
async def verify_payment(order_id: str, payment_data: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    global razorpay_client
    
    order = await db.orders.find_one({"id": order_id, "user_id": current_user['user_id']}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    await init_razorpay_client()
    if razorpay_client:
        try:
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': payment_data.get('razorpay_order_id'),
                'razorpay_payment_id': payment_data.get('razorpay_payment_id'),
                'razorpay_signature': payment_data.get('razorpay_signature')
            })
            
            await db.orders.update_one(
                {"id": order_id},
                {"$set": {
                    "payment_status": PaymentStatus.SUCCESS.value,
                    "order_status": OrderStatus.CONFIRMED.value,
                    "razorpay_payment_id": payment_data.get('razorpay_payment_id')
                }}
            )
            
            return {"message": "Payment verified", "status": "success"}
        except Exception as e:
            logging.error(f"Payment verification failed: {e}")
            await db.orders.update_one({"id": order_id}, {"$set": {"payment_status": PaymentStatus.FAILED.value}})
            raise HTTPException(status_code=400, detail="Payment verification failed")
    
    return {"message": "Payment processed"}


@router.get("")
async def get_orders(current_user: dict = Depends(get_current_user), skip: int = 0, limit: int = 20):
    
    query = {"user_id": current_user['user_id']}
    if current_user['role'] == 'admin':
        query = {}
    
    total = await db.orders.count_documents(query)
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {"orders": orders, "total": total}


@router.get("/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    
    query = {"id": order_id}
    if current_user['role'] != 'admin':
        query["user_id"] = current_user['user_id']
    
    order = await db.orders.find_one(query, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order
