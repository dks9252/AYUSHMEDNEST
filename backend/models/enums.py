# Shared Enums for the application
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"
    VENDOR = "vendor"
    AFFILIATE = "affiliate"
    DOCTOR = "doctor"

class OrderStatus(str, Enum):
    PLACED = "placed"
    CONFIRMED = "confirmed"
    PACKED = "packed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethod(str, Enum):
    RAZORPAY = "razorpay"
    COD = "cod"

class AYUSHSystem(str, Enum):
    AYURVEDA = "ayurveda"
    YOGA = "yoga"
    UNANI = "unani"
    SIDDHA = "siddha"
    HOMEOPATHY = "homeopathy"
    NATUROPATHY = "naturopathy"

class HomepageBlockType(str, Enum):
    HERO_BANNER = "hero_banner"
    CATEGORY_GRID = "category_grid"
    PRODUCT_SLIDER = "product_slider"
    PROMOTIONAL_BANNER = "promotional_banner"
    DOCTOR_CTA = "doctor_cta"
    TESTIMONIALS = "testimonials"
    BLOG_HIGHLIGHTS = "blog_highlights"
    TRUST_BADGES = "trust_badges"
