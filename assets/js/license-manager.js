/**
 * License Manager - Subscription and Feature Gating System
 * Manages free vs premium features with secure license validation
 */

class LicenseManager {
    constructor() {
        this.licenseKey = null;
        this.userTier = 'free'; // free, professional, enterprise
        this.features = new Map();
        this.expiryDate = null;
        this.activationDate = null;
        this.deviceId = this.generateDeviceId();
        this.serverUrl = 'https://api.digitalfootprinteraser.com'; // Replace with actual API
        this.offlineMode = true; // For demo purposes
        this.initializeFeatures();
    }

    /**
     * Initialize feature matrix based on subscription tiers
     */
    initializeFeatures() {
        // Free tier features
        this.features.set('free', {
            // Basic Scanning
            quickScan: true,
            basicThreatDetection: true,
            storageCleanup: true,
            cookieCleanup: true,
            
            // Basic Protection
            basicTrackerBlocking: true,
            basicPrivacyProtection: true,
            
            // Limitations
            maxScansPerDay: 3,
            maxCleanupSize: '100MB',
            basicReports: true,
            
            // Disabled Features
            deepScan: false,
            aiThreatDetection: false,
            realTimeProtection: false,
            advancedAnalytics: false,
            bulkOperations: false,
            customRules: false,
            apiAccess: false,
            prioritySupport: false,
            whitelabelOptions: false
        });

        // Professional tier features
        this.features.set('professional', {
            // All free features
            ...this.features.get('free'),
            
            // Advanced Features
            deepScan: true,
            aiThreatDetection: true,
            realTimeProtection: true,
            advancedAnalytics: true,
            bulkOperations: true,
            customRules: true,
            
            // Enhanced Limits
            maxScansPerDay: 50,
            maxCleanupSize: '10GB',
            advancedReports: true,
            
            // Professional Features
            scheduleScans: true,
            downloadManager: true,
            securityAudit: true,
            complianceReports: true,
            emailSupport: true,
            
            // Still Disabled
            apiAccess: false,
            whitelabelOptions: false,
            enterpriseIntegration: false
        });

        // Enterprise tier features
        this.features.set('enterprise', {
            // All professional features
            ...this.features.get('professional'),
            
            // Enterprise Features
            apiAccess: true,
            whitelabelOptions: true,
            enterpriseIntegration: true,
            ssoIntegration: true,
            advancedSecurity: true,
            multiTenant: true,
            customDeployment: true,
            dedicatedSupport: true,
            
            // Unlimited
            maxScansPerDay: Infinity,
            maxCleanupSize: 'unlimited',
            customBranding: true,
            onPremiseDeployment: true
        });
    }

