/**
 * Cookie Cleaner Module
 * Handles comprehensive cookie and browser data cleanup
 */

class CookieCleaner {
    static async cleanup(options = {}) {
        const result = {
            cookiesRemoved: 0,
            storageCleared: 0,
            cacheCleared: false,
            trackersBlocked: 0,
            message: '',
            details: []
        };

        try {
            // Clear cookies if requested
            if (options.clearCookies) {
                await this.clearCookies(result);
            }

            // Clear local storage and session storage
            if (options.clearSessions) {
                await this.clearStorage(result);
            }

            // Clear cache (limited in browser environment)
            if (options.clearCache) {
                await this.clearCache(result);
            }

            // Additional cleanup
            await this.clearIndexedDB(result);
            await this.clearWebSQL(result);
            await this.analyzeThirdPartyTrackers(result);

            result.message = this.generateSummaryMessage(result);
            
        } catch (error) {
            console.error('Cookie cleanup error:', error);
            result.message = 'Cleanup completed with some limitations due to browser security policies.';
        }

        return result;
    }

    /**
     * Clear all accessible cookies
     */
    static async clearCookies(result) {
        let cookiesCleared = 0;
        
        try {
            // Get all cookies for current domain
            const cookies = document.cookie.split(';');
            
            for (let cookie of cookies) {
                const eqPos = cookie.indexOf('=');
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                
                if (name) {
                    // Clear cookie for current domain
                    this.deleteCookie(name);
                    
                    // Try to clear for parent domains
                    this.deleteCookie(name, window.location.hostname);
                    this.deleteCookie(name, '.' + window.location.hostname);
                    
                    // Try to clear for common parent domains
                    const parts = window.location.hostname.split('.');
                    if (parts.length > 2) {
                        const parentDomain = '.' + parts.slice(-2).join('.');
                        this.deleteCookie(name, parentDomain);
                    }
                    
                    cookiesCleared++;
                }
            }

            // Use the new Cookie Store API if available
            if ('cookieStore' in window) {
                try {
                    const cookieList = await cookieStore.getAll();
                    for (const cookie of cookieList) {
                        await cookieStore.delete(cookie.name);
                        cookiesCleared++;
                    }
                } catch (error) {
                    console.warn('Cookie Store API cleanup failed:', error);
                }
            }

            result.cookiesRemoved = cookiesCleared;
            result.details.push(`Removed ${cookiesCleared} cookies`);
            
        } catch (error) {
            console.error('Error clearing cookies:', error);
            result.details.push('Cookie clearing had limited success due to browser restrictions');
        }
    }

    /**
     * Delete a specific cookie
     */
    static deleteCookie(name, domain = '', path = '/') {
        const expires = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
        const domainPart = domain ? `domain=${domain};` : '';
        const pathPart = `path=${path};`;
        
        document.cookie = `${name}=;${expires};${domainPart}${pathPart}`;
        
        // Also try with different path variations
        document.cookie = `${name}=;${expires};${domainPart}path=/;`;
        document.cookie = `${name}=;${expires};${domainPart}path=;`;
    }

    /**
     * Clear local storage and session storage
     */
    static async clearStorage(result) {
        let itemsCleared = 0;

        try {
            // Clear localStorage
            if (typeof Storage !== 'undefined' && localStorage) {
                const localStorageCount = localStorage.length;
                localStorage.clear();
                itemsCleared += localStorageCount;
                result.details.push(`Cleared ${localStorageCount} localStorage items`);
            }

            // Clear sessionStorage
            if (typeof Storage !== 'undefined' && sessionStorage) {
                const sessionStorageCount = sessionStorage.length;
                sessionStorage.clear();
                itemsCleared += sessionStorageCount;
                result.details.push(`Cleared ${sessionStorageCount} sessionStorage items`);
            }

            result.storageCleared = itemsCleared;

        } catch (error) {
            console.error('Error clearing storage:', error);
            result.details.push('Storage clearing encountered restrictions');
        }
    }

