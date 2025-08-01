# 🚨 URGENT: Fix Email Verification Redirect Issue

## **⚠️ Problem Identified:**
Email verification links are redirecting to `localhost:3000` instead of your GitHub Pages URL.

## **✅ IMMEDIATE FIX - Configure Supabase:**

### **Step 1: Update Supabase Settings**
1. **Go to:** https://supabase.com/dashboard/project/rmnmiqpxqpjvpcavkmxn
2. **Navigate to:** Settings → Authentication → URL Configuration

### **Step 2: Configure These URLs:**

**Site URL:**
```
https://bharathk2498.github.io/digital-footprint-eraser/
```

**Additional Redirect URLs:**
```
https://bharathk2498.github.io/digital-footprint-eraser/**
https://bharathk2498.github.io/digital-footprint-eraser/email-verified.html
https://bharathk2498.github.io/digital-footprint-eraser/index.html
https://bharathk2498.github.io/**
```

### **Step 3: Save Settings**
Click **Save** and wait 2-3 minutes for changes to propagate.

---

## **🔄 Alternative: Test with Email Test Page**

**Instead of using the main site, try:**
1. **Go to:** https://bharathk2498.github.io/digital-footprint-eraser/email-test.html
2. **Create a test account there**
3. **Check if verification email has correct URLs**

---

## **📧 Check Your Email Again**

After updating Supabase settings:
1. **Request a new verification email** (the old one has wrong URL)
2. **Use the "Resend Verification" button** on the site
3. **Check the new email** - it should have the correct GitHub Pages URL

---

## **⚡ Quick Test Process:**

1. **Update Supabase URLs** (above)
2. **Wait 3 minutes**
3. **Go to email test page**
4. **Create new test account**
5. **Check email for correct URL**
6. **Click verification link**
7. **Should redirect to GitHub Pages, not localhost**

---

## **🔍 If Still Having Issues:**

**Check these in Supabase:**
- Authentication → URL Configuration → Site URL is correct
- Authentication → General → "Enable email confirmations" is ON
- No localhost URLs anywhere in configuration

**Then:**
- Clear browser cache
- Try with different email address
- Use incognito/private browsing mode

---

**The main issue is Supabase configuration - once you update the Site URL to your GitHub Pages URL, the verification emails will work correctly!**
