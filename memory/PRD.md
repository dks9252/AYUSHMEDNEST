# AYUSH Healthcare Marketplace - Product Requirements Document

## Original Problem Statement
Build a production-grade AYUSH healthcare marketplace platform for www.ayushmednest.com. The platform combines:
- Multi-vendor AYUSH pharmacy marketplace
- Doctor consultation discovery system
- Prescription-based medicine purchase
- Affiliate marketing system
- AI-powered health concern & doctor recommendation engine

**Design Inspiration:** Healthmug.com - vibrant, colorful, modern e-commerce design

## Tech Stack
- **Frontend:** React, Tailwind CSS, Shadcn/UI
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **AI:** OpenAI GPT-5.2 (planned)
- **Payments:** Razorpay (INTEGRATED - Live keys configured)
- **Shipping:** Shiprocket (CONFIGURED - Admin editable)
- **Notifications:** MSG91 (planned)

## What's Been Implemented

### Completed (Dec 8, 2025)
- [x] **Stunning Homepage Design** - Healthmug-inspired vibrant UI with:
  - Animated announcement bar with offers
  - Hero carousel (3 rotating banners with auto-slide)
  - Shop by Health Concern icons (8 categories)
  - Trust badges strip
  - Category-wise product sections with horizontal scroll
  - Top AYUSH Brands section with gradient background
  - Stats section (10K+ products, 5L+ orders, etc.)
  - Doctor Consultation CTA
  - Newsletter subscription section
  - Complete responsive Footer
- [x] **Frontend Cleanup** - Removed obsolete HomePage.js and ImprovedHomePage.js
- [x] **Frontend Testing** - 95% success rate, all 15+ features passing
- [x] **Backend Refactoring** - Monolithic server.py (1781 lines) refactored into:
  - `/routers/auth.py` - Authentication (register, login, me)
  - `/routers/products.py` - Product CRUD + reviews + variants
  - `/routers/doctors.py` - Doctor listing and creation
  - `/routers/cart.py` - Cart operations
  - `/routers/orders.py` - Order management
  - `/routers/admin.py` - Admin dashboard, settings, templates
  - `/routers/cms.py` - CMS settings, categories, banners
  - `/routers/public.py` - Health concerns, testimonials, newsletter
  - `/routers/ai.py` - AI recommendations
  - `/routers/user_features.py` - Prescriptions, affiliate
  - `/models/` - Pydantic schemas and enums
  - `/utils/auth.py` - JWT utilities
- [x] **Backend Testing** - 100% success rate (30/30 tests passed)
- [x] **Product Variant System** - Healthmug-style variant selection:
  - Size variants (30ml, 2x30ml, 100ml) with price per 100ml
  - Potency variants (6 CH, 12 CH, 30 CH, 200 CH, 1M, 10M)
  - "+X more" expandable button for hidden variants
  - Dynamic price updates on variant selection
  - SEO-friendly URLs (/products/{id}/{variant-slug})
  - Stock warning "Only X left at this price"
  - Sticky sidebar with Buy Now / Add to Cart
  - Breadcrumb navigation
  - Pincode delivery check
  - 7 days return policy display
  - **Variants only shown for products that have them**
- [x] **Variant Testing** - 100% success rate (17/17 features passed)
- [x] **Healthmug-style Homepage Product Carousel**:
  - Compact product cards with "+" quick add button
  - Discount badge in corner (XX% OFF)
  - Product name, size info, price with strikethrough
  - "view all" with yellow circle arrow (Healthmug style)
- [x] **Rich Product Detail Page**:
  - Product Specifications (System, Pack Size, Brand, Category, Origin)
  - Product Details (Also known as, Description)
  - Indications / Benefits
  - Side Effects section
  - Dosage section
  - Precautions section
  - Terms and Conditions box
  - **"Useful in" section** with health concern images from product tags
  - **Questions & Answers (FAQ)** - Auto-generated accordion FAQs
  - Ratings & Reviews section
  - Other Information (Manufacturer, Country)
  - Related Products in sidebar
