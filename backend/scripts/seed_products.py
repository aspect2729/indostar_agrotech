"""
Seed script for initial product data.

This script populates the database with initial product data for all categories:
jaggery, oil, chutney powder, pickles, and milk products.
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import logging

from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Initial product seed data
SEED_PRODUCTS = [
    # Jaggery Products
    {
        "name": "Organic Jaggery Powder",
        "category": "jaggery",
        "description": "Pure organic jaggery powder made from sugarcane grown in Karnataka. Rich in iron and minerals, perfect for sweetening beverages and desserts.",
        "images": ["/images/products/jaggery-powder.jpg"],
        "price": {
            "consumer": 150.0,
            "distributor": 120.0
        },
        "unit": "kg",
        "nutritional_info": {
            "calories": 383.0,
            "protein": 0.4,
            "carbohydrates": 98.0,
            "fat": 0.1,
            "additional_info": {
                "iron": 11.0,
                "calcium": 80.0,
                "sugar": 97.0
            }
        },
        "inter_state_delivery": True,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "Jaggery Blocks (Bella)",
        "category": "jaggery",
        "description": "Traditional jaggery blocks made from pure sugarcane juice. Ideal for cooking and traditional recipes. No chemicals or preservatives added.",
        "images": ["/images/products/jaggery-blocks.jpg"],
        "price": {
            "consumer": 140.0,
            "distributor": 110.0
        },
        "unit": "kg",
        "nutritional_info": {
            "calories": 383.0,
            "protein": 0.4,
            "carbohydrates": 98.0,
            "fat": 0.1,
            "additional_info": {
                "iron": 11.0,
                "calcium": 80.0
            }
        },
        "inter_state_delivery": True,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    # Oil Products
    {
        "name": "Cold Pressed Coconut Oil",
        "category": "oil",
        "description": "Premium cold pressed coconut oil extracted from fresh coconuts. Rich in MCT and perfect for cooking, hair care, and skin care.",
        "images": ["/images/products/coconut-oil.jpg"],
        "price": {
            "consumer": 350.0,
            "distributor": 280.0
        },
        "unit": "liter",
        "nutritional_info": {
            "calories": 862.0,
            "protein": 0.0,
            "carbohydrates": 0.0,
            "fat": 100.0,
            "additional_info": {
                "saturated_fat": 87.0,
                "monounsaturated_fat": 6.0
            }
        },
        "inter_state_delivery": True,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "Cold Pressed Groundnut Oil",
        "category": "oil",
        "description": "Pure cold pressed groundnut oil with natural aroma and flavor. Ideal for deep frying and traditional cooking.",
        "images": ["/images/products/groundnut-oil.jpg"],
        "price": {
            "consumer": 280.0,
            "distributor": 220.0
        },
        "unit": "liter",
        "nutritional_info": {
            "calories": 884.0,
            "protein": 0.0,
            "carbohydrates": 0.0,
            "fat": 100.0,
            "additional_info": {
                "saturated_fat": 17.0,
                "monounsaturated_fat": 46.0,
                "polyunsaturated_fat": 32.0
            }
        },
        "inter_state_delivery": True,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "Cold Pressed Sesame Oil",
        "category": "oil",
        "description": "Traditional cold pressed sesame oil (Nallennai) with rich nutty flavor. Perfect for South Indian cooking and Ayurvedic applications.",
        "images": ["/images/products/sesame-oil.jpg"],
        "price": {
            "consumer": 400.0,
            "distributor": 320.0
        },
        "unit": "liter",
        "nutritional_info": {
            "calories": 884.0,
            "protein": 0.0,
            "carbohydrates": 0.0,
            "fat": 100.0,
            "additional_info": {
                "saturated_fat": 14.0,
                "monounsaturated_fat": 40.0,
                "polyunsaturated_fat": 42.0
            }
        },
        "inter_state_delivery": True,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    # Chutney Powder Products
    {
        "name": "Idli Podi (Gun Powder)",
        "category": "chutney_powder",
        "description": "Spicy and aromatic idli podi made with roasted lentils and spices. Perfect accompaniment for idli, dosa, and rice.",
        "images": ["/images/products/idli-podi.jpg"],
        "price": {
            "consumer": 180.0,
            "distributor": 145.0
        },
        "unit": "kg",
        "nutritional_info": {
            "calories": 450.0,
            "protein": 18.0,
            "carbohydrates": 45.0,
            "fat": 22.0,
            "additional_info": {
                "fiber": 12.0,
                "sodium": 800.0
            }
        },
        "inter_state_delivery": False,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "Coconut Chutney Powder",
        "category": "chutney_powder",
        "description": "Instant coconut chutney powder with authentic South Indian taste. Just add water and enjoy with breakfast items.",
        "images": ["/images/products/coconut-chutney-powder.jpg"],
        "price": {
            "consumer": 200.0,
            "distributor": 160.0
        },
        "unit": "kg",
        "nutritional_info": {
            "calories": 520.0,
            "protein": 8.0,
            "carbohydrates": 35.0,
            "fat": 38.0,
            "additional_info": {
                "fiber": 15.0,
                "sodium": 600.0
            }
        },
        "inter_state_delivery": False,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    # Pickle Products
    {
        "name": "Mango Pickle (Avakaya)",
        "category": "pickles",
        "description": "Traditional Andhra style mango pickle made with raw mangoes, spices, and sesame oil. Spicy and tangy flavor.",
        "images": ["/images/products/mango-pickle.jpg"],
        "price": {
            "consumer": 250.0,
            "distributor": 200.0
        },
        "unit": "kg",
        "nutritional_info": {
            "calories": 180.0,
            "protein": 2.0,
            "carbohydrates": 15.0,
            "fat": 12.0,
            "additional_info": {
                "sodium": 2500.0,
                "vitamin_c": 15.0
            }
        },
        "inter_state_delivery": False,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "Lemon Pickle",
        "category": "pickles",
        "description": "Tangy lemon pickle made with fresh lemons, spices, and oil. Perfect side dish for rice and roti.",
        "images": ["/images/products/lemon-pickle.jpg"],
        "price": {
            "consumer": 220.0,
            "distributor": 175.0
        },
        "unit": "kg",
        "nutritional_info": {
            "calories": 150.0,
            "protein": 1.5,
            "carbohydrates": 12.0,
            "fat": 10.0,
            "additional_info": {
                "sodium": 2200.0,
                "vitamin_c": 25.0
            }
        },
        "inter_state_delivery": False,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "Mixed Vegetable Pickle",
        "category": "pickles",
        "description": "Assorted vegetable pickle with carrots, cauliflower, and green chillies. Mild spice level suitable for all.",
        "images": ["/images/products/mixed-pickle.jpg"],
        "price": {
            "consumer": 230.0,
            "distributor": 185.0
        },
        "unit": "kg",
        "nutritional_info": {
            "calories": 160.0,
            "protein": 2.5,
            "carbohydrates": 14.0,
            "fat": 11.0,
            "additional_info": {
                "sodium": 2000.0,
                "fiber": 4.0
            }
        },
        "inter_state_delivery": False,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    # Milk Products
    {
        "name": "Fresh Cow Milk",
        "category": "milk",
        "description": "Fresh cow milk from grass-fed cows. Delivered daily from our farm. Rich in calcium and protein.",
        "images": ["/images/products/cow-milk.jpg"],
        "price": {
            "consumer": 60.0,
            "distributor": 50.0
        },
        "unit": "liter",
        "nutritional_info": {
            "calories": 61.0,
            "protein": 3.2,
            "carbohydrates": 4.8,
            "fat": 3.3,
            "additional_info": {
                "calcium": 113.0,
                "vitamin_d": 1.3
            }
        },
        "inter_state_delivery": False,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "Fresh Buffalo Milk",
        "category": "milk",
        "description": "Fresh buffalo milk with higher fat content. Perfect for making curd, paneer, and traditional sweets.",
        "images": ["/images/products/buffalo-milk.jpg"],
        "price": {
            "consumer": 70.0,
            "distributor": 58.0
        },
        "unit": "liter",
        "nutritional_info": {
            "calories": 97.0,
            "protein": 3.8,
            "carbohydrates": 5.2,
            "fat": 6.9,
            "additional_info": {
                "calcium": 169.0,
                "vitamin_a": 53.0
            }
        },
        "inter_state_delivery": False,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
]


async def seed_products():
    """Seed the database with initial product data."""
    client = None
    try:
        logger.info("Connecting to MongoDB...")
        client = AsyncIOMotorClient(settings.mongodb_url)
        db = client[settings.database_name]
        
        # Check if products already exist
        existing_count = await db.products.count_documents({})
        if existing_count > 0:
            logger.warning(f"Products collection already contains {existing_count} documents.")
            response = input("Do you want to clear existing products and reseed? (yes/no): ")
            if response.lower() != 'yes':
                logger.info("Seeding cancelled.")
                return
            
            # Clear existing products
            logger.info("Clearing existing products...")
            await db.products.delete_many({})
            logger.info("Existing products cleared.")
        
        # Insert seed products
        logger.info(f"Inserting {len(SEED_PRODUCTS)} products...")
        result = await db.products.insert_many(SEED_PRODUCTS)
        logger.info(f"Successfully inserted {len(result.inserted_ids)} products.")
        
        # Display inserted products
        logger.info("\nInserted products:")
        for product in SEED_PRODUCTS:
            logger.info(f"  - {product['name']} ({product['category']})")
        
        logger.info("\nProduct seeding completed successfully!")
        
    except Exception as e:
        logger.error(f"Error seeding products: {str(e)}")
        raise
    finally:
        if client:
            client.close()


if __name__ == "__main__":
    asyncio.run(seed_products())
