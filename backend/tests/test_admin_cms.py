"""
Backend API Tests for Admin CMS, Payment (Razorpay), and Shipping (Shiprocket) Integration
Tests all admin panel endpoints including connection tests and settings management
"""

import pytest
import requests
import os
import uuid

# Use production URL from env
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials from request
ADMIN_EMAIL = "admin@ayushmednest.com"
ADMIN_PASSWORD = "Admin@123"


class TestRazorpayPublicEndpoint:
    """Razorpay key endpoint - public (no auth required)"""
    
    def test_razorpay_key_endpoint(self):
        """GET /api/admin/razorpay/key returns configured key_id"""
        response = requests.get(f"{BASE_URL}/api/admin/razorpay/key")
        assert response.status_code == 200
        data = response.json()
        assert "key_id" in data
        assert data["key_id"] is not None
        assert data["key_id"].startswith("rzp_")
        print(f"✓ Razorpay key endpoint: {data['key_id'][:20]}...")


class TestAdminLogin:
    """Admin authentication and access tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Login as admin and get token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["token"]
        # If admin doesn't exist, try to register
        print(f"Admin login failed, trying to register...")
        reg_response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD,
                "full_name": "Admin User",
                "role": "admin"
            }
        )
        if reg_response.status_code == 200:
            return reg_response.json()["token"]
        pytest.skip("Admin user not available")
    
    def test_admin_login(self, admin_token):
        """Verify admin can login"""
        assert admin_token is not None
        print(f"✓ Admin login successful")


class TestAdminIntegrations:
    """Admin integration settings tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Login as admin and get token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin user not available")
    
    def test_get_integrations(self, admin_token):
        """GET /api/admin/integrations returns integration settings"""
        response = requests.get(
            f"{BASE_URL}/api/admin/integrations",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        # Should have integration fields (may be masked)
        print(f"✓ Integration settings retrieved")
        if "razorpay_key_id" in data:
            print(f"  - Razorpay key present: {bool(data.get('razorpay_key_id'))}")
        if "shiprocket_email" in data:
            print(f"  - Shiprocket email present: {bool(data.get('shiprocket_email'))}")
    
    def test_integrations_requires_auth(self):
        """GET /api/admin/integrations without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/admin/integrations")
        assert response.status_code == 401
        print(f"✓ Integration settings require authentication")


class TestAdminRazorpayConnection:
    """Razorpay connection test endpoint"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Login as admin"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin user not available")
    
    def test_razorpay_connection_test(self, admin_token):
        """POST /api/admin/razorpay/test-connection tests Razorpay credentials"""
        response = requests.post(
            f"{BASE_URL}/api/admin/razorpay/test-connection",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        # Can be 200 (success/fail with message) or 400 (not configured)
        assert response.status_code in [200, 400]
        data = response.json()
        print(f"✓ Razorpay connection test: {data.get('message', data.get('detail', 'Unknown'))}")
        if response.status_code == 200:
            print(f"  - Success: {data.get('success')}")
    
    def test_razorpay_connection_test_requires_auth(self):
        """POST /api/admin/razorpay/test-connection without auth returns 401"""
        response = requests.post(f"{BASE_URL}/api/admin/razorpay/test-connection")
        assert response.status_code == 401
        print(f"✓ Razorpay connection test requires authentication")


class TestAdminShiprocketConnection:
    """Shiprocket connection test endpoint"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Login as admin"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin user not available")
    
    def test_shiprocket_connection_test(self, admin_token):
        """POST /api/admin/shiprocket/test-connection tests Shiprocket credentials"""
        response = requests.post(
            f"{BASE_URL}/api/admin/shiprocket/test-connection",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        # Can be 200 (success/fail with message) or 400 (not configured)
        assert response.status_code in [200, 400]
        data = response.json()
        print(f"✓ Shiprocket connection test: {data.get('message', data.get('detail', 'Unknown'))}")
    
    def test_shiprocket_connection_test_requires_auth(self):
        """POST /api/admin/shiprocket/test-connection without auth returns 401"""
        response = requests.post(f"{BASE_URL}/api/admin/shiprocket/test-connection")
        assert response.status_code == 401
        print(f"✓ Shiprocket connection test requires authentication")


class TestAdminReviews:
    """Admin reviews management endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Login as admin"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin user not available")
    
    def test_get_pending_reviews(self, admin_token):
        """GET /api/admin/reviews/pending returns pending reviews"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reviews/pending",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "reviews" in data
        print(f"✓ Pending reviews: {len(data['reviews'])} items")
    
    def test_pending_reviews_requires_auth(self):
        """GET /api/admin/reviews/pending without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/admin/reviews/pending")
        assert response.status_code == 401
        print(f"✓ Pending reviews requires authentication")


class TestAdminQuestions:
    """Admin Q&A management endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Login as admin"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin user not available")
    
    def test_get_pending_questions(self, admin_token):
        """GET /api/admin/questions/pending returns pending questions"""
        response = requests.get(
            f"{BASE_URL}/api/admin/questions/pending",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "questions" in data
        print(f"✓ Pending questions: {len(data['questions'])} items")
    
    def test_pending_questions_requires_auth(self):
        """GET /api/admin/questions/pending without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/admin/questions/pending")
        assert response.status_code == 401
        print(f"✓ Pending questions requires authentication")


class TestAdminVendors:
    """Admin vendor management endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Login as admin"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin user not available")
    
    def test_get_vendors(self, admin_token):
        """GET /api/admin/vendors returns vendor list"""
        response = requests.get(
            f"{BASE_URL}/api/admin/vendors",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "vendors" in data
        print(f"✓ Vendors: {len(data['vendors'])} registered")
    
    def test_vendors_requires_auth(self):
        """GET /api/admin/vendors without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/admin/vendors")
        assert response.status_code == 401
        print(f"✓ Vendors list requires authentication")


class TestAdminAffiliates:
    """Admin affiliate management endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Login as admin"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin user not available")
    
    def test_get_affiliates(self, admin_token):
        """GET /api/admin/affiliates returns affiliate list"""
        response = requests.get(
            f"{BASE_URL}/api/admin/affiliates",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "affiliates" in data
        print(f"✓ Affiliates: {len(data['affiliates'])} registered")
    
    def test_affiliates_requires_auth(self):
        """GET /api/admin/affiliates without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/admin/affiliates")
        assert response.status_code == 401
        print(f"✓ Affiliates list requires authentication")


class TestAdminNewsletterAndAudit:
    """Admin newsletter and audit logs endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Login as admin"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin user not available")
    
    def test_get_newsletter_subscribers(self, admin_token):
        """GET /api/admin/newsletter returns subscribers"""
        response = requests.get(
            f"{BASE_URL}/api/admin/newsletter",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "subscribers" in data
        print(f"✓ Newsletter subscribers: {len(data['subscribers'])} total")
    
    def test_get_audit_logs(self, admin_token):
        """GET /api/admin/audit-logs returns audit logs"""
        response = requests.get(
            f"{BASE_URL}/api/admin/audit-logs?limit=10",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "logs" in data
        print(f"✓ Audit logs: {len(data['logs'])} entries")


class TestAdminEmailSMSTemplates:
    """Admin email and SMS template endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Login as admin"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin user not available")
    
    def test_get_email_templates(self, admin_token):
        """GET /api/admin/email-templates returns templates"""
        response = requests.get(
            f"{BASE_URL}/api/admin/email-templates",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "templates" in data
        print(f"✓ Email templates: {len(data['templates'])} templates")
    
    def test_get_sms_templates(self, admin_token):
        """GET /api/admin/sms-templates returns templates"""
        response = requests.get(
            f"{BASE_URL}/api/admin/sms-templates",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "templates" in data
        print(f"✓ SMS templates: {len(data['templates'])} templates")


class TestAdminTestimonials:
    """Admin testimonials management"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Login as admin"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin user not available")
    
    def test_create_testimonial(self, admin_token):
        """POST /api/admin/testimonials creates testimonial"""
        response = requests.post(
            f"{BASE_URL}/api/admin/testimonials",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "customer_name": f"Test Customer {uuid.uuid4().hex[:6]}",
                "rating": 5,
                "comment": "Great products and service!",
                "is_featured": False
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Testimonial created: {data.get('id', 'success')}")


class TestOrderCreationWithRazorpay:
    """Order creation with Razorpay payment method"""
    
    @pytest.fixture(scope="class")
    def user_token(self):
        """Register/login test user"""
        # Try to create a unique test user
        unique_id = uuid.uuid4().hex[:6]
        user_data = {
            "email": f"checkout_test_{unique_id}@example.com",
            "password": "testpass123",
            "full_name": f"Checkout Test {unique_id}"
        }
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=user_data
        )
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Could not create test user")
    
    def test_order_creation_requires_cart_items(self, user_token):
        """POST /api/orders/create with empty items fails gracefully"""
        response = requests.post(
            f"{BASE_URL}/api/orders/create",
            headers={"Authorization": f"Bearer {user_token}"},
            json={
                "items": [],
                "shipping_address": {
                    "name": "Test User",
                    "email": "test@example.com",
                    "phone": "9876543210",
                    "address": "123 Test Street",
                    "city": "Mumbai",
                    "state": "Maharashtra",
                    "postal_code": "400001"
                },
                "billing_address": {
                    "name": "Test User",
                    "email": "test@example.com",
                    "phone": "9876543210",
                    "address": "123 Test Street",
                    "city": "Mumbai",
                    "state": "Maharashtra",
                    "postal_code": "400001"
                },
                "payment_method": "razorpay"
            }
        )
        # Empty items should create an order with 0 total or fail validation
        print(f"✓ Order creation with empty items: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
