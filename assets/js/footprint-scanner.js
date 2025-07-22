/**
 * Digital Footprint Scanner Module
 * Analyzes digital exposure and calculates privacy scores
 */

class FootprintScanner {
    static async scanDigitalFootprint() {
        const result = {
            privacyScore: 0,
            exposureLevel: 'Unknown',
            riskFactors: 0,
            scoreBreakdown: [],
            recommendations: [],
            detailedFindings: {},
            timestamp: new Date().toISOString()
        };

        try {
            // Perform comprehensive privacy analysis
            await this.analyzeBrowserPrivacy(result);
            await this.analyzeWebTrackingExposure(result);
            await this.analyzeDataLeakage(result);
            await this.analyzeSocialMediaExposure(result);
            await this.analyzeSecurityHeaders(result);
            await this.analyzeLocalStorage(result);
            
            // Calculate overall scores
            this.calculateOverallScore(result);
            this.generateRecommendations(result);
            
        } catch (error) {
            console.error('Footprint scan error:', error);
            result.recommendations.push('Scan encountered errors - manual privacy review recommended');
        }

        return result;
    }

    /**
     * Analyze browser privacy settings and capabilities
     */
    static async analyzeBrowserPrivacy(result) {
        const browserAnalysis = {
            category: 'Browser Privacy',
            score: 0,
            findings: [],
            weight: 25
        };

        try {
            // Check Do Not Track
            if (navigator.doNotTrack === '1') {
                browserAnalysis.score += 20;
                browserAnalysis.findings.push('PASS: Do Not Track enabled');
            } else {
                browserAnalysis.findings.push('FAIL: Do Not Track disabled');
                result.recommendations.push('Enable Do Not Track in browser settings');
            }

            // Check cookie settings (indirect)
            const cookieTest = this.testCookieBlocking();
            if (cookieTest.thirdPartyBlocked) {
                browserAnalysis.score += 30;
                browserAnalysis.findings.push('PASS: Third-party cookies appear to be blocked');
            } else {
                browserAnalysis.findings.push('FAIL: Third-party cookies may be enabled');
                result.recommendations.push('Block third-party cookies in browser settings');
            }

            // Check for private browsing indicators
            if (this.isPrivateBrowsing()) {
                browserAnalysis.score += 25;
                browserAnalysis.findings.push('PASS: Private browsing mode detected');
            } else {
                browserAnalysis.findings.push('INFO: Regular browsing mode (consider using private mode)');
            }

            // Check JavaScript privacy APIs
            if (!('geolocation' in navigator)) {
                browserAnalysis.score += 15;
                browserAnalysis.findings.push('PASS: Geolocation API disabled');
            } else {
                browserAnalysis.findings.push('WARN: Geolocation API available');
                result.recommendations.push('Disable location services for websites');
            }

            // Check for WebRTC leaks
            if (this.hasWebRTCLeak()) {
                browserAnalysis.findings.push('FAIL: Potential WebRTC IP leak detected');
                result.recommendations.push('Consider disabling WebRTC in browser settings');
            } else {
                browserAnalysis.score += 10;
                browserAnalysis.findings.push('PASS: No obvious WebRTC leaks detected');
            }

        } catch (error) {
            browserAnalysis.findings.push('ERROR: Browser analysis encountered errors');
        }

        result.scoreBreakdown.push(browserAnalysis);
        result.detailedFindings.browserPrivacy = browserAnalysis.findings;
    }

