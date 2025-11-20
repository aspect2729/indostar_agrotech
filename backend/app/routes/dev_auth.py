"""
Development Authentication Routes (BYPASS GOOGLE OAUTH)

WARNING: This is for development only! Remove in production.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from datetime import datetime
import logging

from app.services.token_service import token_service
from app.database import get_users_collection
from app.models.user import User
from bson import ObjectId

logger = logging.getLogger(__name__)

router = APIRouter()


class DevLoginRequest(BaseModel):
    email: str
    role: str  # 'consumer', 'distributor', or 'owner'


@router.post("/dev-login")
async def dev_login(request: DevLoginRequest):
    """
    Development login endpoint - bypasses Google OAuth.
    
    WARNING: Only use for development/testing!
    """
    try:
        users_collection = get_users_collection()
        
        # Generate unique google_id for dev users
        dev_google_id = f"dev_{request.email.replace('@', '_at_').replace('.', '_')}"
        
        # Check if user exists by email
        user_data = await users_collection.find_one({"email": request.email})
        
        if not user_data:
            # Create new user
            user_data = {
                "google_id": dev_google_id,
                "email": request.email,
                "name": request.email.split('@')[0].title(),
                "role": request.role,
                "phone": None,
                "addresses": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            try:
                result = await users_collection.insert_one(user_data)
                user_data["_id"] = result.inserted_id
                logger.info(f"Created dev user: {request.email} with role: {request.role}")
            except Exception as insert_error:
                # If insert fails due to duplicate, try to find existing user
                logger.warning(f"Insert failed, trying to find existing user: {str(insert_error)}")
                user_data = await users_collection.find_one({"email": request.email})
                if not user_data:
                    # If still not found, try by google_id
                    user_data = await users_collection.find_one({"google_id": dev_google_id})
                if not user_data:
                    raise insert_error
        else:
            # Update role if different
            if user_data.get("role") != request.role:
                await users_collection.update_one(
                    {"email": request.email},
                    {"$set": {"role": request.role, "updated_at": datetime.utcnow()}}
                )
                user_data["role"] = request.role
            logger.info(f"Dev login for existing user: {request.email}")
        
        # Create user object
        user = User(**user_data)
        
        # Generate tokens
        token_data = token_service.create_token_pair(user)
        
        return {
            "access_token": token_data["access_token"],
            "refresh_token": token_data["refresh_token"],
            "token_type": "bearer",
            "expires_in": token_data["expires_in"],
            "user_id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role
        }
        
    except Exception as e:
        logger.error(f"Dev login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dev login failed: {str(e)}"
        )
