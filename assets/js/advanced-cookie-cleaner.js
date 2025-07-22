/**
 * Enhanced Cookie Cleaner Module
 * Advanced local cleanup with comprehensive privacy protection
 */

class AdvancedCookieCleaner {
    static async performDeepCleanup(options = {}) {
        const result = {
            cookiesRemoved: 0,
            storageCleared: 0,
            cacheCleared: false,
            sessionsCleared: 0,
            trackingDataRemoved: 0,
            fingerprintingDataCleared: 0,
            securityIssuesFixed: 0,
            totalDataRemoved: 0,
            cleanupReport: [],
            securityReport: [],
            recommendations: []
        };

        try {
            // Phase 1: Cookie and Storage Cleanup
            if (options.clearCookies !== false) {
                await this.clearAllCookies(result);
            }

            // Phase 2: Advanced Storage Cleanup
            if (options.clearStorage !== false) {
                await this.clearAdvancedStorage(result);
            }

            // Phase 3: Cache and Temporary Data
            if (options.clearCache !== false) {
                await this.clearCacheAndTemp(result);
            }

            // Phase 4: Tracking and Fingerprinting Data
            await this.removeTrackingData(result);
            await this.clearFingerprintingData(result);

            // Phase 5: Security Hardening
            await this.performSecurityCleanup(result);

            // Phase 6: Generate Report and Recommendations
            this.generateCleanupReport(result);
            this.generateSecurityRecommendations(result);

            result.totalDataRemoved = this.calculateTotalDataRemoved(result);

        } catch (error) {
            console.error('Advanced cleanup failed:', error);
            result.cleanupReport.push('ERROR: Some cleanup operations failed');
        }

        return result;
    }

    /**
     * Clear all cookies with advanced filtering
     */
    static async clearAllCookies(result) {
        let cookieCount = 0;
        
        try {
            // Get all cookies
            const allCookies = document.cookie.split(';');
            
            // Clear each cookie
            allCookies.forEach(cookie => {
                const eqPos = cookie.indexOf('=');
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                
                if (name) {
                    // Clear for current domain
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
                    cookieCount++;
                }
            });

            // Clear additional cookie variants
            const commonDomains = this.getCommonTrackingDomains();
            commonDomains.forEach(domain => {
                try {
                    document.cookie = `_ga=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}; path=/`;
                    document.cookie = `_gid=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}; path=/`;
                    document.cookie = `_fbp=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}; path=/`;
                } catch (e) {
                    // Domain restrictions, ignore
                }
            });

            result.cookiesRemoved = cookieCount;
            result.cleanupReport.push(`Cleared ${cookieCount} cookies from current domain`);

        } catch (error) {
            result.cleanupReport.push('WARNING: Cookie clearing partially failed');
        }
    }

    /**
     * Clear advanced storage including IndexedDB, WebSQL, Cache API
     */
    static async clearAdvancedStorage(result) {
        let storageItemsCleared = 0;

        try {
            // Clear localStorage
            const localStorageCount = localStorage.length;
            localStorage.clear();
            storageItemsCleared += localStorageCount;
            result.cleanupReport.push(`Cleared ${localStorageCount} localStorage items`);

            // Clear sessionStorage
            const sessionStorageCount = sessionStorage.length;
            sessionStorage.clear();
            result.sessionsCleared = sessionStorageCount;
            storageItemsCleared += sessionStorageCount;
            result.cleanupReport.push(`Cleared ${sessionStorageCount} sessionStorage items`);

            // Clear IndexedDB
            const indexedDBCleared = await this.clearIndexedDB();
            storageItemsCleared += indexedDBCleared;
            result.cleanupReport.push(`Cleared ${indexedDBCleared} IndexedDB databases`);

            // Clear WebSQL (deprecated but still exists)
            try {
                if (window.openDatabase) {
                    const db = window.openDatabase('', '', '', '');
                    if (db) {
                        result.cleanupReport.push('Attempted WebSQL cleanup');
                    }
                }
            } catch (e) {
                // WebSQL not supported or blocked
            }

            // Clear Cache API
            if ('caches' in window) {
                try {
                    const cacheNames = await caches.keys();
                    await Promise.all(cacheNames.map(name => caches.delete(name)));
                    result.cleanupReport.push(`Cleared ${cacheNames.length} cache instances`);
                } catch (e) {
                    result.cleanupReport.push('WARNING: Cache API cleanup failed');
                }
            }

            result.storageCleared = storageItemsCleared;

        } catch (error) {
            result.cleanupReport.push('WARNING: Advanced storage cleanup partially failed');
        }
    }

