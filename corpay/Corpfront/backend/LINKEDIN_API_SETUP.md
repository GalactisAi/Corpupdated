# LinkedIn Official API Setup Guide

This guide will help you set up LinkedIn Official API credentials to automatically fetch posts from the Galactis AI Tech company page.

## Prerequisites

1. A LinkedIn account
2. Access to the LinkedIn company page you want to fetch posts from
3. Admin access to the company page (for some API endpoints)

## Step 1: Create a LinkedIn Developer Account

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Sign in with your LinkedIn account
3. Click **"Create app"** or **"My Apps"** → **"Create app"**

## Step 2: Create a New App

1. Fill in the app details:
   - **App name**: e.g., "Corpay Dashboard"
   - **LinkedIn Page**: Select the company page (Galactis AI Tech Pvt Ltd)
   - **Privacy Policy URL**: (Required) You can use a placeholder like `https://yourdomain.com/privacy`
   - **App logo**: (Optional) Upload a logo
   - **App use case**: Select "Other" or appropriate option
   - **User agreement**: Accept the terms

2. Click **"Create app"**

## Step 3: Get Your Credentials

After creating the app, you'll see:

1. **Client ID** (also called "Client ID" or "API Key")
2. **Client Secret** (also called "Client Secret" or "Secret Key")

Copy these values - you'll need them in Step 5.

## Step 4: Request API Products

1. In your app dashboard, go to the **"Products"** tab
2. Request access to:
   - **Marketing Developer Platform** (for company posts)
   - **Sign In with LinkedIn using OpenID Connect** (if needed)
   - **Share on LinkedIn** (if you want to post)

3. Wait for approval (usually instant for basic access, but can take a few days for advanced features)

## Step 5: Get Company URN

The Company URN is needed to fetch posts from a specific company page.

### Option A: From LinkedIn Company Page URL
1. Go to the company page: `https://www.linkedin.com/company/galactisaitech`
2. The URN format is: `urn:li:organization:{numeric_id}`
3. You can find the numeric ID in the page source or use the API to look it up

### Option B: Use LinkedIn API to Find URN
```bash
# Use this endpoint to find company URN by vanity name
GET https://api.linkedin.com/v2/organizations?q=vanityName&vanityName=galactisaitech
```

### Option C: From Company Page Admin
1. If you're an admin of the company page, you can find the URN in the page settings
2. Or use LinkedIn's Company Page API to list organizations you manage

## Step 6: Get Access Token

### Option A: OAuth 2.0 Flow (Recommended for Production)

1. Set up OAuth redirect URI in your app settings:
   - Go to **"Auth"** tab in your app
   - Add redirect URI: `http://localhost:8000/api/admin/auth/linkedin/callback`

2. Use OAuth flow to get access token:
   ```
   https://www.linkedin.com/oauth/v2/authorization?
     response_type=code&
     client_id={YOUR_CLIENT_ID}&
     redirect_uri={YOUR_REDIRECT_URI}&
     state={RANDOM_STATE}&
     scope=r_organization_social,r_basicprofile
   ```

### Option B: Developer Token (For Testing)

1. In your app dashboard, go to **"Auth"** tab
2. Generate a **Developer Token** (only works for your own account)
3. This is useful for testing but limited in scope

## Step 7: Configure Environment Variables

Create or update `.env` file in `Corpfront/backend/`:

```env
# LinkedIn API Configuration
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_API_KEY=your_access_token_here
LINKEDIN_COMPANY_URN=urn:li:organization:123456789
LINKEDIN_COMPANY_URL=https://www.linkedin.com/company/galactisaitech/posts/?feedView=all
```

## Step 8: Test the Connection

1. Start the backend server:
   ```bash
   cd Corpfront/backend
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

2. Test the sync endpoint:
   ```bash
   curl -X POST "http://localhost:8000/api/admin/posts/sync-linkedin-dev?post_type=corpay&limit=10"
   ```

3. Check the logs for any errors

## Troubleshooting

### Common Issues

1. **"Invalid access token"**
   - Token may have expired (they expire after 60 days)
   - Regenerate the token using OAuth flow

2. **"Insufficient permissions"**
   - Make sure you've requested the correct API products
   - Wait for approval if pending

3. **"Company URN not found"**
   - Verify the URN format: `urn:li:organization:{id}`
   - Make sure you have access to the company page

4. **"Rate limit exceeded"**
   - LinkedIn has rate limits (varies by plan)
   - Implement caching (already done in the code)
   - Reduce sync frequency

### API Rate Limits

- **Free tier**: Limited requests per day
- **Paid plans**: Higher limits
- Check your app dashboard for current limits

## Alternative: Manual Post Entry

If LinkedIn API setup is complex, you can manually add posts via:
- Admin Dashboard → Posts page
- Or use the API endpoint: `POST /api/admin/posts`

## Next Steps

Once configured:
1. Posts will automatically sync every 30 minutes
2. New posts from LinkedIn will appear in the dashboard
3. You can manually trigger sync using the API endpoint

## Support

For LinkedIn API issues:
- [LinkedIn API Documentation](https://docs.microsoft.com/en-us/linkedin/)
- [LinkedIn Developer Support](https://www.linkedin.com/help/linkedin/answer/a1338220)
