# 🔧 Supabase Email Verification Setup Guide

## **📧 Step 1: Configure Email Settings in Supabase Dashboard**

### **🌐 Access Your Supabase Dashboard:**
1. Go to **https://supabase.com/dashboard**
2. Select your project: **rmnmiqpxqpjvpcavkmxn**
3. Navigate to **Settings → Authentication**

### **⚙️ Configure Email Authentication:**

#### **A. Email Templates (Settings → Authentication → Email Templates):**

**1. Confirm Signup Template:**
```html
<h2>🛡️ Welcome to Digital Footprint Eraser!</h2>
<p>Hi there,</p>
<p>Thank you for signing up for Digital Footprint Eraser - your ultimate privacy protection platform!</p>
<p>To activate your account and start protecting your digital privacy, please click the confirmation link below:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Your Email Address</a></p>
<p>This link will expire in 24 hours.</p>
<p><strong>What's Next?</strong></p>
<ul>
<li>🔍 Run free privacy scans</li>
<li>🍪 Clear tracking cookies</li>
<li>👨‍👩‍👧‍👦 Set up family protection</li>
<li>🤖 Access AI-powered tools</li>
</ul>
<p>If you didn't create this account, you can safely ignore this email.</p>
<p>Best regards,<br>The Digital Footprint Eraser Team</p>
```

**2. Recovery/Reset Password Template:**
```html
<h2>🔐 Reset Your Digital Footprint Eraser Password</h2>
<p>Hi there,</p>
<p>We received a request to reset your password for your Digital Footprint Eraser account.</p>
<p>Click the link below to create a new password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Your Password</a></p>
<p>This link will expire in 1 hour for security reasons.</p>
<p>If you didn't request this password reset, please ignore this email - your account remains secure.</p>
<p>Best regards,<br>The Digital Footprint Eraser Team</p>
```

#### **B. Authentication Settings (Settings → Authentication → General):**

**Enable the following:**
- ✅ **Enable email confirmations** = `TRUE`
- ✅ **Enable email change confirmations** = `TRUE`
- ✅ **Enable secure email change** = `TRUE` (recommended)

**Configure these values:**
- **Site URL:** `https://bharathk2498.github.io/digital-footprint-eraser/`
- **Redirect URLs:** 
  ```
  https://bharathk2498.github.io/digital-footprint-eraser/
  https://bharathk2498.github.io/digital-footprint-eraser/**
  http://localhost:3000/**
  ```

#### **C. Email Rate Limiting:**
- **Email rate limit:** `3 emails per hour` (default)
- **SMS rate limit:** `3 SMS per hour` (if using SMS)

---

## **🗃️ Step 2: Update Database Schema**

### **Execute the SQL Schema:**
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the content from `supabase-email-verification-schema.sql`
3. Click **Run** to execute all the database updates

**This will:**
- ✅ Add email verification tracking fields
- ✅ Create automated triggers for user registration
- ✅ Set up email verification logging
- ✅ Create dashboard views
- ✅ Configure Row Level Security policies

---

## **📬 Step 3: Configure Email Provider (Choose One)**

### **Option A: Use Supabase Built-in Email (Easiest - for testing)**
**Already configured!** Supabase will send emails from their servers.

**Limits:**
- 3 emails per hour per user
- Basic email templates
- Supabase branding

### **Option B: Configure Custom SMTP (Recommended for production)**

#### **Using Gmail SMTP:**
1. Go to **Settings → Authentication → SMTP Settings**
2. Configure:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: your-email@gmail.com
   SMTP Pass: [Generate App Password]
   ```

#### **Using SendGrid (Professional):**
1. Create SendGrid account
2. Generate API key
3. Configure in Supabase:
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP User: apikey
   SMTP Pass: [Your SendGrid API Key]
   ```

---

## **🧪 Step 4: Test Email Verification**

### **Test the Complete Flow:**

1. **Clear browser data** and go to your site
2. **Click "Create Account"**
3. **Enter test email** (use a real email you can access)
4. **Check your email** for verification message
5. **Click verification link**
6. **Return to site and sign in**

### **Verify Database Storage:**
Check in Supabase dashboard → Table editor:
- ✅ `auth.users` - User created with `email_confirmed_at`
- ✅ `user_security_profiles` - Profile created with `email_verified = true`
- ✅ `user_subscriptions` - Free plan assigned
- ✅ `email_verification_logs` - Verification logged

---

## **🚀 Step 5: Troubleshooting Common Issues**

### **Issue 1: Emails not sending**
**Solution:**
- Check SMTP settings in Supabase
- Verify email provider limits
- Check spam/junk folders
- Test with different email addresses

### **Issue 2: Users not stored in database**
**Solution:**
- Verify the trigger function is active:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  ```
- Check RLS policies are enabled
- Verify table permissions

### **Issue 3: Verification links not working**
**Solution:**
- Check Site URL configuration
- Verify redirect URLs are correct
- Ensure HTTPS is used in production

### **Issue 4: Rate limiting issues**
**Solution:**
- Increase rate limits in Supabase settings
- Implement exponential backoff
- Use professional email service

---

## **🔍 Step 6: Monitor Email System**

### **Check Email Logs:**
```sql
-- View recent email verification attempts
SELECT 
    evl.*,
    u.email 
FROM email_verification_logs evl
JOIN auth.users u ON evl.user_id = u.id
ORDER BY evl.sent_at DESC
LIMIT 20;

-- Check user registration success rate
SELECT 
    COUNT(*) as total_registrations,
    COUNT(verification_completed_at) as verified_registrations,
    ROUND(
        COUNT(verification_completed_at)::numeric / COUNT(*)::numeric * 100, 
        2
    ) as verification_rate_percent
FROM user_registration_events
WHERE created_at >= NOW() - INTERVAL '7 days';
```

### **Monitor Key Metrics:**
- Email delivery success rate
- Verification completion rate
- Time to verification
- Email bounce rates

---

## **✅ Verification Checklist**

**Before going live, ensure:**
- [ ] Email templates are customized
- [ ] SMTP provider is configured
- [ ] Site URL is set correctly
- [ ] Database schema is updated
- [ ] Triggers are working
- [ ] Test emails are received
- [ ] Verification links work
- [ ] Users are stored in database
- [ ] Rate limits are appropriate
- [ ] Monitoring is in place

---

## **🆘 Need Help?**

**If emails still aren't working:**

1. **Check Supabase Logs:**
   - Go to Logs → Auth logs
   - Look for email-related errors

2. **Verify Database Functions:**
   ```sql
   SELECT proname FROM pg_proc WHERE proname LIKE '%email%';
   ```

3. **Test Direct Database Insert:**
   ```sql
   SELECT handle_new_user_registration();
   ```

4. **Contact Support:**
   - Supabase Discord: https://discord.supabase.com
   - GitHub Issues: https://github.com/supabase/supabase/issues

---

**🎉 Once configured, your Digital Footprint Eraser will have:**
- ✅ **Automatic email verification**
- ✅ **Proper user database storage**
- ✅ **Professional email templates**
- ✅ **Comprehensive logging**
- ✅ **Enterprise-grade reliability**

**Your privacy platform is now production-ready with full email verification!** 🛡️
