// Fixed Database Integration for Digital Footprint Eraser
// Handles email verification issues and redirect problems

const supabaseConfig = {
    url: 'https://rmnmiqpxqpjvpcavkmxn.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbm1pcXB4cXBqdnBjYXZrbXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTUzMTAsImV4cCI6MjA2OTU3MTMxMH0.deKUH0tkvzCoHcqIedPDeG2YcS_lxrhVpGjMJU-ErF0'
};

// Initialize Supabase client with proper redirect URL
const supabase = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        redirectTo: 'https://bharathk2498.github.io/digital-footprint-eraser/'
    }
});

// Enhanced Sign Up with immediate access (no email confirmation required)
async function signUpUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: 'https://bharathk2498.github.io/digital-footprint-eraser/',
                data: {
                    email_verified: true
                }
            }
        });

        if (error) {
            if (error.message.includes('email not confirmed')) {
                // Auto sign in for unconfirmed users
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                
                if (signInData) {
                    await createUserProfile(signInData.user.id, email);
                    return { 
                        success: true, 
                        message: 'Account created! You can start using all features immediately.',
                        user: signInData.user 
                    };
                }
            }
            throw error;
        }

        // Create user profile immediately
        if (data.user) {
            await createUserProfile(data.user.id, email);
        }

        return {
            success: true,
            message: 'Account created successfully! You can start using all features immediately.',
            user: data.user
        };
    } catch (error) {
        console.error('Sign up error:', error);
        return {
            success: false,
            message: error.message || 'Failed to create account'
        };
    }
}

// Enhanced Sign In with better error handling
async function signInUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            if (error.message.includes('Email not confirmed')) {
                // Try to resend confirmation email
                await supabase.auth.resend({
                    type: 'signup',
                    email: email,
                    options: {
                        emailRedirectTo: 'https://bharathk2498.github.io/digital-footprint-eraser/'
                    }
                });
                
                return {
                    success: false,
                    message: 'Please check your email to verify your account. We just sent a new verification link.',
                    needsVerification: true
                };
            }
            throw error;
        }

        return {
            success: true,
            message: 'Signed in successfully!',
            user: data.user
        };
    } catch (error) {
        console.error('Sign in error:', error);
        return {
            success: false,
            message: error.message || 'Failed to sign in'
        };
    }
}

// Create user profile with free subscription
async function createUserProfile(userId, email) {
    try {
        // Check if profile exists
        const { data: existingProfile } = await supabase
            .from('user_security_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (existingProfile) {
            return existingProfile;
        }

        // Create new profile
        const { data: profile, error: profileError } = await supabase
            .from('user_security_profiles')
            .insert([{
                user_id: userId,
                email: email,
                privacy_score: 85,
                threat_level: 'LOW'
            }])
            .select()
            .single();

        if (profileError) throw profileError;

        // Get free plan ID
        const { data: freePlan } = await supabase
            .from('subscription_plans')
            .select('id')
            .eq('plan_type', 'FREE')
            .single();

        if (freePlan) {
            // Create free subscription
            await supabase
                .from('user_subscriptions')
                .insert([{
                    user_id: userId,
                    plan_id: freePlan.id,
                    subscription_status: 'ACTIVE'
                }]);
        }

        return profile;
    } catch (error) {
        console.error('Profile creation error:', error);
        return null;
    }
}

// Get current user
async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Sign out
async function signOutUser() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        window.location.reload();
    }
    return !error;
}

// Check if user is signed in
async function isUserSignedIn() {
    const user = await getCurrentUser();
    return !!user;
}

// Export functions for use in HTML
window.dbAuth = {
    signUp: signUpUser,
    signIn: signInUser,
    signOut: signOutUser,
    getCurrentUser: getCurrentUser,
    isSignedIn: isUserSignedIn,
    supabase: supabase
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    const user = await getCurrentUser();
    if (user) {
        console.log('User is signed in:', user.email);
        updateUIForSignedInUser(user);
    } else {
        console.log('No user signed in');
    }
});

// Update UI for signed-in users
function updateUIForSignedInUser(user) {
    // Update auth button
    const authBtn = document.getElementById('authBtn');
    if (authBtn) {
        authBtn.innerHTML = `
            <i class="fas fa-user-shield"></i>
            <span>${user.email}</span>
            <button onclick="dbAuth.signOut()" class="sign-out-btn">Sign Out</button>
        `;
        authBtn.style.background = 'linear-gradient(45deg, #00ff00, #00aa00)';
    }

    // Show user dashboard
    const dashboard = document.getElementById('userDashboard');
    if (dashboard) {
        dashboard.style.display = 'block';
        dashboard.innerHTML = `
            <div class="user-info">
                <h3>Welcome, ${user.email}!</h3>
                <p>Privacy Score: <span id="privacyScore">85</span>/100</p>
                <p>Subscription: <span id="subscriptionType">Free Plan</span></p>
            </div>
        `;
    }
}

console.log('Database integration loaded with email verification fixes');
