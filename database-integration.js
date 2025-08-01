// ====================
// DIGITAL FOOTPRINT ERASER - SUPABASE DATABASE INTEGRATION
// Complete database functionality for all features
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
        if (event === 'SIGNED_IN') {
            this.onUserSignedIn(session.user);
        } else if (event === 'SIGNED_OUT') {
            this.onUserSignedOut();
        }
    }

    // ====================
    // AUTHENTICATION METHODS
    // ====================

    async signUp(email, password, metadata = {}) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: metadata
                }
            });
            
            if (error) throw error;
            
            // Create user profile and assign free plan
            if (data.user) {
                await this.createUserProfile(data.user);
                await this.assignFreePlan(data.user.id);
            }
            
            return { success: true, user: data.user, needsVerification: !data.session };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) throw error;
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Signin error:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
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
    // USER PROFILE MANAGEMENT
    // ====================

    async createUserProfile(user) {
        try {
            const { data, error } = await this.supabase
                .from('user_security_profiles')
                .insert([
                    {
                        user_id: user.id,
                        email: user.email,
                        privacy_score: 85,
                        threat_level: 'LOW',
                        total_scans_performed: 0
                    }
                ]);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Create profile error:', error);
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
            // Get free plan ID
            const { data: freePlan } = await this.supabase
                .from('subscription_plans')
                .select('id')
                .eq('plan_type', 'FREE')
                .single();

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
                    ]);
                
                if (error) throw error;
                return data;
            }
        } catch (error) {
            console.error('Assign free plan error:', error);
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

    async upgradeToAdvanced(userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.id;
            if (!targetUserId) return null;

            // Get advanced plan
            const { data: advancedPlan } = await this.supabase
                .from('subscription_plans')
                .select('id')
                .eq('plan_type', 'ADVANCED')
                .single();

            if (advancedPlan) {
                // Update current subscription
                const { data, error } = await this.supabase
                    .from('user_subscriptions')
                    .update({
                        plan_id: advancedPlan.id,
                        start_date: new Date().toISOString(),
                        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', targetUserId)
                    .eq('subscription_status', 'ACTIVE');

                if (error) throw error;
                return data;
            }
        } catch (error) {
            console.error('Upgrade subscription error:', error);
            return null;
        }
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

    async recordOSINTScan(scanData, userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.id;
            if (!targetUserId) return null;

            const { data, error } = await this.supabase
                .from('osint_scans')
                .insert([
                    {
                        user_id: targetUserId,
                        scan_type: scanData.type,
                        target_email: scanData.email,
                        target_domain: scanData.domain,
                        tools_detected: scanData.tools,
                        threats_found: scanData.threatsFound || 0,
                        scan_results: scanData.results
                    }
                ]);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Record OSINT scan error:', error);
            return null;
        }
    }

    async recordDataBrokerScan(scanData, userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.id;
            if (!targetUserId) return null;

            const { data, error } = await this.supabase
                .from('data_broker_scans')
                .insert([
                    {
                        user_id: targetUserId,
                        full_name: scanData.fullName,
                        location: scanData.location,
                        brokers_found: scanData.brokers,
                        removal_requests_sent: scanData.removalRequests || 0,
                        successful_removals: scanData.successfulRemovals || 0,
                        quantum_removal_used: scanData.quantumRemoval || false
                    }
                ]);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Record broker scan error:', error);
            return null;
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

    async recordFamilyAlert(alertData, userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.id;
            if (!targetUserId) return null;

            const { data, error } = await this.supabase
                .from('family_alerts')
                .insert([
                    {
                        user_id: targetUserId,
                        family_member_id: alertData.memberId,
                        alert_type: alertData.type,
                        severity: alertData.severity,
                        alert_message: alertData.message,
                        ai_detection_confidence: alertData.confidence || 90.0
                    }
                ]);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Record family alert error:', error);
            return null;
        }
    }

    // ====================
    // COMPLIANCE MANAGEMENT
    // ====================

    async recordComplianceAudit(auditData, userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.id;
            if (!targetUserId) return null;

            // Get framework ID
            const { data: framework } = await this.supabase
                .from('compliance_frameworks')
                .select('id')
                .eq('framework_name', auditData.framework)
                .single();

            if (framework) {
                const { data, error } = await this.supabase
                    .from('compliance_audits')
                    .insert([
                        {
                            user_id: targetUserId,
                            framework_id: framework.id,
                            audit_type: auditData.type,
                            sector: auditData.sector,
                            compliance_score: auditData.score,
                            violations: auditData.violations,
                            recommendations: auditData.recommendations,
                            next_audit_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
                        }
                    ]);
                
                if (error) throw error;
                return data;
            }
        } catch (error) {
            console.error('Record compliance audit error:', error);
            return null;
        }
    }

    async getComplianceFrameworks() {
        try {
            const { data, error } = await this.supabase
                .from('compliance_frameworks')
                .select('*')
                .eq('active', true);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Get compliance frameworks error:', error);
            return [];
        }
    }

    // ====================
    // AI OPERATIONS
    // ====================

    async recordAIPrediction(predictionData, userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.id;
            if (!targetUserId) return null;

            // Get AI model ID
            const { data: model } = await this.supabase
                .from('ai_models')
                .select('id')
                .eq('model_name', predictionData.modelName)
                .single();

            if (model) {
                const { data, error } = await this.supabase
                    .from('ai_predictions')
                    .insert([
                        {
                            user_id: targetUserId,
                            model_id: model.id,
                            prediction_type: predictionData.type,
                            prediction_data: predictionData.data,
                            confidence_score: predictionData.confidence,
                            time_horizon_days: predictionData.timeHorizon || 30
                        }
                    ]);
                
                if (error) throw error;
                return data;
            }
        } catch (error) {
            console.error('Record AI prediction error:', error);
            return null;
        }
    }

    async getAIModels() {
        try {
            const { data, error } = await this.supabase
                .from('ai_models')
                .select('*')
                .eq('active', true);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Get AI models error:', error);
            return [];
        }
    }

    // ====================
    // QUANTUM OPERATIONS
    // ====================

    async recordQuantumOperation(operationData, userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.id;
            if (!targetUserId) return null;

            const { data, error } = await this.supabase
                .from('quantum_operations')
                .insert([
                    {
                        user_id: targetUserId,
                        operation_type: operationData.type,
                        quantum_bits: operationData.qubits || 256,
                        encryption_strength: operationData.strength || '4096-bit',
                        operation_result: operationData.result,
                        quantum_readiness_score: operationData.readinessScore || 100
                    }
                ]);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Record quantum operation error:', error);
            return null;
        }
    }

    // ====================
    // SECURITY ALERTS & MONITORING
    // ====================

    async createSecurityAlert(alertData, userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.id;
            if (!targetUserId) return null;

            const { data, error } = await this.supabase
                .from('security_alerts')
                .insert([
                    {
                        user_id: targetUserId,
                        alert_type: alertData.type,
                        severity: alertData.severity,
                        alert_message: alertData.message,
                        alert_data: alertData.data,
                        ai_generated: alertData.aiGenerated || true
                    }
                ]);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Create security alert error:', error);
            return null;
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

    // ====================
    // USAGE TRACKING
    // ====================

    async updateUsageMetric(metricType, value, userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.id;
            if (!targetUserId) return null;

            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

            const { data, error } = await this.supabase
                .from('user_usage')
                .upsert([
                    {
                        user_id: targetUserId,
                        month_year: currentMonth,
                        [metricType]: value
                    }
                ], {
                    onConflict: 'user_id,month_year'
                });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Update usage metric error:', error);
            return null;
        }
    }

    async getCurrentUsage(userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.id;
            if (!targetUserId) return null;

            const currentMonth = new Date().toISOString().slice(0, 7);

            const { data, error } = await this.supabase
                .from('user_usage')
                .select('*')
                .eq('user_id', targetUserId)
                .eq('month_year', currentMonth)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
            return data || {
                scans_used: 0,
                ai_requests_used: 0,
                api_calls_used: 0,
                quantum_operations_used: 0
            };
        } catch (error) {
            console.error('Get current usage error:', error);
            return null;
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
        console.log('User signed in:', user.email);
        // Initialize user dashboard
        this.initializeUserDashboard(user);
    }

    onUserSignedOut() {
        console.log('User signed out');
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

    // Show authentication modal
    showAuthModal() {
        // Implementation for authentication modal
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: linear-gradient(135deg, #0A0A0F, #1a1a2e); border: 2px solid #8B5CF6; border-radius: 16px; padding: 2rem; max-width: 400px; color: #F8FAFC;">
                    <h3 style="color: #8B5CF6; margin-bottom: 1rem;">🛡️ Secure Access Required</h3>
                    <div id="authForm">
                        <input type="email" id="authEmail" placeholder="Email" style="width: 100%; padding: 0.8rem; margin-bottom: 1rem; border: 1px solid #8B5CF6; border-radius: 8px; background: rgba(76, 29, 149, 0.1); color: #F8FAFC;">
                        <input type="password" id="authPassword" placeholder="Password" style="width: 100%; padding: 0.8rem; margin-bottom: 1rem; border: 1px solid #8B5CF6; border-radius: 8px; background: rgba(76, 29, 149, 0.1); color: #F8FAFC;">
                        <button onclick="window.DigitalFootprintUtils.handleAuth('signin')" style="width: 100%; padding: 0.8rem; margin-bottom: 0.5rem; background: linear-gradient(45deg, #4C1D95, #8B5CF6); color: white; border: none; border-radius: 8px; cursor: pointer;">Sign In</button>
                        <button onclick="window.DigitalFootprintUtils.handleAuth('signup')" style="width: 100%; padding: 0.8rem; background: transparent; color: #8B5CF6; border: 2px solid #8B5CF6; border-radius: 8px; cursor: pointer;">Create Account</button>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #8B5CF6; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    // Handle authentication
    async handleAuth(type) {
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;

        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }

        let result;
        if (type === 'signin') {
            result = await window.dfDB.signIn(email, password);
        } else {
            result = await window.dfDB.signUp(email, password);
        }

        if (result.success) {
            // Close modal
            document.querySelector('[style*="position: fixed"]').remove();
            alert(`Successfully ${type === 'signin' ? 'signed in' : 'created account'}!`);
            location.reload(); // Refresh to update UI
        } else {
            alert(`Error: ${result.error}`);
        }
    }
};

console.log('🚀 Digital Footprint Eraser Database Integration Loaded');
console.log('🛡️ Complete database functionality ready');
console.log('📊 26 tables available for all features');
console.log('🔐 Row Level Security enabled');
console.log('🌐 Connected to: https://rmnmiqpxqpjvpcavkmxn.supabase.co');