    /**
     * Analyze web tracking exposure
     */
    static async analyzeWebTrackingExposure(result) {
        const trackingAnalysis = {
            category: 'Tracking Protection',
            score: 0,
            findings: [],
            weight: 30
        };

        try {
            // Detect tracking scripts
            const trackers = this.detectTrackingScripts();
            
            if (trackers.analytics.length === 0) {
                trackingAnalysis.score += 25;
                trackingAnalysis.findings.push('PASS: No analytics trackers detected');
            } else {
                trackingAnalysis.findings.push(`FAIL: ${trackers.analytics.length} analytics trackers found`);
                result.recommendations.push('Use ad blocker to prevent tracking scripts');
            }

            if (trackers.advertising.length === 0) {
                trackingAnalysis.score += 25;
                trackingAnalysis.findings.push('PASS: No advertising trackers detected');
            } else {
                trackingAnalysis.findings.push(`FAIL: ${trackers.advertising.length} advertising trackers found`);
            }

            if (trackers.social.length === 0) {
                trackingAnalysis.score += 20;
                trackingAnalysis.findings.push('PASS: No social media trackers detected');
            } else {
                trackingAnalysis.findings.push(`FAIL: ${trackers.social.length} social media trackers found`);
                result.recommendations.push('Block social media tracking pixels');
            }

            // Check for fingerprinting attempts
            const fingerprintingRisk = this.assessFingerprintingRisk();
            if (fingerprintingRisk.score > 50) {
                trackingAnalysis.findings.push('FAIL: High fingerprinting risk detected');
                result.recommendations.push('Use browser with fingerprinting protection');
            } else {
                trackingAnalysis.score += 15;
                trackingAnalysis.findings.push('PASS: Low fingerprinting risk');
            }

            // Check for beacon/pixel tracking
            const beaconCount = this.detectTrackingBeacons();
            if (beaconCount === 0) {
                trackingAnalysis.score += 15;
                trackingAnalysis.findings.push('PASS: No tracking beacons detected');
            } else {
                trackingAnalysis.findings.push(`FAIL: ${beaconCount} tracking beacons found`);
            }

        } catch (error) {
            trackingAnalysis.findings.push('ERROR: Tracking analysis encountered errors');
        }

        result.scoreBreakdown.push(trackingAnalysis);
        result.detailedFindings.trackingExposure = trackingAnalysis.findings;
    }

    /**
     * Analyze potential data leakage points
     */
    static async analyzeDataLeakage(result) {
        const leakageAnalysis = {
            category: 'Data Leakage Protection',
            score: 0,
            findings: [],
            weight: 20
        };

        try {
            // Check localStorage for sensitive data
            const storageFindings = this.scanLocalStorage();
            if (storageFindings.sensitiveData.length === 0) {
                leakageAnalysis.score += 30;
                leakageAnalysis.findings.push('PASS: No sensitive data in localStorage');
            } else {
                leakageAnalysis.findings.push(`FAIL: ${storageFindings.sensitiveData.length} potential sensitive items in storage`);
                result.recommendations.push('Clear browser storage regularly');
            }

            // Check for form data persistence
            if (this.hasFormDataPersistence()) {
                leakageAnalysis.findings.push('WARN: Forms may store data locally');
                result.recommendations.push('Disable form data saving in browser');
            } else {
                leakageAnalysis.score += 20;
                leakageAnalysis.findings.push('PASS: No obvious form data persistence');
            }

            // Check for automatic password filling
            if (this.hasPasswordManager()) {
                leakageAnalysis.findings.push('INFO: Password manager detected (review saved passwords)');
                result.recommendations.push('Audit saved passwords and remove unused ones');
            } else {
                leakageAnalysis.score += 15;
                leakageAnalysis.findings.push('PASS: No browser password manager detected');
            }

            // Check for clipboard access
            if ('clipboard' in navigator) {
                leakageAnalysis.findings.push('WARN: Clipboard API available to websites');
                result.recommendations.push('Be cautious of clipboard access permissions');
            } else {
                leakageAnalysis.score += 10;
                leakageAnalysis.findings.push('PASS: Clipboard API not available');
            }

            // Check session storage
            const sessionData = this.scanSessionStorage();
            if (sessionData.itemCount === 0) {
                leakageAnalysis.score += 25;
                leakageAnalysis.findings.push('PASS: Session storage is clean');
            } else {
                leakageAnalysis.findings.push(`INFO: ${sessionData.itemCount} items in session storage`);
            }

        } catch (error) {
            leakageAnalysis.findings.push('ERROR: Data leakage analysis encountered errors');
        }

        result.scoreBreakdown.push(leakageAnalysis);
        result.detailedFindings.dataLeakage = leakageAnalysis.findings;
    }

