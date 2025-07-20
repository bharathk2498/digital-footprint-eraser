/**
 * Digital Footprint Eraser - Browser Extension Background Script
 * Handles extension lifecycle, privacy protection, and background tasks
 */

// Extension configuration
const EXTENSION_CONFIG = {
    version: '1.0.0',
    privacyProtectionEnabled: true,
    autoCleanupInterval: 30 * 60 * 1000, // 30 minutes
    notificationEnabled: true
};

// Privacy protection state
let privacyState = {
    isActive: true,
    cookiesBlocked: 0,
    trackersBlocked: 0,
    lastCleanup: null,
    protectedTabs: new Set()
};

/**
 * Extension Installation & Updates
 */
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('🔧 Digital Footprint Eraser: Extension installed/updated');
    
    switch (details.reason) {
        case 'install':
            await handleInstallation();
            break;
        case 'update':
            await handleUpdate(details.previousVersion);
            break;
    }
    
    // Set up initial state
    await initializeExtension();
});

/**
 * Handle fresh installation
 */
async function handleInstallation() {
    console.log('🎉 Digital Footprint Eraser: First installation');
    
    // Set default settings
    await chrome.storage.sync.set({
        privacyProtectionEnabled: true,
        autoCleanupEnabled: true,
        cleanupInterval: 30,
        notificationsEnabled: true,
        trackingProtectionLevel: 'strict',
        autoDeleteCookies: true,
        blockSocialTrackers: true,
        clearHistoryOnClose: false
    });
    
    // Create context menus
    await setupContextMenus();
    
    // Show welcome notification
    if (EXTENSION_CONFIG.notificationEnabled) {
        chrome.notifications.create('welcome', {
            type: 'basic',
            iconUrl: '/assets/images/icon-48x48.png',
            title: 'Digital Footprint Eraser Installed',
            message: 'Your privacy protection is now active. Click the extension icon to get started.',
            buttons: [
                { title: 'Open Settings' },
                { title: 'Start Cleanup' }
            ]
        });
    }
    
    // Open welcome page
    chrome.tabs.create({
        url: 'https://bharathk2498.github.io/digital-footprint-eraser/?source=extension-install'
    });
}

/**
 * Handle extension updates
 */
async function handleUpdate(previousVersion) {
    console.log(`🔄 Digital Footprint Eraser: Updated from ${previousVersion} to ${EXTENSION_CONFIG.version}`);
    
    // Migration logic for settings if needed
    const settings = await chrome.storage.sync.get();
    
    // Add any new default settings that weren't in previous version
    const defaultSettings = {
        trackingProtectionLevel: 'strict',
        blockSocialTrackers: true
    };
    
    for (const [key, value] of Object.entries(defaultSettings)) {
        if (!(key in settings)) {
            await chrome.storage.sync.set({ [key]: value });
        }
    }
}

/**
 * Initialize extension components
 */
async function initializeExtension() {
    // Load settings
    const settings = await chrome.storage.sync.get();
    EXTENSION_CONFIG.privacyProtectionEnabled = settings.privacyProtectionEnabled ?? true;
    EXTENSION_CONFIG.notificationEnabled = settings.notificationsEnabled ?? true;
    
    // Set up automatic cleanup
    if (settings.autoCleanupEnabled) {
        setupAutoCleanup(settings.cleanupInterval || 30);
    }
    
    // Initialize privacy protection
    if (EXTENSION_CONFIG.privacyProtectionEnabled) {
        await enablePrivacyProtection();
    }
    
    console.log('✅ Digital Footprint Eraser: Initialization complete');
}

/**
 * Context Menu Setup
 */
