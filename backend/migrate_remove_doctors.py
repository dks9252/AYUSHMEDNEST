
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'ayushmednest_db')

async def migrate_remove_doctors():
    print(f"Connecting to database: {DB_NAME}")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        # 1. Drop the doctors collection
        collections = await db.list_collection_names()
        if 'doctors' in collections:
            await db.doctors.drop()
            print("✓ Dropped 'doctors' collection successfully.")
        else:
            print("! 'doctors' collection does not exist.")
            
        # 2. Clean up any other potential doctor-related data
        # For example, if there were appointment or review collections specific to doctors
        if 'appointments' in collections:
            await db.appointments.drop()
            print("✓ Dropped 'appointments' collection successfully.")
            
        if 'doctor_reviews' in collections:
            await db.doctor_reviews.drop()
            print("✓ Dropped 'doctor_reviews' collection successfully.")

        print("\nMigration completed successfully. The platform is now exclusively e-commerce.")
        
    except Exception as e:
        print(f"Error during migration: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(migrate_remove_doctors())
