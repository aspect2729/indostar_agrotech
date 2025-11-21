"""Test if password hashing works locally."""

try:
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    # Test hashing
    password = "TestPass123!"
    hashed = pwd_context.hash(password)
    print(f"✅ Password hashing works!")
    print(f"   Original: {password}")
    print(f"   Hashed: {hashed[:50]}...")
    
    # Test verification
    is_valid = pwd_context.verify(password, hashed)
    print(f"✅ Password verification works: {is_valid}")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("   passlib is not installed")
except Exception as e:
    print(f"❌ Error: {e}")
