# Authentication routes
from fastapi import APIRouter, HTTPException, Depends
from database import db
from models.schemas import User, UserCreate, UserLogin
from utils.auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
async def register(user_create: UserCreate):
    existing = await db.users.find_one({"email": user_create.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_create.email,
        password_hash=hash_password(user_create.password),
        full_name=user_create.full_name,
        phone=user_create.phone,
        role=user_create.role
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    token = create_token(user.id, user.role.value)
    return {"token": token, "user": {"id": user.id, "email": user.email, "role": user.role, "full_name": user.full_name}}


@router.post("/login")
async def login(user_login: UserLogin):
    user = await db.users.find_one({"email": user_login.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(user_login.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['role'])
    return {"token": token, "user": {"id": user['id'], "email": user['email'], "role": user['role'], "full_name": user['full_name']}}


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
