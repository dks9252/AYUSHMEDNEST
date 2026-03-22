# Shared Pydantic Models
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid
from models.enums import UserRole, AYUSHSystem, PaymentMethod, PaymentStatus, OrderStatus


# ============== USER MODELS ==============
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    role: UserRole = UserRole.CUSTOMER
    full_name: str
    phone: Optional[str] = None
    address: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ============== PRODUCT MODELS ==============
class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vendor_id: str
    name: str
    description: str
    brand: str
    ayush_system: AYUSHSystem
    category: str
    sub_category: Optional[str] = None
    sku: str
    price: float
    discount_price: Optional[float] = None
    stock: int
    images: List[str] = []
    health_concerns: List[str] = []
    benefits: List[str] = []
    disadvantages: List[str] = []
    ingredients: List[str] = []
    variants: List[Dict[str, Any]] = []
    is_prescription_required: bool = False
    rating: float = 0.0
    reviews_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class ProductCreate(BaseModel):
    name: str
    description: str
    brand: str
    ayush_system: AYUSHSystem
    category: str
    sub_category: Optional[str] = None
    sku: str
    price: float
    discount_price: Optional[float] = None
    stock: int
    images: List[str] = []
    health_concerns: List[str] = []
    benefits: List[str] = []
    disadvantages: List[str] = []
    ingredients: List[str] = []
    is_prescription_required: bool = False

class ProductVariant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parent_product_id: str
    variant_name: str
    variant_type: str
    sku: str
    price: float
    discount_price: Optional[float] = None
    stock: int
    image_url: Optional[str] = None
    is_default: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============== CART & ORDER MODELS ==============
class CartItem(BaseModel):
    product_id: str
    quantity: int
    price: float

class Cart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    total: float

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[OrderItem]
    subtotal: float
    tax: float
    shipping_charge: float
    discount: float
    total: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus = PaymentStatus.PENDING
    order_status: OrderStatus = OrderStatus.PLACED
    shipping_address: Dict[str, Any]
    billing_address: Dict[str, Any]
    prescription_url: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    shiprocket_order_id: Optional[str] = None
    tracking_number: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    items: List[CartItem]
    shipping_address: Dict[str, Any]
    billing_address: Dict[str, Any]
    payment_method: PaymentMethod
    prescription_url: Optional[str] = None


# ============== OTHER MODELS ==============
class Prescription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    file_url: str
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Affiliate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    referral_code: str
    commission_rate: float = 5.0
    total_earnings: float = 0.0
    pending_earnings: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductReview(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_id: str
    user_name: str
    rating: int
    title: str
    comment: str
    images: List[str] = []
    is_verified_purchase: bool = False
    is_approved: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Wishlist(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    product_ids: List[str] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Testimonial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_image: Optional[str] = None
    rating: int
    comment: str
    designation: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Newsletter(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    is_active: bool = True
    subscribed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    action: str
    entity_type: str
    entity_id: str
    changes: Dict[str, Any] = {}
    ip_address: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============== SETTINGS MODELS ==============
class AdminSettings(BaseModel):
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    shiprocket_email: Optional[str] = None
    shiprocket_password: Optional[str] = None
    commission_rate: float = 5.0
    shipping_charge: float = 50.0
    tax_rate: float = 18.0

class WebsiteSettings(BaseModel):
    website_name: str = "AYUSHMEDNEST"
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    meta_title: Optional[str] = "India's Most Trusted AYUSH Marketplace"
    meta_description: Optional[str] = "Buy authentic Ayurvedic medicines online"
    contact_email: Optional[str] = "support@ayushmednest.com"
    contact_phone: Optional[str] = "+91 1800-XXX-XXXX"
    facebook_url: Optional[str] = None
    twitter_url: Optional[str] = None
    instagram_url: Optional[str] = None
    youtube_url: Optional[str] = None
    theme_primary_color: str = "#2F5C3E"
    theme_secondary_color: str = "#F97316"
    google_analytics_id: Optional[str] = None
    facebook_pixel_id: Optional[str] = None
    google_tag_manager_id: Optional[str] = None
    announcement_bar_text: Optional[str] = None
    announcement_bar_enabled: bool = False

class IntegrationSettings(BaseModel):
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    shiprocket_email: Optional[str] = None
    shiprocket_password: Optional[str] = None
    msg91_auth_key: Optional[str] = None
    msg91_sender_id: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from_email: Optional[str] = None
    google_indexing_json_key: Optional[str] = None
    commission_rate: float = 5.0
    shipping_charge: float = 50.0
    tax_rate: float = 18.0

class EmailTemplate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    subject: str
    body: str
    variables: List[str] = []
    is_active: bool = True

class SMSTemplate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    template_id: str
    message: str
    variables: List[str] = []
    is_active: bool = True

class AIRecommendationRequest(BaseModel):
    symptoms: List[str]
    health_concern: Optional[str] = None
    preferred_system: Optional[AYUSHSystem] = None
