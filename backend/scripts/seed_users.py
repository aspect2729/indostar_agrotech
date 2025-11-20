"""
Seed script for sample user data.

This script creates sample users for testing purposes:
- Consumer users
- Distributor users
- Owner user
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


# Sample user data for testing
SEED_USERS = [
    # Owner
    {
        "google_id": "owner_test_001",
        "email": "owner@indostar.com",
        "name": "Indostar Owner",
        "role": "owner",
        "phone": "+919876543210",
        "addresses": [
            {
                "type": "billing",
                "street": "Indostar Agrotech Farm, Village Road",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001",
                "is_default": True
            }
        ],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    # Distributors
    {
        "google_id": "distributor_test_001",
        "email": "distributor1@example.com",
        "name": "Rajesh Kumar",
        "role": "distributor",
        "phone": "+919876543211",
        "addresses": [
            {
                "type": "billing",
                "street": "123 Wholesale Market Street",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560002",
                "is_default": True
            },
            {
                "type": "shipping",
                "street": "123 Wholesale Market Street",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560002",
                "is_default": True
            }
        ],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "google_id": "distributor_test_002",
        "email": "distributor2@example.com",
        "name": "Priya Sharma",
        "role": "distributor",
        "phone": "+919876543212",
        "addresses": [
            {
                "type": "billing",
                "street": "456 Market Road",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001",
                "is_default": True
            },
            {
                "type": "shipping",
                "street": "456 Market Road",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001",
                "is_default": True
            }
        ],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    # Consumers
    {
        "google_id": "consumer_test_001",
        "email": "consumer1@example.com",
        "name": "Amit Patel",
        "role": "consumer",
        "phone": "+919876543213",
        "addresses": [
            {
                "type": "shipping",
                "street": "789 Residential Area",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560003",
                "is_default": True
            }
        ],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "google_id": "consumer_test_002",
        "email": "consumer2@example.com",
        "name": "Sneha Reddy",
        "role": "consumer",
        "phone": "+919876543214",
        "addresses": [
            {
                "type": "shipping",
                "street": "321 Green Park",
                "city": "Hyderabad",
                "state": "Telangana",
                "pincode": "500001",
                "is_default": True
            }
        ],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "google_id": "consumer_test_003",
        "email": "consumer3@example.com",
        "name": "Vikram Singh",
        "role": "consumer",
        "phone": "+919876543215",
        "addresses": [
            {
                "type": "shipping",
                "street": "654 Lake View Apartments",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560004",
                "is_default": True
            }
        ],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
]


async def seed_users():
    """Seed the database with sample user data."""
    client = None
    try:
        logger.info("Connecting to MongoDB...")
        client = AsyncIOMotorClient(settings.mongodb_url)
        db = client[settings.database_name]
        
        # Check if users already exist
        existing_count = await db.users.count_documents({})
        if existing_count > 0:
            logger.warning(f"Users collection already contains {existing_count} documents.")
            response = input("Do you want to add sample users anyway? (yes/no): ")
            if response.lower() != 'yes':
                logger.info("Seeding cancelled.")
                return
        
        # Insert seed users
        logger.info(f"Inserting {len(SEED_USERS)} sample users...")
        result = await db.users.insert_many(SEED_USERS)
        logger.info(f"Successfully inserted {len(result.inserted_ids)} users.")
        
        # Display inserted users
        logger.info("\nInserted users:")
        for user in SEED_USERS:
            logger.info(f"  - {user['name']} ({user['role']}) - {user['email']}")
        
        logger.info("\n" + "="*60)
        logger.info("IMPORTANT: These are TEST users for development only!")
        logger.info("="*60)
        logger.info("\nTest credentials:")
        logger.info("  Owner: owner@indostar.com")
        logger.info("  Distributor 1: distributor1@example.com")
        logger.info("  Distributor 2: distributor2@example.com")
        logger.info("  Consumer 1: consumer1@example.com")
        logger.info("  Consumer 2: consumer2@example.com")
        logger.info("  Consumer 3: consumer3@example.com")
        logger.info("\nNote: In production, users will be created via Google OAuth.")
        logger.info("="*60)
        
        logger.info("\nUser seeding completed successfully!")
        
    except Exception as e:
        logger.error(f"Error seeding users: {str(e)}")
        raise
    finally:
        if client:
            client.close()


if __name__ == "__main__":
    asyncio.run(seed_users())
