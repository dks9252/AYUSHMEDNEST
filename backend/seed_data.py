import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'ayushmednest_db')

async def seed_database():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Sample products by category
    products = [
        # Immunity Boosters
        {
            "id": str(uuid.uuid4()),
            "vendor_id": "admin",
            "name": "Chyawanprash Special - 500g",
            "description": "Traditional Ayurvedic immunity booster made with 40+ herbs and natural ingredients. Strengthens immune system naturally.",
            "brand": "Dabur",
            "ayush_system": "ayurveda",
            "category": "Immunity",
            "sku": "IMM001",
            "price": 299,
            "discount_price": 249,
            "stock": 100,
            "images": ["https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400"],
            "health_concerns": ["immunity", "cold-cough"],
            "benefits": ["Boosts immunity", "Improves digestion", "Enhances strength"],
            "disadvantages": [],
            "ingredients": ["Amla", "Ashwagandha", "Honey", "Ghee"],
            "rating": 4.5,
            "reviews_count": 1250,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "vendor_id": "admin",
            "name": "Giloy Tulsi Juice - 1L",
            "description": "Pure Giloy and Tulsi juice for natural immunity. No added sugar or preservatives.",
            "brand": "Patanjali",
            "ayush_system": "ayurveda",
            "category": "Immunity",
            "sku": "IMM002",
            "price": 180,
            "discount_price": 150,
            "stock": 80,
            "images": ["https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400"],
            "health_concerns": ["immunity"],
            "benefits": ["Natural immunity booster", "Detoxifies body"],
            "disadvantages": [],
            "ingredients": ["Giloy", "Tulsi"],
            "rating": 4.3,
            "reviews_count": 890,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        
        # Diabetes Care
        {
            "id": str(uuid.uuid4()),
            "vendor_id": "admin",
            "name": "Diabecon DS - 60 Tablets",
            "description": "Ayurvedic supplement for blood sugar management. Clinically tested formula.",
            "brand": "Himalaya",
            "ayush_system": "ayurveda",
            "category": "Diabetes Care",
            "sku": "DIA001",
            "price": 350,
            "discount_price": 299,
            "stock": 50,
            "images": ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"],
            "health_concerns": ["diabetes"],
            "benefits": ["Manages blood sugar", "Supports pancreatic health"],
            "disadvantages": [],
            "ingredients": ["Gymnema", "Bitter Melon", "Indian Kino Tree"],
            "rating": 4.6,
            "reviews_count": 2100,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "vendor_id": "admin",
            "name": "Karela Jamun Juice - 1L",
            "description": "Natural juice for diabetes management with Karela and Jamun extracts.",
            "brand": "Baidyanath",
            "ayush_system": "ayurveda",
            "category": "Diabetes Care",
            "sku": "DIA002",
            "price": 200,
            "discount_price": 170,
            "stock": 60,
            "images": ["https://images.unsplash.com/photo-1628191010210-a59de3904e32?w=400"],
            "health_concerns": ["diabetes"],
            "benefits": ["Controls blood sugar naturally"],
            "disadvantages": [],
            "ingredients": ["Karela", "Jamun"],
            "rating": 4.4,
            "reviews_count": 750,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        
        # Joint Pain Relief
        {
            "id": str(uuid.uuid4()),
            "vendor_id": "admin",
            "name": "Rumalaya Forte - 60 Tablets",
            "description": "Powerful Ayurvedic formulation for joint and bone health. Reduces inflammation.",
            "brand": "Himalaya",
            "ayush_system": "ayurveda",
            "category": "Joint Care",
            "sku": "JOINT001",
            "price": 280,
            "discount_price": 240,
            "stock": 70,
            "images": ["https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400"],
            "health_concerns": ["joint-pain"],
            "benefits": ["Reduces joint pain", "Improves mobility"],
            "disadvantages": [],
            "ingredients": ["Boswellia", "Guggul", "Ginger"],
            "rating": 4.7,
            "reviews_count": 1800,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        
        # Digestion
        {
            "id": str(uuid.uuid4()),
            "vendor_id": "admin",
            "name": "Triphala Churna - 100g",
            "description": "Ancient Ayurvedic formula for digestive health and detoxification.",
            "brand": "Organic India",
            "ayush_system": "ayurveda",
            "category": "Digestion",
            "sku": "DIG001",
            "price": 150,
            "discount_price": 120,
            "stock": 90,
            "images": ["https://images.unsplash.com/photo-1599929082256-8f8c5f0a5a2f?w=400"],
            "health_concerns": ["digestion"],
            "benefits": ["Improves digestion", "Natural detox"],
            "disadvantages": [],
            "ingredients": ["Amla", "Haritaki", "Bibhitaki"],
            "rating": 4.5,
            "reviews_count": 950,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        
        # Hair Care
        {
            "id": str(uuid.uuid4()),
            "vendor_id": "admin",
            "name": "Bhringraj Hair Oil - 200ml",
            "description": "Pure Ayurvedic hair oil for hair growth and preventing hair fall.",
            "brand": "Kama Ayurveda",
            "ayush_system": "ayurveda",
            "category": "Hair Care",
            "sku": "HAIR001",
            "price": 450,
            "discount_price": 399,
            "stock": 55,
            "images": ["https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400"],
            "health_concerns": ["hair"],
            "benefits": ["Promotes hair growth", "Reduces hair fall"],
            "disadvantages": [],
            "ingredients": ["Bhringraj", "Amla", "Coconut Oil"],
            "rating": 4.6,
            "reviews_count": 1100,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        
        # Skin Care
        {
            "id": str(uuid.uuid4()),
            "vendor_id": "admin",
            "name": "Kumkumadi Tailam - 12ml",
            "description": "Premium facial oil for glowing skin. Ancient beauty secret.",
            "brand": "Forest Essentials",
            "ayush_system": "ayurveda",
            "category": "Skin Care",
            "sku": "SKIN001",
            "price": 1850,
            "discount_price": 1650,
            "stock": 30,
            "images": ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400"],
            "health_concerns": ["skin"],
            "benefits": ["Brightens complexion", "Anti-aging"],
            "disadvantages": [],
            "ingredients": ["Saffron", "Sandalwood", "Lotus"],
            "rating": 4.8,
            "reviews_count": 650,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        
        # Stress & Anxiety
        {
            "id": str(uuid.uuid4()),
            "vendor_id": "admin",
            "name": "Ashwagandha Capsules - 60 Count",
            "description": "Premium Ashwagandha extract for stress relief and energy.",
            "brand": "Himalaya",
            "ayush_system": "ayurveda",
            "category": "Mental Wellness",
            "sku": "STRESS001",
            "price": 380,
            "discount_price": 320,
            "stock": 75,
            "images": ["https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400"],
            "health_concerns": ["stress", "sleep"],
            "benefits": ["Reduces stress", "Improves sleep quality"],
            "disadvantages": [],
            "ingredients": ["Ashwagandha Extract"],
            "rating": 4.7,
            "reviews_count": 2300,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        
        # Heart Health
        {
            "id": str(uuid.uuid4()),
            "vendor_id": "admin",
            "name": "Arjuna Tablets - 60 Count",
            "description": "Ayurvedic heart tonic for cardiovascular health.",
            "brand": "Zandu",
            "ayush_system": "ayurveda",
            "category": "Heart Care",
            "sku": "HEART001",
            "price": 250,
            "discount_price": 210,
            "stock": 65,
            "images": ["https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400"],
            "health_concerns": ["bp", "cholesterol"],
            "benefits": ["Supports heart health", "Maintains blood pressure"],
            "disadvantages": [],
            "ingredients": ["Arjuna Bark Extract"],
            "rating": 4.5,
            "reviews_count": 880,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        
        # Homeopathy
        {
            "id": str(uuid.uuid4()),
            "vendor_id": "admin",
            "name": "Arnica Montana 30C - 25g",
            "description": "Homeopathic medicine for pain relief and injury recovery.",
            "brand": "SBL",
            "ayush_system": "homeopathy",
            "category": "Pain Relief",
            "sku": "HOM001",
            "price": 120,
            "discount_price": 99,
            "stock": 100,
            "images": ["https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400"],
            "health_concerns": ["joint-pain"],
            "benefits": ["Relieves pain", "Aids injury recovery"],
            "disadvantages": [],
            "ingredients": ["Arnica Montana"],
            "rating": 4.4,
            "reviews_count": 560,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        
        {
            "id": str(uuid.uuid4()),
            "vendor_id": "admin",
            "name": "Belladonna 200C - 25g",
            "description": "Homeopathic remedy for fever and inflammation.",
            "brand": "Dr. Reckeweg",
            "ayush_system": "homeopathy",
            "category": "Fever Care",
            "sku": "HOM002",
            "price": 130,
            "discount_price": 110,
            "stock": 85,
            "images": ["https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400"],
            "health_concerns": ["cold-cough"],
            "benefits": ["Reduces fever", "Anti-inflammatory"],
            "disadvantages": [],
            "ingredients": ["Belladonna"],
            "rating": 4.3,
            "reviews_count": 420,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
    ]
    
    # Clear existing products
    await db.products.delete_many({})
    
    # Insert sample products
    if products:
        await db.products.insert_many(products)
        print(f"✓ Seeded {len(products)} products")
    
    # Create sample doctors
    doctors = [
        {
            "id": str(uuid.uuid4()),
            "name": "Dr. Rajesh Kumar",
            "email": "dr.rajesh@ayushmednest.com",
            "phone": "9876543210",
            "specialization": "Panchakarma Specialist",
            "ayush_system": "ayurveda",
            "experience": 15,
            "qualification": "BAMS, MD (Ayurveda)",
            "languages": ["Hindi", "English"],
            "rating": 4.8,
            "reviews_count": 450,
            "consultation_fee": 500,
            "bio": "Expert in Panchakarma treatments with 15 years of experience",
            "conditions_treated": ["Diabetes", "Joint Pain", "Digestive Issues"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Dr. Priya Sharma",
            "email": "dr.priya@ayushmednest.com",
            "phone": "9876543211",
            "specialization": "Skin & Hair Specialist",
            "ayush_system": "ayurveda",
            "experience": 10,
            "qualification": "BAMS",
            "languages": ["Hindi", "English"],
            "rating": 4.7,
            "reviews_count": 320,
            "consultation_fee": 400,
            "bio": "Specialist in Ayurvedic treatments for skin and hair problems",
            "conditions_treated": ["Hair Loss", "Acne", "Eczema"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Dr. Amit Patel",
            "email": "dr.amit@ayushmednest.com",
            "phone": "9876543212",
            "specialization": "Classical Homeopath",
            "ayush_system": "homeopathy",
            "experience": 12,
            "qualification": "BHMS, MD (Homeopathy)",
            "languages": ["Hindi", "English", "Gujarati"],
            "rating": 4.6,
            "reviews_count": 280,
            "consultation_fee": 350,
            "bio": "Classical homeopathy expert specializing in chronic diseases",
            "conditions_treated": ["Allergies", "Asthma", "Chronic Pain"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        }
    ]
    
    await db.doctors.delete_many({})
    if doctors:
        await db.doctors.insert_many(doctors)
        print(f"✓ Seeded {len(doctors)} doctors")
    
    client.close()
    print("✓ Database seeding completed!")

if __name__ == "__main__":
    asyncio.run(seed_database())
