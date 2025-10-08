# Authentication Debugging Guide

## Issue: "Failed to fetch" Error

This error means the connection to Supabase database is failing.

### Step 1: Open Browser Console (F12)

Look for error messages in the Console tab. Common errors:

1. **"Failed to fetch"** - Network connection issue
2. **"CORS policy"** - Cross-origin request blocked
3. **"401 Unauthorized"** - Invalid API credentials
4. **"Project is paused"** - Supabase project needs to be resumed

### Step 2: Check Supabase Project Status

1. Go to: https://supabase.com/dashboard
2. Sign in with your Supabase account
3. Find project: rmnmiqpxqpjvpcavkmxn
4. Check if project status is "Active" or "Paused"
5. If paused, click "Resume Project"

### Step 3: Verify Network Access

Run this in browser console:

```javascript
// Test connection
fetch('https://rmnmiqpxqpjvpcavkmxn.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbm1pcXB4cXBqdnBjYXZrbXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTUzMTAsImV4cCI6MjA2OTU3MTMxMH0.deKUH0tkvzCoHcqIedPDeG2YcS_lxrhVpGjMJU-ErF0',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbm1pcXB4cXBqdnBjYXZrbXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTUzMTAsImV4cCI6MjA2OTU3MTMxMH0.deKUH0tkvzCoHcqIedPDeG2YcS_lxrhVpGjMJU-ErF0'
  }
})
.then(r => {
  console.log("✅ Connection successful, status:", r.status);
  return r.json();
})
.then(d => console.log("Response:", d))
.catch(e => console.error("❌ Connection failed:", e.message));
```

### Step 4: Check CORS Settings

In Supabase Dashboard:
1. Go to Settings → API
2. Check "URL Configuration"
3. Ensure these domains are allowed:
   - `bharathk2498.github.io`
   - `localhost` (for testing)

### Step 5: Browser Extensions

Temporarily disable:
- Ad blockers (uBlock Origin, AdBlock)
- Privacy extensions (Privacy Badger, Ghostery)
- VPN or proxy extensions

### Step 6: Alternative - Use Different Browser

Try in:
- Chrome Incognito mode (Ctrl+Shift+N)
- Firefox Private window (Ctrl+Shift+P)
- Different browser entirely

### Step 7: Manual Signup Test

If automatic auth fails, you can manually create account:

1. Go to Supabase Dashboard
2. Authentication → Users
3. Click "Add User"
4. Enter email and password
5. Confirm email in verification tab

### Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| Failed to fetch | Network/Supabase down | Check project status |
| CORS policy error | Domain not allowed | Add domain to Supabase CORS |
| 401 Unauthorized | Invalid API key | Regenerate API keys |
| Project is paused | Inactivity timeout | Resume project |
| Too many requests | Rate limit hit | Wait 1 hour |

### Emergency Fallback

If Supabase continues failing, you can use localStorage for testing:

```javascript
// Temporary local auth (browser console)
localStorage.setItem('temp_user', JSON.stringify({
  email: 'test@example.com',
  name: 'Test User',
  timestamp: Date.now()
}));

// Reload page
location.reload();
```

### Get Help

If none of these work:
1. Screenshot the browser console errors
2. Check Supabase status: https://status.supabase.com
3. Post error details in GitHub Issues

### Verification Checklist

- [ ] Supabase project is active (not paused)
- [ ] Network connection stable
- [ ] No ad blockers interfering
- [ ] CORS configured correctly
- [ ] API keys are valid
- [ ] Browser console shows specific error
- [ ] Tried in incognito/private mode
- [ ] Tested on different network