    /**
     * Activate license with key or subscription
     */
    async activateLicense(licenseKey, email = null) {
        try {
            if (this.offlineMode) {
                return this.activateOfflineLicense(licenseKey);
            }

            const response = await fetch(`${this.serverUrl}/api/license/activate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    licenseKey,
                    email,
                    deviceId: this.deviceId,
                    version: '2.0.0'
                })
            });

            if (!response.ok) {
                throw new Error('License activation failed');
            }

            const licenseData = await response.json();
            return this.processLicenseData(licenseData);

        } catch (error) {
            console.error('License activation error:', error);
            return {
                success: false,
                error: error.message,
                tier: 'free'
            };
        }
    }

    /**
     * Offline license activation (for demo/trial purposes)
     */
    activateOfflineLicense(licenseKey) {
        const validKeys = {
            // Professional keys (for demo)
            'DFEP-PRO-2024-DEMO1': {
                tier: 'professional',
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                email: 'demo@company.com'
            },
            'DFEP-PRO-2024-DEMO2': {
                tier: 'professional',
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                email: 'demo@company.com'
            },
            
            // Enterprise keys (for demo)
            'DFEP-ENT-2024-DEMO1': {
                tier: 'enterprise',
                expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
                email: 'enterprise@company.com'
            },
            'DFEP-ENT-2024-DEMO2': {
                tier: 'enterprise',
                expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                email: 'enterprise@company.com'
            },

            // Trial keys
            'TRIAL-7DAY-2024': {
                tier: 'professional',
                expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                email: 'trial@user.com'
            }
        };

        const licenseData = validKeys[licenseKey.toUpperCase()];
        
        if (!licenseData) {
            return {
                success: false,
                error: 'Invalid license key',
                tier: 'free'
            };
        }

        return this.processLicenseData({
            success: true,
            licenseKey,
            ...licenseData,
            activationDate: new Date(),
            deviceId: this.deviceId
        });
    }

    /**
     * Process license data after activation
     */
    processLicenseData(licenseData) {
        if (!licenseData.success) {
            return licenseData;
        }

        this.licenseKey = licenseData.licenseKey;
        this.userTier = licenseData.tier;
        this.expiryDate = new Date(licenseData.expiryDate);
        this.activationDate = new Date(licenseData.activationDate);

        // Save license data securely
        this.saveLicenseData(licenseData);

        return {
            success: true,
            tier: this.userTier,
            expiryDate: this.expiryDate,
            daysRemaining: this.getDaysRemaining(),
            features: this.getAvailableFeatures()
        };
    }

    /**
     * Check if a feature is available for current user
     */
    hasFeature(featureName) {
        const tierFeatures = this.features.get(this.userTier);
        return tierFeatures ? tierFeatures[featureName] === true : false;
    }

    /**
     * Get available features for current tier
     */
    getAvailableFeatures() {
        return this.features.get(this.userTier) || this.features.get('free');
    }

    /**
     * Check if license is valid and not expired
     */
    isLicenseValid() {
        if (this.userTier === 'free') {
            return true;
        }

        if (!this.licenseKey || !this.expiryDate) {
            return false;
        }

        return new Date() < this.expiryDate;
    }

    /**
     * Get days remaining in license
     */
    getDaysRemaining() {
        if (this.userTier === 'free' || !this.expiryDate) {
            return Infinity;
        }

        const now = new Date();
        const timeDiff = this.expiryDate.getTime() - now.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    /**
     * Generate unique device ID
     */
    generateDeviceId() {
        // Use a combination of browser fingerprinting techniques
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ].join('|');

        // Simple hash function
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        return 'device_' + Math.abs(hash).toString(36);
    }

    /**
     * Save license data securely in browser storage
     */
    saveLicenseData(licenseData) {
        try {
            const encryptedData = this.encryptData(JSON.stringify({
                licenseKey: licenseData.licenseKey,
                tier: licenseData.tier,
                expiryDate: licenseData.expiryDate,
                activationDate: licenseData.activationDate,
                deviceId: this.deviceId,
                timestamp: Date.now()
            }));

            localStorage.setItem('dfep_license', encryptedData);
        } catch (error) {
            console.warn('Failed to save license data:', error);
        }
    }

    /**
     * Load license data from browser storage
     */
    loadLicenseData() {
        try {
            const encryptedData = localStorage.getItem('dfep_license');
            if (!encryptedData) {
                return null;
            }

            const decryptedData = this.decryptData(encryptedData);
            const licenseData = JSON.parse(decryptedData);

            // Validate data integrity
            if (licenseData.deviceId !== this.deviceId) {
                console.warn('Device ID mismatch, clearing license data');
                this.clearLicenseData();
                return null;
            }

            return licenseData;
        } catch (error) {
            console.warn('Failed to load license data:', error);
            this.clearLicenseData();
            return null;
        }
    }

    /**
     * Simple encryption for license data (not cryptographically secure)
     */
    encryptData(data) {
        // Simple XOR encryption for demo purposes
        const key = 'dfep_license_key_2024';
        let encrypted = '';
        
        for (let i = 0; i < data.length; i++) {
            encrypted += String.fromCharCode(
                data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        
        return btoa(encrypted);
    }

    /**
     * Simple decryption for license data
     */
    decryptData(encryptedData) {
        const key = 'dfep_license_key_2024';
        const encrypted = atob(encryptedData);
        let decrypted = '';
        
        for (let i = 0; i < encrypted.length; i++) {
            decrypted += String.fromCharCode(
                encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        
        return decrypted;
    }

    /**
     * Clear license data
     */
    clearLicenseData() {
        localStorage.removeItem('dfep_license');
        this.licenseKey = null;
        this.userTier = 'free';
        this.expiryDate = null;
        this.activationDate = null;
    }

    /**
     * Initialize license manager
     */
    async initialize() {
        // Load existing license data
        const savedLicense = this.loadLicenseData();
        
        if (savedLicense) {
            this.licenseKey = savedLicense.licenseKey;
            this.userTier = savedLicense.tier;
            this.expiryDate = new Date(savedLicense.expiryDate);
            this.activationDate = new Date(savedLicense.activationDate);

            // Check if license is still valid
            if (!this.isLicenseValid()) {
                console.warn('License expired, reverting to free tier');
                this.clearLicenseData();
                this.userTier = 'free';
            }
        }

        // Periodic license validation
        this.startLicenseValidation();

        return {
            tier: this.userTier,
            isValid: this.isLicenseValid(),
            daysRemaining: this.getDaysRemaining(),
            features: this.getAvailableFeatures()
        };
    }

    /**
     * Start periodic license validation
     */
    startLicenseValidation() {
        // Check license validity every hour
        setInterval(() => {
            if (!this.isLicenseValid() && this.userTier !== 'free') {
                console.warn('License validation failed, reverting to free tier');
                this.clearLicenseData();
                this.userTier = 'free';
                
                // Notify application
                window.dispatchEvent(new CustomEvent('licenseExpired', {
                    detail: { tier: this.userTier }
                }));
            }
        }, 3600000); // 1 hour
    }

    /**
     * Get usage statistics
     */
    getUsageStats() {
        const stats = JSON.parse(localStorage.getItem('dfep_usage_stats') || '{}');
        const today = new Date().toDateString();
        
        if (!stats[today]) {
            stats[today] = {
                scans: 0,
                cleanupSize: 0,
                features: []
            };
        }

        return stats[today];
    }

    /**
     * Track feature usage
     */
    trackUsage(feature, data = {}) {
        const stats = this.getUsageStats();
        const today = new Date().toDateString();
        const allStats = JSON.parse(localStorage.getItem('dfep_usage_stats') || '{}');
        
        if (!allStats[today]) {
            allStats[today] = stats;
        }

        switch (feature) {
            case 'scan':
                allStats[today].scans++;
                break;
            case 'cleanup':
                allStats[today].cleanupSize += data.size || 0;
                break;
            default:
                if (!allStats[today].features.includes(feature)) {
                    allStats[today].features.push(feature);
                }
        }

        localStorage.setItem('dfep_usage_stats', JSON.stringify(allStats));
    }

    /**
     * Check if usage limit exceeded
     */
    isUsageLimitExceeded(feature) {
        const stats = this.getUsageStats();
        const features = this.getAvailableFeatures();

        switch (feature) {
            case 'scan':
                return stats.scans >= features.maxScansPerDay;
            case 'cleanup':
                const maxSize = this.parseSize(features.maxCleanupSize);
                return stats.cleanupSize >= maxSize;
            default:
                return false;
        }
    }

    /**
     * Parse size string to bytes
     */
    parseSize(sizeStr) {
        if (sizeStr === 'unlimited') return Infinity;
        
        const units = {
            'KB': 1024,
            'MB': 1024 * 1024,
            'GB': 1024 * 1024 * 1024
        };

        const match = sizeStr.match(/^(\d+)\s*(KB|MB|GB)$/i);
        if (!match) return 0;

        return parseInt(match[1]) * (units[match[2].toUpperCase()] || 1);
    }

    /**
     * Get license information for display
     */
    getLicenseInfo() {
        return {
            tier: this.userTier,
            licenseKey: this.licenseKey ? this.licenseKey.replace(/(.{4}).*(.{4})/, '$1****$2') : null,
            isValid: this.isLicenseValid(),
            expiryDate: this.expiryDate,
            daysRemaining: this.getDaysRemaining(),
            activationDate: this.activationDate,
            deviceId: this.deviceId,
            features: this.getAvailableFeatures(),
            usageStats: this.getUsageStats()
        };
    }

    /**
     * Generate trial license
     */
    generateTrialLicense(days = 7) {
        const trialKey = `TRIAL-${days}DAY-${Date.now()}`;
        return this.activateOfflineLicense(trialKey);
    }

    /**
     * Deactivate license
     */
    async deactivateLicense() {
        try {
            if (!this.offlineMode && this.licenseKey) {
                await fetch(`${this.serverUrl}/api/license/deactivate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        licenseKey: this.licenseKey,
                        deviceId: this.deviceId
                    })
                });
            }

            this.clearLicenseData();
            return { success: true, tier: 'free' };

        } catch (error) {
            console.error('License deactivation error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Singleton instance
let licenseManagerInstance = null;

/**
 * Get or create license manager instance
 */
function getLicenseManager() {
    if (!licenseManagerInstance) {
        licenseManagerInstance = new LicenseManager();
    }
    return licenseManagerInstance;
}

/**
 * Initialize license system
 */
async function initializeLicenseSystem() {
    const manager = getLicenseManager();
    return await manager.initialize();
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.LicenseManager = LicenseManager;
    window.getLicenseManager = getLicenseManager;
    window.initializeLicenseSystem = initializeLicenseSystem;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LicenseManager,
        getLicenseManager,
        initializeLicenseSystem
    };
}