
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'ayushmednest_db')

async def list_users():
    print(f"Connecting to database: {DB_NAME}")
    print(f"Using MONGO_URL: {MONGO_URL[:30]}...")
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(100)
        print(f"\nFound {len(users)} users in the database:")
        for user in users:
            print(f"- {user.get('email')} (Role: {user.get('role')})")
        
        if not users:
            print("No users found. Your database is empty!")
            
    except Exception as e:
        print(f"Error connecting to database: {e}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(list_users())
