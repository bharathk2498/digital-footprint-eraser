/**
 * Digital Footprint Eraser - Extension Options Script
 * Handles settings management and user preferences
 */

// Options page state
let optionsState = {
    settings: {},
    statistics: {},
    isLoading: false,
    hasUnsavedChanges: false
};

// Default settings configuration
const DEFAULT_SETTINGS = {
    privacyProtectionEnabled: true,
    trackingProtectionLevel: 'strict',
    notificationsEnabled: true,
    autoDeleteCookies: true,
    clearHistoryOnClose: false,
    autoCleanupEnabled: true,
    cleanupInterval: 30,
    blockSocialTrackers: true,
    blockAdvertising: true,
    blockAnalytics: true,
    removeSocialWidgets: true,
    preventFingerprinting: true,
    spoofUserAgent: false,
    blockWebRTC: false,
    customDomains: '',
    whitelistedSites: ''
};

/**
 * Initialize options page
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Digital Footprint Eraser: Options page initializing...');
    
    try {
        await loadSettings();
        await loadStatistics();
        bindEventListeners();
        updateUI();
        setupAutoSave();
        
        console.log('✅ Options page initialization complete');
    } catch (error) {
        console.error('❌ Options initialization failed:', error);
        showMessage('Failed to load settings', 'error');
    }
});

/**
 * Load settings from storage
 */
async function loadSettings() {
    console.log('📋 Loading settings...');
    
    try {
        const stored = await chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS));
        
        // Merge with defaults
        optionsState.settings = { ...DEFAULT_SETTINGS, ...stored };
        
        console.log('✅ Settings loaded:', optionsState.settings);
    } catch (error) {
        console.error('❌ Failed to load settings:', error);
        optionsState.settings = { ...DEFAULT_SETTINGS };
    }
}

/**
 * Load statistics from storage
 */
async function loadStatistics() {
    console.log('📊 Loading statistics...');
    
    try {
        const stats = await chrome.storage.local.get([
            'totalTrackersBlocked',
            'totalCookiesRemoved', 
            'totalWidgetsRemoved',
            'fingerrintingBlocked'
        ]);
        
        optionsState.statistics = {
            totalTrackersBlocked: stats.totalTrackersBlocked || 0,
            totalCookiesRemoved: stats.totalCookiesRemoved || 0,
            totalWidgetsRemoved: stats.totalWidgetsRemoved || 0,
            fingerrintingBlocked: stats.fingerrintingBlocked || 0
        };
        
        console.log('✅ Statistics loaded:', optionsState.statistics);
    } catch (error) {
        console.error('❌ Failed to load statistics:', error);
        optionsState.statistics = {
            totalTrackersBlocked: 0,
            totalCookiesRemoved: 0,
            totalWidgetsRemoved: 0,
            fingerrintingBlocked: 0
        };
    }
}

/**
 * Update UI with current settings and statistics
 */
function updateUI() {
    console.log('🎨 Updating UI...');
    
    // Update settings controls
    updateSettingsControls();
    
    // Update statistics display
    updateStatisticsDisplay();
    
    // Update dependent controls
    updateDependentControls();
}

/**
 * Update settings form controls
 */
function updateSettingsControls() {
    Object.keys(optionsState.settings).forEach(key => {
        const element = document.getElementById(key);
        if (!element) return;
        
        const value = optionsState.settings[key];
        
        if (element.type === 'checkbox') {
            element.checked = value;
        } else if (element.tagName === 'SELECT') {
            element.value = value;
        } else if (element.tagName === 'TEXTAREA') {
            element.value = value;
        } else {
            element.value = value;
        }
    });
}

/**
 * Update statistics display
 */
function updateStatisticsDisplay() {
    const stats = optionsState.statistics;
    
    updateStatElement('totalTrackersBlocked', stats.totalTrackersBlocked);
    updateStatElement('totalCookiesRemoved', stats.totalCookiesRemoved);
    updateStatElement('totalWidgetsRemoved', stats.totalWidgetsRemoved);
    updateStatElement('fingerrintingBlocked', stats.fingerrintingBlocked);
}

