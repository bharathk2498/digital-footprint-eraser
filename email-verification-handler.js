// ====================
// DIGITAL FOOTPRINT ERASER - EMAIL VERIFICATION HANDLER
// Handles email verification redirects and updates
// ====================

// Email verification handler that checks URL parameters
class EmailVerificationHandler {
    constructor() {
        this.init();
    }

    async init() {
        // Check if this is an email verification redirect
        if (this.isEmailVerificationRedirect()) {
            await this.handleEmailVerification();
        }
    }

    isEmailVerificationRedirect() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has('access_token') || 
               urlParams.get('type') === 'signup' || 
               urlParams.has('confirmation_url');
    }

    async handleEmailVerification() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const accessToken = urlParams.get('access_token');
            const refreshToken = urlParams.get('refresh_token');
            const type = urlParams.get('type');
            const error = urlParams.get('error');

            console.log('🔄 Handling email verification redirect...');

            // Wait for database to be ready
            await this.waitForDatabase();

            if (error) {
                this.showVerificationError('Email verification failed: ' + error);
                return;
            }

            if (accessToken && type === 'signup') {
                // User successfully verified their email
                console.log('✅ Email verification successful');
                
                // Get current user
                const user = await window.dfDB.getCurrentUser();
                
                if (user) {
                    // Update email verification status
                    await window.dfDB.updateEmailVerificationStatus(user.id, true);
                    
                    // Show success message
                    this.showVerificationSuccess(user.email);
                    
                    // Clean URL and redirect after delay
                    setTimeout(() => {
                        this.cleanUrlAndRedirect();
                    }, 3000);
                } else {
                    this.showVerificationError('User session not found');
                }
            } else {
                // Redirect to dedicated verification page
                window.location.href = 'email-verified.html' + window.location.search;
            }
            
        } catch (error) {
            console.error('Email verification error:', error);
            this.showVerificationError('Verification failed: ' + error.message);
        }
    }

    async waitForDatabase() {
        let attempts = 0;
        while (!window.dfDB?.supabase && attempts < 100) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }

    showVerificationSuccess(email) {
        // Create success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #10B981, #059669);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(16, 185, 129, 0.4);
            z-index: 10001;
            text-align: center;
            max-width: 400px;
            animation: slideIn 0.5s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
            <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">
                Email Verified Successfully!
            </div>
            <div style="margin-bottom: 1rem;">
                Your account is now fully activated.
            </div>
            <div style="font-size: 0.9rem; opacity: 0.9;">
                Redirecting to dashboard...
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add animation styles
        if (!document.getElementById('verification-animations')) {
            const style = document.createElement('style');
            style.id = 'verification-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    showVerificationError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #EF4444, #DC2626);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(239, 68, 68, 0.4);
            z-index: 10001;
            text-align: center;
            max-width: 400px;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
            <div style="font-size: 1.3rem; font-weight: bold; margin-bottom: 1rem;">
                Verification Failed
            </div>
            <div style="margin-bottom: 1rem; font-size: 0.9rem;">
                ${message}
            </div>
            <button onclick="this.parentElement.remove(); window.location.href='email-test.html';" style="
                background: rgba(255,255,255,0.2);
                border: 1px solid white;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
            ">Test Email System</button>
        `;
        
        document.body.appendChild(notification);
    }

    cleanUrlAndRedirect() {
        // Remove verification parameters from URL
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, document.title, url.toString());
        
        // Reload page to show normal dashboard
        window.location.reload();
    }
}

// Initialize email verification handler
document.addEventListener('DOMContentLoaded', () => {
    new EmailVerificationHandler();
});

console.log('📧 Email verification handler loaded');
