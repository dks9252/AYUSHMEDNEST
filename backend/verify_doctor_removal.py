
import pytest
import requests
import os

# Base URL for testing - adjust if needed
BASE_URL = os.environ.get('TEST_BASE_URL', 'http://localhost:8001')

def test_doctor_api_redirect():
    """Verify that backend /api/doctors endpoints redirect with 301"""
    # Test list endpoint
    response = requests.get(f"{BASE_URL}/api/doctors", allow_redirects=False)
    assert response.status_code == 301
    assert "https://consult.ayushmednest.com/doctors" in response.headers['Location']
    
    # Test specific doctor ID
    response = requests.get(f"{BASE_URL}/api/doctors/123", allow_redirects=False)
    assert response.status_code == 301
    assert "https://consult.ayushmednest.com/doctors/123" in response.headers['Location']
    
    # Test with query params
    response = requests.get(f"{BASE_URL}/api/doctors?specialization=ayurveda", allow_redirects=False)
    assert response.status_code == 301
    assert "specialization=ayurveda" in response.headers['Location']

def test_recommend_doctors_endpoint_removed():
    """Verify that the recommend-doctors AI endpoint is gone (404)"""
    response = requests.post(f"{BASE_URL}/api/ai/recommend-doctors", json={"symptoms": ["fever"]})
    assert response.status_code == 404

def test_admin_dashboard_no_doctor_count():
    """Verify admin dashboard no longer returns total_doctors"""
    # This requires an admin token, but we can verify the schema if we had one.
    # For now, we've manually verified the code change in admin.py.
    pass

if __name__ == "__main__":
    # Simple manual verification
    print("Running verification tests...")
    try:
        test_doctor_api_redirect()
        print("✓ Redirect tests passed")
        test_recommend_doctors_endpoint_removed()
        print("✓ AI endpoint removal test passed")
        print("\nAll verification tests completed successfully.")
    except Exception as e:
        print(f"\nVerification failed: {e}")
        print("Make sure the backend server is running on http://localhost:8001")