async function setupContextMenus() {
    // Remove existing menus
    chrome.contextMenus.removeAll();
    
    // Main context menu
    chrome.contextMenus.create({
        id: 'dfe-main',
        title: 'Digital Footprint Eraser',
        contexts: ['page', 'selection']
    });
    
    // Quick cleanup
    chrome.contextMenus.create({
        id: 'dfe-quick-cleanup',
        title: '🧹 Quick Cleanup',
        parentId: 'dfe-main',
        contexts: ['page']
    });
    
    // Privacy scan
    chrome.contextMenus.create({
        id: 'dfe-privacy-scan',
        title: '🔍 Scan This Page',
        parentId: 'dfe-main',
        contexts: ['page']
    });
    
    // Block trackers
    chrome.contextMenus.create({
        id: 'dfe-block-trackers',
        title: '🛡️ Enhanced Protection',
        parentId: 'dfe-main',
        contexts: ['page']
    });
    
    // Separator
    chrome.contextMenus.create({
        id: 'separator1',
        type: 'separator',
        parentId: 'dfe-main'
    });
    
    // Open full app
    chrome.contextMenus.create({
        id: 'dfe-open-app',
        title: '🚀 Open Full App',
        parentId: 'dfe-main',
        contexts: ['page']
    });
}

/**
 * Context Menu Click Handler
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    switch (info.menuItemId) {
        case 'dfe-quick-cleanup':
            await performQuickCleanup();
            break;
        case 'dfe-privacy-scan':
            await scanTabPrivacy(tab.id);
            break;
        case 'dfe-block-trackers':
            await enableEnhancedProtection(tab.id);
            break;
        case 'dfe-open-app':
            chrome.tabs.create({
                url: 'https://bharathk2498.github.io/digital-footprint-eraser/?source=extension-context'
            });
            break;
    }
});

/**
 * Command Handler (Keyboard Shortcuts)
 */
chrome.commands.onCommand.addListener(async (command) => {
    console.log('⌨️ Command received:', command);
    
    switch (command) {
        case 'quick-cleanup':
            await performQuickCleanup();
            showNotification('Quick Cleanup', 'Privacy cleanup completed successfully!');
            break;
        case 'privacy-scan':
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (activeTab) {
                await scanTabPrivacy(activeTab.id);
            }
            break;
        case 'toggle-protection':
            await togglePrivacyProtection();
            break;
    }
});

/**
 * Privacy Protection Functions
 */
async function enablePrivacyProtection() {
    console.log('🛡️ Enabling privacy protection...');
    
    // Set up declarative rules for blocking trackers
    await updateTrackingProtectionRules();
    
    // Monitor cookies and storage
    setupCookieMonitoring();
    
    // Set up tab protection
    setupTabProtection();
    
    privacyState.isActive = true;
    await updateBadge('🛡️', '#22c55e');
}

async function disablePrivacyProtection() {
    console.log('🔓 Disabling privacy protection...');
    
    privacyState.isActive = false;
    await updateBadge('⚠️', '#f59e0b');
}

async function togglePrivacyProtection() {
    if (privacyState.isActive) {
        await disablePrivacyProtection();
        showNotification('Privacy Protection', 'Protection disabled');
    } else {
        await enablePrivacyProtection();
        showNotification('Privacy Protection', 'Protection enabled');
    }
}

/**
 * Quick Cleanup Function
 */
async function performQuickCleanup() {
    console.log('🧹 Performing quick cleanup...');
    
    try {
        const cleanupResults = {
            cookiesRemoved: 0,
            storageCleared: 0,
            historyCleared: false
        };
        
        // Clear cookies for tracking domains
        const trackingDomains = await getTrackingDomains();
        for (const domain of trackingDomains) {
            const cookies = await chrome.cookies.getAll({ domain });
            for (const cookie of cookies) {
                await chrome.cookies.remove({
                    url: `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`,
                    name: cookie.name
                });
                cleanupResults.cookiesRemoved++;
            }
        }
        
        // Clear browsing data if permission available
        if (chrome.browsingData) {
            await chrome.browsingData.remove({
                since: Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
            }, {
                cache: true,
                localStorage: true,
                sessionStorage: true,
                indexedDB: true
            });
            cleanupResults.storageCleared = 1;
        }
        
        // Update statistics
        privacyState.lastCleanup = new Date().toISOString();
        await chrome.storage.local.set({ lastCleanup: privacyState.lastCleanup });
        
        console.log('✅ Quick cleanup completed:', cleanupResults);
        return cleanupResults;
        
    } catch (error) {
        console.error('❌ Quick cleanup failed:', error);
        throw error;
    }
}