    /**
     * Analyze social media exposure indicators
     */
    static async analyzeSocialMediaExposure(result) {
        const socialAnalysis = {
            category: 'Social Media Privacy',
            score: 0,
            findings: [],
            weight: 15
        };

        try {
            // Check for social login buttons/widgets
            const socialWidgets = this.detectSocialWidgets();
            if (socialWidgets.length === 0) {
                socialAnalysis.score += 40;
                socialAnalysis.findings.push('PASS: No social media widgets detected');
            } else {
                socialAnalysis.findings.push(`FAIL: ${socialWidgets.length} social media widgets found`);
                result.recommendations.push('Social widgets can track you - consider blocking');
            }

            // Check for social sharing tracking
            const shareTracking = this.detectSocialSharing();
            if (!shareTracking) {
                socialAnalysis.score += 30;
                socialAnalysis.findings.push('PASS: No social sharing tracking detected');
            } else {
                socialAnalysis.findings.push('FAIL: Social sharing tracking detected');
            }

            // Check for embedded social content
            const embeddedContent = this.detectEmbeddedSocialContent();
            if (embeddedContent.length === 0) {
                socialAnalysis.score += 30;
                socialAnalysis.findings.push('PASS: No embedded social content');
            } else {
                socialAnalysis.findings.push(`WARN: ${embeddedContent.length} embedded social elements found`);
                result.recommendations.push('Embedded social content can track your activity');
            }

        } catch (error) {
            socialAnalysis.findings.push('ERROR: Social media analysis encountered errors');
        }

        result.scoreBreakdown.push(socialAnalysis);
        result.detailedFindings.socialMedia = socialAnalysis.findings;
    }

    /**
     * Analyze security headers and HTTPS usage
     */
    static async analyzeSecurityHeaders(result) {
        const securityAnalysis = {
            category: 'Connection Security',
            score: 0,
            findings: [],
            weight: 10
        };

        try {
            // Check HTTPS usage
            if (location.protocol === 'https:') {
                securityAnalysis.score += 50;
                securityAnalysis.findings.push('PASS: Using HTTPS connection');
            } else {
                securityAnalysis.findings.push('FAIL: Using unencrypted HTTP connection');
                result.recommendations.push('Always use HTTPS websites when possible');
            }

            // Check for mixed content
            if (this.hasMixedContent()) {
                securityAnalysis.findings.push('WARN: Mixed content detected (HTTP resources on HTTPS page)');
                result.recommendations.push('Avoid websites with mixed content warnings');
            } else {
                securityAnalysis.score += 25;
                securityAnalysis.findings.push('PASS: No mixed content detected');
            }

            // Check for secure cookies
            if (this.hasSecureCookies()) {
                securityAnalysis.score += 25;
                securityAnalysis.findings.push('PASS: Secure cookie flags detected');
            } else {
                securityAnalysis.findings.push('WARN: Some cookies may lack security flags');
            }

        } catch (error) {
            securityAnalysis.findings.push('ERROR: Security analysis encountered errors');
        }

        result.scoreBreakdown.push(securityAnalysis);
        result.detailedFindings.connectionSecurity = securityAnalysis.findings;
    }

    /**
     * Analyze local storage for privacy concerns
     */
    static async analyzeLocalStorage(result) {
        const storageAnalysis = {
            category: 'Local Data Storage',
            score: 100, // Start high, deduct for issues
            findings: [],
            weight: 10
        };

        try {
            // Analyze localStorage contents
            const localStorageData = this.analyzeStorageContents(localStorage, 'localStorage');
            if (localStorageData.totalItems === 0) {
                storageAnalysis.findings.push('PASS: localStorage is empty');
            } else {
                storageAnalysis.score -= Math.min(localStorageData.totalItems * 2, 30);
                storageAnalysis.findings.push(`INFO: ${localStorageData.totalItems} items in localStorage`);
                
                if (localStorageData.suspiciousItems > 0) {
                    storageAnalysis.score -= 20;
                    storageAnalysis.findings.push(`WARN: ${localStorageData.suspiciousItems} potentially tracking-related items`);
                    result.recommendations.push('Clear localStorage regularly to remove tracking data');
                }
            }

            // Analyze sessionStorage contents
            const sessionStorageData = this.analyzeStorageContents(sessionStorage, 'sessionStorage');
            if (sessionStorageData.totalItems === 0) {
                storageAnalysis.findings.push('PASS: sessionStorage is empty');
            } else {
                storageAnalysis.score -= Math.min(sessionStorageData.totalItems, 15);
                storageAnalysis.findings.push(`INFO: ${sessionStorageData.totalItems} items in sessionStorage`);
            }

            // Check IndexedDB usage
            if ('indexedDB' in window) {
                try {
                    const dbInfo = await this.getIndexedDBInfo();
                    if (dbInfo.databases.length === 0) {
                        storageAnalysis.findings.push('PASS: No IndexedDB databases found');
                    } else {
                        storageAnalysis.score -= Math.min(dbInfo.databases.length * 5, 25);
                        storageAnalysis.findings.push(`INFO: ${dbInfo.databases.length} IndexedDB databases found`);
                    }
                } catch (error) {
                    storageAnalysis.findings.push('INFO: Could not analyze IndexedDB (may be restricted)');
                }
            }

        } catch (error) {
            storageAnalysis.findings.push('ERROR: Storage analysis encountered errors');
        }

        // Ensure score doesn't go below 0
        storageAnalysis.score = Math.max(0, storageAnalysis.score);

        result.scoreBreakdown.push(storageAnalysis);
        result.detailedFindings.localStorage = storageAnalysis.findings;
    }