- [x] **Q&A System**:
  - "Be the first to ask a question" button opens modal
  - Question textarea with product name
  - Admin approval required before display
  - Answers can be added by admin or users
- [x] **Review System**:
  - "Rate and Review Product" button opens modal
  - 5-star rating selector (clickable)
  - Title (optional) and comment fields
  - Admin approval required before publishing
- [x] **Vendor Registration & Dashboard**:
  - Full registration form (Business Name, Phone, GST, PAN)
  - Bank details (Account, IFSC, Bank Name)
  - Business address (Address, City, State, Pincode)
  - Benefits section displayed
  - Dashboard with stats, products, orders, profile tabs
  - Product CRUD (add, edit, delete)
- [x] **Affiliate Registration & Dashboard**:
  - Landing page with benefits (10% commission, 30-day cookie, weekly payouts)
  - "How It Works" 4-step process
  - Referral code generator
  - Share buttons (WhatsApp, Facebook, Twitter)
  - Earnings tracking
- [x] **Footer Links Updated**:
  - "Find Doctors" → consult.ayushmednest.com
  - "Online Consultation" → consult.ayushmednest.com
  - "Sell With Us" → /vendor/register
  - "Become Affiliate" → /affiliate/register

### Completed (Mar 10, 2026)
- [x] **Admin Control Panel (Comprehensive CMS)**:
  - 14 navigation sections: Overview, Website, Reviews, Q&A, Vendors, Affiliates, Payment, Shipping, Email, SMS, Testimonials, Newsletter, SEO, Audit Logs
  - Overview dashboard with stats cards (Pending Reviews, Questions, Vendors, Affiliates)
  - Reviews approval/rejection management
  - Questions approval/rejection management
  - Vendors approval workflow
  - Affiliates management with commission tracking
  - Testimonials creation
  - Newsletter subscriber list
  - Audit logs viewer
- [x] **Razorpay Payment Integration**:
  - Live keys configured (rzp_live_VEWkQOYaQkK5pf)
  - Admin editable Razorpay credentials
  - Connection test endpoint with success/failure feedback
  - Checkout page with Razorpay script loading
  - Order creation generates Razorpay order
  - Payment verification endpoint
  - Frontend shows Pay Online option with Razorpay badge
- [x] **Shiprocket Shipping Integration**:
  - Admin editable Shiprocket credentials (email/password)
  - Connection test endpoint
  - Default shipping charge and tax rate configuration
  - Auto-push orders to Shiprocket when confirmed
- [x] **Website Settings CMS**:
  - General Settings (Website Name, Logo URL, Favicon URL, Contact Email/Phone)
  - Theme Colors with color picker (Primary + Secondary/Accent colors)
  - SEO Settings (Meta Title, Meta Description)
  - Social Media Links (Facebook, Twitter, Instagram, YouTube)
  - Analytics & Tracking (Google Analytics ID, GTM ID, Facebook Pixel ID)
  - Announcement Bar (Enable/Disable toggle + custom text)
  - Navigation Menu Management (Add/Edit/Delete menu items)
- [x] **Vendor Dashboard**:
  - Post-login dashboard for approved vendors
  - Product management (add, edit, delete products)
  - Order tracking
  - Revenue statistics
  - Registration form for new vendors
- [x] **Affiliate Dashboard**:
  - Post-login dashboard showing referral code
  - Earnings tracking (total, pending, paid)
  - Referral links with copy/share functionality
  - Commission structure display
  - WhatsApp share integration
- [x] **Testing** - 100% success rate (17/17 tests passed)

### Existing (Pre-built by previous agent - NOT VERIFIED)
- Basic product listing and detail pages (placeholder)
- Doctor listing page (placeholder)
- Cart functionality (basic)
- User authentication (login/register)
- Admin dashboard pages (placeholder UI only)
- Sample data seeded in MongoDB

## Architecture

