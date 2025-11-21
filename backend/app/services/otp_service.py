"""
OTP Service for Mobile Authentication
"""
import random
import string
from datetime import datetime, timedelta
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# In-memory OTP storage (for development)
# In production, use Redis or database
otp_storage = {}


class OTPService:
    """Service for OTP generation and verification"""
    
    OTP_LENGTH = 6
    OTP_VALIDITY_MINUTES = 10
    MAX_ATTEMPTS = 3
    
    @staticmethod
    def generate_otp() -> str:
        """Generate a 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=OTPService.OTP_LENGTH))
    
    @staticmethod
    async def send_otp(phone: str) -> dict:
        """
        Generate and send OTP to phone number
        
        Args:
            phone: 10-digit mobile number
            
        Returns:
            dict with success status and message
        """
        try:
            # Generate OTP
            otp = OTPService.generate_otp()
            
            # Store OTP with expiry
            otp_storage[phone] = {
                'otp': otp,
                'created_at': datetime.utcnow(),
                'attempts': 0,
                'verified': False
            }
            
            # TODO: Integrate with SMS service (Twilio, MSG91, etc.)
            # For now, just log it (REMOVE IN PRODUCTION!)
            logger.info(f"OTP for {phone}: {otp}")
            
            # In development, return OTP in response (REMOVE IN PRODUCTION!)
            return {
                'success': True,
                'message': 'OTP sent successfully',
                'otp': otp,  # REMOVE IN PRODUCTION!
                'expires_in': OTPService.OTP_VALIDITY_MINUTES
            }
            
        except Exception as e:
            logger.error(f"Error sending OTP: {str(e)}")
            return {
                'success': False,
                'message': 'Failed to send OTP'
            }
    
    @staticmethod
    async def verify_otp(phone: str, otp: str) -> dict:
        """
        Verify OTP for phone number
        
        Args:
            phone: 10-digit mobile number
            otp: OTP to verify
            
        Returns:
            dict with verification status
        """
        try:
            # Check if OTP exists
            if phone not in otp_storage:
                return {
                    'success': False,
                    'message': 'OTP not found. Please request a new OTP.'
                }
            
            stored_data = otp_storage[phone]
            
            # Check if already verified
            if stored_data['verified']:
                return {
                    'success': False,
                    'message': 'OTP already used. Please request a new OTP.'
                }
            
            # Check expiry
            created_at = stored_data['created_at']
            expiry_time = created_at + timedelta(minutes=OTPService.OTP_VALIDITY_MINUTES)
            
            if datetime.utcnow() > expiry_time:
                del otp_storage[phone]
                return {
                    'success': False,
                    'message': 'OTP expired. Please request a new OTP.'
                }
            
            # Check max attempts
            if stored_data['attempts'] >= OTPService.MAX_ATTEMPTS:
                del otp_storage[phone]
                return {
                    'success': False,
                    'message': 'Maximum attempts exceeded. Please request a new OTP.'
                }
            
            # Verify OTP
            if stored_data['otp'] == otp:
                stored_data['verified'] = True
                return {
                    'success': True,
                    'message': 'OTP verified successfully'
                }
            else:
                stored_data['attempts'] += 1
                remaining = OTPService.MAX_ATTEMPTS - stored_data['attempts']
                return {
                    'success': False,
                    'message': f'Invalid OTP. {remaining} attempts remaining.'
                }
                
        except Exception as e:
            logger.error(f"Error verifying OTP: {str(e)}")
            return {
                'success': False,
                'message': 'Failed to verify OTP'
            }
    
    @staticmethod
    async def clear_otp(phone: str):
        """Clear OTP for phone number"""
        if phone in otp_storage:
            del otp_storage[phone]


otp_service = OTPService()