/**
 * Update individual stat element
 */
function updateStatElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = formatNumber(value);
    }
}

/**
 * Update controls that depend on other settings
 */
function updateDependentControls() {
    // Show/hide cleanup interval setting based on auto cleanup
    const cleanupIntervalSetting = document.getElementById('cleanupIntervalSetting');
    const autoCleanupEnabled = optionsState.settings.autoCleanupEnabled;
    
    if (cleanupIntervalSetting) {
        cleanupIntervalSetting.style.display = autoCleanupEnabled ? 'flex' : 'none';
    }
}

/**
 * Bind event listeners to form controls
 */
function bindEventListeners() {
    console.log('🎧 Binding event listeners...');
    
    // Settings form controls
    bindSettingsListeners();
    
    // Action buttons
    bindActionButtons();
    
    // Auto-save on changes
    bindAutoSaveListeners();
    
    // Keyboard shortcuts
    bindKeyboardShortcuts();
}

/**
 * Bind settings form listeners
 */
function bindSettingsListeners() {
    Object.keys(DEFAULT_SETTINGS).forEach(key => {
        const element = document.getElementById(key);
        if (!element) return;
        
        const eventType = element.type === 'checkbox' ? 'change' : 'input';
        element.addEventListener(eventType, (event) => {
            handleSettingChange(key, event);
        });
    });
}

/**
 * Handle individual setting changes
 */
function handleSettingChange(key, event) {
    const element = event.target;
    let value;
    
    if (element.type === 'checkbox') {
        value = element.checked;
    } else if (element.tagName === 'SELECT') {
        value = element.value;
    } else if (element.type === 'number') {
        value = parseInt(element.value, 10);
    } else {
        value = element.value;
    }
    
    // Update state
    optionsState.settings[key] = value;
    optionsState.hasUnsavedChanges = true;
    
    // Update dependent controls
    updateDependentControls();
    
    // Visual feedback
    markAsChanged(element);
    
    console.log(`⚙️ Setting changed: ${key} = ${value}`);
}

/**
 * Bind action button listeners
 */
function bindActionButtons() {
    // Save settings
    const saveBtn = document.getElementById('saveSettings');
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveSettings);
    }
    
    // Reset settings
    const resetBtn = document.getElementById('resetSettings');
    if (resetBtn) {
        resetBtn.addEventListener('click', handleResetSettings);
    }
    
    // Reset statistics
    const resetStatsBtn = document.getElementById('resetStats');
    if (resetStatsBtn) {
        resetStatsBtn.addEventListener('click', handleResetStatistics);
    }
    
    // Export statistics
    const exportStatsBtn = document.getElementById('exportStats');
    if (exportStatsBtn) {
        exportStatsBtn.addEventListener('click', handleExportStatistics);
    }
    
    // Open full app
    const openFullAppBtn = document.getElementById('openFullApp');
    if (openFullAppBtn) {
        openFullAppBtn.addEventListener('click', handleOpenFullApp);
    }
    
    // Privacy policy link
    const privacyLink = document.getElementById('privacyPolicyLink');
    if (privacyLink) {
        privacyLink.addEventListener('click', handlePrivacyPolicyLink);
    }
}

/**
 * Bind auto-save listeners
 */
function bindAutoSaveListeners() {
    // Auto-save after 2 seconds of inactivity
    let autoSaveTimeout;
    
    const autoSave = () => {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            if (optionsState.hasUnsavedChanges) {
                saveSettingsQuietly();
            }
        }, 2000);
    };
    
    // Listen to all form changes
    document.querySelectorAll('input, select, textarea').forEach(element => {
        element.addEventListener('input', autoSave);
        element.addEventListener('change', autoSave);
    });
}

/**
 * Bind keyboard shortcuts
 */
function bindKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Ctrl/Cmd + S to save
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            handleSaveSettings();
        }
        
        // Ctrl/Cmd + R to reset (with confirmation)
        if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
            event.preventDefault();
            handleResetSettings();
        }
    });
}

/**
 * Event Handlers
 */
async function handleSaveSettings() {
    console.log('💾 Saving settings...');
    
    try {
        setLoadingState(true);
        
        // Validate settings
        const validationErrors = validateSettings();
        if (validationErrors.length > 0) {
            showMessage(`Validation errors: ${validationErrors.join(', ')}`, 'error');
            return;
        }
        
        // Save to storage
        await chrome.storage.sync.set(optionsState.settings);
        
        // Notify background script of changes
        await chrome.runtime.sendMessage({
            action: 'settingsUpdated',
            settings: optionsState.settings
        });
        
        // Update state
        optionsState.hasUnsavedChanges = false;
        
        // Visual feedback
        clearChangedMarkers();
        showMessage('Settings saved successfully!', 'success');
        
        console.log('✅ Settings saved successfully');
        
    } catch (error) {
        console.error('❌ Failed to save settings:', error);
        showMessage('Failed to save settings', 'error');
    } finally {
        setLoadingState(false);
    }
}

async function handleResetSettings() {
    const confirmed = confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.');
    
    if (!confirmed) return;
    
    console.log('🔄 Resetting settings to defaults...');
    
    try {
        setLoadingState(true);
        
        // Reset to defaults
        optionsState.settings = { ...DEFAULT_SETTINGS };
        optionsState.hasUnsavedChanges = true;
        
        // Update UI
        updateUI();
        
        // Save immediately
        await handleSaveSettings();
        
        showMessage('Settings reset to defaults', 'success');
        
    } catch (error) {
        console.error('❌ Failed to reset settings:', error);
        showMessage('Failed to reset settings', 'error');
    } finally {
        setLoadingState(false);
    }
}

async function handleResetStatistics() {
    const confirmed = confirm('Are you sure you want to reset all statistics? This cannot be undone.');
    
    if (!confirmed) return;
    
    console.log('📊 Resetting statistics...');
    
    try {
        setLoadingState(true);
        
        // Reset statistics
        optionsState.statistics = {
            totalTrackersBlocked: 0,
            totalCookiesRemoved: 0,
            totalWidgetsRemoved: 0,
            fingerrintingBlocked: 0
        };
        
        // Save to storage
        await chrome.storage.local.set(optionsState.statistics);
        
        // Update display
        updateStatisticsDisplay();
        
        showMessage('Statistics reset successfully', 'success');
        
    } catch (error) {
        console.error('❌ Failed to reset statistics:', error);
        showMessage('Failed to reset statistics', 'error');
    } finally {
        setLoadingState(false);
    }
}

function handleExportStatistics() {
    console.log('📁 Exporting statistics...');
    
    try {
        const exportData = {
            statistics: optionsState.statistics,
            settings: optionsState.settings,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dfe-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showMessage('Statistics exported successfully', 'success');
        
    } catch (error) {
        console.error('❌ Failed to export statistics:', error);
        showMessage('Failed to export statistics', 'error');
    }
}

function handleOpenFullApp() {
    chrome.tabs.create({
        url: 'https://bharathk2498.github.io/digital-footprint-eraser/?source=extension-options'
    });
}

function handlePrivacyPolicyLink(event) {
    event.preventDefault();
    chrome.tabs.create({
        url: 'https://bharathk2498.github.io/digital-footprint-eraser/docs/PRIVACY_POLICY.md'
    });
}

/**
 * Utility Functions
 */

/**
 * Save settings quietly (without user feedback)
 */
async function saveSettingsQuietly() {
    try {
        await chrome.storage.sync.set(optionsState.settings);
        
        await chrome.runtime.sendMessage({
            action: 'settingsUpdated',
            settings: optionsState.settings
        });
        
        optionsState.hasUnsavedChanges = false;
        clearChangedMarkers();
        
        console.log('💾 Settings auto-saved');
        
    } catch (error) {
        console.warn('Auto-save failed:', error);
    }
}

/**
 * Validate current settings
 */
function validateSettings() {
    const errors = [];
    
    // Validate cleanup interval
    const interval = optionsState.settings.cleanupInterval;
    if (interval < 5 || interval > 1440) {
        errors.push('Cleanup interval must be between 5 and 1440 minutes');
    }
    
    // Validate custom domains format
    const customDomains = optionsState.settings.customDomains.trim();
    if (customDomains) {
        const domains = customDomains.split('\n').filter(d => d.trim());
        for (const domain of domains) {
            if (!isValidDomain(domain.trim())) {
                errors.push(`Invalid domain format: ${domain}`);
            }
        }
    }
    
    // Validate whitelisted sites format
    const whitelistedSites = optionsState.settings.whitelistedSites.trim();
    if (whitelistedSites) {
        const sites = whitelistedSites.split('\n').filter(s => s.trim());
        for (const site of sites) {
            if (!isValidDomain(site.trim())) {
                errors.push(`Invalid site format: ${site}`);
            }
        }
    }
    
    return errors;
}

/**
 * Check if domain format is valid
 */
function isValidDomain(domain) {
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain);
}

