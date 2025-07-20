/**
 * Digital Footprint Eraser - Extension Popup Script
 * Handles UI interactions and communicates with background script
 */

// Popup state management
let popupState = {
    currentTab: null,
    privacyScore: 0,
    trackersBlocked: 0,
    cookiesRemoved: 0,
    protectionEnabled: true,
    lastCleanup: null,
    pageAnalysis: {
        trackers: 0,
        cookies: 0,
        risk: 'low'
    }
};

/**
 * Initialize popup when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Digital Footprint Eraser: Popup initializing...');
    
    try {
        await initializePopup();
        await loadCurrentTabInfo();
        await loadStoredData();
        await analyzeCurrentPage();
        updateUI();
        bindEventListeners();
        
        console.log('✅ Popup initialization complete');
    } catch (error) {
        console.error('❌ Popup initialization failed:', error);
        showNotification('Initialization failed', 'error');
    }
});

/**
 * Initialize popup state and UI
 */
async function initializePopup() {
    // Get current active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    popupState.currentTab = tabs[0];
    
    // Load extension settings
    const settings = await chrome.storage.sync.get([
        'privacyProtectionEnabled',
        'trackingProtectionLevel',
        'autoCleanupEnabled'
    ]);
    
    popupState.protectionEnabled = settings.privacyProtectionEnabled ?? true;
    
    // Update protection toggle
    const protectionToggle = document.getElementById('protectionToggle');
    if (protectionToggle) {
        protectionToggle.checked = popupState.protectionEnabled;
    }
    
    // Update status indicator
    updateStatusIndicator();
}

/**
 * Load current tab information
 */
async function loadCurrentTabInfo() {
    if (!popupState.currentTab) return;
    
    const tabId = popupState.currentTab.id;
    const url = popupState.currentTab.url;
    
    console.log('📄 Analyzing tab:', url);
    
    // Skip extension pages and special URLs
    if (url.startsWith('chrome://') || 
        url.startsWith('chrome-extension://') ||
        url.startsWith('edge://') ||
        url.startsWith('about:')) {
        
        document.getElementById('pageAnalysis').style.display = 'none';
        return;
    }
    
    // Get tab-specific data from background script
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'getTabAnalysis',
            tabId: tabId
        });
        
        if (response && response.analysis) {
            popupState.pageAnalysis = response.analysis;
        }
    } catch (error) {
        console.warn('Could not get tab analysis:', error);
    }
}

/**
 * Load stored statistics and data
 */
async function loadStoredData() {
    try {
        // Get stored statistics
        const localData = await chrome.storage.local.get([
            'trackersBlocked',
            'cookiesRemoved',
            'lastCleanup',
            'privacyScore'
        ]);
        
        popupState.trackersBlocked = localData.trackersBlocked || 0;
        popupState.cookiesRemoved = localData.cookiesRemoved || 0;
        popupState.lastCleanup = localData.lastCleanup;
        popupState.privacyScore = localData.privacyScore || 75; // Default score
        
        console.log('📊 Loaded statistics:', {
            trackersBlocked: popupState.trackersBlocked,
            cookiesRemoved: popupState.cookiesRemoved,
            lastCleanup: popupState.lastCleanup
        });
        
    } catch (error) {
        console.error('Failed to load stored data:', error);
    }
}

/**
 * Analyze current page for privacy issues
 */
async function analyzeCurrentPage() {
    if (!popupState.currentTab || 
        popupState.currentTab.url.startsWith('chrome://') ||
        popupState.currentTab.url.startsWith('chrome-extension://')) {
        return;
    }
    
    try {
        // Update UI to show scanning
        updateAnalysisUI('scanning');
        
        // Inject analysis script into current page
        const results = await chrome.scripting.executeScript({
            target: { tabId: popupState.currentTab.id },
            func: performPageAnalysis
        });
        
        if (results && results[0] && results[0].result) {
            popupState.pageAnalysis = results[0].result;
            console.log('🔍 Page analysis complete:', popupState.pageAnalysis);
        }
        
    } catch (error) {
        console.warn('Could not analyze current page:', error);
        popupState.pageAnalysis = {
            trackers: 'Unknown',
            cookies: 'Unknown',
            risk: 'unknown'
        };
    }
}