```
/app/
├── backend/
│   ├── server.py             # Main entry point (refactored - 50 lines)
│   ├── database.py           # MongoDB connection
│   ├── routers/              # API route modules
│   │   ├── auth.py           # Authentication routes
│   │   ├── products.py       # Product CRUD + reviews
│   │   ├── doctors.py        # Doctor routes
│   │   ├── cart.py           # Cart operations
│   │   ├── orders.py         # Order management
│   │   ├── admin.py          # Admin dashboard/settings
│   │   ├── cms.py            # CMS routes
│   │   ├── public.py         # Public routes
│   │   ├── ai.py             # AI recommendations
│   │   └── user_features.py  # Prescriptions/affiliate
│   ├── models/
│   │   ├── schemas.py        # Pydantic models
│   │   └── enums.py          # Enumerations
│   ├── utils/
│   │   └── auth.py           # JWT utilities
│   ├── tests/                # Pytest test files
│   ├── seed_data.py          # Database seeding
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── Footer.js
    │   │   └── ui/           # Shadcn components
    │   ├── pages/
    │   │   ├── StunningHomePage.js  # ACTIVE homepage
    │   │   ├── ProductListPage.js
    │   │   ├── ProductDetailPage.js
    │   │   ├── DoctorListPage.js
    │   │   ├── AuthPage.js
    │   │   ├── CartPage.js
    │   │   ├── AdminDashboard.js
    │   │   └── ...
    │   └── App.js
    └── package.json
```

## Prioritized Backlog

### P0 - Critical (Completed)
1. ~~**Backend Refactoring**~~ ✅ DONE - Modular router architecture
2. ~~**Functional Testing**~~ ✅ DONE - 100% backend tests pass

### P1 - High Priority (Completed)
3. ~~**Product Variant System**~~ ✅ DONE - Healthmug-style implementation
4. ~~**Admin CMS**~~ ✅ DONE - Comprehensive admin panel with 12 sections
5. ~~**Razorpay Payment Integration**~~ ✅ DONE - Live keys configured
6. ~~**Shiprocket Shipping Integration**~~ ✅ DONE - Admin editable

### P2 - Medium Priority (Next)
7. **Vendor & Affiliate Dashboards** - Post-login management functionality
8. **Search Filters** (price range, brands, ratings)
9. **Website Settings CMS** - Logo, colors, menus from admin
10. **Homepage Builder** - Editable content blocks

### Future/Backlog
- OpenAI GPT-5.2 AI recommendations
- MSG91 notifications
- Google Analytics 4 / GTM / Facebook Pixel
- Google Indexing API
- SEO tools (sitemap, schema markup)
- Vendor portal (full)
- Affiliate marketing system
- Prescription upload & management
- Email/SMS templates

## API Endpoints (Current)

```
POST /api/auth/register - User registration
POST /api/auth/login - User login
GET /api/auth/me - Get current user

GET /api/products - List products
GET /api/products/{id} - Product detail
POST /api/cart/add - Add to cart
GET /api/cart - Get cart items

GET /api/doctors - List doctors
GET /api/doctors/{id} - Doctor detail
```

## Database Collections
- `users` - User accounts
- `products` - Product catalog
- `doctors` - Doctor profiles
- `cart_items` - Shopping cart
- `health_concerns` - Health categories
- `categories`, `brands` - Taxonomies

## Test Reports
- `/app/test_reports/iteration_1.json` - Frontend homepage testing (95% pass)
- `/app/test_reports/iteration_2.json` - Backend API testing (100% pass - 30/30 tests)
- `/app/test_reports/iteration_3.json` - Product Variant System (100% pass - 17/17 features)
- `/app/test_reports/iteration_4.json` - Q&A, Review, Vendor, Affiliate Systems (100% pass - 10/10 features)
- `/app/backend/tests/test_api_refactored.py` - Pytest test file

## Known Issues (Resolved)
1. ~~**Backend Monolith**~~ ✅ FIXED - Refactored into modular routers
2. ~~**ProductListPage SelectItem error**~~ ✅ FIXED by testing agent

## Notes for Next Session
- Always test features after implementation
- Backend refactoring is P0 before adding new features
- Product images are from Unsplash placeholders
- EMERGENT_LLM_KEY available in backend/.env for AI integration