/**
 * Set loading state for UI
 */
function setLoadingState(isLoading) {
    optionsState.isLoading = isLoading;
    
    // Disable all form controls
    document.querySelectorAll('input, select, textarea, button').forEach(element => {
        element.disabled = isLoading;
    });
    
    // Update save button
    const saveBtn = document.getElementById('saveSettings');
    if (saveBtn) {
        if (isLoading) {
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        } else {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Settings';
        }
    }
}

/**
 * Mark element as changed
 */
function markAsChanged(element) {
    const settingItem = element.closest('.setting-item');
    if (settingItem) {
        settingItem.classList.add('changed');
    }
}

/**
 * Clear all changed markers
 */
function clearChangedMarkers() {
    document.querySelectorAll('.setting-item.changed').forEach(item => {
        item.classList.remove('changed');
    });
}

/**
 * Show message overlay
 */
function showMessage(text, type = 'success') {
    const overlay = document.getElementById('messageOverlay');
    const icon = overlay.querySelector('.message-icon');
    const messageText = overlay.querySelector('.message-text');
    
    if (overlay && icon && messageText) {
        icon.className = `message-icon ${type}`;
        messageText.textContent = text;
        overlay.style.display = 'flex';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 3000);
    }
}

/**
 * Format number for display
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
 * Setup auto-save functionality
 */
function setupAutoSave() {
    // Warn user about unsaved changes when leaving
    window.addEventListener('beforeunload', (event) => {
        if (optionsState.hasUnsavedChanges) {
            event.preventDefault();
            event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    });
    
    // Auto-save when page loses focus
    window.addEventListener('blur', () => {
        if (optionsState.hasUnsavedChanges) {
            saveSettingsQuietly();
        }
    });
}

/**
 * Listen for storage changes from other extension parts
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
        // Settings changed from another source
        console.log('📡 Settings updated from external source');
        
        // Update local state
        Object.keys(changes).forEach(key => {
            if (key in optionsState.settings) {
                optionsState.settings[key] = changes[key].newValue;
            }
        });
        
        // Update UI
        updateSettingsControls();
        updateDependentControls();
    }
    
    if (areaName === 'local') {
        // Statistics might have changed
        const statKeys = ['totalTrackersBlocked', 'totalCookiesRemoved', 'totalWidgetsRemoved', 'fingerrintingBlocked'];
        const hasStatChanges = statKeys.some(key => key in changes);
        
        if (hasStatChanges) {
            console.log('📊 Statistics updated from external source');
            loadStatistics().then(() => {
                updateStatisticsDisplay();
            });
        }
    }
});

console.log('🔐 Digital Footprint Eraser: Options script loaded');
console.log('⚙️ Settings management: Ready');
console.log('📊 Statistics tracking: Active');
console.log('💾 Auto-save: Enabled');