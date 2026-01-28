# LinkedIn API Quick Start Guide

## Quick Setup (5 minutes)

### Step 1: Create LinkedIn App
1. Go to https://www.linkedin.com/developers/
2. Click "Create app"
3. Fill in:
   - App name: "Corpay Dashboard"
   - LinkedIn Page: Select "Galactis AI Tech Pvt Ltd"
   - Privacy Policy URL: `https://example.com/privacy` (can be placeholder)
4. Click "Create app"

### Step 2: Get Credentials
1. In your app dashboard, go to "Auth" tab
2. Copy:
   - **Client ID**
   - **Client Secret**

### Step 3: Request API Access
1. Go to "Products" tab
2. Request: **Marketing Developer Platform**
3. Wait for approval (usually instant)

### Step 4: Get Access Token

**Option A: OAuth Flow (Recommended)**
1. Start your backend: `python -m uvicorn app.main:app --reload`
2. Visit: `http://localhost:8000/api/admin/auth/linkedin/authorize`
3. Authorize the app
4. Copy the access token from the callback response

**Option B: Developer Token (Quick Test)**
1. In app dashboard → "Auth" tab
2. Generate "Developer Token"
3. Use this as your access token (limited scope)

### Step 5: Get Company URN

Run this in your terminal (replace `YOUR_TOKEN` with your access token):
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.linkedin.com/v2/organizationSearch?q=vanityName&vanityName=galactisaitech"
```

Look for `"id"` in the response - that's your URN (format: `urn:li:organization:123456`)

### Step 6: Configure .env

Create `Corpfront/backend/.env`:
```env
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_API_KEY=your_access_token_here
LINKEDIN_COMPANY_URN=urn:li:organization:123456789
LINKEDIN_VANITY_NAME=galactisaitech
```

### Step 7: Test

1. Restart backend server
2. Test connection:
   ```bash
   curl http://localhost:8000/api/admin/auth/linkedin/test-connection
   ```
3. Sync posts:
   ```bash
   curl -X POST "http://localhost:8000/api/admin/posts/sync-linkedin-dev?post_type=corpay&limit=10"
   ```

### Step 8: Verify

1. Check frontend dashboard at `http://localhost:3000`
2. Posts should appear in "Corpay Posts" section

## Troubleshooting

**"Invalid access token"**
- Token expired (60 days). Get a new one via OAuth flow.

**"Insufficient permissions"**
- Make sure "Marketing Developer Platform" is approved in Products tab.

**"Company URN not found"**
- Verify vanity name: `galactisaitech`
- Make sure you have access to the company page.

## Need Help?

See full documentation: `LINKEDIN_API_SETUP.md`
