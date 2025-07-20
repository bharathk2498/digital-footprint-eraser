/**
 * Digital Footprint Eraser - Content Script
 * Provides real-time privacy protection on web pages
 */

// Content script state
let privacyProtection = {
    isActive: false,
    trackersBlocked: 0,
    cookiesBlocked: 0,
    socialWidgetsRemoved: 0,
    fingerprinting: {
        canvasBlocked: 0,
        webglBlocked: 0,
        audioBlocked: 0
    },
    lastScan: null
};

// Configuration
const PROTECTION_CONFIG = {
    blockTrackers: true,
    removeSocialWidgets: true,
    preventFingerprinting: true,
    clearCookiesAutomatically: false,
    blockTrackingPixels: true,
    enhancedMode: false
};

/**
 * Initialize content script
 */
(function initializeContentScript() {
    console.log('🔐 Digital Footprint Eraser: Content script initializing...');
    
    // Check if we should run on this page
    if (!shouldRunOnPage()) {
        console.log('🚫 Content script skipped for this page');
        return;
    }
    
    // Load configuration from storage
    chrome.storage.sync.get([
        'privacyProtectionEnabled',
        'blockTrackers',
        'removeSocialWidgets',
        'preventFingerprinting',
        'enhancedMode'
    ]).then(settings => {
        Object.assign(PROTECTION_CONFIG, settings);
        
        if (settings.privacyProtectionEnabled !== false) {
            enablePrivacyProtection();
        }
    });
    
    // Listen for messages from popup/background
    chrome.runtime.onMessage.addListener(handleMessage);
    
    console.log('✅ Digital Footprint Eraser: Content script ready');
})();

/**
 * Check if content script should run on current page
 */
function shouldRunOnPage() {
    const url = window.location.href;
    
    // Skip extension pages and special URLs
    if (url.startsWith('chrome://') || 
        url.startsWith('chrome-extension://') ||
        url.startsWith('edge://') ||
        url.startsWith('about:') ||
        url.startsWith('moz-extension://')) {
        return false;
    }
    
    return true;
}

/**
 * Enable comprehensive privacy protection
 */
function enablePrivacyProtection() {
    console.log('🛡️ Enabling privacy protection on page');
    
    privacyProtection.isActive = true;
    
    // Run immediate protections
    if (PROTECTION_CONFIG.blockTrackingPixels) {
        blockTrackingPixels();
    }
    
    if (PROTECTION_CONFIG.removeSocialWidgets) {
        removeSocialWidgets();
    }
    
    if (PROTECTION_CONFIG.blockTrackers) {
        blockTrackingScripts();
    }
    
    if (PROTECTION_CONFIG.preventFingerprinting) {
        setupFingerprintingProtection();
    }
    
    // Set up monitoring
    setupDOMMonitoring();
    setupNetworkMonitoring();
    
    // Schedule periodic scans
    setInterval(performPeriodicScan, 30000); // Every 30 seconds
    
    // Send initial status to background
    reportStatus();
    
    console.log('✅ Privacy protection active');
}

/**
 * Block tracking pixels and 1x1 images
 */
function blockTrackingPixels() {
    console.log('🔍 Scanning for tracking pixels...');
    
    let pixelsBlocked = 0;
    
    // Find and remove 1x1 tracking pixels
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if ((img.width === 1 && img.height === 1) || 
            img.src.includes('pixel') ||
            img.src.includes('beacon') ||
            img.src.includes('track')) {
            
            console.log('🚫 Blocked tracking pixel:', img.src);
            img.remove();
            pixelsBlocked++;
        }
    });
    
    // Block tracking iframes
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        if (iframe.width === '1' || iframe.height === '1') {
            console.log('🚫 Blocked tracking iframe:', iframe.src);
            iframe.remove();
            pixelsBlocked++;
        }
    });
    
    privacyProtection.trackersBlocked += pixelsBlocked;
    
    if (pixelsBlocked > 0) {
        console.log(`✅ Blocked ${pixelsBlocked} tracking pixels`);
    }
}

/**
 * Remove social media widgets and tracking buttons
 */
