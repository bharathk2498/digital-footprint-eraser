-- ====================
-- DIGITAL FOOTPRINT ERASER - ENHANCED DATABASE SCHEMA
-- Updated schema with email verification support
-- ====================

-- Update user_security_profiles table to include email verification fields
ALTER TABLE user_security_profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS registration_ip_address INET,
ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP WITH TIME ZONE;

-- Update subscription_plans table to ensure we have free plan
INSERT INTO subscription_plans (plan_name, plan_type, monthly_price, features, active) 
VALUES (
    'Free Plan',
    'FREE',
    0.00,
    jsonb_build_object(
        'scans_per_month', 10,
        'basic_tools', true,
        'email_support', true,
        'family_members', 0,
        'ai_features', false,
        'quantum_protection', false
    ),
    true
) ON CONFLICT (plan_type) DO UPDATE SET
    plan_name = EXCLUDED.plan_name,
    features = EXCLUDED.features,
    active = EXCLUDED.active;

-- Create email_verification_logs table
CREATE TABLE IF NOT EXISTS email_verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_address TEXT NOT NULL,
    verification_type TEXT NOT NULL CHECK (verification_type IN ('SIGNUP', 'RESEND', 'PASSWORD_RESET')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_token TEXT,
    attempts INTEGER DEFAULT 1,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policy for email_verification_logs
ALTER TABLE email_verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email verification logs" ON email_verification_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert email verification logs" ON email_verification_logs
    FOR INSERT WITH CHECK (true);

-- Create user_registration_events table
CREATE TABLE IF NOT EXISTS user_registration_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_address TEXT NOT NULL,
    registration_source TEXT DEFAULT 'WEB',
    registration_ip INET,
    user_agent TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_completed_at TIMESTAMP WITH TIME ZONE,
    first_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policy for user_registration_events
ALTER TABLE user_registration_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own registration events" ON user_registration_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert registration events" ON user_registration_events
    FOR INSERT WITH CHECK (true);

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user_registration()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into user_security_profiles
    INSERT INTO user_security_profiles (
        user_id,
        email,
        privacy_score,
        threat_level,
        total_scans_performed,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        85,
        'LOW',
        0,
        NEW.email_confirmed_at IS NOT NULL,
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        email_verified = NEW.email_confirmed_at IS NOT NULL,
        updated_at = NOW();

    -- Log registration event
    INSERT INTO user_registration_events (
        user_id,
        email_address,
        email_verified,
        verification_completed_at,
        created_at
    ) VALUES (
        NEW.id,
        NEW.email,
        NEW.email_confirmed_at IS NOT NULL,
        NEW.email_confirmed_at,
        NOW()
    ) ON CONFLICT DO NOTHING;

    -- Assign free plan if user doesn't have one
    INSERT INTO user_subscriptions (
        user_id,
        plan_id,
        subscription_status,
        start_date,
        created_at
    )
    SELECT 
        NEW.id,
        sp.id,
        'ACTIVE',
        NOW(),
        NOW()
    FROM subscription_plans sp
    WHERE sp.plan_type = 'FREE'
    AND NOT EXISTS (
        SELECT 1 FROM user_subscriptions us 
        WHERE us.user_id = NEW.id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_registration();

-- Create function to log email verification attempts
CREATE OR REPLACE FUNCTION log_email_verification_attempt(
    p_user_id UUID,
    p_email TEXT,
    p_verification_type TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO email_verification_logs (
        user_id,
        email_address,
        verification_type,
        ip_address,
        user_agent,
        sent_at
    ) VALUES (
        p_user_id,
        p_email,
        p_verification_type,
        p_ip_address,
        p_user_agent,
        NOW()
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark email as verified
CREATE OR REPLACE FUNCTION mark_email_verified(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update user security profile
    UPDATE user_security_profiles 
    SET 
        email_verified = TRUE,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Update registration event
    UPDATE user_registration_events 
    SET 
        email_verified = TRUE,
        verification_completed_at = NOW()
    WHERE user_id = p_user_id AND verification_completed_at IS NULL;
    
    -- Update latest verification log
    UPDATE email_verification_logs 
    SET verified_at = NOW()
    WHERE user_id = p_user_id 
    AND verified_at IS NULL
    AND id = (
        SELECT id FROM email_verification_logs 
        WHERE user_id = p_user_id 
        ORDER BY sent_at DESC 
        LIMIT 1
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_verification_logs_user_id ON email_verification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_logs_sent_at ON email_verification_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_registration_events_user_id ON user_registration_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_registration_events_created_at ON user_registration_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_security_profiles_email_verified ON user_security_profiles(email_verified);

-- Update existing users to have email_verified status
UPDATE user_security_profiles 
SET email_verified = TRUE 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email_confirmed_at IS NOT NULL
);

-- Create view for user dashboard data
CREATE OR REPLACE VIEW user_dashboard_view AS
SELECT 
    usp.user_id,
    usp.email,
    usp.privacy_score,
    usp.threat_level,
    usp.total_scans_performed,
    usp.email_verified,
    usp.last_login,
    usp.created_at as profile_created_at,
    us.subscription_status,
    sp.plan_name,
    sp.plan_type,
    sp.features as plan_features,
    (SELECT COUNT(*) FROM threat_detections td WHERE td.user_id = usp.user_id) as total_threats_detected,
    (SELECT COUNT(*) FROM family_protection fp WHERE fp.user_id = usp.user_id) as family_members_protected,
    (SELECT COUNT(*) FROM security_alerts sa WHERE sa.user_id = usp.user_id AND sa.status = 'ACTIVE') as active_alerts
FROM user_security_profiles usp
LEFT JOIN user_subscriptions us ON usp.user_id = us.user_id AND us.subscription_status = 'ACTIVE'
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id;

-- Grant access to the view
GRANT SELECT ON user_dashboard_view TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Users can view their own dashboard data" ON user_dashboard_view
    FOR SELECT USING (auth.uid() = user_id);

COMMENT ON TABLE email_verification_logs IS 'Logs all email verification attempts and completions';
COMMENT ON TABLE user_registration_events IS 'Tracks user registration events and verification status';
COMMENT ON FUNCTION handle_new_user_registration() IS 'Automatically creates user profile and assigns free plan on registration';
COMMENT ON FUNCTION log_email_verification_attempt(UUID, TEXT, TEXT, INET, TEXT) IS 'Logs email verification attempts';
COMMENT ON FUNCTION mark_email_verified(UUID) IS 'Marks user email as verified across all relevant tables';
COMMENT ON VIEW user_dashboard_view IS 'Comprehensive user dashboard data view';
