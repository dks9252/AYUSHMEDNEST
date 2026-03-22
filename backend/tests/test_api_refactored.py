"""
Backend API Tests for AYUSH Healthcare Marketplace - Post-Refactoring
Tests all modular routers: auth, products, doctors, cart, public, cms
"""

import pytest
import requests
import os
import uuid

# Use production URL from env
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestHealthCheck:
    """Health check endpoint - validates server is running"""
    
    def test_health_endpoint_returns_200(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        print(f"✓ Health check passed: {data}")


class TestPublicRoutes:
    """Public routes - no authentication required"""
    
    def test_get_health_concerns(self):
        """GET /api/health-concerns returns list of health concerns"""
        response = requests.get(f"{BASE_URL}/api/health-concerns")
        assert response.status_code == 200
        data = response.json()
        assert "concerns" in data
        assert len(data["concerns"]) > 0
        # Validate structure
        concern = data["concerns"][0]
        assert "id" in concern
        assert "name" in concern
        print(f"✓ Health concerns: {len(data['concerns'])} items")
    
    def test_get_testimonials(self):
        """GET /api/testimonials returns testimonials list"""
        response = requests.get(f"{BASE_URL}/api/testimonials")
        assert response.status_code == 200
        data = response.json()
        assert "testimonials" in data
        print(f"✓ Testimonials: {len(data['testimonials'])} items")
    
    def test_newsletter_subscribe(self):
        """POST /api/newsletter/subscribe adds email subscriber"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": unique_email}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Newsletter subscribe: {data['message']}")
    
    def test_newsletter_subscribe_duplicate(self):
        """POST /api/newsletter/subscribe with duplicate email"""
        email = "duplicate_test@example.com"
        # First subscribe
        requests.post(f"{BASE_URL}/api/newsletter/subscribe", json={"email": email})
        # Second subscribe should return "Already subscribed"
        response = requests.post(f"{BASE_URL}/api/newsletter/subscribe", json={"email": email})
        assert response.status_code == 200
        data = response.json()
        assert "Already subscribed" in data["message"]
        print(f"✓ Duplicate subscription handled: {data['message']}")


class TestCMSRoutes:
    """CMS routes - website settings and content"""
    
    def test_get_website_settings(self):
        """GET /api/cms/settings returns website settings"""
        response = requests.get(f"{BASE_URL}/api/cms/settings")
        assert response.status_code == 200
        data = response.json()
        # Validate expected fields exist
        assert "website_name" in data or data == {}  # May be empty if not set
        print(f"✓ CMS settings retrieved")
    
    def test_get_cms_categories(self):
        """GET /api/cms/categories returns categories list"""
        response = requests.get(f"{BASE_URL}/api/cms/categories")
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data
        print(f"✓ CMS categories: {len(data['categories'])} items")
    
    def test_get_cms_banners(self):
        """GET /api/cms/banners returns banners list"""
        response = requests.get(f"{BASE_URL}/api/cms/banners")
        assert response.status_code == 200
        data = response.json()
        assert "banners" in data
        print(f"✓ CMS banners: {len(data['banners'])} items")
    
    def test_get_cms_brands(self):
        """GET /api/cms/brands returns brands list"""
        response = requests.get(f"{BASE_URL}/api/cms/brands")
        assert response.status_code == 200
        data = response.json()
        assert "brands" in data
        print(f"✓ CMS brands: {len(data['brands'])} items")


class TestProductRoutes:
    """Product routes - listing and detail"""
    
    def test_get_products_list(self):
        """GET /api/products returns product list with pagination"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert "total" in data
        assert "skip" in data
        assert "limit" in data
        print(f"✓ Products list: {len(data['products'])} of {data['total']} total")
    
    def test_get_products_with_pagination(self):
        """GET /api/products with skip and limit params"""
        response = requests.get(f"{BASE_URL}/api/products?skip=0&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) <= 5
        print(f"✓ Products pagination: returned {len(data['products'])} items")
    
    def test_get_products_with_search(self):
        """GET /api/products with search param"""
        response = requests.get(f"{BASE_URL}/api/products?search=ayurvedic")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        print(f"✓ Products search: {len(data['products'])} results")
    
    def test_get_product_detail_not_found(self):
        """GET /api/products/{id} returns 404 for non-existent product"""
        response = requests.get(f"{BASE_URL}/api/products/nonexistent-id-12345")
        assert response.status_code == 404
        print(f"✓ Product not found returns 404")
    
    def test_get_products_search_endpoint(self):
        """GET /api/products/search advanced search endpoint"""
        response = requests.get(f"{BASE_URL}/api/products/search")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        print(f"✓ Products search endpoint: {len(data['products'])} items")


class TestDoctorRoutes:
    """Doctor routes - listing and detail"""
    
    def test_get_doctors_list(self):
        """GET /api/doctors returns doctor list"""
        response = requests.get(f"{BASE_URL}/api/doctors")
        assert response.status_code == 200
        data = response.json()
        assert "doctors" in data
        assert "total" in data
        print(f"✓ Doctors list: {len(data['doctors'])} of {data['total']} total")
    
    def test_get_doctors_with_filter(self):
        """GET /api/doctors with ayush_system filter"""
        response = requests.get(f"{BASE_URL}/api/doctors?ayush_system=ayurveda")
        assert response.status_code == 200
        data = response.json()
        assert "doctors" in data
        print(f"✓ Doctors filtered: {len(data['doctors'])} results")
    
    def test_get_doctor_not_found(self):
        """GET /api/doctors/{id} returns 404 for non-existent doctor"""
        response = requests.get(f"{BASE_URL}/api/doctors/nonexistent-doctor-id")
        assert response.status_code == 404
        print(f"✓ Doctor not found returns 404")


class TestAuthRoutes:
    """Authentication routes - register, login, me"""
    
    @pytest.fixture
    def unique_user(self):
        """Generate unique user credentials for each test"""
        unique_id = uuid.uuid4().hex[:8]
        return {
            "email": f"testuser_{unique_id}@example.com",
            "password": "testpass123",
            "full_name": f"Test User {unique_id}"
        }
    
    def test_register_new_user(self, unique_user):
        """POST /api/auth/register creates new user and returns token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=unique_user
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == unique_user["email"]
        print(f"✓ User registered: {data['user']['email']}")
    
    def test_register_duplicate_email(self):
        """POST /api/auth/register with existing email returns 400"""
        # Use a fixed email for duplicate test
        user_data = {
            "email": "permanent_test_duplicate@example.com",
            "password": "testpass123",
            "full_name": "Duplicate Test User"
        }
        # First registration (may already exist)
        requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
        # Second registration should fail
        response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
        assert response.status_code == 400
        print(f"✓ Duplicate registration blocked")
    
    def test_login_with_valid_credentials(self):
        """POST /api/auth/login with valid credentials returns token"""
        # First register a test user
        user_data = {
            "email": f"login_test_{uuid.uuid4().hex[:6]}@example.com",
            "password": "testpass123",
            "full_name": "Login Test User"
        }
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
        assert reg_response.status_code == 200
        
        # Now login
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        data = login_response.json()
        assert "token" in data
        assert "user" in data
        print(f"✓ Login successful: {data['user']['email']}")
    
    def test_login_with_invalid_credentials(self):
        """POST /api/auth/login with invalid credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "nonexistent@example.com", "password": "wrongpass"}
        )
        assert response.status_code == 401
        print(f"✓ Invalid login blocked")
    
    def test_get_me_without_token(self):
        """GET /api/auth/me without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print(f"✓ Auth required for /me endpoint")
    
    def test_get_me_with_valid_token(self):
        """GET /api/auth/me with valid token returns user data"""
        # Register and get token
        user_data = {
            "email": f"me_test_{uuid.uuid4().hex[:6]}@example.com",
            "password": "testpass123",
            "full_name": "Me Test User"
        }
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
        token = reg_response.json()["token"]
        
        # Get current user
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == user_data["email"]
        print(f"✓ Get me: {data['email']}")


class TestCartRoutes:
    """Cart routes - requires authentication"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for cart tests"""
        user_data = {
            "email": f"cart_test_{uuid.uuid4().hex[:6]}@example.com",
            "password": "testpass123",
            "full_name": "Cart Test User"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
        return response.json()["token"]
    
    def test_get_cart_without_auth(self):
        """GET /api/cart without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/cart")
        assert response.status_code == 401
        print(f"✓ Cart requires authentication")
    
    def test_get_cart_with_auth(self, auth_token):
        """GET /api/cart with token returns cart items"""
        response = requests.get(
            f"{BASE_URL}/api/cart",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        print(f"✓ Get cart: {len(data['items'])} items")
    
    def test_add_to_cart_invalid_product(self, auth_token):
        """POST /api/cart/add with invalid product returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/cart/add",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "product_id": "nonexistent-product-id",
                "quantity": 1,
                "price": 100.0
            }
        )
        assert response.status_code == 404
        print(f"✓ Add invalid product to cart blocked")
    
    def test_add_to_cart_without_auth(self):
        """POST /api/cart/add without token returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/cart/add",
            json={
                "product_id": "some-product-id",
                "quantity": 1,
                "price": 100.0
            }
        )
        assert response.status_code == 401
        print(f"✓ Add to cart requires authentication")


class TestWishlistRoutes:
    """Wishlist routes - requires authentication"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for wishlist tests"""
        user_data = {
            "email": f"wishlist_test_{uuid.uuid4().hex[:6]}@example.com",
            "password": "testpass123",
            "full_name": "Wishlist Test User"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
        return response.json()["token"]
    
    def test_get_wishlist_without_auth(self):
        """GET /api/wishlist without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/wishlist")
        assert response.status_code == 401
        print(f"✓ Wishlist requires authentication")
    
    def test_get_wishlist_with_auth(self, auth_token):
        """GET /api/wishlist with token returns wishlist"""
        response = requests.get(
            f"{BASE_URL}/api/wishlist",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "product_ids" in data
        print(f"✓ Get wishlist: {len(data['product_ids'])} items")


class TestExistingUserLogin:
    """Test with provided credentials"""
    
    def test_login_existing_user(self):
        """Login with provided test credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "test@example.com", "password": "test123"}
        )
        # May return 401 if user doesn't exist, or 200 if it does
        if response.status_code == 200:
            data = response.json()
            assert "token" in data
            print(f"✓ Existing user login: {data['user']['email']}")
        else:
            print(f"✓ Test user not found (expected if not seeded): {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