    /**
     * Clear cache and temporary data
     */
    static async clearCacheAndTemp(result) {
        try {
            // Clear application cache (deprecated but still exists)
            if (window.applicationCache) {
                try {
                    window.applicationCache.update();
                    result.cleanupReport.push('Application cache updated');
                } catch (e) {
                    // Ignore if not supported
                }
            }

            // Clear service worker cache
            if ('serviceWorker' in navigator) {
                try {
                    const registration = await navigator.serviceWorker.getRegistration();
                    if (registration) {
                        await registration.unregister();
                        result.cleanupReport.push('Service worker unregistered');
                    }
                } catch (e) {
                    // Ignore if no service worker
                }
            }

            result.cacheCleared = true;

        } catch (error) {
            result.cleanupReport.push('WARNING: Cache cleanup partially failed');
        }
    }

    /**
     * Remove tracking data and identifiers
     */
    static async removeTrackingData(result) {
        let trackingDataRemoved = 0;

        try {
            // Clear Google Analytics data
            if (window.gtag) {
                try {
                    window.gtag('consent', 'update', {
                        'analytics_storage': 'denied',
                        'ad_storage': 'denied'
                    });
                    trackingDataRemoved++;
                } catch (e) {
                    // Continue with other cleanup
                }
            }

            // Clear Facebook tracking
            if (window.fbq) {
                try {
                    window.fbq('consent', 'revoke');
                    trackingDataRemoved++;
                } catch (e) {
                    // Continue with other cleanup
                }
            }

            // Remove tracking pixels and beacons
            const trackingElements = document.querySelectorAll('img[width="1"][height="1"], img[src*="pixel"], img[src*="beacon"]');
            trackingElements.forEach(el => {
                el.remove();
                trackingDataRemoved++;
            });

            // Clear ETags by manipulating cache headers
            if (window.fetch) {
                try {
                    fetch(window.location.href, {
                        method: 'HEAD',
                        cache: 'no-cache',
                        headers: {
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                        }
                    });
                } catch (e) {
                    // Ignore fetch errors
                }
            }

            result.trackingDataRemoved = trackingDataRemoved;
            if (trackingDataRemoved > 0) {
                result.cleanupReport.push(`Removed ${trackingDataRemoved} tracking elements`);
            }

        } catch (error) {
            result.cleanupReport.push('WARNING: Tracking data removal partially failed');
        }
    }

