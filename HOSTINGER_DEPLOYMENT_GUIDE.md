# 🚀 AYUSHMEDNEST - Complete Hostinger Deployment Guide

This guide will help you deploy your AYUSH marketplace on Hostinger shared hosting. Since Hostinger shared hosting doesn't support Python/FastAPI natively, we'll need a **hybrid approach**.

---

## ⚠️ Important: Hosting Requirements

Your application has:
- **Frontend**: React (JavaScript) - ✅ Can run on Hostinger shared hosting
- **Backend**: FastAPI (Python) - ❌ Cannot run on Hostinger shared hosting directly
- **Database**: MongoDB - ❌ Requires separate service

### Recommended Architecture for Production:

| Component | Where to Host | Cost (Approx.) |
|-----------|--------------|----------------|
| Frontend | Hostinger (your plan) | Included |
| Backend API | Railway / Render / DigitalOcean | $5-10/month |
| Database | MongoDB Atlas (Free Tier) | FREE |

---

## 📋 Step-by-Step Deployment Guide

### STEP 1: Set Up MongoDB Atlas (Free Database)

1. **Go to**: https://www.mongodb.com/atlas/database
2. **Create Account** → Sign up with Google/Email
3. **Create Free Cluster**:
   - Click "Build a Database"
   - Choose "Shared" (FREE)
   - Select region closest to India (Mumbai)
   - Cluster name: `ayushmednest-cluster`

4. **Create Database User**:
   - Go to "Database Access" → Add New User
   - Username: `ayushmednest_admin`
   - Password: Generate secure password (SAVE IT!)
   - Role: "Read and write to any database"

5. **Allow Network Access**:
   - Go to "Network Access" → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is required for cloud deployment

6. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string:
   ```
   mongodb+srv://ayushmednest_admin:<password>@ayushmednest-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password

---

### STEP 2: Deploy Backend to Railway (Recommended)

Railway offers easy Python deployment with $5 free credits monthly.

1. **Go to**: https://railway.app
2. **Sign Up** with GitHub
3. **Create New Project** → "Deploy from GitHub repo"

4. **Upload Backend Code**:
   If you don't have a GitHub repo, create one:
   ```bash
   # On your computer, create folder 'ayushmednest-backend'
   # Copy all files from /app/backend/ into it
   ```

5. **Configure Railway Environment Variables**:
   Go to your project → Variables → Add:
   ```
   MONGO_URL=mongodb+srv://ayushmednest_admin:<password>@ayushmednest-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   DB_NAME=ayushmednest_db
   JWT_SECRET=your-super-secret-key-change-this-in-production
   CORS_ORIGINS=https://www.ayushmednest.com,https://ayushmednest.com
   RAZORPAY_KEY_ID=rzp_live_VEWkQOYaQkK5pf
   RAZORPAY_KEY_SECRET=IFy44bGq5asWn6fL86QohUS8
   ```

6. **Create `railway.toml`** in backend folder:
   ```toml
   [build]
   builder = "NIXPACKS"
   
   [deploy]
   startCommand = "uvicorn server:app --host 0.0.0.0 --port $PORT"
   healthcheckPath = "/api/health"
   healthcheckTimeout = 100
   ```

7. **Create `Procfile`** in backend folder:
   ```
   web: uvicorn server:app --host 0.0.0.0 --port $PORT
   ```

8. **Deploy**:
   - Push to GitHub
   - Railway auto-deploys
   - Get your backend URL: `https://your-app.up.railway.app`

---

### STEP 3: Build Frontend for Production

1. **Update Frontend `.env`**:
   Create `.env.production` in frontend folder:
   ```
   REACT_APP_BACKEND_URL=https://your-railway-app.up.railway.app
   ```

2. **Build the React App**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   This creates a `build/` folder with static files.

---

### STEP 4: Deploy Frontend to Hostinger

#### A. Login to Hostinger:
1. Go to https://hpanel.hostinger.com
2. Login with your credentials

#### B. Access File Manager:
1. Click on your hosting plan
2. Go to "Files" → "File Manager"
3. Navigate to `public_html` folder

#### C. Upload Files:
1. **Delete** existing files in `public_html` (if any default files)
2. **Upload** all files from your `build/` folder:
   - Click "Upload" button
   - Select all files from `frontend/build/`
   - Upload everything including subfolders

Your folder structure should look like:
```
public_html/
├── index.html
├── static/
│   ├── css/
│   ├── js/
│   └── media/
├── favicon.ico
├── manifest.json
└── robots.txt
```

#### D. Configure `.htaccess` for React Router:
Create/edit `.htaccess` in `public_html`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

### STEP 5: Connect Domain (ayushmednest.com)

#### A. Point Domain to Hostinger:
1. Go to Hostinger hPanel → "Domains"
2. Click "Manage" on your domain
3. Go to "DNS / Nameservers"
4. Use Hostinger nameservers:
   ```
   ns1.dns-parking.com
   ns2.dns-parking.com
   ```

#### B. Enable SSL (HTTPS):
1. Go to hPanel → "SSL"
2. Click "Install" for free Let's Encrypt SSL
3. Wait 5-10 minutes for activation

---

### STEP 6: Post-Deployment Checklist

#### ✅ Test Your Website:
1. Visit https://www.ayushmednest.com
2. Test these flows:
   - [ ] Homepage loads correctly
   - [ ] Products page shows items
   - [ ] Login/Register works
   - [ ] Add to cart works
   - [ ] Checkout with Razorpay works
   - [ ] Admin panel accessible at /admin/settings

#### ✅ Create Admin User:
Run this in your Railway deployment console or MongoDB Compass:
```javascript
db.users.insertOne({
  id: "admin-001",
  email: "admin@ayushmednest.com",
  password_hash: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4M7QF9V5h9v3VZm6", // Admin@123
  role: "admin",
  full_name: "Platform Admin",
  is_active: true
})
```

#### ✅ Configure Integration Settings:
Login as admin → Go to /admin/settings → Configure:
- Razorpay keys (Payment section)
- Shiprocket credentials (Shipping section)
- Website settings (Website section)

---

## 🔧 Troubleshooting

### Problem: API calls failing
**Solution**: Check that your frontend `.env.production` has the correct Railway backend URL.

### Problem: 404 errors on page refresh
**Solution**: Make sure `.htaccess` file is correctly configured in `public_html`.

### Problem: MongoDB connection issues
**Solution**: 
1. Verify MongoDB Atlas network access allows 0.0.0.0/0
2. Check connection string has correct password
3. Ensure DB_NAME matches in Railway variables

### Problem: Razorpay not working
**Solution**: 
1. Add your production domain to Razorpay dashboard whitelist
2. Go to: https://dashboard.razorpay.com/app/website-app-settings
3. Add: `https://www.ayushmednest.com`

---

## 💰 Cost Summary

| Service | Monthly Cost |
|---------|-------------|
| Hostinger Shared Hosting | ₹99-299/month |
| Railway (Backend) | ~$5/month (5GB free) |
| MongoDB Atlas | FREE (512MB) |
| **Total** | **~₹500-800/month** |

---

## 📞 Need Help?

If you face any issues:
1. Check Railway logs for backend errors
2. Check browser console (F12) for frontend errors
3. Verify all environment variables are set correctly

---

## 🎉 Congratulations!

Your AYUSHMEDNEST marketplace is now live at https://www.ayushmednest.com!

**Admin Login**:
- URL: https://www.ayushmednest.com/admin/settings
- Email: admin@ayushmednest.com
- Password: Admin@123 (Change this immediately!)
