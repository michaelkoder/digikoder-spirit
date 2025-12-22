# ✅ DEPLOYMENT VERIFICATION CHECKLIST

## 1️⃣ LOCAL DEVELOPMENT SETUP

### Environment Configuration
- [ ] `.env.local` exists with correct values:
  ```
  VITE_API_BASE_URL=/spirit
  NODE_ENV=development
  ADMIN_USER=admin
  ADMIN_HASH=<bcrypt_hash_of_password>
  JWT_SECRET=dev-secret-key-change-in-production
  PORT=3001
  ```
- [ ] `.env.production` exists with correct values:
  ```
  VITE_API_BASE_URL=/spirit
  NODE_ENV=production
  ```
  (Secrets referenced in vercel.json dashboard)

### File Structure
- [ ] `vite.config.ts` has proxy configured:
  ```typescript
  '/spirit/api': {
    target: 'http://localhost:3001',
    rewrite: (path) => path.replace(/^\/spirit\/api/, '/api'),
    ws: true,
  }
  ```
- [ ] `vercel.json` exists with correct rewrites:
  ```json
  {
    "rewrites": [
      { "source": "/spirit/api/(.*)", "destination": "/api/$1" }
    ]
  }
  ```
- [ ] `package.json` has correct scripts:
  - `"dev": "vite"` (frontend on 5173)
  - `"build": "vite build"` (production build)
  - `"start:server": "node server/index.cjs"` (backend on 3001)
  - `"preview": "vite preview"` (preview build)

### Dependencies
- [ ] Run `npm install` to ensure all packages are available
- [ ] Check `package.json` has all required packages:
  - react, react-dom
  - vite, @vitejs/plugin-react
  - typescript, tailwindcss
  - axios or fetch
  - lucide-react

---

## 2️⃣ API CONFIGURATION VERIFICATION

### Backend Files (server/index.cjs)
- [ ] Server listens on port **3001** (not 3005)
- [ ] `/api/validate-url` uses direct page fetch (not just oEmbed)
- [ ] `/api/login` handles admin authentication
- [ ] `/api/me` validates JWT tokens
- [ ] `/api/logout` clears sessions
- [ ] All endpoints have CORS headers configured

### Serverless API Files (api/ folder)
- [ ] `api/login.js` exports default function for POST /api/login
- [ ] `api/me.js` exports default function for GET /api/me
- [ ] `api/logout.js` exports default function for POST /api/logout
- [ ] `api/validate-url.js` exports default function for POST /api/validate-url
- [ ] All use `process.env.JWT_SECRET || 'dev-secret-key'` fallback

### JWT Configuration
- [ ] All auth endpoints use same JWT_SECRET
- [ ] Token expiry is set to 8 hours (28800 seconds)
- [ ] Tokens are signed with HS256 algorithm
- [ ] Both Authorization header and cookie methods work

---

## 3️⃣ FRONTEND CONFIGURATION

### React Application (index.tsx)
- [ ] API_BASE is read from `import.meta.env.VITE_API_BASE_URL`
- [ ] Fallback to `/spirit` if env var not set
- [ ] All API calls use relative paths:
  - `/spirit/api/login`
  - `/spirit/api/me`
  - `/spirit/api/logout`
  - `/spirit/api/contents`
  - `/spirit/api/validate-url`

### Authentication
- [ ] Login flow stores JWT token in localStorage and cookie
- [ ] Token is included in Authorization header for all requests
- [ ] Token expiry is checked and refresh handled
- [ ] Logout clears both localStorage and cookie

### Build Output
- [ ] `npm run build` produces `dist/` folder
- [ ] `dist/index.html` exists and is valid
- [ ] All assets are in `dist/assets/`

---

## 4️⃣ PRODUCTION DEPLOYMENT (Vercel)

### Environment Variables
Set these in Vercel Project Settings → Environment Variables:
- [ ] `ADMIN_USER=admin` (or your admin email)
- [ ] `ADMIN_HASH=<bcrypt_hash>` (use scripts/generate-admin-hash.cjs)
- [ ] `JWT_SECRET=<32char_random_string>` (e.g., `crypto.randomBytes(32).toString('hex')`)
- [ ] `NODE_ENV=production`

### vercel.json Configuration
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Framework: `vite`
- [ ] Rewrites configured for `/spirit/api/*` paths
- [ ] CORS headers include `Authorization`
- [ ] Functions have memory: 512, timeout: 30

### Git & Deployment
- [ ] `.gitignore` includes `.env`, `.env.local`, `.env.production`
- [ ] `.env.local` and `.env.production` are NOT committed
- [ ] GitHub repository is connected to Vercel
- [ ] Auto-deploy is enabled on push to main branch
- [ ] Build logs show no errors or warnings

