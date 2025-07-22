/**
 * Advanced System Scanner Module
 * Local file and system scanning for unwanted files and security threats
 */

class AdvancedSystemScanner {
    static async performComprehensiveScan(options = {}) {
        const result = {
            filesScanned: 0,
            suspiciousFilesFound: 0,
            unwantedFilesFound: 0,
            trackingFilesFound: 0,
            duplicateFilesFound: 0,
            largeFilesFound: 0,
            totalSizeReclaimed: 0,
            securityThreats: 0,
            privacyRisks: 0,
            scanReport: [],
            detailedFindings: {},
            recommendations: [],
            timestamp: new Date().toISOString()
        };

        try {
            // Phase 1: Browser-accessible file scanning
            await this.scanBrowserAccessibleFiles(result, options);
            
            // Phase 2: Download folder analysis (if accessible)
            await this.scanDownloadFolder(result, options);
            
            // Phase 3: Temporary files and cache
            await this.scanTemporaryFiles(result, options);
            
            // Phase 4: Browser extension analysis
            await this.scanBrowserExtensions(result, options);
            
            // Phase 5: Registry and system settings analysis
            await this.scanSystemSettings(result, options);
            
            // Phase 6: Network and privacy scanning
            await this.scanNetworkPrivacy(result, options);
            
            // Phase 7: Generate comprehensive report
            this.generateComprehensiveReport(result);
            
        } catch (error) {
            console.error('System scan failed:', error);
            result.scanReport.push('ERROR: Some scan operations failed - manual review recommended');
        }

        return result;
    }

    /**
     * Scan browser-accessible files and data
     */
    static async scanBrowserAccessibleFiles(result, options) {
        try {
            // Scan localStorage for suspicious content
            const localStorageFindings = this.scanLocalStorageContent();
            result.trackingFilesFound += localStorageFindings.trackingItems;
            result.privacyRisks += localStorageFindings.privacyRisks;
            
            if (localStorageFindings.trackingItems > 0) {
                result.scanReport.push(`FOUND: ${localStorageFindings.trackingItems} tracking items in localStorage`);
                result.detailedFindings.localStorage = localStorageFindings.details;
            }

            // Scan sessionStorage
            const sessionStorageFindings = this.scanSessionStorageContent();
            result.trackingFilesFound += sessionStorageFindings.trackingItems;
            
            // Scan IndexedDB databases
            const indexedDBFindings = await this.scanIndexedDBContent();
            result.suspiciousFilesFound += indexedDBFindings.suspiciousDatabases;
            result.detailedFindings.indexedDB = indexedDBFindings.details;

            // Scan for embedded tracking scripts
            const scriptFindings = this.scanEmbeddedScripts();
            result.securityThreats += scriptFindings.suspiciousScripts;
            result.trackingFilesFound += scriptFindings.trackingScripts;
            result.detailedFindings.scripts = scriptFindings.details;

            result.filesScanned += localStorageFindings.itemsScanned + 
                                   sessionStorageFindings.itemsScanned + 
                                   indexedDBFindings.databasesScanned + 
                                   scriptFindings.scriptsScanned;

        } catch (error) {
            result.scanReport.push('WARNING: Browser file scan partially failed');
        }
    }

    /**
     * Scan download folder using File System Access API (when available)
     */
    static async scanDownloadFolder(result, options) {
        try {
            // Check if File System Access API is available
            if ('showDirectoryPicker' in window && options.scanDownloads) {
                result.scanReport.push('INFO: File System Access API available - can scan downloads with user permission');
                
                // Note: This would require user interaction to grant permission
                const downloadFindings = await this.analyzeDownloadPatterns();
                result.suspiciousFilesFound += downloadFindings.suspicious;
                result.largeFilesFound += downloadFindings.largeFiles;
                result.duplicateFilesFound += downloadFindings.duplicates;
                result.detailedFindings.downloads = downloadFindings.details;
                
            } else {
                result.scanReport.push('INFO: File System Access API not available - using alternative methods');
                
                // Alternative: Analyze download patterns from browser history (if accessible)
                const browserDownloads = this.analyzeBrowserDownloadHistory();
                result.detailedFindings.downloadHistory = browserDownloads;
            }

        } catch (error) {
            result.scanReport.push('WARNING: Download folder scan not available in this browser');
        }
    }

