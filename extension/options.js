/**
 * Digital Footprint Eraser - Extension Options Script
 * Handles settings management and user interface interactions
 */

// Options page state
let optionsState = {
    currentTab: 'general',
    settings: {},
    isDirty: false,
    statistics: {
        totalTrackersBlocked: 0,
        totalCookiesRemoved: 0,
        totalPagesProtected: 0,
        daysActive: 0
    }
};

// Default settings configuration
const DEFAULT_SETTINGS = {
    privacyProtectionEnabled: true,
    autoCleanupEnabled: true,
    cleanupInterval: 30,
    notificationsEnabled: true,
    trackingProtectionLevel: 'strict',
    blockSocialTrackers: true,
    preventFingerprinting: true,
    autoDeleteCookies: true,
    blockTrackingPixels: true,
    clearHistoryOnClose: false,
    clearDownloads: false,
    clearFormData: false,
    dataRetentionPeriod: 30,
    debugMode: false
};

/**
 * Initialize options page
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎛️ Digital Footprint Eraser: Options page initializing...');
    
    try {
        await loadSettings();
        await loadStatistics();
        initializeUI();
        bindEventListeners();
        updateStatisticsDisplay();
        
        console.log('✅ Options page initialization complete');
    } catch (error) {
        console.error('❌ Options page initialization failed:', error);
        showNotification('Failed to load settings', 'error');
    }
});

/**
 * Load settings from storage
 */
async function loadSettings() {
    try {
        // Load settings from sync storage
        const syncSettings = await chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS));
        
        // Merge with defaults
        optionsState.settings = { ...DEFAULT_SETTINGS, ...syncSettings };
        
        console.log('📄 Settings loaded:', optionsState.settings);
        
    } catch (error) {
        console.error('Failed to load settings:', error);
        optionsState.settings = { ...DEFAULT_SETTINGS };
    }
}

/**
 * Load statistics from storage
 */
async function loadStatistics() {
    try {
        const localData = await chrome.storage.local.get([
            'totalTrackersBlocked',
            'totalCookiesRemoved',
            'totalPagesProtected',
            'installDate'
        ]);
        
        // Update statistics
        optionsState.statistics.totalTrackersBlocked = localData.totalTrackersBlocked || 0;
        optionsState.statistics.totalCookiesRemoved = localData.totalCookiesRemoved || 0;
        optionsState.statistics.totalPagesProtected = localData.totalPagesProtected || 0;
        
        // Calculate days active
        const installDate = localData.installDate || new Date().toISOString();
        const daysSinceInstall = Math.floor((Date.now() - new Date(installDate).getTime()) / (1000 * 60 * 60 * 24));
        optionsState.statistics.daysActive = Math.max(1, daysSinceInstall);
        
        console.log('📊 Statistics loaded:', optionsState.statistics);
        
    } catch (error) {
        console.error('Failed to load statistics:', error);
    }
}

/**
 * Initialize UI elements with current settings
 */
function initializeUI() {
    // Set all form values from settings
    Object.keys(optionsState.settings).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = optionsState.settings[key];
            } else if (element.tagName === 'SELECT') {
                element.value = optionsState.settings[key];
            } else {
                element.value = optionsState.settings[key];
            }
        }
    });
    
    // Update build date
    const buildDateEl = document.getElementById('buildDate');
    if (buildDateEl) {
        buildDateEl.textContent = new Date().toLocaleDateString();
    }
    
    console.log('🎨 UI initialized with current settings');
}

/**
 * Bind event listeners
 */
function bindEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Setting controls
    document.querySelectorAll('input, select').forEach(element => {
        if (element.id && element.id in DEFAULT_SETTINGS) {
            element.addEventListener('change', handleSettingChange);
        }
    });
    
    // Action buttons
    document.getElementById('saveSettings')?.addEventListener('click', saveAllSettings);
    document.getElementById('resetCurrentTab')?.addEventListener('click', resetCurrentTab);
    document.getElementById('exportData')?.addEventListener('click', exportUserData);
    document.getElementById('resetSettings')?.addEventListener('click', () => showConfirmDialog(
        'Reset All Settings',
        'This will restore all settings to their default values. This action cannot be undone.',
        resetAllSettings
    ));
    document.getElementById('clearAllData')?.addEventListener('click', () => showConfirmDialog(
        'Clear All Data',
        'This will permanently delete all stored statistics and configuration. This action cannot be undone.',
        clearAllUserData
    ));
    
    // Modal controls
    document.getElementById('cancelAction')?.addEventListener('click', hideConfirmDialog);
    document.getElementById('confirmAction')?.addEventListener('click', executeConfirmedAction);
    
    // Management buttons
    document.getElementById('manageBlockingRules')?.addEventListener('click', manageBlockingRules);
    document.getElementById('manageWhitelist')?.addEventListener('click', manageWhitelist);
    
    console.log('🔗 Event listeners bound');
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName)?.classList.add('active');
    
    optionsState.currentTab = tabName;
    
    console.log(`📋 Switched to tab: ${tabName}`);
}