/**
 * Privacy Scanning
 */
async function scanTabPrivacy(tabId) {
    console.log('🔍 Scanning tab privacy:', tabId);
    
    try {
        // Inject content script for privacy analysis
        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: analyzePagePrivacy
        });
        
        const privacyAnalysis = results[0].result;
        
        // Show results in notification
        const score = privacyAnalysis.score || 0;
        const message = `Privacy Score: ${score}/100\nTrackers: ${privacyAnalysis.trackers || 0}\nCookies: ${privacyAnalysis.cookies || 0}`;
        
        showNotification('Privacy Scan Complete', message);
        
        return privacyAnalysis;
        
    } catch (error) {
        console.error('❌ Privacy scan failed:', error);
        showNotification('Privacy Scan Failed', 'Unable to analyze this page');
    }
}

// Function to be injected into page for privacy analysis
function analyzePagePrivacy() {
    const analysis = {
        url: window.location.href,
        cookies: document.cookie.split(';').length,
        localStorage: localStorage.length,
        sessionStorage: sessionStorage.length,
        trackers: 0,
        socialWidgets: 0,
        score: 100
    };
    
    // Count tracking scripts
    const scripts = document.querySelectorAll('script[src]');
    const trackingDomains = ['google-analytics.com', 'facebook.com', 'doubleclick.net', 'googlesyndication.com'];
    
    scripts.forEach(script => {
        if (trackingDomains.some(domain => script.src.includes(domain))) {
            analysis.trackers++;
        }
    });
    
    // Count social widgets
    const socialSelectors = ['[class*="facebook"]', '[class*="twitter"]', '[class*="linkedin"]'];
    socialSelectors.forEach(selector => {
        analysis.socialWidgets += document.querySelectorAll(selector).length;
    });
    
    // Calculate privacy score
    analysis.score -= Math.min(analysis.trackers * 10, 30);
    analysis.score -= Math.min(analysis.cookies * 2, 20);
    analysis.score -= Math.min(analysis.socialWidgets * 5, 15);
    
    return analysis;
}

/**
 * Auto Cleanup Setup
 */
function setupAutoCleanup(intervalMinutes) {
    console.log(`⏰ Setting up auto cleanup every ${intervalMinutes} minutes`);
    
    // Clear existing alarms
    chrome.alarms.clear('autoCleanup');
    
    // Create new alarm
    chrome.alarms.create('autoCleanup', {
        delayInMinutes: intervalMinutes,
        periodInMinutes: intervalMinutes
    });
}

// Auto cleanup alarm handler
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'autoCleanup') {
        console.log('⏰ Auto cleanup triggered');
        await performQuickCleanup();
        
        const settings = await chrome.storage.sync.get(['notificationsEnabled']);
        if (settings.notificationsEnabled) {
            showNotification('Auto Cleanup', 'Automatic privacy cleanup completed');
        }
    }
});

/**
 * Cookie Monitoring
 */
function setupCookieMonitoring() {
    if (!chrome.cookies.onChanged) return;
    
    chrome.cookies.onChanged.addListener((changeInfo) => {
        if (!changeInfo.removed && changeInfo.cookie) {
            const cookie = changeInfo.cookie;
            
            // Check if cookie is from tracking domain
            const trackingDomains = ['doubleclick.net', 'google-analytics.com', 'facebook.com'];
            
            if (trackingDomains.some(domain => cookie.domain.includes(domain))) {
                console.log('🍪 Tracking cookie detected:', cookie.domain);
                privacyState.cookiesBlocked++;
                
                // Optionally auto-remove tracking cookies
                chrome.storage.sync.get(['autoDeleteCookies']).then(settings => {
                    if (settings.autoDeleteCookies) {
                        chrome.cookies.remove({
                            url: `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`,
                            name: cookie.name
                        });
                    }
                });
            }
        }
    });
}

