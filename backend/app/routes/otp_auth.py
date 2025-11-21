"""
OTP-based Authentication Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.services.otp_service import otp_service
from app.services.auth_service import auth_service
from app.services.token_service import token_service

router = APIRouter(prefix="/api/auth/otp", tags=["OTP Authentication"])


class SendOTPRequest(BaseModel):
    """Request to send OTP"""
    phone: str = Field(..., pattern=r"^\d{10}$", description="10-digit mobile number")


class VerifyOTPRequest(BaseModel):
    """Request to verify OTP and login/register"""
    phone: str = Field(..., pattern=r"^\d{10}$", description="10-digit mobile number")
    otp: str = Field(..., pattern=r"^\d{6}$", description="6-digit OTP")
    name: str = Field(None, min_length=2, max_length=100, description="User's full name (required for new users)")
    role: str = Field(default="consumer", pattern="^(consumer|distributor|owner)$")


class OTPResponse(BaseModel):
    """OTP send response"""
    success: bool
    message: str
    otp: str = None  # Only in development
    expires_in: int = None


class AuthResponse(BaseModel):
    """Authentication response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: str
    phone: str
    name: str
    role: str
    is_new_user: bool


@router.post("/send", response_model=OTPResponse)
async def send_otp(request: SendOTPRequest):
    """
    Send OTP to mobile number
    
    - Generates a 6-digit OTP
    - Sends via SMS (in development, returns OTP in response)
    - Valid for 10 minutes
    """
    result = await otp_service.send_otp(request.phone)
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['message'])
    
    return result


@router.post("/verify", response_model=AuthResponse)
async def verify_otp_and_login(
    request: VerifyOTPRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Verify OTP and login/register user
    
    - Verifies the OTP
    - If user exists, logs them in
    - If new user, registers them (name required)
    - Returns JWT tokens
    """
    # Verify OTP
    verification = await otp_service.verify_otp(request.phone, request.otp)
    
    if not verification['success']:
        raise HTTPException(status_code=400, detail=verification['message'])
    
    # Check if user exists
    users_collection = db.users
    user = await users_collection.find_one({"phone": request.phone})
    
    is_new_user = False
    
    if not user:
        # New user - name is required
        if not request.name:
            raise HTTPException(
                status_code=400,
                detail="Name is required for new users"
            )
        
        # Create new user
        user_data = {
            "phone": request.phone,
            "name": request.name,
            "email": f"{request.phone}@indostar.app",  # Placeholder email
            "role": request.role,
            "googleId": None,
            "addresses": [],
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = await users_collection.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        user = user_data
        is_new_user = True
    
    # Generate tokens
    access_token = token_service.create_access_token(
        data={"sub": str(user["_id"]), "role": user["role"]}
    )
    refresh_token = token_service.create_refresh_token(
        data={"sub": str(user["_id"])}
    )
    
    # Clear OTP
    await otp_service.clear_otp(request.phone)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": 1440,  # 24 hours in minutes
        "user_id": str(user["_id"]),
        "phone": user["phone"],
        "name": user["name"],
        "role": user["role"],
        "is_new_user": is_new_user
    }


@router.post("/resend")
async def resend_otp(request: SendOTPRequest):
    """Resend OTP to mobile number"""
    # Clear existing OTP
    await otp_service.clear_otp(request.phone)
    
    # Send new OTP
    result = await otp_service.send_otp(request.phone)
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['message'])
    
    return result


from datetime import datetime
