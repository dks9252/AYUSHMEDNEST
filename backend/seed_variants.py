"""
Seed sample product variants for testing the variant system
"""
import asyncio
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_variants():
    # Get first 3 products to add variants
    products = await db.products.find({}, {"_id": 0, "id": 1, "name": 1, "price": 1, "discount_price": 1}).limit(3).to_list(3)
    
    if not products:
        print("No products found to add variants")
        return
    
    variants_to_add = []
    
    for product in products:
        base_price = product.get('discount_price') or product['price']
        
        # Size variants
        size_variants = [
            {"variant_name": "30ml", "variant_type": "Size", "price": base_price, "discount_price": base_price * 0.85, "stock": 15, "is_default": True},
            {"variant_name": "2x30ml", "variant_type": "Size", "price": base_price * 1.8, "discount_price": base_price * 1.6, "stock": 8, "is_default": False},
            {"variant_name": "100ml", "variant_type": "Size", "price": base_price * 2.5, "discount_price": base_price * 2.2, "stock": 5, "is_default": False},
        ]
        
        # Potency variants (for homeopathic products)
        potency_variants = [
            {"variant_name": "6 CH", "variant_type": "Potency", "price": base_price, "discount_price": base_price * 0.85, "stock": 20, "is_default": True},
            {"variant_name": "12 CH", "variant_type": "Potency", "price": base_price * 1.1, "discount_price": base_price * 0.95, "stock": 15, "is_default": False},
            {"variant_name": "30 CH", "variant_type": "Potency", "price": base_price * 1.2, "discount_price": base_price * 1.0, "stock": 12, "is_default": False},
            {"variant_name": "200 CH", "variant_type": "Potency", "price": base_price * 1.3, "discount_price": base_price * 1.1, "stock": 10, "is_default": False},
            {"variant_name": "1M", "variant_type": "Potency", "price": base_price * 1.5, "discount_price": base_price * 1.25, "stock": 5, "is_default": False},
            {"variant_name": "10M", "variant_type": "Potency", "price": base_price * 1.8, "discount_price": base_price * 1.5, "stock": 3, "is_default": False},
        ]
        
        for v in size_variants + potency_variants:
            variant = {
                "id": str(uuid.uuid4()),
                "parent_product_id": product['id'],
                "variant_name": v['variant_name'],
                "variant_type": v['variant_type'],
                "sku": f"{product['id'][:8]}-{v['variant_name'].replace(' ', '-')}",
                "price": round(v['price'], 2),
                "discount_price": round(v['discount_price'], 2),
                "stock": v['stock'],
                "image_url": None,
                "is_default": v['is_default'],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            variants_to_add.append(variant)
    
    # Clear existing variants for these products
    product_ids = [p['id'] for p in products]
    await db.product_variants.delete_many({"parent_product_id": {"$in": product_ids}})
    
    # Insert new variants
    if variants_to_add:
        await db.product_variants.insert_many(variants_to_add)
        print(f"Seeded {len(variants_to_add)} variants for {len(products)} products")
    
    # Also update stock warning on first product to test "Only X left" feature
    if products:
        await db.products.update_one(
            {"id": products[0]['id']},
            {"$set": {"stock": 3}}
        )
        print(f"Set low stock on product: {products[0]['name']}")

async def main():
    await seed_variants()
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