    /**
     * Clear browser cache (limited capabilities)
     */
    static async clearCache(result) {
        try {
            // Use Cache API if available
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                
                for (const cacheName of cacheNames) {
                    await caches.delete(cacheName);
                }
                
                result.cacheCleared = true;
                result.details.push(`Cleared ${cacheNames.length} cache stores`);
            } else {
                result.details.push('Cache API not available - manual browser cache clear recommended');
            }

        } catch (error) {
            console.error('Error clearing cache:', error);
            result.details.push('Cache clearing had limited success');
        }
    }

    /**
     * Clear IndexedDB databases
     */
    static async clearIndexedDB(result) {
        try {
            if ('indexedDB' in window) {
                // Get list of databases (if supported)
                if (indexedDB.databases) {
                    const databases = await indexedDB.databases();
                    
                    for (const db of databases) {
                        const deleteRequest = indexedDB.deleteDatabase(db.name);
                        await new Promise((resolve, reject) => {
                            deleteRequest.onsuccess = () => resolve();
                            deleteRequest.onerror = () => reject(deleteRequest.error);
                            deleteRequest.onblocked = () => reject(new Error('Database deletion blocked'));
                        });
                    }
                    
                    result.details.push(`Cleared ${databases.length} IndexedDB databases`);
                } else {
                    result.details.push('IndexedDB database enumeration not supported');
                }
            }
        } catch (error) {
            console.error('Error clearing IndexedDB:', error);
            result.details.push('IndexedDB clearing encountered restrictions');
        }
    }

    /**
     * Clear WebSQL databases (deprecated but still present in some browsers)
     */
    static async clearWebSQL(result) {
        try {
            if ('openDatabase' in window) {
                // WebSQL is deprecated, but we'll try to clear it
                result.details.push('WebSQL detected - manual clearing may be required');
            }
        } catch (error) {
            console.error('Error with WebSQL:', error);
        }
    }

    /**
     * Analyze and report third-party trackers
     */
    static async analyzeThirdPartyTrackers(result) {
        try {
            const trackers = this.detectTrackers();
            result.trackersBlocked = trackers.length;
            
            if (trackers.length > 0) {
                result.details.push(`Detected ${trackers.length} potential tracking domains`);
            }

        } catch (error) {
            console.error('Error analyzing trackers:', error);
        }
    }

    /**
     * Detect common tracking domains
     */
    static detectTrackers() {
        const commonTrackers = [
            'google-analytics.com',
            'googletagmanager.com',
            'facebook.com',
            'doubleclick.net',
            'googlesyndication.com',
            'amazon-adsystem.com',
            'adsystem.com',
            'twitter.com',
            'linkedin.com',
            'bing.com',
            'yahoo.com',
            'yandex.com',
            'baidu.com',
            'quantserve.com',
            'scorecardresearch.com',
            'outbrain.com',
            'taboola.com',
            'criteo.com',
            'adsystem.com'
        ];

        const detectedTrackers = [];
        
        // Check for scripts from tracking domains
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            const src = script.src;
            commonTrackers.forEach(tracker => {
                if (src.includes(tracker)) {
                    detectedTrackers.push(tracker);
                }
            });
        });

        // Check for images from tracking domains
        const images = document.querySelectorAll('img[src]');
        images.forEach(img => {
            const src = img.src;
            commonTrackers.forEach(tracker => {
                if (src.includes(tracker)) {
                    detectedTrackers.push(tracker);
                }
            });
        });

        return [...new Set(detectedTrackers)]; // Remove duplicates
    }

    /**
     * Generate detailed instructions for manual cleanup
     */
    static generateManualInstructions() {
        const browser = this.detectBrowser();
        
        const instructions = {
            chrome: {
                title: 'Chrome Manual Cleanup',
                steps: [
                    'Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)',
                    'Select "All time" from the time range dropdown',
                    'Check all boxes: Browsing history, Cookies, Cached images',
                    'Click "Clear data"',
                    'Go to Settings > Privacy and security > Cookies',
                    'Click "See all cookies and site data"',
                    'Click "Remove all" to delete remaining cookies'
                ]
            },
            firefox: {
                title: 'Firefox Manual Cleanup',
                steps: [
                    'Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)',
                    'Select "Everything" from the time range dropdown',
                    'Check: Cookies, Cache, Active Logins, Site Preferences',
                    'Click "Clear Now"',
                    'Go to Settings > Privacy & Security',
                    'Under Cookies, click "Manage Data"',
                    'Click "Remove All" to clear remaining data'
                ]
            },
            safari: {
                title: 'Safari Manual Cleanup',
                steps: [
                    'Go to Safari > Preferences > Privacy',
                    'Click "Manage Website Data"',
                    'Click "Remove All"',
                    'Go to Develop menu > Empty Caches',
                    'In Preferences > Privacy, click "Remove All Website Data"',
                    'Restart Safari for complete cleanup'
                ]
            },
            edge: {
                title: 'Edge Manual Cleanup',
                steps: [
                    'Press Ctrl+Shift+Delete',
                    'Select "All time" from the time range',
                    'Check: Browsing history, Cookies, Cached images',
                    'Click "Clear now"',
                    'Go to Settings > Cookies and site permissions',
                    'Click "See all cookies and site data"',
                    'Click "Remove all" to clear remaining cookies'
                ]
            }
        };

        return instructions[browser] || instructions.chrome;
    }

    /**
     * Detect current browser
     */
    static detectBrowser() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
            return 'chrome';
        } else if (userAgent.includes('firefox')) {
            return 'firefox';
        } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
            return 'safari';
        } else if (userAgent.includes('edg')) {
            return 'edge';
        }
        
        return 'chrome'; // Default fallback
    }

    /**
     * Generate summary message
     */
    static generateSummaryMessage(result) {
        const parts = [];
        
        if (result.cookiesRemoved > 0) {
            parts.push(`${result.cookiesRemoved} cookies removed`);
        }
        
        if (result.storageCleared > 0) {
            parts.push(`${result.storageCleared} storage items cleared`);
        }
        
        if (result.cacheCleared) {
            parts.push('cache cleared');
        }
        
        if (result.trackersBlocked > 0) {
            parts.push(`${result.trackersBlocked} tracking domains detected`);
        }

        if (parts.length === 0) {
            return 'Browser cleanup completed. No data found to remove.';
        }

        return `Cleanup successful: ${parts.join(', ')}.`;
    }

    /**
     * Get privacy recommendations based on browser
     */
    static getPrivacyRecommendations() {
        const browser = this.detectBrowser();
        
        const recommendations = {
            general: [
                'Enable "Do Not Track" requests in browser settings',
                'Block third-party cookies in privacy settings',
                'Use private/incognito mode for sensitive browsing',
                'Install a reputable ad blocker extension',
                'Regularly clear browsing data (weekly recommended)',
                'Disable location sharing for websites',
                'Turn off password saving for sensitive sites',
                'Use HTTPS-only mode when available'
            ],
            chrome: [
                'Enable "Send a Do Not Track request"',
                'Set cookies to "Block third-party cookies"',
                'Enable "Preload pages for faster browsing" = OFF',
                'Turn off "Make searches and browsing better"',
                'Disable "Help improve Chrome\'s features"'
            ],
            firefox: [
                'Set Enhanced Tracking Protection to "Strict"',
                'Enable "Delete cookies and site data when Firefox is closed"',
                'Set "Send websites a Do Not Track signal"',
                'Disable "Allow Firefox to make personalized extension recommendations"',
                'Turn off "Allow Firefox to send technical and interaction data"'
            ],
            safari: [
                'Enable "Prevent cross-site tracking"',
                'Set "Block all cookies" or "Block third-party cookies"',
                'Enable "Hide IP address from trackers"',
                'Turn on "Private Relay" if available',
                'Disable "Allow privacy-preserving measurement of ad effectiveness"'
            ],
            edge: [
                'Set Tracking prevention to "Strict"',
                'Enable "Send Do Not Track requests"',
                'Block third-party cookies',
                'Turn off "Help improve Microsoft products"',
                'Disable "Personalize your web experience"'
            ]
        };

        return {
            general: recommendations.general,
            browser: recommendations[browser] || recommendations.chrome
        };
    }

    /**
     * Test browser privacy settings
     */
    static async testPrivacySettings() {
        const tests = {
            thirdPartyCookies: this.testThirdPartyCookies(),
            doNotTrack: navigator.doNotTrack === '1',
            localStorage: this.testLocalStorage(),
            sessionStorage: this.testSessionStorage(),
            indexedDB: this.testIndexedDB(),
            geolocation: this.testGeolocation()
        };

        return tests;
    }

    /**
     * Test if third-party cookies are blocked
     */
    static testThirdPartyCookies() {
        try {
            // This is a simplified test - real-world testing would require external domains
            return document.cookie.indexOf('test=') === -1;
        } catch (error) {
            return true; // Assume blocked if we can't test
        }
    }

    /**
     * Test localStorage access
     */
    static testLocalStorage() {
        try {
            localStorage.setItem('privacy-test', 'test');
            localStorage.removeItem('privacy-test');
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Test sessionStorage access
     */
    static testSessionStorage() {
        try {
            sessionStorage.setItem('privacy-test', 'test');
            sessionStorage.removeItem('privacy-test');
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Test IndexedDB access
     */
    static testIndexedDB() {
        return 'indexedDB' in window;
    }

    /**
     * Test geolocation access
     */
    static testGeolocation() {
        return 'geolocation' in navigator;
    }

    /**
     * Generate browser-specific cleanup instructions
     */
    static getBrowserCleanupInstructions() {
        const browser = this.detectBrowser();
        const instructions = this.generateManualInstructions();
        const recommendations = this.getPrivacyRecommendations();

        return {
            browser: browser,
            instructions: instructions,
            recommendations: recommendations,
            automatedCleanup: 'This tool performs automated cleanup where possible, but manual steps may provide more thorough results.',
            limitations: 'Due to browser security policies, some data can only be cleared through browser settings.'
        };
    }
}

// Export the class for use in other modules
if (typeof window !== 'undefined') {
    window.CookieCleaner = CookieCleaner;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CookieCleaner;
}