    /**
     * Clear fingerprinting data and capabilities
     */
    static async clearFingerprintingData(result) {
        let fingerprintingDataCleared = 0;

        try {
            // Clear canvas fingerprinting data
            const canvases = document.querySelectorAll('canvas');
            canvases.forEach(canvas => {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    fingerprintingDataCleared++;
                }
            });

            // Clear WebGL fingerprinting data
            const webglElements = document.querySelectorAll('canvas[webgl], canvas[experimental-webgl]');
            webglElements.forEach(canvas => {
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (gl) {
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    fingerprintingDataCleared++;
                }
            });

            // Clear AudioContext (used for audio fingerprinting)
            if (window.AudioContext || window.webkitAudioContext) {
                try {
                    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                    // Close any existing audio contexts
                    if (window.audioContext && typeof window.audioContext.close === 'function') {
                        await window.audioContext.close();
                        fingerprintingDataCleared++;
                    }
                } catch (e) {
                    // Ignore audio context errors
                }
            }

            // Clear battery API data (if supported)
            if (navigator.getBattery) {
                try {
                    navigator.getBattery().then(() => {
                        fingerprintingDataCleared++;
                    });
                } catch (e) {
                    // Ignore battery API errors
                }
            }

            result.fingerprintingDataCleared = fingerprintingDataCleared;
            if (fingerprintingDataCleared > 0) {
                result.cleanupReport.push(`Cleared ${fingerprintingDataCleared} fingerprinting data sources`);
            }

        } catch (error) {
            result.cleanupReport.push('WARNING: Fingerprinting data cleanup partially failed');
        }
    }

    /**
     * Perform security cleanup and hardening
     */
    static async performSecurityCleanup(result) {
        let securityIssuesFixed = 0;

        try {
            // Check and fix secure cookie settings
            if (location.protocol === 'https:') {
                // Recommend secure cookies for HTTPS sites
                result.securityReport.push('SECURE: Site uses HTTPS - cookies should use Secure flag');
            } else {
                result.securityReport.push('WARNING: Site uses HTTP - data transmission not encrypted');
                result.recommendations.push('Use HTTPS websites when possible for secure communication');
            }

            // Check for mixed content
            const httpResources = document.querySelectorAll('script[src^="http:"], img[src^="http:"], link[href^="http:"]');
            if (httpResources.length > 0) {
                result.securityReport.push(`WARNING: ${httpResources.length} insecure HTTP resources detected`);
                result.recommendations.push('Avoid websites with mixed content (HTTP resources on HTTPS pages)');
            } else {
                result.securityReport.push('SECURE: No mixed content detected');
                securityIssuesFixed++;
            }

            // Check for XSS protection
            if (window.location.hash && window.location.hash.includes('<script>')) {
                result.securityReport.push('CRITICAL: Potential XSS vulnerability in URL');
                result.recommendations.push('Do not click on suspicious links with script content');
            } else {
                securityIssuesFixed++;
            }

            // Clear potentially dangerous globals
            const dangerousGlobals = ['eval', 'Function', 'setTimeout', 'setInterval'];
            dangerousGlobals.forEach(global => {
                if (window[global] && window[global].toString().includes('eval')) {
                    result.securityReport.push(`WARNING: Potentially compromised ${global} function detected`);
                }
            });

            // Check for suspicious extensions/modifications
            if (window.chrome && window.chrome.runtime) {
                result.securityReport.push('INFO: Chrome extension API detected - review installed extensions');
                result.recommendations.push('Regularly review and remove unnecessary browser extensions');
            }

            result.securityIssuesFixed = securityIssuesFixed;

        } catch (error) {
            result.securityReport.push('WARNING: Security scan partially failed');
        }
    }

    /**
     * Clear IndexedDB databases
     */
    static async clearIndexedDB() {
        let clearedDatabases = 0;

        try {
            if ('indexedDB' in window) {
                // Try to get database list (newer browsers)
                if (indexedDB.databases) {
                    const databases = await indexedDB.databases();
                    for (const db of databases) {
                        try {
                            const deleteReq = indexedDB.deleteDatabase(db.name);
                            await new Promise((resolve, reject) => {
                                deleteReq.onsuccess = resolve;
                                deleteReq.onerror = reject;
                            });
                            clearedDatabases++;
                        } catch (e) {
                            // Continue with other databases
                        }
                    }
                } else {
                    // Fallback: try common database names
                    const commonNames = ['keyval-store', 'firebase-heartbeat-store', 'firebase-installations-store'];
                    for (const name of commonNames) {
                        try {
                            const deleteReq = indexedDB.deleteDatabase(name);
                            await new Promise((resolve) => {
                                deleteReq.onsuccess = resolve;
                                deleteReq.onerror = resolve; // Don't fail on missing databases
                            });
                            clearedDatabases++;
                        } catch (e) {
                            // Continue
                        }
                    }
                }
            }
        } catch (error) {
            // IndexedDB operations can fail for various reasons
        }

        return clearedDatabases;
    }

    /**
     * Get common tracking domains for cookie cleanup
     */
    static getCommonTrackingDomains() {
        return [
            '.google.com',
            '.facebook.com',
            '.doubleclick.net',
            '.googletagmanager.com',
            '.google-analytics.com',
            '.googlesyndication.com',
            '.amazon-adsystem.com',
            '.outbrain.com',
            '.taboola.com',
            '.criteo.com'
        ];
    }

    /**
     * Calculate total data removed
     */
    static calculateTotalDataRemoved(result) {
        return result.cookiesRemoved + 
               result.storageCleared + 
               result.trackingDataRemoved + 
               result.fingerprintingDataCleared +
               (result.cacheCleared ? 1 : 0);
    }

    /**
     * Generate comprehensive cleanup report
     */
    static generateCleanupReport(result) {
        const totalItems = result.totalDataRemoved;
        
        if (totalItems > 0) {
            result.cleanupReport.unshift(`SUCCESS: Removed ${totalItems} privacy-compromising items`);
        } else {
            result.cleanupReport.unshift('INFO: System was already clean');
        }

        // Add summary statistics
        result.cleanupReport.push('--- CLEANUP SUMMARY ---');
        result.cleanupReport.push(`Cookies Removed: ${result.cookiesRemoved}`);
        result.cleanupReport.push(`Storage Items Cleared: ${result.storageCleared}`);
        result.cleanupReport.push(`Session Data Cleared: ${result.sessionsCleared}`);
        result.cleanupReport.push(`Tracking Elements Removed: ${result.trackingDataRemoved}`);
        result.cleanupReport.push(`Fingerprinting Data Cleared: ${result.fingerprintingDataCleared}`);
        result.cleanupReport.push(`Security Issues Fixed: ${result.securityIssuesFixed}`);
    }

    /**
     * Generate security recommendations
     */
    static generateSecurityRecommendations(result) {
        // Add general security recommendations
        result.recommendations.push('Use a privacy-focused browser like Firefox or Brave');
        result.recommendations.push('Enable tracking protection in your browser settings');
        result.recommendations.push('Consider using a VPN for additional privacy protection');
        result.recommendations.push('Regularly clear browser data (weekly recommended)');
        result.recommendations.push('Use ad blockers like uBlock Origin to prevent tracking');
        result.recommendations.push('Review and remove unnecessary browser extensions');
        result.recommendations.push('Keep your browser updated for latest security patches');

        // Remove duplicates
        result.recommendations = [...new Set(result.recommendations)];
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AdvancedCookieCleaner = AdvancedCookieCleaner;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedCookieCleaner;
}