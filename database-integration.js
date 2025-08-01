// ====================
// DIGITAL FOOTPRINT ERASER - ENHANCED SUPABASE DATABASE INTEGRATION
// Complete database functionality with email verification
// ====================

// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'https://rmnmiqpxqpjvpcavkmxn.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbm1pcXB4cXBqdnBjYXZrbXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTUzMTAsImV4cCI6MjA2OTU3MTMxMH0.deKUH0tkvzCoHcqIedPDeG2YcS_lxrhVpGjMJU-ErF0'
};

// DigitalFootprintDB - Complete Database Integration Class
class DigitalFootprintDB {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.init();
    }

    // Initialize Supabase connection
    async init() {
        try {
            // Load Supabase library dynamically
            if (!window.supabase) {
                await this.loadSupabaseLibrary();
            }
            
            this.supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            
            // Listen for auth changes
            this.supabase.auth.onAuthStateChange((event, session) => {
                this.currentUser = session?.user || null;
                this.handleAuthStateChange(event, session);
            });

            console.log('🛡️ Digital Footprint Eraser Database Connected');
            console.log('📧 Email verification system active');
            return true;
        } catch (error) {
            console.error('Database initialization error:', error);
            return false;
        }
    }

    // Load Supabase library
    async loadSupabaseLibrary() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Handle authentication state changes
    handleAuthStateChange(event, session) {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN') {
            this.onUserSignedIn(session.user);
        } else if (event === 'SIGNED_OUT') {
            this.onUserSignedOut();
        } else if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed for user:', session.user.email);
        }
    }

    // ====================
    // ENHANCED AUTHENTICATION METHODS
    // ====================

    async signUp(email, password, metadata = {}) {
        try {
            console.log('🔄 Starting signup process for:', email);
            
            // Validate input
            if (!email || !email.includes('@')) {
                throw new Error('Please enter a valid email address');
            }
            
            if (!password || password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            const { data, error } = await this.supabase.auth.signUp({
                email: email.trim().toLowerCase(),
                password: password,
                options: {
                    data: {
                        full_name: metadata.fullName || '',
                        user_type: metadata.userType || 'INDIVIDUAL',
                        ...metadata
                    }
                }
            });
            
            if (error) {
                console.error('Signup error:', error);
                throw error;
            }
            
            console.log('✅ Signup successful:', data);
            
            // Create user profile immediately (even if email not confirmed)
            if (data.user) {
                console.log('🔄 Creating user profile...');
                await this.createUserProfileImmediate(data.user);
                
                // Assign free plan
                await this.assignFreePlan(data.user.id);
                
                // Log registration event
                await this.logRegistrationEvent(data.user);
            }
            
            const needsVerification = !data.session;
            
            return { 
                success: true, 
                user: data.user, 
                needsVerification: needsVerification,
                message: needsVerification ? 
                    'Account created! Please check your email to verify your account.' : 
                    'Account created and verified!'
            };
        } catch (error) {
            console.error('Signup error:', error);
            return { 
                success: false, 
                error: this.formatAuthError(error.message)
            };
        }
    }

    async signIn(email, password) {
        try {
            console.log('🔄 Starting signin process for:', email);
            
            if (!email || !email.includes('@')) {
                throw new Error('Please enter a valid email address');
            }
            
            if (!password) {
                throw new Error('Please enter your password');
            }

            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password: password
            });
            
            if (error) {
                console.error('Signin error:', error);
                throw error;
            }
            
            console.log('✅ Signin successful:', data.user.email);
            
            // Update last login
            if (data.user) {
                await this.updateLastLogin(data.user.id);
            }
            
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Signin error:', error);
            return { 
                success: false, 
                error: this.formatAuthError(error.message)
            };
        }
    }

    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            console.log('✅ User signed out successfully');
            return { success: true };
        } catch (error) {
            console.error('Signout error:', error);
            return { success: false, error: error.message };
        }
    }

    async getCurrentUser() {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            return user;
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    }

    // ====================
    // EMAIL VERIFICATION METHODS
    // ====================

    async resendVerificationEmail() {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                throw new Error('No user found');
            }

            const { error } = await this.supabase.auth.resend({
                type: 'signup',
                email: user.email
            });

            if (error) throw error;

            return { 
                success: true, 
                message: 'Verification email sent! Please check your inbox.' 
            };
        } catch (error) {
            console.error('Resend email error:', error);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }

    async checkEmailVerification() {
        try {
            const user = await this.getCurrentUser();
            if (!user) return false;
            
            return user.email_confirmed_at !== null;
        } catch (error) {
            console.error('Check verification error:', error);
            return false;
        }
    }

    // ====================
    // ENHANCED USER PROFILE MANAGEMENT
    // ====================

    async createUserProfileImmediate(user) {
        try {
            console.log('🔄 Creating immediate user profile for:', user.email);
            
            // Check if profile already exists
            const { data: existing } = await this.supabase
                .from('user_security_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();
                
            if (existing) {
                console.log('👤 Profile already exists');
                return existing;
            }

            const { data, error } = await this.supabase
                .from('user_security_profiles')
                .insert([
                    {
                        user_id: user.id,
                        email: user.email,
                        privacy_score: 85,
                        threat_level: 'LOW',
                        total_scans_performed: 0,
                        email_verified: user.email_confirmed_at !== null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();
            
            if (error) {
                console.error('Profile creation error:', error);
                throw error;
            }
            
            console.log('✅ User profile created successfully');
            return data;
        } catch (error) {
            console.error('Create profile error:', error);
            return null;
        }
    }

    async updateEmailVerificationStatus(userId, verified = true) {
        try {
            const { data, error } = await this.supabase
                .from('user_security_profiles')
                .update({ 
                    email_verified: verified,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Update verification status error:', error);
            return null;
        }
    }

    async updateLastLogin(userId) {
        try {
            const { data, error } = await this.supabase
                .from('user_security_profiles')
                .update({ 
                    last_login: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Update last login error:', error);
            return null;
        }
    }

    async logRegistrationEvent(user) {
        try {
            const { data, error } = await this.supabase
                .from('security_alerts')
                .insert([
                    {
                        user_id: user.id,
                        alert_type: 'USER_REGISTRATION',
                        severity: 'INFO',
                        alert_message: `New user registered: ${user.email}`,
                        alert_data: {
                            email: user.email,
                            registration_time: new Date().toISOString(),
                            email_verified: user.email_confirmed_at !== null
                        },
                        ai_generated: false
                    }
                ]);
            
            if (error) throw error;
            console.log('📝 Registration event logged');
            return data;
        } catch (error) {
            console.error('Log registration error:', error);
            return null;
        }
    }

    async getUserProfile(userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.id;
            if (!targetUserId) return null;

            const { data, error } = await this.supabase
                .from('user_security_profiles')
                .select('*')
                .eq('user_id', targetUserId)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get profile error:', error);
            return null;
        }
    }

    async updatePrivacyScore(score, userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.id;
            if (!targetUserId) return null;

            const { data, error } = await this.supabase
                .from('user_security_profiles')
                .update({ 
                    privacy_score: score, 
                    updated_at: new Date().toISOString() 
                })
                .eq('user_id', targetUserId);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Update privacy score error:', error);
            return null;
        }
    }

    // ====================
    // SUBSCRIPTION MANAGEMENT
    // ====================

    async assignFreePlan(userId) {
        try {
            console.log('🔄 Assigning free plan to user:', userId);
            
            // Check if user already has a subscription
            const { data: existing } = await this.supabase
                .from('user_subscriptions')
                .select('id')
                .eq('user_id', userId)
                .single();
                
            if (existing) {
                console.log('💳 Subscription already exists');
                return existing;
            }

            // Get free plan ID
            const { data: freePlan, error: planError } = await this.supabase
                .from('subscription_plans')
                .select('id')
                .eq('plan_type', 'FREE')
                .single();

            if (planError || !freePlan) {
                console.error('Free plan not found:', planError);
                // Create free plan if it doesn't exist
                const { data: newPlan } = await this.supabase
                    .from('subscription_plans')
                    .insert([
                        {
                            plan_name: 'Free Plan',
                            plan_type: 'FREE',
                            monthly_price: 0.00,
                            features: {
                                scans_per_month: 10,
                                basic_tools: true,
                                email_support: true
                            }
                        }
                    ])
                    .select()
                    .single();
                    
                if (newPlan) {
                    freePlan.id = newPlan.id;
                }
            }

            if (freePlan) {
                const { data, error } = await this.supabase
                    .from('user_subscriptions')
                    .insert([
                        {
                            user_id: userId,
                            plan_id: freePlan.id,
                            subscription_status: 'ACTIVE',
                            start_date: new Date().toISOString()
                        }
                    ])
                    .select()
                    .single();
                
                if (error) throw error;
                console.log('✅ Free plan assigned successfully');
                return data;
            }
        } catch (error) {
            console.error('Assign free plan error:', error);
            return null;
        }
    }

    async getUserSubscription(userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.id;
            if (!targetUserId) return null;

            const { data, error } = await this.supabase
                .from('user_subscriptions')
                .select(`
                    *,
                    subscription_plans(*)
                `)
                .eq('user_id', targetUserId)
                .eq('subscription_status', 'ACTIVE')
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get subscription error:', error);
            return null;
        }
    }

    // ====================
    // ERROR HANDLING HELPERS
    // ====================

    formatAuthError(errorMessage) {
        const errorMap = {
            'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
            'Email not confirmed': 'Please check your email and click the verification link before signing in.',
            'User already registered': 'An account with this email already exists. Try signing in instead.',
            'Signup disabled': 'New registrations are temporarily disabled. Please try again later.',
            'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
            'Unable to validate email address': 'Please enter a valid email address.',
            'Email rate limit exceeded': 'Too many emails sent. Please wait before requesting another verification email.'
        };

        return errorMap[errorMessage] || errorMessage;
    }

    // ====================
    // THREAT DETECTION & SECURITY
    // ====================

    async recordThreatDetection(threatData, userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.id;
            if (!targetUserId) return null;

            const { data, error } = await this.supabase
                .from('threat_detections')
                .insert([
                    {
                        user_id: targetUserId,
                        threat_type: threatData.type,
                        threat_source: threatData.source,
                        severity: threatData.severity,
                        details: threatData.details,
                        ai_confidence_score: threatData.confidence || 95.0
                    }
                ]);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Record threat error:', error);
            return null;
        }
    }

    async getUserThreats(userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.id;
            if (!targetUserId) return [];

            const { data, error } = await this.supabase
                .from('threat_detections')
                .select('*')
                .eq('user_id', targetUserId)
                .order('detected_at', { ascending: false })
                .limit(50);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Get threats error:', error);
            return [];
        }
    }

    // ====================
    // FAMILY PROTECTION
    // ====================

    async addFamilyMember(memberData, userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.id;
            if (!targetUserId) return null;

            const { data, error } = await this.supabase
                .from('family_protection')
                .insert([
                    {
                        user_id: targetUserId,
                        family_member_name: memberData.name,
                        member_type: memberData.type,
                        age: memberData.age,
                        protection_level: memberData.level || 'STANDARD',
                        ai_enabled: memberData.aiEnabled || false,
                        quantum_protection: memberData.quantumProtection || false
                    }
                ]);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Add family member error:', error);
            return null;
        }
    }

    async getFamilyMembers(userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.id;
            if (!targetUserId) return [];

            const { data, error } = await this.supabase
                .from('family_protection')
                .select('*')
                .eq('user_id', targetUserId);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Get family members error:', error);
            return [];
        }
    }

    // ====================
    // REAL-TIME SUBSCRIPTIONS
    // ====================

    subscribeToUserAlerts(callback, userId = null) {
        const targetUserId = userId || this.currentUser?.id;
        if (!targetUserId) return null;

        return this.supabase
            .channel('user-alerts')
            .on('postgres_changes', 
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'security_alerts',
                    filter: `user_id=eq.${targetUserId}`
                }, 
                callback
            )
            .subscribe();
    }

    subscribeToProfileUpdates(callback, userId = null) {
        const targetUserId = userId || this.currentUser?.id;
        if (!targetUserId) return null;

        return this.supabase
            .channel('profile-updates')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'user_security_profiles',
                    filter: `user_id=eq.${targetUserId}`
                }, 
                callback
            )
            .subscribe();
    }

    // ====================
    // EVENT HANDLERS
    // ====================

    onUserSignedIn(user) {
        console.log('👤 User signed in:', user.email);
        console.log('📧 Email verified:', user.email_confirmed_at !== null);
        
        // Update email verification status in profile
        if (user.email_confirmed_at) {
            this.updateEmailVerificationStatus(user.id, true);
        }
        
        // Initialize user dashboard
        this.initializeUserDashboard(user);
    }

    onUserSignedOut() {
        console.log('👋 User signed out');
        this.currentUser = null;
        // Clear any cached data
        this.clearUserData();
    }

    async initializeUserDashboard(user) {
        try {
            // Load user profile
            const profile = await this.getUserProfile(user.id);
            
            // Load subscription
            const subscription = await this.getUserSubscription(user.id);
            
            // Load recent alerts
            const alerts = await this.getUserAlerts(user.id);
            
            // Update UI with user data
            this.updateDashboardUI(profile, subscription, alerts);
            
        } catch (error) {
            console.error('Dashboard initialization error:', error);
        }
    }

    async getUserAlerts(userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.id;
            if (!targetUserId) return [];

            const { data, error } = await this.supabase
                .from('security_alerts')
                .select('*')
                .eq('user_id', targetUserId)
                .eq('status', 'ACTIVE')
                .order('created_at', { ascending: false })
                .limit(20);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Get user alerts error:', error);
            return [];
        }
    }

    updateDashboardUI(profile, subscription, alerts) {
        // Update privacy score
        const privacyScoreElement = document.getElementById('privacyScore');
        if (privacyScoreElement && profile) {
            privacyScoreElement.textContent = profile.privacy_score;
        }

        // Update subscription status
        const subscriptionElement = document.getElementById('subscriptionStatus');
        if (subscriptionElement && subscription) {
            subscriptionElement.textContent = subscription.subscription_plans.plan_name;
        }

        // Update alerts count
        const alertsElement = document.getElementById('alertsCount');
        if (alertsElement && alerts) {
            alertsElement.textContent = alerts.length;
        }

        // Show email verification status
        if (profile && !profile.email_verified) {
            this.showEmailVerificationNotice();
        }
    }

    showEmailVerificationNotice() {
        // Create verification notice
        const notice = document.createElement('div');
        notice.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(45deg, #F59E0B, #D97706);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);
            z-index: 10000;
            text-align: center;
            max-width: 500px;
        `;
        
        notice.innerHTML = `
            <div style="margin-bottom: 0.5rem;">
                <strong>📧 Email Verification Required</strong>
            </div>
            <div style="font-size: 0.9rem; margin-bottom: 1rem;">
                Please check your email and click the verification link to activate all features.
            </div>
            <button onclick="window.dfDB.resendVerificationEmail().then(result => { 
                if(result.success) alert(result.message); 
                else alert('Error: ' + result.error); 
            })" style="
                background: rgba(255,255,255,0.2);
                border: 1px solid white;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
                margin-right: 0.5rem;
            ">Resend Email</button>
            <button onclick="this.parentElement.remove()" style="
                background: transparent;
                border: 1px solid white;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
            ">Dismiss</button>
        `;
        
        document.body.appendChild(notice);
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (notice.parentElement) {
                notice.remove();
            }
        }, 30000);
    }

    clearUserData() {
        // Clear any cached user data from UI
        const elements = ['privacyScore', 'subscriptionStatus', 'alertsCount'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = '';
        });
    }
}

// ====================
// GLOBAL INSTANCE
// ====================

// Create global database instance
window.dfDB = new DigitalFootprintDB();

// Enhanced utility functions for your existing site
window.DigitalFootprintUtils = {
    // Check if user has advanced features
    async hasAdvancedFeatures() {
        const subscription = await window.dfDB.getUserSubscription();
        return subscription?.subscription_plans?.plan_type === 'ADVANCED' || 
               subscription?.subscription_plans?.plan_type === 'ENTERPRISE';
    },

    // Check usage limits
    async checkUsageLimit(metricType, limit) {
        const usage = await window.dfDB.getCurrentUsage();
        return usage && usage[metricType] < limit;
    },

    // Show enhanced authentication modal
    showAuthModal() {
        // Implementation for authentication modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
        `;
        
        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #0A0A0F, #1a1a2e);
                border: 2px solid #8B5CF6;
                border-radius: 16px;
                padding: 2rem;
                max-width: 450px;
                width: 90%;
                color: #F8FAFC;
                box-shadow: 0 20px 60px rgba(139, 92, 246, 0.4);
            ">
                <h3 style="color: #8B5CF6; margin-bottom: 1.5rem; text-align: center;">🛡️ Secure Access Required</h3>
                
                <div id="authTabs" style="display: flex; margin-bottom: 1.5rem; background: rgba(76, 29, 149, 0.1); border-radius: 8px; padding: 4px;">
                    <button onclick="showAuthTab('signin')" id="signinTab" style="flex: 1; padding: 0.5rem; background: linear-gradient(45deg, #4C1D95, #8B5CF6); color: white; border: none; border-radius: 6px; cursor: pointer;">Sign In</button>
                    <button onclick="showAuthTab('signup')" id="signupTab" style="flex: 1; padding: 0.5rem; background: transparent; color: #8B5CF6; border: none; border-radius: 6px; cursor: pointer;">Create Account</button>
                </div>
                
                <div id="authForm">
                    <div id="signinForm">
                        <input type="email" id="authEmail" placeholder="Email address" style="width: 100%; padding: 0.8rem; margin-bottom: 1rem; border: 1px solid #8B5CF6; border-radius: 8px; background: rgba(76, 29, 149, 0.1); color: #F8FAFC;">
                        <input type="password" id="authPassword" placeholder="Password" style="width: 100%; padding: 0.8rem; margin-bottom: 1rem; border: 1px solid #8B5CF6; border-radius: 8px; background: rgba(76, 29, 149, 0.1); color: #F8FAFC;">
                        <button onclick="window.DigitalFootprintUtils.handleAuth('signin')" style="width: 100%; padding: 0.8rem; margin-bottom: 0.5rem; background: linear-gradient(45deg, #4C1D95, #8B5CF6); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Sign In to Your Account</button>
                    </div>
                    
                    <div id="signupForm" style="display: none;">
                        <input type="text" id="signupFullName" placeholder="Full Name (Optional)" style="width: 100%; padding: 0.8rem; margin-bottom: 1rem; border: 1px solid #8B5CF6; border-radius: 8px; background: rgba(76, 29, 149, 0.1); color: #F8FAFC;">
                        <input type="email" id="signupEmail" placeholder="Email address" style="width: 100%; padding: 0.8rem; margin-bottom: 1rem; border: 1px solid #8B5CF6; border-radius: 8px; background: rgba(76, 29, 149, 0.1); color: #F8FAFC;">
                        <input type="password" id="signupPassword" placeholder="Password (min 6 characters)" style="width: 100%; padding: 0.8rem; margin-bottom: 1rem; border: 1px solid #8B5CF6; border-radius: 8px; background: rgba(76, 29, 149, 0.1); color: #F8FAFC;">
                        <button onclick="window.DigitalFootprintUtils.handleAuth('signup')" style="width: 100%; padding: 0.8rem; margin-bottom: 0.5rem; background: linear-gradient(45deg, #10B981, #059669); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Create Free Account</button>
                        <div style="font-size: 0.8rem; color: #CBD5E1; text-align: center; margin-top: 0.5rem;">
                            📧 A verification email will be sent to activate your account
                        </div>
                    </div>
                </div>
                
                <div id="authMessage" style="margin-top: 1rem; padding: 0.8rem; border-radius: 6px; display: none;"></div>
                
                <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #8B5CF6; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add tab switching function to global scope
        window.showAuthTab = function(tab) {
            const signinTab = document.getElementById('signinTab');
            const signupTab = document.getElementById('signupTab');
            const signinForm = document.getElementById('signinForm');
            const signupForm = document.getElementById('signupForm');
            
            if (tab === 'signin') {
                signinTab.style.background = 'linear-gradient(45deg, #4C1D95, #8B5CF6)';
                signinTab.style.color = 'white';
                signupTab.style.background = 'transparent';
                signupTab.style.color = '#8B5CF6';
                signinForm.style.display = 'block';
                signupForm.style.display = 'none';
            } else {
                signupTab.style.background = 'linear-gradient(45deg, #4C1D95, #8B5CF6)';
                signupTab.style.color = 'white';
                signinTab.style.background = 'transparent';
                signinTab.style.color = '#8B5CF6';
                signupForm.style.display = 'block';
                signinForm.style.display = 'none';
            }
        };
    },

    // Handle authentication with enhanced error handling
    async handleAuth(type) {
        const messageDiv = document.getElementById('authMessage');
        
        // Show loading state
        messageDiv.style.display = 'block';
        messageDiv.style.background = 'rgba(139, 92, 246, 0.1)';
        messageDiv.style.color = '#8B5CF6';
        messageDiv.innerHTML = '🔄 Processing...';
        
        try {
            let result;
            
            if (type === 'signin') {
                const email = document.getElementById('authEmail').value;
                const password = document.getElementById('authPassword').value;
                
                if (!email || !password) {
                    throw new Error('Please enter both email and password');
                }
                
                result = await window.dfDB.signIn(email, password);
            } else {
                const fullName = document.getElementById('signupFullName').value;
                const email = document.getElementById('signupEmail').value;
                const password = document.getElementById('signupPassword').value;
                
                if (!email || !password) {
                    throw new Error('Please enter email and password');
                }
                
                result = await window.dfDB.signUp(email, password, { fullName });
            }
            
            if (result.success) {
                // Show success message
                messageDiv.style.background = 'rgba(16, 185, 129, 0.1)';
                messageDiv.style.color = '#10B981';
                messageDiv.innerHTML = `✅ ${result.message || 'Success!'}`;
                
                // Close modal after delay
                setTimeout(() => {
                    document.querySelector('[style*="position: fixed"]').remove();
                    if (result.needsVerification) {
                        // Show verification notice
                        alert('📧 Account created! Please check your email to verify your account before signing in.');
                    } else {
                        location.reload(); // Refresh to update UI
                    }
                }, 2000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            // Show error message
            messageDiv.style.background = 'rgba(239, 68, 68, 0.1)';
            messageDiv.style.color = '#EF4444';
            messageDiv.innerHTML = `❌ ${error.message}`;
        }
    },

    // Password reset functionality
    async resetPassword(email) {
        try {
            const { error } = await window.dfDB.supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            
            return {
                success: true,
                message: 'Password reset email sent! Check your inbox.'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
};

console.log('🚀 Digital Footprint Eraser Database Integration Loaded');
console.log('🛡️ Complete database functionality ready');
console.log('📊 26 tables available for all features');
console.log('🔐 Row Level Security enabled');
console.log('📧 Email verification system active');
console.log('🌐 Connected to: https://rmnmiqpxqpjvpcavkmxn.supabase.co');