---

## 5️⃣ TESTING CHECKLIST

### Local Testing (Development)
```bash
# Terminal 1: Start backend
npm run start:server

# Terminal 2: Start frontend
npm run dev
```

Run these tests:
- [ ] Open http://localhost:5173/spirit in browser
- [ ] Try to login with admin credentials
- [ ] Verify token appears in Network tab (Authorization header)
- [ ] Check user profile loads (/api/me works)
- [ ] Validate a YouTube video URL
- [ ] Try to logout and verify token is cleared
- [ ] Run `node scripts/test-api.cjs` for automated tests

### Production Testing (Vercel)
```bash
# After deployment
npm run build
npm run preview
```

Test routes:
- [ ] https://your-vercel-domain.vercel.app/spirit/
- [ ] Login endpoint responds correctly
- [ ] API requests work (check Network tab)
- [ ] Video validation works
- [ ] No CORS errors in console

---

## 6️⃣ CRITICAL ISSUES TO ADDRESS

### 🚨 Database Persistence (BLOCKER)
- **Current**: Uses `db_json.cjs` - writes to file system
- **Problem**: Vercel serverless has ephemeral file system (resets on redeploy)
- **Solution**: Migrate to persistent database:
  - Option A: MongoDB Atlas (recommended for production)
  - Option B: Supabase PostgreSQL
  - Option C: Vercel KV (for caching)
- **Status**: ⚠️ **MUST FIX BEFORE PRODUCTION DEPLOY**

### 🟡 API Response Consistency
- **Issue**: Different responses for success/error cases
- **Solution**: Standardize all API responses:
  ```javascript
  // Success
  { success: true, data: {...} }
  
  // Error
  { success: false, error: 'message' }
  ```
- **Status**: 📝 Nice to have, low priority

### 🟡 Error Handling
- **Issue**: Some endpoints don't handle missing parameters
- **Solution**: Add input validation
- **Status**: 📝 Nice to have, medium priority

---

## 7️⃣ USEFUL COMMANDS

### Development
```bash
# Install dependencies
npm install

# Start backend only
npm run start:server

# Start frontend only  
npm run dev

# Start both (requires two terminals)
npm run start:server &
npm run dev

# Test API endpoints
node scripts/test-api.cjs
node scripts/test-api.cjs https://your-vercel-domain.vercel.app
```

### Production
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Generate secure hash for admin password
node scripts/generate-admin-hash.cjs "your-password-here"

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Debugging
```bash
# Check environment variables
cat .env.local

# Check Vercel logs
vercel logs

# Check build output
ls -la dist/
```

---

## 8️⃣ DEPLOYMENT STEPS

1. **Prepare Local Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   npm install
   ```

2. **Test Locally**
   ```bash
   # In two terminals
   npm run start:server
   npm run dev
   
   # In another terminal
   node scripts/test-api.cjs
   ```

3. **Generate Production Secrets**
   ```bash
   # Generate ADMIN_HASH
   node scripts/generate-admin-hash.cjs "your-password"
   
   # Generate JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Configure Vercel**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add: `ADMIN_USER`, `ADMIN_HASH`, `JWT_SECRET`, `NODE_ENV=production`

5. **Create .env.production**
   ```bash
   cat > .env.production << 'EOF'
   VITE_API_BASE_URL=/spirit
   NODE_ENV=production
   EOF
   ```

6. **Commit and Push**
   ```bash
   git add .
   git commit -m "chore: prepare for production deployment"
   git push origin main
   ```

7. **Verify Deployment**
   - Check Vercel dashboard for successful build
   - Test API endpoints on production URL
   - Check Network tab for API calls
   - Verify no CORS errors

---

## ⚠️ BLOCKERS & NEXT STEPS

| Issue | Priority | Status | Action |
|-------|----------|--------|--------|
| Database persistence | 🚨 CRITICAL | ⏳ PENDING | Migrate to MongoDB/Supabase |
| Environment variables | 🚨 CRITICAL | ⏳ PENDING | Set in Vercel dashboard |
| Video validation | ✅ DONE | ✅ FIXED | Using direct page fetch |
| API proxy | ✅ DONE | ✅ FIXED | Configured in vite.config.ts |
| Port configuration | ✅ DONE | ✅ FIXED | 5173 frontend, 3001 backend |
| API_BASE environment | ✅ DONE | ✅ FIXED | Reading from VITE_API_BASE_URL |

---

## 📝 NOTES

- **Security**: Always use HTTPS in production
- **Secrets**: Never commit `.env.local` or `.env.production`
- **CORS**: Verify headers are set correctly for production domain
- **Monitoring**: Check Vercel logs after deployment
- **Backup**: Keep database backups before migrations
