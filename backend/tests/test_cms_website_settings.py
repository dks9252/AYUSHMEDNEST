"""
Tests for CMS Website Settings, Menus, Vendor Dashboard, and Affiliate Dashboard APIs
Testing new features: Website Settings CMS, Theme Colors, Analytics, Announcement Bar, Navigation Menu
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@ayushmednest.com"
ADMIN_PASSWORD = "Admin@123"


class TestAdminAuth:
    """Admin authentication"""
    
    def test_admin_login(self):
        """Test admin can login and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token returned"
        print(f"PASS: Admin login successful")
        return data["token"]


class TestCMSSettings:
    """CMS Website Settings endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_cms_settings_public(self):
        """Test GET /api/cms/settings returns default settings (public endpoint)"""
        response = requests.get(f"{BASE_URL}/api/cms/settings")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify default fields exist
        assert "website_name" in data, "website_name missing"
        assert "contact_email" in data, "contact_email missing"
        assert "theme_primary_color" in data, "theme_primary_color missing"
        print(f"PASS: GET /api/cms/settings returns default settings")
        print(f"Current settings: website_name={data.get('website_name')}")
    
    def test_put_cms_settings_requires_auth(self):
        """Test PUT /api/cms/settings requires authentication"""
        response = requests.put(f"{BASE_URL}/api/cms/settings", json={
            "website_name": "Test"
        })
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"
        print(f"PASS: PUT /api/cms/settings requires authentication")
    
    def test_put_cms_settings_admin_only(self):
        """Test PUT /api/cms/settings - Admin can save website settings"""
        test_settings = {
            "website_name": "TEST_AYUSHMEDNEST",
            "contact_email": "test@ayushmednest.com",
            "contact_phone": "+91 9876543210",
            "logo_url": "https://example.com/test-logo.png",
            "favicon_url": "https://example.com/test-favicon.ico",
            "meta_title": "Test Title",
            "meta_description": "Test Description",
            "facebook_url": "https://facebook.com/test",
            "twitter_url": "https://twitter.com/test",
            "instagram_url": "https://instagram.com/test",
            "theme_primary_color": "#FF5733",
            "google_analytics_id": "G-TEST12345",
            "facebook_pixel_id": "TEST123456789",
            "google_tag_manager_id": "GTM-TEST123"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/cms/settings", 
            json=test_settings,
            headers=self.headers
        )
        assert response.status_code == 200, f"Failed to save settings: {response.text}"
        data = response.json()
        assert "message" in data, "No success message"
        print(f"PASS: Admin can save website settings")
        
        # Verify settings were saved by reading them back
        get_response = requests.get(f"{BASE_URL}/api/cms/settings")
        assert get_response.status_code == 200
        saved_data = get_response.json()
        assert saved_data.get("website_name") == "TEST_AYUSHMEDNEST", "website_name not saved correctly"
        assert saved_data.get("contact_email") == "test@ayushmednest.com", "contact_email not saved correctly"
        print(f"PASS: Settings were persisted correctly")
    
    def test_put_cms_settings_with_analytics(self):
        """Test saving analytics IDs (GA, GTM, Facebook Pixel)"""
        analytics_settings = {
            "website_name": "AYUSHMEDNEST",
            "google_analytics_id": "G-ANALYTICS123",
            "google_tag_manager_id": "GTM-TAGMGR123",
            "facebook_pixel_id": "FBPIXEL987654"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/cms/settings",
            json=analytics_settings,
            headers=self.headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        
        # Verify
        get_response = requests.get(f"{BASE_URL}/api/cms/settings")
        data = get_response.json()
        assert data.get("google_analytics_id") == "G-ANALYTICS123", "GA ID not saved"
        assert data.get("google_tag_manager_id") == "GTM-TAGMGR123", "GTM ID not saved"
        assert data.get("facebook_pixel_id") == "FBPIXEL987654", "FB Pixel not saved"
        print(f"PASS: Analytics IDs saved correctly")
    
    def test_reset_cms_settings_to_default(self):
        """Reset settings to default values after tests"""
        default_settings = {
            "website_name": "AYUSHMEDNEST",
            "contact_email": "support@ayushmednest.com",
            "contact_phone": "+91 1800-XXX-XXXX",
            "meta_title": "India's Most Trusted AYUSH Marketplace",
            "meta_description": "Buy authentic Ayurvedic medicines online",
            "theme_primary_color": "#2F5C3E"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/cms/settings",
            json=default_settings,
            headers=self.headers
        )
        assert response.status_code == 200, f"Failed to reset: {response.text}"
        print(f"PASS: Settings reset to defaults")


class TestCMSMenus:
    """CMS Navigation Menu endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
        self.created_menu_ids = []
    
    def test_get_menus_public(self):
        """Test GET /api/cms/menus returns menu list"""
        response = requests.get(f"{BASE_URL}/api/cms/menus")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "menus" in data, "menus field missing"
        assert isinstance(data["menus"], list), "menus should be a list"
        print(f"PASS: GET /api/cms/menus returns menu list (count: {len(data['menus'])})")
    
    def test_post_menus_requires_admin(self):
        """Test POST /api/cms/menus requires admin authentication"""
        response = requests.post(f"{BASE_URL}/api/cms/menus", json={
            "name": "Test Menu",
            "url": "/test"
        })
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"
        print(f"PASS: POST /api/cms/menus requires admin auth")
    
    def test_post_menus_create_menu(self):
        """Test POST /api/cms/menus - Admin can create menu item"""
        menu_data = {
            "name": "TEST_Products",
            "url": "/products",
            "order": 1,
            "is_active": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/cms/menus",
            json=menu_data,
            headers=self.headers
        )
        assert response.status_code == 200, f"Failed to create menu: {response.text}"
        data = response.json()
        assert "menu_id" in data, "menu_id not returned"
        self.created_menu_ids.append(data["menu_id"])
        print(f"PASS: Menu created with ID: {data['menu_id']}")
        
        # Verify menu appears in list
        get_response = requests.get(f"{BASE_URL}/api/cms/menus")
        menus = get_response.json().get("menus", [])
        created_menu = next((m for m in menus if m.get("id") == data["menu_id"]), None)
        assert created_menu is not None, "Created menu not found in list"
        assert created_menu["name"] == "TEST_Products", "Menu name mismatch"
        print(f"PASS: Created menu appears in menu list")
    
    def test_delete_menus_admin_only(self):
        """Test DELETE /api/cms/menus/{menu_id} - Admin can delete menu"""
        # First create a menu to delete
        create_response = requests.post(
            f"{BASE_URL}/api/cms/menus",
            json={"name": "TEST_ToDelete", "url": "/delete-me", "order": 99},
            headers=self.headers
        )
        assert create_response.status_code == 200
        menu_id = create_response.json()["menu_id"]
        
        # Delete the menu
        delete_response = requests.delete(
            f"{BASE_URL}/api/cms/menus/{menu_id}",
            headers=self.headers
        )
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"
        print(f"PASS: Menu {menu_id} deleted successfully")
        
        # Verify it's marked as inactive (soft delete)
        get_response = requests.get(f"{BASE_URL}/api/cms/menus")
        menus = get_response.json().get("menus", [])
        deleted_menu = next((m for m in menus if m.get("id") == menu_id), None)
        assert deleted_menu is None, "Deleted menu should not appear in active list"
        print(f"PASS: Deleted menu no longer in active list")


