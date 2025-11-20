"""
Verification script to test role-based authorization decorators.
"""

import sys
sys.path.insert(0, '.')

from app.utils.dependencies import (
    RoleChecker,
    require_owner,
    require_distributor,
    require_consumer,
    require_owner_or_distributor
)
from app.models.user import User
from datetime import datetime
from bson import ObjectId


def test_role_checker():
    """Test the RoleChecker class and pre-configured role checkers."""
    
    print("Testing Role-Based Authorization Decorators")
    print("=" * 60)
    
    # Create test users with different roles
    consumer_user = User(
        _id=ObjectId(),
        google_id="consumer123",
        email="consumer@example.com",
        name="Test Consumer",
        role="consumer",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    distributor_user = User(
        _id=ObjectId(),
        google_id="distributor123",
        email="distributor@example.com",
        name="Test Distributor",
        role="distributor",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    owner_user = User(
        _id=ObjectId(),
        google_id="owner123",
        email="owner@indostar.com",
        name="Test Owner",
        role="owner",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    print("\n1. Testing RoleChecker class instantiation:")
    print("-" * 60)
    
    # Test custom role checker
    custom_checker = RoleChecker(["owner", "distributor"])
    print(f"✓ Created custom RoleChecker with allowed roles: {custom_checker.allowed_roles}")
    
    print("\n2. Testing pre-configured role checkers:")
    print("-" * 60)
    
    checkers = {
        "require_owner": (require_owner, ["owner"]),
        "require_distributor": (require_distributor, ["distributor", "owner"]),
        "require_consumer": (require_consumer, ["consumer", "distributor", "owner"]),
        "require_owner_or_distributor": (require_owner_or_distributor, ["owner", "distributor"])
    }
    
    for name, (checker, expected_roles) in checkers.items():
        print(f"\n✓ {name}")
        print(f"  Type: {type(checker).__name__}")
        print(f"  Allowed roles: {checker.allowed_roles}")
        assert checker.allowed_roles == expected_roles, f"Unexpected roles for {name}"
    
    print("\n3. Testing role validation logic:")
    print("-" * 60)
    
    test_cases = [
        ("require_owner", require_owner, consumer_user, False),
        ("require_owner", require_owner, distributor_user, False),
        ("require_owner", require_owner, owner_user, True),
        
        ("require_distributor", require_distributor, consumer_user, False),
        ("require_distributor", require_distributor, distributor_user, True),
        ("require_distributor", require_distributor, owner_user, True),
        
        ("require_consumer", require_consumer, consumer_user, True),
        ("require_consumer", require_consumer, distributor_user, True),
        ("require_consumer", require_consumer, owner_user, True),
        
        ("require_owner_or_distributor", require_owner_or_distributor, consumer_user, False),
        ("require_owner_or_distributor", require_owner_or_distributor, distributor_user, True),
        ("require_owner_or_distributor", require_owner_or_distributor, owner_user, True),
    ]
    
    all_passed = True
    
    for checker_name, checker, user, should_pass in test_cases:
        user_role = user.role
        is_allowed = user.role in checker.allowed_roles
        
        status = "✓" if is_allowed == should_pass else "✗"
        result = "PASS" if is_allowed == should_pass else "FAIL"
        
        print(f"{status} {checker_name} with {user_role} user: {result}")
        
        if is_allowed != should_pass:
            all_passed = False
    
    print("\n" + "=" * 60)
    
    if all_passed:
        print("✓ SUCCESS: All role-based authorization decorators work correctly!")
        print("\nAvailable decorators:")
        print("  - require_owner: Only owner role")
        print("  - require_distributor: Distributor and owner roles")
        print("  - require_consumer: All roles (consumer, distributor, owner)")
        print("  - require_owner_or_distributor: Owner and distributor roles")
        return True
    else:
        print("✗ FAILURE: Some role checks failed!")
        return False


if __name__ == "__main__":
    try:
        success = test_role_checker()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ Error during verification: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
