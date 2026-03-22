# Prescription & Affiliate routes
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
import os
import uuid
from database import db
from models.schemas import Prescription, Affiliate
from utils.auth import get_current_user

router = APIRouter(tags=["User Features"])


# Prescriptions
@router.post("/prescriptions/upload")
async def upload_prescription(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    
    file_path = f"/tmp/prescriptions/{current_user['user_id']}_{uuid.uuid4()}_{file.filename}"
    os.makedirs("/tmp/prescriptions", exist_ok=True)
    
    content = await file.read()
    with open(file_path, 'wb') as f:
        f.write(content)
    
    prescription = Prescription(
        user_id=current_user['user_id'],
        file_url=file_path
    )
    
    doc = prescription.model_dump()
    doc['uploaded_at'] = doc['uploaded_at'].isoformat()
    await db.prescriptions.insert_one(doc)
    
    return {"message": "Prescription uploaded", "prescription_id": prescription.id, "file_url": file_path}


@router.get("/prescriptions")
async def get_prescriptions(current_user: dict = Depends(get_current_user)):
    prescriptions = await db.prescriptions.find({"user_id": current_user['user_id']}, {"_id": 0}).to_list(100)
    return {"prescriptions": prescriptions}


# Affiliate
@router.post("/affiliate/register")
async def register_affiliate(current_user: dict = Depends(get_current_user)):
    
    existing = await db.affiliates.find_one({"user_id": current_user['user_id']}, {"_id": 0})
    if existing:
        return {"message": "Already registered as affiliate", "referral_code": existing['referral_code']}
    
    referral_code = f"AFF{uuid.uuid4().hex[:8].upper()}"
    
    affiliate = Affiliate(user_id=current_user['user_id'], referral_code=referral_code)
    doc = affiliate.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.affiliates.insert_one(doc)
    
    return {"message": "Affiliate registered", "referral_code": referral_code}


@router.get("/affiliate/dashboard")
async def affiliate_dashboard(current_user: dict = Depends(get_current_user)):
    
    affiliate = await db.affiliates.find_one({"user_id": current_user['user_id']}, {"_id": 0})
    if not affiliate:
        raise HTTPException(status_code=404, detail="Not registered as affiliate")
    
    # Get referral orders
    referrals = await db.affiliate_referrals.find(
        {"affiliate_id": affiliate['id']}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Get earnings history
    earnings = await db.affiliate_payouts.find(
        {"affiliate_id": affiliate['id']}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {
        **affiliate,
        "referrals": referrals,
        "earnings_history": earnings,
        "total_referrals": len(referrals)
    }


@router.get("/affiliate/referrals")
async def get_affiliate_referrals(current_user: dict = Depends(get_current_user)):
    affiliate = await db.affiliates.find_one({"user_id": current_user['user_id']}, {"_id": 0})
    if not affiliate:
        raise HTTPException(status_code=404, detail="Not registered as affiliate")
    
    referrals = await db.affiliate_referrals.find(
        {"affiliate_id": affiliate['id']}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"referrals": referrals}


@router.get("/affiliate/earnings")
async def get_affiliate_earnings(current_user: dict = Depends(get_current_user)):
    affiliate = await db.affiliates.find_one({"user_id": current_user['user_id']}, {"_id": 0})
    if not affiliate:
        raise HTTPException(status_code=404, detail="Not registered as affiliate")
    
    payouts = await db.affiliate_payouts.find(
        {"affiliate_id": affiliate['id']}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"payouts": payouts, "total_earnings": affiliate.get('total_earnings', 0), "pending_earnings": affiliate.get('pending_earnings', 0)}


# Vendor Registration
@router.post("/vendor/register")
async def register_vendor(vendor_data: dict, current_user: dict = Depends(get_current_user)):
    from datetime import datetime, timezone
    
    # Check if already a vendor
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    if user and user.get('role') == 'vendor':
        return {"message": "Already registered as vendor"}
    
    # Update user to vendor role
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$set": {
            "role": "vendor",
            "business_name": vendor_data.get('businessName'),
            "gst_number": vendor_data.get('gstNumber'),
            "pan_number": vendor_data.get('panNumber'),
            "bank_details": {
                "account_number": vendor_data.get('bankAccountNumber'),
                "ifsc_code": vendor_data.get('ifscCode'),
                "bank_name": vendor_data.get('bankName')
            },
            "business_address": {
                "address": vendor_data.get('address'),
                "city": vendor_data.get('city'),
                "state": vendor_data.get('state'),
                "pincode": vendor_data.get('pincode')
            },
            "phone": vendor_data.get('phone'),
            "is_approved": False,
            "vendor_registered_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Vendor registration submitted", "status": "pending_approval"}


# Vendor Dashboard Stats
@router.get("/vendor/dashboard")
async def vendor_dashboard(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'vendor':
        raise HTTPException(status_code=403, detail="Vendor access required")
    
    # Get vendor's products
    products = await db.products.find(
        {"vendor_id": current_user['user_id']}, {"_id": 0}
    ).to_list(1000)
    
    # Get orders containing vendor's products
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    vendor_orders = []
    total_revenue = 0
    
    for order in orders:
        for item in order.get('items', []):
            if any(p['id'] == item.get('product_id') for p in products):
                vendor_orders.append(order)
                total_revenue += item.get('total', 0)
                break
    
    return {
        "total_products": len(products),
        "total_orders": len(vendor_orders),
        "total_revenue": total_revenue,
        "pending_orders": len([o for o in vendor_orders if o.get('order_status') == 'placed']),
        "products": products,
        "orders": vendor_orders
    }