/**
 * Handle setting changes
 */
function handleSettingChange(event) {
    const { id, type, checked, value } = event.target;
    
    // Update setting value
    const newValue = type === 'checkbox' ? checked : value;
    optionsState.settings[id] = newValue;
    optionsState.isDirty = true;
    
    // Auto-save setting
    saveIndividualSetting(id, newValue);
    
    // Handle special cases
    if (id === 'autoCleanupEnabled' && !checked) {
        // Disable cleanup interval when auto cleanup is off
        document.getElementById('cleanupInterval').disabled = true;
    } else if (id === 'autoCleanupEnabled' && checked) {
        document.getElementById('cleanupInterval').disabled = false;
    }
    
    if (id === 'debugMode') {
        // Notify background script about debug mode change
        chrome.runtime.sendMessage({
            action: 'updateDebugMode',
            enabled: checked
        });
    }
    
    console.log(`⚙️ Setting changed: ${id} = ${newValue}`);
}

/**
 * Save individual setting
 */
async function saveIndividualSetting(key, value) {
    try {
        await chrome.storage.sync.set({ [key]: value });
        showSaveIndicator();
        
        // Notify background script of important setting changes
        if (['privacyProtectionEnabled', 'trackingProtectionLevel', 'autoCleanupEnabled'].includes(key)) {
            chrome.runtime.sendMessage({
                action: 'settingChanged',
                setting: key,
                value: value
            });
        }
        
    } catch (error) {
        console.error(`Failed to save setting ${key}:`, error);
        showNotification('Failed to save setting', 'error');
    }
}

/**
 * Save all settings
 */
async function saveAllSettings() {
    try {
        await chrome.storage.sync.set(optionsState.settings);
        optionsState.isDirty = false;
        
        showSaveIndicator();
        showNotification('All settings saved successfully', 'success');
        
        // Notify background script
        chrome.runtime.sendMessage({
            action: 'settingsUpdated',
            settings: optionsState.settings
        });
        
        console.log('💾 All settings saved');
        
    } catch (error) {
        console.error('Failed to save settings:', error);
        showNotification('Failed to save settings', 'error');
    }
}

/**
 * Reset current tab settings
 */
function resetCurrentTab() {
    const tabElements = document.querySelectorAll(`#${optionsState.currentTab} input, #${optionsState.currentTab} select`);
    
    tabElements.forEach(element => {
        if (element.id && element.id in DEFAULT_SETTINGS) {
            const defaultValue = DEFAULT_SETTINGS[element.id];
            
            if (element.type === 'checkbox') {
                element.checked = defaultValue;
            } else {
                element.value = defaultValue;
            }
            
            // Update state
            optionsState.settings[element.id] = defaultValue;
            
            // Save individual setting
            saveIndividualSetting(element.id, defaultValue);
        }
    });
    
    showNotification(`${optionsState.currentTab} settings reset to defaults`, 'success');
}

/**
 * Reset all settings to defaults
 */
async function resetAllSettings() {
    try {
        optionsState.settings = { ...DEFAULT_SETTINGS };
        
        await chrome.storage.sync.clear();
        await chrome.storage.sync.set(optionsState.settings);
        
        initializeUI();
        optionsState.isDirty = false;
        
        showNotification('All settings reset to defaults', 'success');
        
        // Notify background script
        chrome.runtime.sendMessage({
            action: 'settingsReset'
        });
        
        console.log('🔄 All settings reset to defaults');
        
    } catch (error) {
        console.error('Failed to reset settings:', error);
        showNotification('Failed to reset settings', 'error');
    }
}

/**
 * Export user data
 */