    /**
     * Scan temporary files and cache
     */
    static async scanTemporaryFiles(result, options) {
        try {
            // Scan cache storage
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                let suspiciousCache = 0;
                let totalCacheSize = 0;

                for (const cacheName of cacheNames) {
                    const cache = await caches.open(cacheName);
                    const requests = await cache.keys();
                    
                    // Analyze cache entries for suspicious content
                    requests.forEach(request => {
                        if (this.isSuspiciousURL(request.url)) {
                            suspiciousCache++;
                        }
                        totalCacheSize += 1; // Approximate
                    });
                }

                result.suspiciousFilesFound += suspiciousCache;
                result.totalSizeReclaimed += totalCacheSize;
                result.scanReport.push(`SCANNED: ${cacheNames.length} cache instances, ${suspiciousCache} suspicious entries found`);
            }

            // Scan service worker cache
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    result.scanReport.push('FOUND: Service Worker registered - analyzing for privacy implications');
                    
                    // Check if service worker has tracking capabilities
                    if (registration.active && registration.active.scriptURL) {
                        if (this.isSuspiciousURL(registration.active.scriptURL)) {
                            result.securityThreats++;
                            result.recommendations.push('Review service worker for potential tracking capabilities');
                        }
                    }
                }
            }

        } catch (error) {
            result.scanReport.push('WARNING: Temporary file scan partially failed');
        }
    }

    /**
     * Scan browser extensions for privacy and security risks
     */
    static async scanBrowserExtensions(result, options) {
        try {
            // Check for Chrome extension API access
            if (window.chrome && window.chrome.runtime) {
                result.scanReport.push('DETECTED: Chrome extension environment - analyzing permissions');
                
                // Analyze extension permissions (limited by browser security)
                const extensionFindings = this.analyzeExtensionEnvironment();
                result.privacyRisks += extensionFindings.privacyRisks;
                result.securityThreats += extensionFindings.securityRisks;
                result.detailedFindings.extensions = extensionFindings.details;
                
                if (extensionFindings.privacyRisks > 0) {
                    result.recommendations.push('Review installed browser extensions for excessive permissions');
                }
            }

            // Check for common extension indicators
            const extensionIndicators = this.detectExtensionIndicators();
            if (extensionIndicators.length > 0) {
                result.scanReport.push(`DETECTED: ${extensionIndicators.length} potential browser modifications`);
                result.detailedFindings.browserModifications = extensionIndicators;
            }

        } catch (error) {
            result.scanReport.push('WARNING: Extension scan partially failed');
        }
    }

    /**
     * Scan system settings and browser configuration
     */
    static async scanSystemSettings(result, options) {
        try {
            // Analyze browser settings and capabilities
            const browserConfig = this.analyzeBrowserConfiguration();
            result.privacyRisks += browserConfig.privacyRisks;
            result.detailedFindings.browserConfig = browserConfig.details;

            // Check for privacy-compromising browser features
            const privacyFeatures = this.analyzePrivacyFeatures();
            if (privacyFeatures.riskyFeatures > 0) {
                result.privacyRisks += privacyFeatures.riskyFeatures;
                result.recommendations.push('Disable privacy-compromising browser features');
            }

            // Analyze browser fingerprinting exposure
            const fingerprintExposure = this.analyzeFingerprintingExposure();
            result.privacyRisks += fingerprintExposure.exposureLevel;
            result.detailedFindings.fingerprinting = fingerprintExposure.details;

            result.scanReport.push(`ANALYZED: Browser configuration and privacy settings`);

        } catch (error) {
            result.scanReport.push('WARNING: System settings scan partially failed');
        }
    }

    /**
     * Scan network and privacy configuration
     */
    static async scanNetworkPrivacy(result, options) {
        try {
            // Check connection security
            const connectionSecurity = this.analyzeConnectionSecurity();
            if (connectionSecurity.risks > 0) {
                result.securityThreats += connectionSecurity.risks;
                result.recommendations.push('Use secure HTTPS connections only');
            }

            // Check for WebRTC leaks
            const webrtcLeaks = await this.checkWebRTCLeaks();
            if (webrtcLeaks.leakDetected) {
                result.privacyRisks++;
                result.recommendations.push('Consider disabling WebRTC to prevent IP leaks');
            }

            // Analyze tracking protection status
            const trackingProtection = this.analyzeTrackingProtection();
            result.detailedFindings.trackingProtection = trackingProtection;

            result.scanReport.push('COMPLETED: Network privacy analysis');

        } catch (error) {
            result.scanReport.push('WARNING: Network privacy scan partially failed');
        }
    }

    /**
     * Scan localStorage content for suspicious items
     */
    static scanLocalStorageContent() {
        const result = {
            itemsScanned: 0,
            trackingItems: 0,
            privacyRisks: 0,
            details: []
        };

        try {
            const trackingPatterns = [
                'ga', 'gtm', '_gid', '_gat', 'fbp', 'fbc', 'utm', 'pixel',
                'analytics', 'tracking', 'campaign', 'adnxs', 'doubleclick',
                'segment', 'mixpanel', 'amplitude', 'hotjar', 'crazyegg'
            ];

            const sensitivePatterns = [
                'token', 'auth', 'session', 'password', 'key', 'secret',
                'credit', 'payment', 'ssn', 'social', 'account'
            ];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                result.itemsScanned++;

                const lowerKey = key.toLowerCase();
                const lowerValue = value ? value.toLowerCase() : '';

                // Check for tracking patterns
                if (trackingPatterns.some(pattern => lowerKey.includes(pattern) || lowerValue.includes(pattern))) {
                    result.trackingItems++;
                    result.details.push({
                        type: 'tracking',
                        key: key,
                        size: value ? value.length : 0,
                        risk: 'medium'
                    });
                }

                // Check for sensitive data
                if (sensitivePatterns.some(pattern => lowerKey.includes(pattern))) {
                    result.privacyRisks++;
                    result.details.push({
                        type: 'sensitive',
                        key: key,
                        size: value ? value.length : 0,
                        risk: 'high'
                    });
                }

                // Check for large data items
                if (value && value.length > 10000) {
                    result.details.push({
                        type: 'large',
                        key: key,
                        size: value.length,
                        risk: 'low'
                    });
                }
            }

        } catch (error) {
            result.details.push({ type: 'error', message: 'localStorage scan failed' });
        }

        return result;
    }

    /**
     * Scan sessionStorage content
     */
    static scanSessionStorageContent() {
        const result = {
            itemsScanned: 0,
            trackingItems: 0,
            details: []
        };

        try {
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                result.itemsScanned++;

                if (key && (key.includes('track') || key.includes('analytics') || key.includes('ga'))) {
                    result.trackingItems++;
                }
            }
        } catch (error) {
            // Session storage access failed
        }

        return result;
    }

    /**
     * Scan IndexedDB content
     */
    static async scanIndexedDBContent() {
        const result = {
            databasesScanned: 0,
            suspiciousDatabases: 0,
            details: []
        };

        try {
            if ('indexedDB' in window && indexedDB.databases) {
                const databases = await indexedDB.databases();
                result.databasesScanned = databases.length;

                databases.forEach(db => {
                    const name = db.name.toLowerCase();
                    if (name.includes('analytics') || name.includes('tracking') || 
                        name.includes('ads') || name.includes('pixel')) {
                        result.suspiciousDatabases++;
                        result.details.push({
                            name: db.name,
                            version: db.version,
                            risk: 'medium'
                        });
                    }
                });
            }
        } catch (error) {
            result.details.push({ error: 'IndexedDB scan failed' });
        }

        return result;
    }

    /**
     * Scan embedded scripts for tracking and security threats
     */
    static scanEmbeddedScripts() {
        const result = {
            scriptsScanned: 0,
            trackingScripts: 0,
            suspiciousScripts: 0,
            details: []
        };

        try {
            const scripts = document.querySelectorAll('script[src]');
            result.scriptsScanned = scripts.length;

            const trackingDomains = [
                'google-analytics.com', 'googletagmanager.com', 'facebook.com',
                'doubleclick.net', 'googlesyndication.com', 'amazon-adsystem.com',
                'outbrain.com', 'taboola.com', 'criteo.com', 'segment.com'
            ];

            const suspiciousDomains = [
                'eval', 'document.write', 'innerHTML', 'createElement'
            ];

            scripts.forEach(script => {
                const src = script.src.toLowerCase();
                
                // Check for tracking scripts
                if (trackingDomains.some(domain => src.includes(domain))) {
                    result.trackingScripts++;
                    result.details.push({
                        type: 'tracking',
                        src: script.src,
                        risk: 'medium'
                    });
                }

                // Check for suspicious patterns
                if (src.includes('eval') || src.includes('obfuscated') || 
                    script.innerHTML && script.innerHTML.includes('eval')) {
                    result.suspiciousScripts++;
                    result.details.push({
                        type: 'suspicious',
                        src: script.src || 'inline',
                        risk: 'high'
                    });
                }
            });

        } catch (error) {
            result.details.push({ error: 'Script scan failed' });
        }

        return result;
    }

    /**
     * Check if URL is suspicious
     */
    static isSuspiciousURL(url) {
        const suspiciousPatterns = [
            'track', 'analytics', 'ads', 'doubleclick', 'facebook.com/tr',
            'google-analytics', 'googletagmanager', 'pixel', 'beacon'
        ];

        return suspiciousPatterns.some(pattern => url.toLowerCase().includes(pattern));
    }

    /**
     * Analyze browser configuration for privacy risks
     */
    static analyzeBrowserConfiguration() {
        const result = {
            privacyRisks: 0,
            details: []
        };

        try {
            // Check Do Not Track
            if (navigator.doNotTrack !== '1') {
                result.privacyRisks++;
                result.details.push({ issue: 'Do Not Track disabled', risk: 'medium' });
            }

            // Check geolocation permissions
            if ('geolocation' in navigator) {
                result.details.push({ issue: 'Geolocation API available', risk: 'medium' });
            }

            // Check camera/microphone access
            if ('mediaDevices' in navigator) {
                result.details.push({ issue: 'Media devices API available', risk: 'medium' });
            }

            // Check clipboard access
            if ('clipboard' in navigator) {
                result.details.push({ issue: 'Clipboard API available', risk: 'low' });
            }

        } catch (error) {
            result.details.push({ error: 'Configuration analysis failed' });
        }

        return result;
    }

    /**
     * Analyze privacy features
     */
    static analyzePrivacyFeatures() {
        const result = {
            riskyFeatures: 0,
            details: []
        };

        // Check for WebRTC
        if (window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection) {
            result.riskyFeatures++;
            result.details.push({ feature: 'WebRTC', risk: 'IP leak potential' });
        }

        // Check for battery API
        if (navigator.getBattery) {
            result.riskyFeatures++;
            result.details.push({ feature: 'Battery API', risk: 'Fingerprinting' });
        }

        return result;
    }

    /**
     * Analyze fingerprinting exposure
     */
    static analyzeFingerprintingExposure() {
        const result = {
            exposureLevel: 0,
            details: []
        };

        // Canvas fingerprinting
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
                result.exposureLevel++;
                result.details.push({ method: 'Canvas', exposed: true });
            }
        } catch (e) {}

        // WebGL fingerprinting
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl');
            if (gl) {
                result.exposureLevel++;
                result.details.push({ method: 'WebGL', exposed: true });
            }
        } catch (e) {}

        // Audio fingerprinting
        if (window.AudioContext || window.webkitAudioContext) {
            result.exposureLevel++;
            result.details.push({ method: 'Audio', exposed: true });
        }

        return result;
    }

    /**
     * Analyze connection security
     */
    static analyzeConnectionSecurity() {
        const result = {
            risks: 0,
            details: []
        };

        // Check protocol
        if (location.protocol !== 'https:') {
            result.risks++;
            result.details.push({ issue: 'Insecure HTTP connection', severity: 'high' });
        }

        // Check for mixed content
        const httpResources = document.querySelectorAll('[src^="http:"], [href^="http:"]');
        if (httpResources.length > 0) {
            result.risks++;
            result.details.push({ issue: `${httpResources.length} insecure resources`, severity: 'medium' });
        }

        return result;
    }

    /**
     * Check for WebRTC leaks
     */
    static async checkWebRTCLeaks() {
        return new Promise((resolve) => {
            const result = { leakDetected: false, details: [] };

            try {
                const RTCPeerConnection = window.RTCPeerConnection || 
                                        window.mozRTCPeerConnection || 
                                        window.webkitRTCPeerConnection;

                if (!RTCPeerConnection) {
                    resolve(result);
                    return;
                }

                const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
                
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        result.leakDetected = true;
                        result.details.push({ type: 'ICE candidate', data: event.candidate.candidate });
                    }
                };

                pc.createDataChannel('test');
                pc.createOffer().then(offer => pc.setLocalDescription(offer));

                setTimeout(() => {
                    pc.close();
                    resolve(result);
                }, 2000);

            } catch (error) {
                resolve(result);
            }
        });
    }

    /**
     * Analyze tracking protection status
     */
    static analyzeTrackingProtection() {
        const result = {
            enabled: false,
            details: []
        };

        // Check for common tracking protection indicators
        if (navigator.doNotTrack === '1') {
            result.enabled = true;
            result.details.push({ protection: 'Do Not Track', status: 'enabled' });
        }

        // Check for ad blocker presence
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        document.body.appendChild(testAd);
        
        setTimeout(() => {
            if (testAd.offsetHeight === 0) {
                result.details.push({ protection: 'Ad Blocker', status: 'detected' });
            }
            document.body.removeChild(testAd);
        }, 100);

        return result;
    }

    /**
     * Analyze download patterns (simulated)
     */
    static analyzeDownloadPatterns() {
        // This would analyze actual downloads if File System Access API is available
        return {
            suspicious: 0,
            largeFiles: 0,
            duplicates: 0,
            details: []
        };
    }

    /**
     * Analyze browser download history (limited access)
     */
    static analyzeBrowserDownloadHistory() {
        // Browser security prevents direct access to download history
        return {
            message: 'Download history analysis requires browser extension or manual review'
        };
    }

    /**
     * Analyze extension environment
     */
    static analyzeExtensionEnvironment() {
        const result = {
            privacyRisks: 0,
            securityRisks: 0,
            details: []
        };

        // Check for Chrome extension indicators
        if (window.chrome && window.chrome.runtime) {
            result.details.push({ indicator: 'Chrome extension API', risk: 'medium' });
            
            // Check for content script injection
            if (document.querySelector('[data-extension-id]')) {
                result.privacyRisks++;
                result.details.push({ indicator: 'Content script injection detected', risk: 'medium' });
            }
        }

        return result;
    }

    /**
     * Detect extension indicators
     */
    static detectExtensionIndicators() {
        const indicators = [];

        // Check for common extension DOM modifications
        if (document.querySelector('.extension-inserted')) {
            indicators.push({ type: 'DOM modification', source: 'extension' });
        }

        // Check for extension-injected styles
        const styleSheets = Array.from(document.styleSheets);
        styleSheets.forEach(sheet => {
            try {
                if (sheet.href && sheet.href.includes('extension://')) {
                    indicators.push({ type: 'Extension stylesheet', source: sheet.href });
                }
            } catch (e) {
                // Cross-origin stylesheet, ignore
            }
        });

        return indicators;
    }

    /**
     * Generate comprehensive report
     */
    static generateComprehensiveReport(result) {
        // Calculate overall risk score
        const totalThreats = result.suspiciousFilesFound + result.securityThreats + result.privacyRisks;
        
        if (totalThreats === 0) {
            result.scanReport.unshift('SUCCESS: No significant threats or privacy risks detected');
        } else if (totalThreats < 5) {
            result.scanReport.unshift('GOOD: Minor privacy risks detected - review recommendations');
        } else if (totalThreats < 10) {
            result.scanReport.unshift('WARNING: Moderate privacy risks detected - action recommended');
        } else {
            result.scanReport.unshift('CRITICAL: High privacy risks detected - immediate action required');
        }

        // Add scan summary
        result.scanReport.push('--- SCAN SUMMARY ---');
        result.scanReport.push(`Files Scanned: ${result.filesScanned}`);
        result.scanReport.push(`Suspicious Files: ${result.suspiciousFilesFound}`);
        result.scanReport.push(`Tracking Files: ${result.trackingFilesFound}`);
        result.scanReport.push(`Security Threats: ${result.securityThreats}`);
        result.scanReport.push(`Privacy Risks: ${result.privacyRisks}`);
        
        // Add recommendations
        if (result.recommendations.length === 0) {
            result.recommendations.push('System appears clean - maintain good security practices');
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AdvancedSystemScanner = AdvancedSystemScanner;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedSystemScanner;
}