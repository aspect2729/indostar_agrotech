"""
User profile service for managing user information.

This module handles user profile operations including fetching
and updating user profile data, addresses, and phone numbers.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
import logging
from bson import ObjectId

from app.database import get_users_collection
from app.models.user import User, Address
from app.schemas.user import UserProfileUpdateRequest, AddressRequest

logger = logging.getLogger(__name__)


class UserService:
    """Service class for user profile operations."""
    
    async def get_user_profile(self, user_id: str) -> Optional[User]:
        """
        Get user profile by user ID.
        
        Args:
            user_id: User ID
            
        Returns:
            User object if found, None otherwise
        """
        users_collection = get_users_collection()
        
        try:
            user_data = await users_collection.find_one({"_id": ObjectId(user_id)})
            if user_data:
                return User(**user_data)
        except Exception as e:
            logger.error(f"Error fetching user profile: {str(e)}")
        
        return None
    
    async def update_user_profile(
        self,
        user_id: str,
        update_data: UserProfileUpdateRequest
    ) -> Optional[User]:
        """
        Update user profile information.
        
        This method updates user profile fields including name, phone,
        and addresses. Only provided fields are updated.
        
        Args:
            user_id: User ID
            update_data: Profile update request with optional fields
            
        Returns:
            Updated User object if successful, None otherwise
            
        Raises:
            ValueError: If validation fails
        """
        users_collection = get_users_collection()
        
        try:
            # Build update document with only provided fields
            update_doc: Dict[str, Any] = {
                "updated_at": datetime.utcnow()
            }
            
            if update_data.name is not None:
                update_doc["name"] = update_data.name
            
            if update_data.phone is not None:
                update_doc["phone"] = update_data.phone
            
            if update_data.addresses is not None:
                # Convert AddressRequest objects to Address model format
                addresses = [
                    {
                        "type": addr.type,
                        "street": addr.street,
                        "city": addr.city,
                        "state": addr.state,
                        "pincode": addr.pincode,
                        "is_default": addr.is_default
                    }
                    for addr in update_data.addresses
                ]
                update_doc["addresses"] = addresses
            
            # Update user in database
            result = await users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_doc}
            )
            
            if result.modified_count == 0 and result.matched_count == 0:
                logger.warning(f"User not found for update: {user_id}")
                return None
            
            # Fetch and return updated user
            updated_user = await self.get_user_profile(user_id)
            logger.info(f"Successfully updated user profile: {user_id}")
            
            return updated_user
            
        except Exception as e:
            logger.error(f"Error updating user profile: {str(e)}")
            raise ValueError(f"Failed to update user profile: {str(e)}")
    
    async def add_address(
        self,
        user_id: str,
        address: AddressRequest
    ) -> Optional[User]:
        """
        Add a new address to user profile.
        
        Args:
            user_id: User ID
            address: Address to add
            
        Returns:
            Updated User object if successful, None otherwise
        """
        users_collection = get_users_collection()
        
        try:
            # Get current user to validate default address logic
            user = await self.get_user_profile(user_id)
            if not user:
                return None
            
            # If this is marked as default, unset other defaults of same type
            if address.is_default:
                # Update existing addresses to unset default for same type
                for idx, existing_addr in enumerate(user.addresses):
                    if existing_addr.type == address.type and existing_addr.is_default:
                        await users_collection.update_one(
                            {"_id": ObjectId(user_id)},
                            {"$set": {f"addresses.{idx}.is_default": False}}
                        )
            
            # Add new address
            address_dict = {
                "type": address.type,
                "street": address.street,
                "city": address.city,
                "state": address.state,
                "pincode": address.pincode,
                "is_default": address.is_default
            }
            
            result = await users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$push": {"addresses": address_dict},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
            
            if result.modified_count == 0:
                return None
            
            # Fetch and return updated user
            return await self.get_user_profile(user_id)
            
        except Exception as e:
            logger.error(f"Error adding address: {str(e)}")
            raise ValueError(f"Failed to add address: {str(e)}")
    
    async def remove_address(
        self,
        user_id: str,
        address_index: int
    ) -> Optional[User]:
        """
        Remove an address from user profile by index.
        
        Args:
            user_id: User ID
            address_index: Index of address to remove
            
        Returns:
            Updated User object if successful, None otherwise
        """
        users_collection = get_users_collection()
        
        try:
            # Get current user
            user = await self.get_user_profile(user_id)
            if not user or address_index >= len(user.addresses):
                return None
            
            # Remove address at index
            user.addresses.pop(address_index)
            
            # Update database
            result = await users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$set": {
                        "addresses": [addr.model_dump() for addr in user.addresses],
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count == 0:
                return None
            
            # Fetch and return updated user
            return await self.get_user_profile(user_id)
            
        except Exception as e:
            logger.error(f"Error removing address: {str(e)}")
            raise ValueError(f"Failed to remove address: {str(e)}")


# Singleton instance
user_service = UserService()