async function exportUserData() {
    try {
        // Collect all data for export
        const exportData = {
            settings: optionsState.settings,
            statistics: optionsState.statistics,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        // Create downloadable file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Download file
        const a = document.createElement('a');
        a.href = url;
        a.download = `digital-footprint-eraser-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Data exported successfully', 'success');
        
        console.log('📤 User data exported');
        
    } catch (error) {
        console.error('Failed to export data:', error);
        showNotification('Failed to export data', 'error');
    }
}

/**
 * Clear all user data
 */
async function clearAllUserData() {
    try {
        // Clear all storage
        await chrome.storage.sync.clear();
        await chrome.storage.local.clear();
        
        // Reset to defaults
        optionsState.settings = { ...DEFAULT_SETTINGS };
        optionsState.statistics = {
            totalTrackersBlocked: 0,
            totalCookiesRemoved: 0,
            totalPagesProtected: 0,
            daysActive: 0
        };
        
        // Save defaults
        await chrome.storage.sync.set(optionsState.settings);
        
        // Update UI
        initializeUI();
        updateStatisticsDisplay();
        
        showNotification('All data cleared successfully', 'success');
        
        // Notify background script
        chrome.runtime.sendMessage({
            action: 'dataCleared'
        });
        
        console.log('🗑️ All user data cleared');
        
    } catch (error) {
        console.error('Failed to clear data:', error);
        showNotification('Failed to clear data', 'error');
    }
}

/**
 * Manage blocking rules
 */
function manageBlockingRules() {
    // This would open a dedicated interface for managing custom blocking rules
    // For now, we'll show a simple prompt
    
    const customRules = prompt(
        'Enter custom blocking rules (one domain per line):\n\nExample:\nexample.com\n*.tracker.com\nads.domain.net',
        ''
    );
    
    if (customRules !== null) {
        // Save custom rules
        const rules = customRules.split('\n').filter(rule => rule.trim());
        chrome.storage.sync.set({ customBlockingRules: rules });
        
        showNotification(`${rules.length} custom rules saved`, 'success');
        
        // Notify background script
        chrome.runtime.sendMessage({
            action: 'updateBlockingRules',
            rules: rules
        });
    }
}

/**
 * Manage whitelist
 */
function manageWhitelist() {
    // Similar to blocking rules, but for whitelisted domains
    
    const whitelistDomains = prompt(
        'Enter whitelisted domains (one domain per line):\n\nThese domains will be excluded from privacy protection.\n\nExample:\ntrusted-site.com\nmy-company.net',
        ''
    );
    
    if (whitelistDomains !== null) {
        const domains = whitelistDomains.split('\n').filter(domain => domain.trim());
        chrome.storage.sync.set({ whitelistDomains: domains });
        
        showNotification(`${domains.length} domains whitelisted`, 'success');
        
        // Notify background script
        chrome.runtime.sendMessage({
            action: 'updateWhitelist',
            domains: domains
        });
    }
}

/**
 * Update statistics display
 */
function updateStatisticsDisplay() {
    const stats = optionsState.statistics;
    
    // Update stat values
    document.getElementById('totalTrackersBlocked').textContent = formatNumber(stats.totalTrackersBlocked);
    document.getElementById('totalCookiesRemoved').textContent = formatNumber(stats.totalCookiesRemoved);
    document.getElementById('totalPagesProtected').textContent = formatNumber(stats.totalPagesProtected);
    document.getElementById('daysActive').textContent = stats.daysActive;
}

/**
 * Show confirmation dialog
 */
let pendingAction = null;

function showConfirmDialog(title, message, action) {
    pendingAction = action;
    
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmModal').style.display = 'flex';
}

function hideConfirmDialog() {
    pendingAction = null;
    document.getElementById('confirmModal').style.display = 'none';
}

function executeConfirmedAction() {
    if (pendingAction) {
        pendingAction();
        hideConfirmDialog();
    }
}

/**
 * Show save indicator
 */
function showSaveIndicator() {
    const indicator = document.getElementById('saveIndicator');
    if (indicator) {
        indicator.style.display = 'flex';
        
        // Hide after 2 seconds
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 2000);
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        z-index: 2000;
        max-width: 400px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease-in-out;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    // Set background color
    const colors = {
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#6366f1'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => removeNotification(notification));
    
    // Auto remove after 5 seconds
    setTimeout(() => removeNotification(notification), 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

function removeNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

/**
 * Format numbers for display
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Handle messages from background script
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 Options page received message:', message);
    
    switch (message.type) {
        case 'statisticsUpdated':
            if (message.statistics) {
                Object.assign(optionsState.statistics, message.statistics);
                updateStatisticsDisplay();
            }
            break;
            
        case 'settingsRequest':
            sendResponse({ settings: optionsState.settings });
            break;
    }
});

/**
 * Handle page unload
 */
window.addEventListener('beforeunload', (e) => {
    if (optionsState.isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
});

console.log('🎛️ Digital Footprint Eraser: Options script loaded');
console.log('⚙️ Settings management: Ready');
console.log('📊 Statistics tracking: Active');
console.log('🎨 User interface: Initialized');