class TestVendorDashboard:
    """Vendor Dashboard endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get user token - need to create/use a vendor user"""
        # Try admin first for basic testing
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.admin_token = response.json().get("token")
        self.admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
    
    def test_vendor_dashboard_requires_auth(self):
        """Test GET /api/vendor/dashboard requires authentication"""
        response = requests.get(f"{BASE_URL}/api/vendor/dashboard")
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"
        print(f"PASS: Vendor dashboard requires authentication")
    
    def test_vendor_dashboard_requires_vendor_role(self):
        """Test GET /api/vendor/dashboard requires vendor role"""
        # Admin is not vendor, should fail
        response = requests.get(
            f"{BASE_URL}/api/vendor/dashboard",
            headers=self.admin_headers
        )
        # Should get 403 because admin is not a vendor
        assert response.status_code in [403, 404], f"Expected vendor role error, got {response.status_code}: {response.text}"
        print(f"PASS: Vendor dashboard requires vendor role (status: {response.status_code})")
    
    def test_vendor_register_endpoint_exists(self):
        """Test POST /api/vendor/register endpoint exists"""
        # Create test user first
        test_email = "test_vendor_check@example.com"
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "Test@123",
            "full_name": "Test Vendor Check"
        })
        # Login to get token
        if register_response.status_code in [200, 400]:  # 400 if already exists
            login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": test_email,
                "password": "Test@123"
            })
            if login_response.status_code == 200:
                token = login_response.json().get("token")
                headers = {"Authorization": f"Bearer {token}"}
                
                # Try to register as vendor
                vendor_reg = requests.post(
                    f"{BASE_URL}/api/vendor/register",
                    json={
                        "businessName": "Test Business",
                        "phone": "9876543210",
                        "panNumber": "AAAAA1234A",
                        "bankAccountNumber": "1234567890",
                        "ifscCode": "SBIN0001234",
                        "bankName": "SBI",
                        "address": "Test Address",
                        "city": "Test City",
                        "state": "Test State",
                        "pincode": "123456"
                    },
                    headers=headers
                )
                # Either success or already registered
                assert vendor_reg.status_code in [200, 400], f"Unexpected: {vendor_reg.status_code} - {vendor_reg.text}"
                print(f"PASS: Vendor registration endpoint works (status: {vendor_reg.status_code})")
            else:
                print(f"SKIP: Could not login test user")


