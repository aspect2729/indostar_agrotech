"""
Manual Integration Testing Script
Run this with both backend and frontend servers running to test all flows.
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000/api"

class IntegrationTester:
    def __init__(self):
        self.consumer_token = None
        self.distributor_token = None
        self.owner_token = None
        self.test_results = []
        
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test result"""
        status = "✓ PASS" if passed else "✗ FAIL"
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "details": details
        })
        print(f"{status}: {test_name}")
        if details:
            print(f"  Details: {details}")
    
    def test_health_check(self):
        """Test health endpoint"""
        try:
            response = requests.get(f"{BASE_URL}/health")
            passed = response.status_code == 200
            self.log_test("Health Check", passed, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Health Check", False, str(e))
            return False
    
    def test_consumer_auth(self):
        """Test consumer authentication"""
        try:
            response = requests.post(
                f"{BASE_URL}/auth/dev-login",
                json={
                    "email": "test_consumer@example.com",
                    "role": "consumer"
                }
            )
            passed = response.status_code == 200
            if passed:
                data = response.json()
                self.consumer_token = data.get("access_token")
                self.log_test("Consumer Authentication", True, f"Token received")
            else:
                self.log_test("Consumer Authentication", False, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Consumer Authentication", False, str(e))
            return False
    
    def test_distributor_auth(self):
        """Test distributor authentication"""
        try:
            response = requests.post(
                f"{BASE_URL}/auth/dev-login",
                json={
                    "email": "test_distributor@example.com",
                    "role": "distributor"
                }
            )
            passed = response.status_code == 200
            if passed:
                data = response.json()
                self.distributor_token = data.get("access_token")
                self.log_test("Distributor Authentication", True, "Token received")
            else:
                self.log_test("Distributor Authentication", False, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Distributor Authentication", False, str(e))
            return False
    
    def test_owner_auth(self):
        """Test owner authentication"""
        try:
            response = requests.post(
                f"{BASE_URL}/auth/dev-login",
                json={
                    "email": "test_owner@example.com",
                    "role": "owner"
                }
            )
            passed = response.status_code == 200
            if passed:
                data = response.json()
                self.owner_token = data.get("access_token")
                self.log_test("Owner Authentication", True, "Token received")
            else:
                self.log_test("Owner Authentication", False, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Owner Authentication", False, str(e))
            return False
    
    def test_consumer_browse_products(self):
        """Test consumer can browse products"""
        if not self.consumer_token:
            self.log_test("Consumer Browse Products", False, "No consumer token")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.consumer_token}"}
            response = requests.get(f"{BASE_URL}/products", headers=headers)
            passed = response.status_code == 200
            if passed:
                products = response.json()
                self.log_test("Consumer Browse Products", True, f"Found {len(products)} products")
            else:
                self.log_test("Consumer Browse Products", False, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Consumer Browse Products", False, str(e))
            return False
    
    def test_distributor_view_products(self):
        """Test distributor can view products with wholesale pricing"""
        if not self.distributor_token:
            self.log_test("Distributor View Products", False, "No distributor token")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.distributor_token}"}
            response = requests.get(f"{BASE_URL}/products", headers=headers)
            passed = response.status_code == 200
            if passed:
                products = response.json()
                has_distributor_price = all("distributor" in p.get("price", {}) for p in products)
                self.log_test("Distributor View Products", has_distributor_price, 
                            f"Found {len(products)} products with distributor pricing")
            else:
                self.log_test("Distributor View Products", False, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Distributor View Products", False, str(e))
            return False
    
    def test_owner_view_inventory(self):
        """Test owner can view inventory"""
        if not self.owner_token:
            self.log_test("Owner View Inventory", False, "No owner token")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.owner_token}"}
            response = requests.get(f"{BASE_URL}/inventory", headers=headers)
            passed = response.status_code == 200
            if passed:
                inventory = response.json()
                self.log_test("Owner View Inventory", True, f"Found {len(inventory)} inventory items")
            else:
                self.log_test("Owner View Inventory", False, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Owner View Inventory", False, str(e))
            return False
    
    def test_role_based_access_control(self):
        """Test that consumers cannot access owner endpoints"""
        if not self.consumer_token:
            self.log_test("RBAC - Consumer Access Control", False, "No consumer token")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.consumer_token}"}
            response = requests.get(f"{BASE_URL}/inventory", headers=headers)
            # Consumer should NOT be able to access inventory
            passed = response.status_code == 403
            self.log_test("RBAC - Consumer Access Control", passed, 
                        f"Consumer correctly denied access (Status: {response.status_code})")
            return passed
        except Exception as e:
            self.log_test("RBAC - Consumer Access Control", False, str(e))
            return False
    
    def test_unauthenticated_access(self):
        """Test that unauthenticated users cannot access protected endpoints"""
        try:
            response = requests.get(f"{BASE_URL}/products")
            # Should require authentication
            passed = response.status_code == 401
            self.log_test("Unauthenticated Access Control", passed, 
                        f"Correctly denied access (Status: {response.status_code})")
            return passed
        except Exception as e:
            self.log_test("Unauthenticated Access Control", False, str(e))
            return False
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("INTEGRATION TEST SUMMARY")
        print("="*60)
        
        total = len(self.test_results)
        passed = sum(1 for r in self.test_results if r["passed"])
        failed = total - passed
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/total*100):.1f}%")
        
        if failed > 0:
            print("\nFailed Tests:")
            for result in self.test_results:
                if not result["passed"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        print("="*60)
        return failed == 0
    
    def run_all_tests(self):
        """Run all integration tests"""
        print("Starting Integration Tests...")
        print("="*60)
        
        # Test health check
        if not self.test_health_check():
            print("\n⚠️  Backend server may not be running!")
            return False
        
        # Test authentication for all roles
        print("\n--- Testing Authentication ---")
        self.test_consumer_auth()
        self.test_distributor_auth()
        self.test_owner_auth()
        
        # Test user flows
        print("\n--- Testing User Flows ---")
        self.test_consumer_browse_products()
        self.test_distributor_view_products()
        self.test_owner_view_inventory()
        
        # Test security
        print("\n--- Testing Security ---")
        self.test_role_based_access_control()
        self.test_unauthenticated_access()
        
        # Print summary
        return self.print_summary()


if __name__ == "__main__":
    print("\n🚀 Indostar E-commerce Integration Test Suite\n")
    print("Prerequisites:")
    print("  1. Backend server running on http://localhost:8000")
    print("  2. MongoDB running and seeded with data")
    print("  3. Frontend server running on http://localhost:3000 (optional)\n")
    
    input("Press Enter to start tests...")
    
    tester = IntegrationTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ All integration tests passed!")
    else:
        print("\n❌ Some integration tests failed. Check the details above.")
    
    exit(0 if success else 1)
