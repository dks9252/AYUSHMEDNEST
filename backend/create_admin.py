
import asyncio
import os
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'ayushmednest_db')

async def create_admin():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    admin_email = "admin@ayushmednest.com"
    admin_password = "Admin@123"
    
    # Check if admin already exists
    existing = await db.users.find_one({"email": admin_email})
    if existing:
        print(f"Admin with email {admin_email} already exists.")
        # Update password just in case
        password_hash = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": password_hash, "role": "admin"}})
        print("Admin credentials updated successfully.")
    else:
        # Create new admin
        password_hash = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        admin_user = {
            "id": "admin-001",
            "email": admin_email,
            "password_hash": password_hash,
            "role": "admin",
            "full_name": "System Administrator",
            "phone": "0000000000",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        }
        await db.users.insert_one(admin_user)
        print(f"Admin user created successfully with email: {admin_email}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin())