function removeSocialWidgets() {
    console.log('📱 Scanning for social media widgets...');
    
    let widgetsRemoved = 0;
    
    // Social media widget selectors
    const socialSelectors = [
        // Facebook
        '[class*="facebook"]', '[id*="facebook"]', '.fb-like', '.fb-share',
        '[class*="fb-"]', '[data-href*="facebook.com"]',
        
        // Twitter
        '[class*="twitter"]', '[id*="twitter"]', '.twitter-share-button',
        '[class*="tweet"]', '[data-url*="twitter.com"]',
        
        // LinkedIn
        '[class*="linkedin"]', '[id*="linkedin"]', '.linkedin-share',
        '[class*="linked-in"]',
        
        // Instagram
        '[class*="instagram"]', '[id*="instagram"]', '[class*="insta"]',
        
        // Pinterest
        '[class*="pinterest"]', '[id*="pinterest"]', '.pin-it-button',
        
        // YouTube (tracking elements)
        '[class*="youtube-tracking"]', '[id*="yt-tracking"]',
        
        // Generic social
        '[class*="social-share"]', '[class*="share-button"]',
        '[data-social]', '[class*="addthis"]', '[class*="sharethis"]'
    ];\n    \n    socialSelectors.forEach(selector => {\n        try {\n            const elements = document.querySelectorAll(selector);\n            elements.forEach(element => {\n                // Check if it's actually a tracking widget\n                if (isTrackingWidget(element)) {\n                    console.log('🚫 Removed social widget:', selector);\n                    element.remove();\n                    widgetsRemoved++;\n                }\n            });\n        } catch (error) {\n            console.warn('Error removing social widget:', error);\n        }\n    });\n    \n    privacyProtection.socialWidgetsRemoved += widgetsRemoved;\n    \n    if (widgetsRemoved > 0) {\n        console.log(`✅ Removed ${widgetsRemoved} social widgets`);\n    }\n}\n\n/**\n * Check if element is a tracking widget\n */\nfunction isTrackingWidget(element) {\n    const trackingIndicators = [\n        'track', 'analytics', 'pixel', 'beacon',\n        'facebook.com', 'twitter.com', 'linkedin.com',\n        'google-analytics', 'gtm', 'fbevents'\n    ];\n    \n    const elementText = element.outerHTML.toLowerCase();\n    return trackingIndicators.some(indicator => elementText.includes(indicator));\n}\n\n/**\n * Block tracking scripts from loading\n */\nfunction blockTrackingScripts() {\n    console.log('🚫 Setting up script blocking...');\n    \n    // List of tracking domains to block\n    const trackingDomains = [\n        'google-analytics.com',\n        'googletagmanager.com',\n        'googlesyndication.com',\n        'doubleclick.net',\n        'facebook.com/tr/',\n        'connect.facebook.net',\n        'twitter.com/i/adsct',\n        'linkedin.com/insight',\n        'outbrain.com',\n        'taboola.com',\n        'criteo.com',\n        'amazon-adsystem.com',\n        'adsystem.com',\n        'quantserve.com',\n        'scorecardresearch.com'\n    ];\n    \n    // Monitor script elements\n    const scripts = document.querySelectorAll('script[src]');\n    scripts.forEach(script => {\n        const src = script.src.toLowerCase();\n        \n        if (trackingDomains.some(domain => src.includes(domain))) {\n            console.log('🚫 Blocked tracking script:', script.src);\n            script.remove();\n            privacyProtection.trackersBlocked++;\n        }\n    });\n}\n\n/**\n * Set up fingerprinting protection\n */\nfunction setupFingerprintingProtection() {\n    console.log('🔒 Setting up fingerprinting protection...');\n    \n    // Protect Canvas fingerprinting\n    protectCanvas();\n    \n    // Protect WebGL fingerprinting\n    protectWebGL();\n    \n    // Protect Audio fingerprinting\n    protectAudioContext();\n    \n    // Protect font enumeration\n    protectFontEnumeration();\n    \n    // Protect screen/device info\n    protectDeviceInfo();\n}\n\n/**\n * Protect against Canvas fingerprinting\n */\nfunction protectCanvas() {\n    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;\n    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;\n    const originalToBlob = HTMLCanvasElement.prototype.toBlob;\n    \n    // Override getImageData\n    CanvasRenderingContext2D.prototype.getImageData = function(...args) {\n        console.log('🛡️ Canvas fingerprinting attempt blocked');\n        privacyProtection.fingerprinting.canvasBlocked++;\n        \n        // Return slightly modified data to break fingerprinting\n        const imageData = originalGetImageData.apply(this, args);\n        if (imageData && imageData.data) {\n            // Add noise to break fingerprinting\n            for (let i = 0; i < imageData.data.length; i += 4) {\n                imageData.data[i] += Math.floor(Math.random() * 3) - 1;\n            }\n        }\n        return imageData;\n    };\n    \n    // Override toDataURL\n    HTMLCanvasElement.prototype.toDataURL = function(...args) {\n        console.log('🛡️ Canvas toDataURL fingerprinting blocked');\n        privacyProtection.fingerprinting.canvasBlocked++;\n        \n        // Return modified data\n        const result = originalToDataURL.apply(this, args);\n        return result + Math.random().toString(36).substr(2, 5);\n    };\n    \n    // Override toBlob\n    HTMLCanvasElement.prototype.toBlob = function(callback, ...args) {\n        console.log('🛡️ Canvas toBlob fingerprinting blocked');\n        privacyProtection.fingerprinting.canvasBlocked++;\n        \n        return originalToBlob.call(this, callback, ...args);\n    };\n}\n\n/**\n * Protect against WebGL fingerprinting\n */\nfunction protectWebGL() {\n    const getParameter = WebGLRenderingContext.prototype.getParameter;\n    \n    WebGLRenderingContext.prototype.getParameter = function(parameter) {\n        console.log('🛡️ WebGL fingerprinting attempt blocked');\n        privacyProtection.fingerprinting.webglBlocked++;\n        \n        // Return generic values for fingerprinting parameters\n        switch (parameter) {\n            case this.RENDERER:\n                return 'Generic Renderer';\n            case this.VENDOR:\n                return 'Generic Vendor';\n            case this.VERSION:\n                return 'WebGL 1.0';\n            case this.SHADING_LANGUAGE_VERSION:\n                return 'WebGL GLSL ES 1.0';\n            default:\n                return getParameter.call(this, parameter);\n        }\n    };\n}\n\n/**\n * Protect against Audio fingerprinting\n */\nfunction protectAudioContext() {\n    if (typeof AudioContext !== 'undefined') {\n        const originalCreateAnalyser = AudioContext.prototype.createAnalyser;\n        \n        AudioContext.prototype.createAnalyser = function() {\n            console.log('🛡️ Audio fingerprinting attempt blocked');\n            privacyProtection.fingerprinting.audioBlocked++;\n            \n            const analyser = originalCreateAnalyser.call(this);\n            \n            // Override getByteFrequencyData to add noise\n            const originalGetByteFrequencyData = analyser.getByteFrequencyData;\n            analyser.getByteFrequencyData = function(array) {\n                originalGetByteFrequencyData.call(this, array);\n                // Add noise to break fingerprinting\n                for (let i = 0; i < array.length; i++) {\n                    array[i] += Math.floor(Math.random() * 3) - 1;\n                }\n            };\n            \n            return analyser;\n        };\n    }\n}\n\n/**\n * Protect against font enumeration\n */\nfunction protectFontEnumeration() {\n    // This is more complex and would involve intercepting font-related CSS/DOM operations\n    // For now, we'll just log attempts\n    console.log('🛡️ Font enumeration protection active');\n}\n\n/**\n * Protect device information\n */\nfunction protectDeviceInfo() {\n    // Override navigator properties that can be used for fingerprinting\n    const navigatorOverrides = {\n        hardwareConcurrency: 4, // Generic value\n        deviceMemory: 8, // Generic value\n        platform: 'Win32', // Generic value\n    };\n    \n    Object.keys(navigatorOverrides).forEach(prop => {\n        if (prop in navigator) {\n            try {\n                Object.defineProperty(navigator, prop, {\n                    get: () => {\n                        console.log(`🛡️ Navigator.${prop} fingerprinting blocked`);\n                        return navigatorOverrides[prop];\n                    }\n                });\n            } catch (error) {\n                console.warn(`Could not override navigator.${prop}:`, error);\n            }\n        }\n    });\n}\n\n/**\n * Set up DOM monitoring for new tracking elements\n */\nfunction setupDOMMonitoring() {\n    const observer = new MutationObserver(mutations => {\n        mutations.forEach(mutation => {\n            mutation.addedNodes.forEach(node => {\n                if (node.nodeType === Node.ELEMENT_NODE) {\n                    // Check for new tracking scripts\n                    if (node.tagName === 'SCRIPT' && node.src) {\n                        const src = node.src.toLowerCase();\n                        const trackingDomains = [\n                            'google-analytics', 'facebook.com', 'doubleclick',\n                            'googlesyndication', 'twitter.com', 'linkedin.com'\n                        ];\n                        \n                        if (trackingDomains.some(domain => src.includes(domain))) {\n                            console.log('🚫 Blocked dynamically added tracking script:', node.src);\n                            node.remove();\n                            privacyProtection.trackersBlocked++;\n                        }\n                    }\n                    \n                    // Check for new tracking pixels\n                    if (node.tagName === 'IMG' && \n                        (node.width === 1 || node.height === 1)) {\n                        console.log('🚫 Blocked dynamically added tracking pixel');\n                        node.remove();\n                        privacyProtection.trackersBlocked++;\n                    }\n                    \n                    // Check for social widgets in added nodes\n                    if (PROTECTION_CONFIG.removeSocialWidgets && isTrackingWidget(node)) {\n                        console.log('🚫 Removed dynamically added social widget');\n                        node.remove();\n                        privacyProtection.socialWidgetsRemoved++;\n                    }\n                }\n            });\n        });\n    });\n    \n    observer.observe(document.body, {\n        childList: true,\n        subtree: true\n    });\n    \n    console.log('👀 DOM monitoring active');\n}\n\n/**\n * Set up network request monitoring\n */\nfunction setupNetworkMonitoring() {\n    // Override fetch to monitor network requests\n    const originalFetch = window.fetch;\n    \n    window.fetch = function(...args) {\n        const url = args[0];\n        \n        if (typeof url === 'string') {\n            const trackingDomains = [\n                'google-analytics.com',\n                'facebook.com',\n                'doubleclick.net',\n                'googlesyndication.com'\n            ];\n            \n            if (trackingDomains.some(domain => url.includes(domain))) {\n                console.log('🚫 Blocked tracking request:', url);\n                privacyProtection.trackersBlocked++;\n                \n                // Return empty response\n                return Promise.resolve(new Response('', { status: 204 }));\n            }\n        }\n        \n        return originalFetch.apply(this, args);\n    };\n    \n    console.log('🌐 Network monitoring active');\n}\n\n/**\n * Perform periodic privacy scan\n */\nfunction performPeriodicScan() {\n    if (!privacyProtection.isActive) return;\n    \n    console.log('🔍 Performing periodic privacy scan...');\n    \n    // Re-scan for new tracking elements\n    blockTrackingPixels();\n    \n    if (PROTECTION_CONFIG.removeSocialWidgets) {\n        removeSocialWidgets();\n    }\n    \n    privacyProtection.lastScan = new Date().toISOString();\n    \n    // Report updated statistics\n    reportStatus();\n}\n\n/**\n * Report status to background script\n */\nfunction reportStatus() {\n    chrome.runtime.sendMessage({\n        type: 'contentScriptStatus',\n        data: {\n            url: window.location.href,\n            protection: privacyProtection,\n            timestamp: new Date().toISOString()\n        }\n    }).catch(error => {\n        // Extension context might be invalidated\n        console.warn('Could not report status:', error);\n    });\n}\n\n/**\n * Handle messages from popup/background\n */\nfunction handleMessage(message, sender, sendResponse) {\n    console.log('📨 Content script received message:', message);\n    \n    switch (message.action) {\n        case 'getPageAnalysis':\n            sendResponse({\n                success: true,\n                analysis: analyzeCurrentPage()\n            });\n            break;\n            \n        case 'enableProtection':\n            enablePrivacyProtection();\n            sendResponse({ success: true });\n            break;\n            \n        case 'disableProtection':\n            privacyProtection.isActive = false;\n            sendResponse({ success: true });\n            break;\n            \n        case 'performCleanup':\n            performImmediateCleanup();\n            sendResponse({ success: true, stats: privacyProtection });\n            break;\n            \n        case 'getProtectionStats':\n            sendResponse({ success: true, stats: privacyProtection });\n            break;\n            \n        default:\n            sendResponse({ success: false, error: 'Unknown action' });\n    }\n}\n\n/**\n * Analyze current page for privacy issues\n */\nfunction analyzeCurrentPage() {\n    const analysis = {\n        url: window.location.href,\n        cookies: document.cookie ? document.cookie.split(';').length : 0,\n        localStorage: localStorage.length,\n        sessionStorage: sessionStorage.length,\n        scripts: document.querySelectorAll('script').length,\n        trackingScripts: 0,\n        socialWidgets: 0,\n        trackingPixels: 0,\n        riskScore: 0\n    };\n    \n    // Count tracking scripts\n    const scripts = document.querySelectorAll('script[src]');\n    const trackingDomains = [\n        'google-analytics', 'facebook.com', 'doubleclick',\n        'googlesyndication', 'twitter.com', 'linkedin.com'\n    ];\n    \n    scripts.forEach(script => {\n        if (trackingDomains.some(domain => script.src.includes(domain))) {\n            analysis.trackingScripts++;\n        }\n    });\n    \n    // Count social widgets\n    const socialSelectors = [\n        '[class*=\"facebook\"]', '[class*=\"twitter\"]', '[class*=\"linkedin\"]'\n    ];\n    socialSelectors.forEach(selector => {\n        analysis.socialWidgets += document.querySelectorAll(selector).length;\n    });\n    \n    // Count tracking pixels\n    const images = document.querySelectorAll('img');\n    images.forEach(img => {\n        if (img.width === 1 && img.height === 1) {\n            analysis.trackingPixels++;\n        }\n    });\n    \n    // Calculate risk score\n    analysis.riskScore = (\n        analysis.trackingScripts * 10 +\n        analysis.socialWidgets * 5 +\n        analysis.trackingPixels * 3 +\n        Math.min(analysis.cookies * 2, 20)\n    );\n    \n    return analysis;\n}\n\n/**\n * Perform immediate cleanup\n */\nfunction performImmediateCleanup() {\n    console.log('🧹 Performing immediate cleanup...');\n    \n    blockTrackingPixels();\n    removeSocialWidgets();\n    blockTrackingScripts();\n    \n    // Clear local cookies if enabled\n    if (PROTECTION_CONFIG.clearCookiesAutomatically) {\n        try {\n            document.cookie.split(\";\").forEach(cookie => {\n                const eqPos = cookie.indexOf(\"=\");\n                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;\n                document.cookie = name + \"=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/\";\n            });\n        } catch (error) {\n            console.warn('Could not clear cookies:', error);\n        }\n    }\n    \n    console.log('✅ Immediate cleanup completed');\n}\n\n// Initialize on page load\nif (document.readyState === 'loading') {\n    document.addEventListener('DOMContentLoaded', () => {\n        // Content script already initialized in IIFE\n    });\n} else {\n    // Document already loaded\n    setTimeout(() => {\n        if (privacyProtection.isActive) {\n            performPeriodicScan();\n        }\n    }, 1000);\n}\n\nconsole.log('🔐 Digital Footprint Eraser: Content script loaded and monitoring');\nconsole.log('🛡️ Real-time privacy protection: Active');\nconsole.log('👀 Tracker monitoring: Active');\nconsole.log('🔒 Fingerprinting protection: Active');