/**
 * Function to be injected into page for analysis
 */
function performPageAnalysis() {
    const analysis = {
        trackers: 0,
        cookies: 0,
        socialWidgets: 0,
        risk: 'low',
        details: []
    };
    
    try {
        // Count cookies
        analysis.cookies = document.cookie ? document.cookie.split(';').length : 0;
        
        // Detect tracking scripts
        const scripts = document.querySelectorAll('script[src]');
        const trackingDomains = [
            'google-analytics.com',
            'googletagmanager.com',
            'facebook.com',
            'doubleclick.net',
            'googlesyndication.com',
            'twitter.com',
            'linkedin.com',
            'outbrain.com',
            'taboola.com',
            'criteo.com'
        ];
        
        scripts.forEach(script => {
            const src = script.src.toLowerCase();
            trackingDomains.forEach(domain => {
                if (src.includes(domain)) {
                    analysis.trackers++;
                    analysis.details.push(`Tracker: ${domain}`);
                }
            });
        });
        
        // Detect social widgets
        const socialSelectors = [
            '[class*="facebook"]', '[class*="fb-"]',
            '[class*="twitter"]', '[class*="tweet"]',
            '[class*="linkedin"]',
            '[class*="instagram"]',
            '[class*="pinterest"]'
        ];
        
        socialSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                analysis.socialWidgets += elements.length;
                analysis.details.push(`Social widgets: ${elements.length}`);\n            }\n        });\n        \n        // Calculate risk level\n        let riskScore = 0;\n        riskScore += analysis.trackers * 10;\n        riskScore += analysis.cookies * 2;\n        riskScore += analysis.socialWidgets * 5;\n        \n        if (riskScore >= 50) {\n            analysis.risk = 'high';\n        } else if (riskScore >= 20) {\n            analysis.risk = 'medium';\n        } else {\n            analysis.risk = 'low';\n        }\n        \n    } catch (error) {\n        console.error('Page analysis error:', error);\n    }\n    \n    return analysis;\n}\n\n/**\n * Update the entire UI with current state\n */\nfunction updateUI() {\n    // Update privacy score\n    const privacyScoreEl = document.getElementById('privacyScore');\n    if (privacyScoreEl) {\n        privacyScoreEl.textContent = popupState.privacyScore;\n    }\n    \n    // Update statistics\n    const trackersBlockedEl = document.getElementById('trackersBlocked');\n    if (trackersBlockedEl) {\n        trackersBlockedEl.textContent = formatNumber(popupState.trackersBlocked);\n    }\n    \n    const cookiesRemovedEl = document.getElementById('cookiesRemoved');\n    if (cookiesRemovedEl) {\n        cookiesRemovedEl.textContent = formatNumber(popupState.cookiesRemoved);\n    }\n    \n    // Update last cleanup time\n    const lastCleanupEl = document.getElementById('lastCleanup');\n    if (lastCleanupEl) {\n        lastCleanupEl.textContent = popupState.lastCleanup ? \n            `Last cleanup: ${formatTime(popupState.lastCleanup)}` : \n            'Last cleanup: Never';\n    }\n    \n    // Update page analysis\n    updateAnalysisUI();\n    \n    // Update status indicator\n    updateStatusIndicator();\n}\n\n/**\n * Update page analysis section\n */\nfunction updateAnalysisUI(status = 'complete') {\n    const pageTrackersEl = document.getElementById('pageTrackers');\n    const pageCookiesEl = document.getElementById('pageCookies');\n    const pageRiskEl = document.getElementById('pageRisk');\n    \n    if (status === 'scanning') {\n        if (pageTrackersEl) pageTrackersEl.textContent = 'Scanning...';\n        if (pageCookiesEl) pageCookiesEl.textContent = 'Scanning...';\n        if (pageRiskEl) {\n            pageRiskEl.textContent = 'Analyzing...';\n            pageRiskEl.className = 'analysis-value risk';\n        }\n        return;\n    }\n    \n    // Update with analysis results\n    if (pageTrackersEl) {\n        pageTrackersEl.textContent = popupState.pageAnalysis.trackers;\n    }\n    \n    if (pageCookiesEl) {\n        pageCookiesEl.textContent = popupState.pageAnalysis.cookies;\n    }\n    \n    if (pageRiskEl) {\n        const risk = popupState.pageAnalysis.risk;\n        pageRiskEl.textContent = risk.charAt(0).toUpperCase() + risk.slice(1);\n        pageRiskEl.className = `analysis-value risk ${risk}`;\n    }\n}\n\n/**\n * Update status indicator\n */\nfunction updateStatusIndicator() {\n    const statusDot = document.querySelector('.status-dot');\n    const statusText = document.querySelector('.status-text');\n    \n    if (statusDot && statusText) {\n        if (popupState.protectionEnabled) {\n            statusDot.className = 'status-dot active';\n            statusText.textContent = 'Protected';\n        } else {\n            statusDot.className = 'status-dot inactive';\n            statusText.textContent = 'Inactive';\n        }\n    }\n}\n\n/**\n * Bind event listeners to UI elements\n */\nfunction bindEventListeners() {\n    // Quick cleanup button\n    const quickCleanupBtn = document.getElementById('quickCleanup');\n    if (quickCleanupBtn) {\n        quickCleanupBtn.addEventListener('click', handleQuickCleanup);\n    }\n    \n    // Privacy scan button\n    const privacyScanBtn = document.getElementById('privacyScan');\n    if (privacyScanBtn) {\n        privacyScanBtn.addEventListener('click', handlePrivacyScan);\n    }\n    \n    // Block trackers button\n    const blockTrackersBtn = document.getElementById('blockTrackers');\n    if (blockTrackersBtn) {\n        blockTrackersBtn.addEventListener('click', handleBlockTrackers);\n    }\n    \n    // Clear cookies button\n    const clearCookiesBtn = document.getElementById('clearCookies');\n    if (clearCookiesBtn) {\n        clearCookiesBtn.addEventListener('click', handleClearCookies);\n    }\n    \n    // Protection toggle\n    const protectionToggle = document.getElementById('protectionToggle');\n    if (protectionToggle) {\n        protectionToggle.addEventListener('change', handleProtectionToggle);\n    }\n    \n    // Open full app button\n    const openFullAppBtn = document.getElementById('openFullApp');\n    if (openFullAppBtn) {\n        openFullAppBtn.addEventListener('click', handleOpenFullApp);\n    }\n    \n    // Open settings button\n    const openSettingsBtn = document.getElementById('openSettings');\n    if (openSettingsBtn) {\n        openSettingsBtn.addEventListener('click', handleOpenSettings);\n    }\n}\n\n/**\n * Event Handlers\n */\nasync function handleQuickCleanup() {\n    console.log('🧹 Quick cleanup requested');\n    \n    try {\n        showLoading('Performing cleanup...');\n        \n        // Send cleanup request to background script\n        const response = await chrome.runtime.sendMessage({\n            action: 'performQuickCleanup'\n        });\n        \n        if (response && response.success) {\n            // Update statistics\n            popupState.cookiesRemoved += response.results.cookiesRemoved || 0;\n            popupState.lastCleanup = new Date().toISOString();\n            \n            // Save to storage\n            await chrome.storage.local.set({\n                cookiesRemoved: popupState.cookiesRemoved,\n                lastCleanup: popupState.lastCleanup\n            });\n            \n            // Update UI\n            updateUI();\n            \n            showNotification('Cleanup completed successfully!', 'success');\n        } else {\n            showNotification('Cleanup failed. Please try again.', 'error');\n        }\n        \n    } catch (error) {\n        console.error('Quick cleanup failed:', error);\n        showNotification('Cleanup encountered an error', 'error');\n    } finally {\n        hideLoading();\n    }\n}\n\nasync function handlePrivacyScan() {\n    console.log('🔍 Privacy scan requested');\n    \n    try {\n        showLoading('Scanning page...');\n        \n        // Re-analyze current page\n        await analyzeCurrentPage();\n        updateAnalysisUI();\n        \n        showNotification('Privacy scan completed', 'success');\n        \n    } catch (error) {\n        console.error('Privacy scan failed:', error);\n        showNotification('Scan failed', 'error');\n    } finally {\n        hideLoading();\n    }\n}\n\nasync function handleBlockTrackers() {\n    console.log('🛡️ Block trackers requested');\n    \n    try {\n        showLoading('Blocking trackers...');\n        \n        // Send block trackers request to background script\n        const response = await chrome.runtime.sendMessage({\n            action: 'blockTrackers',\n            tabId: popupState.currentTab.id\n        });\n        \n        if (response && response.success) {\n            popupState.trackersBlocked += response.trackersBlocked || 0;\n            \n            await chrome.storage.local.set({\n                trackersBlocked: popupState.trackersBlocked\n            });\n            \n            updateUI();\n            showNotification('Trackers blocked successfully!', 'success');\n        } else {\n            showNotification('Failed to block trackers', 'error');\n        }\n        \n    } catch (error) {\n        console.error('Block trackers failed:', error);\n        showNotification('Tracker blocking failed', 'error');\n    } finally {\n        hideLoading();\n    }\n}\n\nasync function handleClearCookies() {\n    console.log('🍪 Clear cookies requested');\n    \n    try {\n        showLoading('Clearing cookies...');\n        \n        // Send clear cookies request to background script\n        const response = await chrome.runtime.sendMessage({\n            action: 'clearCookies',\n            domain: new URL(popupState.currentTab.url).hostname\n        });\n        \n        if (response && response.success) {\n            popupState.cookiesRemoved += response.cookiesCleared || 0;\n            \n            await chrome.storage.local.set({\n                cookiesRemoved: popupState.cookiesRemoved\n            });\n            \n            // Re-analyze page\n            await analyzeCurrentPage();\n            updateUI();\n            \n            showNotification('Cookies cleared successfully!', 'success');\n        } else {\n            showNotification('Failed to clear cookies', 'error');\n        }\n        \n    } catch (error) {\n        console.error('Clear cookies failed:', error);\n        showNotification('Cookie clearing failed', 'error');\n    } finally {\n        hideLoading();\n    }\n}\n\nasync function handleProtectionToggle(event) {\n    const enabled = event.target.checked;\n    console.log('🛡️ Protection toggle:', enabled);\n    \n    try {\n        // Update local state\n        popupState.protectionEnabled = enabled;\n        \n        // Send toggle request to background script\n        const response = await chrome.runtime.sendMessage({\n            action: 'toggleProtection',\n            enabled: enabled\n        });\n        \n        if (response && response.success) {\n            // Save setting\n            await chrome.storage.sync.set({\n                privacyProtectionEnabled: enabled\n            });\n            \n            updateStatusIndicator();\n            \n            const message = enabled ? 'Privacy protection enabled' : 'Privacy protection disabled';\n            showNotification(message, 'success');\n        } else {\n            // Revert toggle if failed\n            event.target.checked = !enabled;\n            showNotification('Failed to toggle protection', 'error');\n        }\n        \n    } catch (error) {\n        console.error('Protection toggle failed:', error);\n        event.target.checked = !enabled;\n        showNotification('Toggle failed', 'error');\n    }\n}\n\nfunction handleOpenFullApp() {\n    console.log('🚀 Opening full app');\n    \n    chrome.tabs.create({\n        url: 'https://bharathk2498.github.io/digital-footprint-eraser/?source=extension-popup'\n    });\n    \n    window.close();\n}\n\nfunction handleOpenSettings() {\n    console.log('⚙️ Opening settings');\n    \n    chrome.runtime.openOptionsPage();\n    window.close();\n}\n\n/**\n * UI Helper Functions\n */\nfunction showLoading(message = 'Processing...') {\n    const loadingOverlay = document.getElementById('loadingOverlay');\n    const loadingText = document.querySelector('.loading-text');\n    \n    if (loadingText) {\n        loadingText.textContent = message;\n    }\n    \n    if (loadingOverlay) {\n        loadingOverlay.style.display = 'flex';\n    }\n}\n\nfunction hideLoading() {\n    const loadingOverlay = document.getElementById('loadingOverlay');\n    if (loadingOverlay) {\n        loadingOverlay.style.display = 'none';\n    }\n}\n\nfunction showNotification(message, type = 'success') {\n    const notification = document.getElementById('notification');\n    const notificationIcon = document.querySelector('.notification-icon');\n    const notificationMessage = document.querySelector('.notification-message');\n    \n    if (notification && notificationIcon && notificationMessage) {\n        // Set icon based on type\n        switch (type) {\n            case 'success':\n                notificationIcon.className = 'notification-icon fas fa-check-circle success';\n                break;\n            case 'error':\n                notificationIcon.className = 'notification-icon fas fa-exclamation-circle error';\n                break;\n            case 'warning':\n                notificationIcon.className = 'notification-icon fas fa-exclamation-triangle warning';\n                break;\n            default:\n                notificationIcon.className = 'notification-icon fas fa-info-circle';\n        }\n        \n        notificationMessage.textContent = message;\n        notification.style.display = 'block';\n        \n        // Auto-hide after 3 seconds\n        setTimeout(() => {\n            notification.style.display = 'none';\n        }, 3000);\n    }\n}\n\n/**\n * Utility Functions\n */\nfunction formatNumber(num) {\n    if (num >= 1000000) {\n        return (num / 1000000).toFixed(1) + 'M';\n    } else if (num >= 1000) {\n        return (num / 1000).toFixed(1) + 'K';\n    }\n    return num.toString();\n}\n\nfunction formatTime(isoString) {\n    try {\n        const date = new Date(isoString);\n        const now = new Date();\n        const diffMs = now - date;\n        const diffMins = Math.floor(diffMs / 60000);\n        const diffHours = Math.floor(diffMins / 60);\n        const diffDays = Math.floor(diffHours / 24);\n        \n        if (diffMins < 60) {\n            return `${diffMins}m ago`;\n        } else if (diffHours < 24) {\n            return `${diffHours}h ago`;\n        } else if (diffDays < 7) {\n            return `${diffDays}d ago`;\n        } else {\n            return date.toLocaleDateString();\n        }\n    } catch (error) {\n        return 'Unknown';\n    }\n}\n\n// Listen for messages from background script\nchrome.runtime.onMessage.addListener((message, sender, sendResponse) => {\n    console.log('📨 Message received in popup:', message);\n    \n    switch (message.type) {\n        case 'statsUpdated':\n            // Update statistics when background script reports changes\n            if (message.stats) {\n                Object.assign(popupState, message.stats);\n                updateUI();\n            }\n            break;\n        case 'protectionStatusChanged':\n            // Update protection status\n            popupState.protectionEnabled = message.enabled;\n            updateStatusIndicator();\n            break;\n        case 'pageAnalysisComplete':\n            // Update page analysis\n            if (message.analysis) {\n                popupState.pageAnalysis = message.analysis;\n                updateAnalysisUI();\n            }\n            break;\n    }\n});\n\nconsole.log('🔐 Digital Footprint Eraser: Popup script loaded');\nconsole.log('🎨 UI: Ready for user interaction');\nconsole.log('📡 Communication: Connected to background script');