"""
User profile API endpoints.

This module provides REST API endpoints for user profile management,
including retrieving and updating user profile information.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
import logging

from app.models.user import User
from app.schemas.user import UserProfileResponse, UserProfileUpdateRequest, AddressResponse
from app.services.user_service import user_service
from app.utils.dependencies import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/profile",
    response_model=UserProfileResponse,
    summary="Get user profile",
    description="Retrieve the current authenticated user's profile information"
)
async def get_user_profile(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get current user's profile.
    
    Returns complete user profile including personal information,
    addresses, and account details.
    
    Args:
        current_user: Current authenticated user from JWT token
        
    Returns:
        UserProfileResponse: User profile data
        
    Raises:
        HTTPException: If user profile cannot be retrieved
    """
    try:
        # Fetch fresh user data from database
        user = await user_service.get_user_profile(str(current_user.id))
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Convert to response format
        response_data = {
            "_id": str(user.id),
            "google_id": user.google_id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "phone": user.phone,
            "addresses": [
                AddressResponse(
                    type=addr.type,
                    street=addr.street,
                    city=addr.city,
                    state=addr.state,
                    pincode=addr.pincode,
                    is_default=addr.is_default
                )
                for addr in user.addresses
            ],
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user profile: {str(e)}"
        )


@router.put(
    "/profile",
    response_model=UserProfileResponse,
    summary="Update user profile",
    description="Update the current authenticated user's profile information including name, phone, and addresses"
)
async def update_user_profile(
    update_data: UserProfileUpdateRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Update current user's profile.
    
    Allows updating name, phone number, and addresses. Only provided
    fields will be updated. Validates address constraints (e.g., only
    one default address per type).
    
    Args:
        update_data: Profile update request with optional fields
        current_user: Current authenticated user from JWT token
        
    Returns:
        UserProfileResponse: Updated user profile data
        
    Raises:
        HTTPException: If update fails or validation errors occur
    """
    try:
        # Update user profile
        updated_user = await user_service.update_user_profile(
            str(current_user.id),
            update_data
        )
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Convert to response format
        response_data = {
            "_id": str(updated_user.id),
            "google_id": updated_user.google_id,
            "email": updated_user.email,
            "name": updated_user.name,
            "role": updated_user.role,
            "phone": updated_user.phone,
            "addresses": [
                AddressResponse(
                    type=addr.type,
                    street=addr.street,
                    city=addr.city,
                    state=addr.state,
                    pincode=addr.pincode,
                    is_default=addr.is_default
                )
                for addr in updated_user.addresses
            ],
            "created_at": updated_user.created_at,
            "updated_at": updated_user.updated_at
        }
        
        logger.info(f"User profile updated successfully: {current_user.email}")
        return response_data
        
    except ValueError as e:
        logger.warning(f"Validation error updating profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user profile: {str(e)}"
        )