class TestAffiliateDashboard:
    """Affiliate Dashboard endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test user for affiliate tests"""
        self.test_email = "test_affiliate@example.com"
        self.test_password = "Test@123"
        
        # Try to register or just login
        requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": self.test_email,
            "password": self.test_password,
            "full_name": "Test Affiliate User"
        })
        
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": self.test_email,
            "password": self.test_password
        })
        if login_response.status_code == 200:
            self.token = login_response.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            self.token = None
            self.headers = {}
    
    def test_affiliate_register_endpoint(self):
        """Test POST /api/affiliate/register creates affiliate"""
        if not self.token:
            pytest.skip("Could not get test user token")
        
        response = requests.post(
            f"{BASE_URL}/api/affiliate/register",
            json={},
            headers=self.headers
        )
        assert response.status_code == 200, f"Affiliate register failed: {response.text}"
        data = response.json()
        assert "referral_code" in data, "referral_code not returned"
        print(f"PASS: Affiliate registered with code: {data['referral_code']}")
    
    def test_affiliate_dashboard_endpoint(self):
        """Test GET /api/affiliate/dashboard returns affiliate data"""
        if not self.token:
            pytest.skip("Could not get test user token")
        
        # First ensure registered as affiliate
        requests.post(f"{BASE_URL}/api/affiliate/register", json={}, headers=self.headers)
        
        response = requests.get(
            f"{BASE_URL}/api/affiliate/dashboard",
            headers=self.headers
        )
        assert response.status_code == 200, f"Dashboard failed: {response.text}"
        data = response.json()
        
        # Verify expected fields
        assert "referral_code" in data, "referral_code missing"
        assert "total_earnings" in data, "total_earnings missing"
        assert "pending_earnings" in data, "pending_earnings missing"
        assert "commission_rate" in data, "commission_rate missing"
        print(f"PASS: Affiliate dashboard returns data: referral_code={data['referral_code']}")
    
    def test_affiliate_referrals_endpoint(self):
        """Test GET /api/affiliate/referrals returns referrals list"""
        if not self.token:
            pytest.skip("Could not get test user token")
        
        # First ensure registered as affiliate
        requests.post(f"{BASE_URL}/api/affiliate/register", json={}, headers=self.headers)
        
        response = requests.get(
            f"{BASE_URL}/api/affiliate/referrals",
            headers=self.headers
        )
        assert response.status_code == 200, f"Referrals failed: {response.text}"
        data = response.json()
        assert "referrals" in data, "referrals field missing"
        assert isinstance(data["referrals"], list), "referrals should be a list"
        print(f"PASS: Affiliate referrals endpoint works (count: {len(data['referrals'])})")
    
    def test_affiliate_earnings_endpoint(self):
        """Test GET /api/affiliate/earnings returns earnings data"""
        if not self.token:
            pytest.skip("Could not get test user token")
        
        # First ensure registered as affiliate
        requests.post(f"{BASE_URL}/api/affiliate/register", json={}, headers=self.headers)
        
        response = requests.get(
            f"{BASE_URL}/api/affiliate/earnings",
            headers=self.headers
        )
        assert response.status_code == 200, f"Earnings failed: {response.text}"
        data = response.json()
        assert "payouts" in data, "payouts field missing"
        assert "total_earnings" in data, "total_earnings missing"
        print(f"PASS: Affiliate earnings endpoint works (total: {data.get('total_earnings', 0)})")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