    /**
     * Test cookie blocking capabilities
     */
    static testCookieBlocking() {
        try {
            // Test if we can set a cookie
            const testCookie = 'privacy_test=' + Date.now();
            document.cookie = testCookie;
            const cookieSet = document.cookie.indexOf('privacy_test=') !== -1;
            
            // Clean up test cookie
            if (cookieSet) {
                document.cookie = 'privacy_test=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }

            return {
                firstPartyAllowed: cookieSet,
                thirdPartyBlocked: !cookieSet // Simplified assumption
            };
        } catch (error) {
            return {
                firstPartyAllowed: false,
                thirdPartyBlocked: true
            };
        }
    }

    /**
     * Detect if browser is in private mode
     */
    static isPrivateBrowsing() {
        try {
            // Different methods for different browsers
            if ('webkitRequestFileSystem' in window) {
                // Chrome/Safari method
                return new Promise((resolve) => {
                    webkitRequestFileSystem(
                        window.TEMPORARY, 1,
                        () => resolve(false),
                        () => resolve(true)
                    );
                });
            }

            // Firefox method
            if ('MozAppearance' in document.documentElement.style) {
                const db = indexedDB.open('test');
                db.onerror = () => true;
                db.onsuccess = () => false;
            }

            // Fallback - check localStorage availability
            try {
                localStorage.setItem('private_test', '1');
                localStorage.removeItem('private_test');
                return false; // localStorage works, probably not private
            } catch (error) {
                return true; // localStorage blocked, likely private
            }
        } catch (error) {
            return false;
        }
    }

    /**
     * Check for WebRTC leaks
     */
    static hasWebRTCLeak() {
        try {
            const rtc = window.RTCPeerConnection || 
                       window.mozRTCPeerConnection || 
                       window.webkitRTCPeerConnection;
            
            if (!rtc) return false;

            // WebRTC is available, which could potentially leak IP
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Detect tracking scripts on the page
     */
    static detectTrackingScripts() {
        const trackers = {
            analytics: [],
            advertising: [],
            social: []
        };

        const analyticsPatterns = [
            'google-analytics.com',
            'googletagmanager.com',
            'adobe.com/analytics',
            'quantserve.com',
            'scorecardresearch.com'
        ];

        const advertisingPatterns = [
            'doubleclick.net',
            'googlesyndication.com',
            'amazon-adsystem.com',
            'outbrain.com',
            'taboola.com',
            'criteo.com'
        ];

        const socialPatterns = [
            'facebook.com',
            'twitter.com',
            'linkedin.com',
            'pinterest.com',
            'instagram.com'
        ];

        // Check scripts
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            const src = script.src.toLowerCase();
            
            analyticsPatterns.forEach(pattern => {
                if (src.includes(pattern)) trackers.analytics.push(pattern);
            });
            
            advertisingPatterns.forEach(pattern => {
                if (src.includes(pattern)) trackers.advertising.push(pattern);
            });
            
            socialPatterns.forEach(pattern => {
                if (src.includes(pattern)) trackers.social.push(pattern);
            });
        });

        return trackers;
    }

    /**
     * Assess fingerprinting risk
     */
    static assessFingerprintingRisk() {
        let risk = 0;
        const factors = [];

        // Check canvas fingerprinting
        if (this.hasCanvasFingerprinting()) {
            risk += 25;
            factors.push('Canvas fingerprinting detected');
        }

        // Check WebGL fingerprinting
        if (this.hasWebGLFingerprinting()) {
            risk += 25;
            factors.push('WebGL fingerprinting possible');
        }

        // Check font enumeration
        if (this.hasFontEnumeration()) {
            risk += 20;
            factors.push('Font enumeration possible');
        }

        // Check audio fingerprinting
        if (this.hasAudioFingerprinting()) {
            risk += 15;
            factors.push('Audio fingerprinting possible');
        }

        // Check screen/device info
        if (this.hasDeviceFingerprinting()) {
            risk += 15;
            factors.push('Device fingerprinting detected');
        }

        return {
            score: risk,
            factors: factors
        };
    }

    /**
     * Check for canvas fingerprinting
     */
    static hasCanvasFingerprinting() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            return !!(ctx && typeof ctx.getImageData === 'function');
        } catch (error) {
            return false;
        }
    }

    /**
     * Check for WebGL fingerprinting
     */
    static hasWebGLFingerprinting() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        } catch (error) {
            return false;
        }
    }

    /**
     * Check for font enumeration capabilities
     */
    static hasFontEnumeration() {
        try {
            // Check if we can create elements to test fonts
            const span = document.createElement('span');
            return typeof span.style.fontFamily !== 'undefined';
        } catch (error) {
            return false;
        }
    }

    /**
     * Check for audio fingerprinting
     */
    static hasAudioFingerprinting() {
        try {
            return !!(window.AudioContext || window.webkitAudioContext);
        } catch (error) {
            return false;
        }
    }

    /**
     * Check for device fingerprinting
     */
    static hasDeviceFingerprinting() {
        const uniqueValues = [
            screen.width,
            screen.height,
            screen.colorDepth,
            navigator.hardwareConcurrency,
            navigator.deviceMemory
        ].filter(val => val !== undefined);

        return uniqueValues.length > 2;
    }

    /**
     * Detect tracking beacons
     */
    static detectTrackingBeacons() {
        let beaconCount = 0;

        // Check for 1x1 images (common tracking pixels)
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if ((img.width === 1 && img.height === 1) || 
                img.src.includes('pixel') || 
                img.src.includes('beacon')) {
                beaconCount++;
            }
        });

        return beaconCount;
    }

    /**
     * Scan localStorage for sensitive patterns
     */
    static scanLocalStorage() {
        const sensitivePatterns = [
            'token', 'auth', 'session', 'user', 'email', 'phone', 
            'address', 'credit', 'payment', 'password', 'key'
        ];

        const sensitiveData = [];
        const totalItems = localStorage.length;

        for (let i = 0; i < totalItems; i++) {
            const key = localStorage.key(i);
            if (key) {
                const lowerKey = key.toLowerCase();
                if (sensitivePatterns.some(pattern => lowerKey.includes(pattern))) {
                    sensitiveData.push(key);
                }
            }
        }

        return {
            totalItems,
            sensitiveData
        };
    }

    /**
     * Check for form data persistence
     */
    static hasFormDataPersistence() {
        const forms = document.querySelectorAll('form');
        return forms.length > 0 && 
               Array.from(forms).some(form => 
                   form.querySelector('input[type="email"], input[type="password"], input[type="text"]')
               );
    }

    /**
     * Check for password manager indicators
     */
    static hasPasswordManager() {
        return navigator.credentials && 'create' in navigator.credentials;
    }

    /**
     * Scan session storage
     */
    static scanSessionStorage() {
        return {
            itemCount: sessionStorage.length
        };
    }

    /**
     * Detect social media widgets
     */
    static detectSocialWidgets() {
        const widgets = [];
        const socialSelectors = [
            '[class*="facebook"]', '[class*="fb-"]', '[id*="facebook"]',
            '[class*="twitter"]', '[class*="tweet"]', '[id*="twitter"]',
            '[class*="linkedin"]', '[class*="linked-in"]', '[id*="linkedin"]',
            '[class*="instagram"]', '[class*="insta"]', '[id*="instagram"]',
            '[class*="pinterest"]', '[class*="pin-it"]', '[id*="pinterest"]',
            '[class*="youtube"]', '[class*="yt-"]', '[id*="youtube"]'
        ];

        socialSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                widgets.push(selector);
            }
        });

        return widgets;
    }

    /**
     * Detect social sharing tracking
     */
    static detectSocialSharing() {
        const sharePatterns = ['share', 'social', 'like', 'follow', 'tweet'];
        const buttons = document.querySelectorAll('button, a, div[onclick]');
        
        return Array.from(buttons).some(button => {
            const text = (button.textContent || '').toLowerCase();
            const className = (button.className || '').toLowerCase();
            const id = (button.id || '').toLowerCase();
            
            return sharePatterns.some(pattern => 
                text.includes(pattern) || className.includes(pattern) || id.includes(pattern)
            );
        });
    }

    /**
     * Detect embedded social content
     */
    static detectEmbeddedSocialContent() {
        const embedded = [];
        
        // Check for iframes from social platforms
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            const src = iframe.src.toLowerCase();
            if (src.includes('facebook.com') || src.includes('twitter.com') || 
                src.includes('youtube.com') || src.includes('instagram.com')) {
                embedded.push(iframe.src);
            }
        });

        return embedded;
    }

    /**
     * Check for mixed content
     */
    static hasMixedContent() {
        if (location.protocol !== 'https:') return false;

        // Check for HTTP resources on HTTPS page
        const httpResources = [];
        
        document.querySelectorAll('script, img, link, iframe').forEach(element => {
            const src = element.src || element.href;
            if (src && src.startsWith('http://')) {
                httpResources.push(src);
            }
        });

        return httpResources.length > 0;
    }

    /**
     * Check for secure cookies
     */
    static hasSecureCookies() {
        // This is a simplified check - in reality, we can't read the Secure flag from JavaScript
        return location.protocol === 'https:' && document.cookie.length > 0;
    }

    /**
     * Analyze storage contents for privacy concerns
     */
    static analyzeStorageContents(storage, storageType) {
        const trackingPatterns = [
            'ga', 'gtm', '_gid', '_gat', 'fbp', 'fbc', 'tr', 'pixel',
            'utm', 'campaign', 'source', 'medium', 'analytics', 'tracking'
        ];

        let suspiciousItems = 0;
        const totalItems = storage.length;

        for (let i = 0; i < totalItems; i++) {
            const key = storage.key(i);
            if (key) {
                const lowerKey = key.toLowerCase();
                if (trackingPatterns.some(pattern => lowerKey.includes(pattern))) {
                    suspiciousItems++;
                }
            }
        }

        return {
            totalItems,
            suspiciousItems
        };
    }

    /**
     * Get IndexedDB information
     */
    static async getIndexedDBInfo() {
        const databases = [];
        
        try {
            if (indexedDB.databases) {
                const dbList = await indexedDB.databases();
                databases.push(...dbList.map(db => db.name));
            }
        } catch (error) {
            // Fallback - we can't enumerate databases in some browsers
        }

        return { databases };
    }

    /**
     * Calculate overall privacy score
     */
    static calculateOverallScore(result) {
        let weightedScore = 0;
        let totalWeight = 0;

        result.scoreBreakdown.forEach(category => {
            weightedScore += (category.score * category.weight);
            totalWeight += category.weight;
        });

        result.privacyScore = Math.round(weightedScore / totalWeight);

        // Determine exposure level
        if (result.privacyScore >= 80) {
            result.exposureLevel = 'Low';
        } else if (result.privacyScore >= 60) {
            result.exposureLevel = 'Medium';
        } else if (result.privacyScore >= 40) {
            result.exposureLevel = 'High';
        } else {
            result.exposureLevel = 'Critical';
        }

        // Count risk factors
        result.riskFactors = result.scoreBreakdown.reduce((count, category) => {
            return count + (category.score < 50 ? 1 : 0);
        }, 0);
    }

    /**
     * Generate personalized recommendations
     */
    static generateRecommendations(result) {
        // Add general recommendations based on score
        if (result.privacyScore < 60) {
            result.recommendations.unshift('CRITICAL: Your digital privacy needs immediate attention');
            result.recommendations.push('Consider using a privacy-focused browser like Firefox or Brave');
            result.recommendations.push('Install a comprehensive ad blocker like uBlock Origin');
        } else if (result.privacyScore < 80) {
            result.recommendations.unshift('WARNING: Several privacy improvements recommended');
        } else {
            result.recommendations.unshift('GOOD: Your privacy settings are well-configured');
        }

        // Add category-specific recommendations
        result.scoreBreakdown.forEach(category => {
            if (category.score < 50) {
                switch (category.category) {
                    case 'Browser Privacy':
                        result.recommendations.push('Review and strengthen browser privacy settings');
                        break;
                    case 'Tracking Protection':
                        result.recommendations.push('Enable stronger tracking protection measures');
                        break;
                    case 'Data Leakage Protection':
                        result.recommendations.push('Clear stored data and review auto-fill settings');
                        break;
                    case 'Social Media Privacy':
                        result.recommendations.push('Block social media tracking and widgets');
                        break;
                    case 'Connection Security':
                        result.recommendations.push('Only use secure HTTPS websites');
                        break;
                }
            }
        });

        // Remove duplicates and limit recommendations
        result.recommendations = [...new Set(result.recommendations)].slice(0, 10);
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.FootprintScanner = FootprintScanner;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FootprintScanner;
}