/**
 * Tab Protection
 */
function setupTabProtection() {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.url) {
            // Check if tab needs protection
            if (shouldProtectTab(tab.url)) {
                privacyState.protectedTabs.add(tabId);
                // Inject privacy protection content script
                injectPrivacyProtection(tabId);
            }
        }
    });
    
    chrome.tabs.onRemoved.addListener((tabId) => {
        privacyState.protectedTabs.delete(tabId);
    });
}

/**
 * Utility Functions
 */
async function updateBadge(text, color) {
    await chrome.action.setBadgeText({ text });
    await chrome.action.setBadgeBackgroundColor({ color });
}

function showNotification(title, message, buttons = []) {
    if (!EXTENSION_CONFIG.notificationEnabled) return;
    
    chrome.notifications.create({
        type: 'basic',
        iconUrl: '/assets/images/icon-48x48.png',
        title,
        message,
        buttons
    });
}

async function getTrackingDomains() {
    // Return common tracking domains for cleanup
    return [
        'doubleclick.net',
        'googlesyndication.com',
        'google-analytics.com',
        'facebook.com',
        'twitter.com',
        'linkedin.com',
        'outbrain.com',
        'taboola.com',
        'criteo.com',
        'amazon-adsystem.com'
    ];
}

function shouldProtectTab(url) {
    // Skip extension pages and special URLs
    if (url.startsWith('chrome://') || 
        url.startsWith('chrome-extension://') || 
        url.startsWith('edge://') ||
        url.startsWith('about:')) {
        return false;
    }
    
    return true;
}

async function injectPrivacyProtection(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['extension/content.js']
        });
    } catch (error) {
        console.warn('Could not inject privacy protection:', error);
    }
}

async function updateTrackingProtectionRules() {
    // This would update the declarative net request rules
    // Implementation depends on rules.json file
}

async function enableEnhancedProtection(tabId) {
    console.log('🛡️ Enabling enhanced protection for tab:', tabId);
    
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                // Enhanced privacy protection code
                console.log('🛡️ Enhanced privacy protection activated');
                
                // Block tracking pixels
                const images = document.querySelectorAll('img');
                images.forEach(img => {
                    if (img.width === 1 && img.height === 1) {
                        img.remove();
                    }
                });
                
                // Remove social widgets
                const socialSelectors = [
                    '[class*="facebook"]', '[class*="twitter"]', 
                    '[class*="linkedin"]', '[class*="instagram"]'
                ];
                socialSelectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(el => el.remove());
                });
            }
        });
        
        showNotification('Enhanced Protection', 'Enhanced privacy protection enabled for this page');
        
    } catch (error) {
        console.error('Failed to enable enhanced protection:', error);
    }
}

// Notification click handler
chrome.notifications.onClicked.addListener((notificationId) => {
    if (notificationId === 'welcome') {
        chrome.tabs.create({
            url: 'https://bharathk2498.github.io/digital-footprint-eraser/?source=extension-welcome'
        });
    }
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (notificationId === 'welcome') {
        if (buttonIndex === 0) {
            // Open Settings
            chrome.runtime.openOptionsPage();
        } else if (buttonIndex === 1) {
            // Start Cleanup
            performQuickCleanup();
        }
    }
});

console.log('🔐 Digital Footprint Eraser: Background script loaded');
console.log('🛡️ Privacy protection: Ready');
console.log('🧹 Cleanup functions: Available');
console.log('📱 Extension features: Initialized');