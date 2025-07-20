/**
 * Digital Footprint Eraser - Extension Options Script
 * Handles settings configuration and user preferences
 */

// Default settings configuration
const DEFAULT_SETTINGS = {
    // Core Protection
    privacyProtectionEnabled: true,
    blockTrackers: true,
    removeSocialWidgets: true,
    preventFingerprinting: true,
    trackingProtectionLevel: 'standard',
    
    // Auto Cleanup
    autoCleanupEnabled: true,
    cleanupInterval: 30,
    autoDeleteCookies: true,
    clearHistoryOnClose: false,
    clearDownloads: false,
    
    // Tracking Protection
    blockAnalytics: true,
    blockAdvertising: true,
    blockSocialTrackers: true,
    blockCryptomining: true,
    blockMalware: true,
    
    // Advanced
    notificationsEnabled: true,
    showTrackerCount: true,
    keepLocalStats: true,
    debugMode: false
};

// Current settings state
let currentSettings = { ...DEFAULT_SETTINGS };
let hasUnsavedChanges = false;

/**
 * Initialize options page
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('⚙️ Digital Footprint Eraser: Options page initializing...');
    
    try {
        await loadSettings();
        initializeUI();
        bindEventListeners();
        loadStatistics();
        
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
        const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
        currentSettings = { ...DEFAULT_SETTINGS, ...stored };
        
        console.log('📖 Settings loaded:', currentSettings);
    } catch (error) {
        console.error('Failed to load settings:', error);
        throw error;
    }
}

/**
 * Initialize UI elements with current settings
 */
function initializeUI() {
    // Populate all form elements with current settings
    Object.keys(currentSettings).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = currentSettings[key];
            } else if (element.tagName === 'SELECT') {
                element.value = currentSettings[key];
            } else {
                element.value = currentSettings[key];
            }
        }
    });
    
    // Set initial tab
    showTab('privacy');
    
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
            showTab(tabName);
        });
    });
    
    // Settings change listeners
    Object.keys(DEFAULT_SETTINGS).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            const eventType = element.type === 'checkbox' ? 'change' : 'input';
            element.addEventListener(eventType, () => {
                handleSettingChange(key, element);
            });
        }
    });
    
    // Action buttons
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('openFullApp').addEventListener('click', openFullApp);
    document.getElementById('exportSettings').addEventListener('click', exportSettings);
    document.getElementById('importSettings').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', importSettings);
    document.getElementById('resetSettings').addEventListener('click', showResetConfirmation);
    
    // Modal handlers
    document.getElementById('cancelAction').addEventListener('click', hideModal);
    document.getElementById('confirmAction').addEventListener('click', confirmAction);
    
    // Prevent accidental tab closure with unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    });
    
    console.log('🔗 Event listeners bound');
}

/**
 * Show specific tab content
 */
function showTab(tabName) {
    // Update navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    console.log(`📄 Switched to ${tabName} tab`);
}

/**
 * Handle setting changes
 */
function handleSettingChange(key, element) {
    let value;
    
    if (element.type === 'checkbox') {
        value = element.checked;
    } else if (element.tagName === 'SELECT') {
        value = element.value;
    } else {
        value = element.value;
    }
    
    // Update current settings
    currentSettings[key] = value;
    hasUnsavedChanges = true;
    
    // Update save button state
    updateSaveButtonState();
    
    // Handle special cases
    handleSpecialSettings(key, value);
    
    console.log(`⚙️ Setting changed: ${key} = ${value}`);
}

/**
 * Handle special setting dependencies
 */
function handleSpecialSettings(key, value) {
    switch (key) {
        case 'privacyProtectionEnabled':
            // If main protection is disabled, show warning
            if (!value) {
                showNotification('Privacy protection disabled. Your browsing data may be tracked.', 'warning');
            }
            break;
            
        case 'autoCleanupEnabled':
            // Enable/disable cleanup interval setting
            const intervalSelect = document.getElementById('cleanupInterval');
            if (intervalSelect) {
                intervalSelect.disabled = !value;
            }
            break;
            
        case 'debugMode':
            // Show debug warning
            if (value) {
                showNotification('Debug mode enabled. This may impact performance.', 'warning');
            }
            break;
    }
}

/**
 * Update save button state
 */
function updateSaveButtonState() {
    const saveButton = document.getElementById('saveSettings');
    if (saveButton) {
        if (hasUnsavedChanges) {
            saveButton.textContent = '💾 Save Changes';
            saveButton.style.background = '#f59e0b';
        } else {
            saveButton.textContent = '✅ Settings Saved';
            saveButton.style.background = '#22c55e';
        }
    }
}

/**
 * Save settings to storage
 */
async function saveSettings() {
    try {
        console.log('💾 Saving settings...');
        
        // Save to storage
        await chrome.storage.sync.set(currentSettings);
        
        // Notify background script of changes
        await chrome.runtime.sendMessage({
            action: 'settingsUpdated',
            settings: currentSettings
        });
        
        hasUnsavedChanges = false;
        updateSaveButtonState();
        
        showNotification('Settings saved successfully!', 'success');
        
        console.log('✅ Settings saved successfully');
        
    } catch (error) {
        console.error('❌ Failed to save settings:', error);
        showNotification('Failed to save settings. Please try again.', 'error');
    }
}

/**
 * Load and display statistics
 */
async function loadStatistics() {
    try {
        const stats = await chrome.storage.local.get([
            'totalTrackersBlocked',
            'totalCookiesRemoved',
            'totalCleanups',
            'installDate'
        ]);
        
        // Update statistics display
        updateStatistic('totalTrackersBlocked', stats.totalTrackersBlocked || 0);
        updateStatistic('totalCookiesRemoved', stats.totalCookiesRemoved || 0);
        updateStatistic('totalCleanups', stats.totalCleanups || 0);
        
        // Calculate days since install
        const installDate = stats.installDate || new Date().toISOString();
        const daysSince = Math.floor((Date.now() - new Date(installDate)) / (1000 * 60 * 60 * 24));
        updateStatistic('daysSinceInstall', daysSince);
        
        console.log('📊 Statistics loaded');
        
    } catch (error) {
        console.error('Failed to load statistics:', error);
    }
}

/**
 * Update statistic display
 */
function updateStatistic(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = formatNumber(value);
    }
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
 * Export settings to file
 */
function exportSettings() {
    try {
        const exportData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            settings: currentSettings
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `digital-footprint-eraser-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Settings exported successfully!', 'success');
        
        console.log('📤 Settings exported');
        
    } catch (error) {
        console.error('Export failed:', error);
        showNotification('Failed to export settings', 'error');
    }
}

/**
 * Import settings from file
 */
function importSettings(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importData = JSON.parse(e.target.result);
            
            // Validate import data
            if (!importData.settings) {
                throw new Error('Invalid settings file format');
            }
            
            // Merge with default settings to ensure all keys exist
            const newSettings = { ...DEFAULT_SETTINGS, ...importData.settings };
            
            // Update current settings
            currentSettings = newSettings;
            hasUnsavedChanges = true;
            
            // Update UI
            initializeUI();
            updateSaveButtonState();
            
            showNotification('Settings imported successfully! Click Save to apply.', 'success');
            
            console.log('📥 Settings imported');
            
        } catch (error) {
            console.error('Import failed:', error);
            showNotification('Failed to import settings. Please check the file format.', 'error');
        }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

/**
 * Show reset confirmation modal
 */
function showResetConfirmation() {
    const modal = document.getElementById('confirmModal');
    const message = document.getElementById('confirmMessage');
    
    if (modal && message) {
        message.textContent = 'Are you sure you want to reset all settings to default values? This action cannot be undone.';
        modal.style.display = 'flex';
        
        // Set up confirm action
        modal.dataset.action = 'reset';
    }
}

/**
 * Show modal
 */
function showModal(title, message, action) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    
    if (modal && messageEl) {
        messageEl.textContent = message;
        modal.style.display = 'flex';
        modal.dataset.action = action;
    }
}

/**
 * Hide modal
 */
function hideModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.style.display = 'none';
        delete modal.dataset.action;
    }
}

/**
 * Confirm modal action
 */
async function confirmAction() {
    const modal = document.getElementById('confirmModal');
    const action = modal?.dataset.action;
    
    switch (action) {
        case 'reset':
            await resetSettings();
            break;
    }
    
    hideModal();
}

/**
 * Reset all settings to defaults
 */
async function resetSettings() {
    try {
        console.log('🔄 Resetting settings to defaults...');
        
        // Reset to default settings
        currentSettings = { ...DEFAULT_SETTINGS };
        hasUnsavedChanges = true;
        
        // Update UI
        initializeUI();
        updateSaveButtonState();
        
        showNotification('Settings reset to defaults. Click Save to apply.', 'success');
        
        console.log('✅ Settings reset successfully');
        
    } catch (error) {
        console.error('❌ Failed to reset settings:', error);
        showNotification('Failed to reset settings', 'error');
    }
}

/**
 * Open full application
 */
function openFullApp() {
    chrome.tabs.create({
        url: 'https://bharathk2498.github.io/digital-footprint-eraser/?source=extension-options'
    });
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const icon = notification.querySelector('.notification-icon');
    const messageEl = notification.querySelector('.notification-message');
    
    if (notification && icon && messageEl) {
        // Set icon based on type
        switch (type) {
            case 'success':
                icon.className = 'notification-icon fas fa-check-circle success';
                break;
            case 'error':
                icon.className = 'notification-icon fas fa-exclamation-circle error';
                break;
            case 'warning':
                icon.className = 'notification-icon fas fa-exclamation-triangle warning';
                break;
            default:
                icon.className = 'notification-icon fas fa-info-circle';
        }
        
        messageEl.textContent = message;
        notification.style.display = 'block';
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 4000);
    }
}

/**
 * Handle keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges) {
            saveSettings();
        }
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
        hideModal();
    }
});

/**
 * Monitor for setting changes from other sources
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        console.log('📡 Settings changed externally, reloading...');
        
        // Reload settings if they were changed elsewhere
        Object.keys(changes).forEach(key => {
            if (key in DEFAULT_SETTINGS) {
                currentSettings[key] = changes[key].newValue;
            }
        });
        
        // Update UI if no unsaved changes
        if (!hasUnsavedChanges) {
            initializeUI();
        }
    }
});

/**
 * Handle messages from background script
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 Options page received message:', message);
    
    switch (message.type) {
        case 'settingsRequest':
            sendResponse({ settings: currentSettings });
            break;
        case 'statsUpdated':
            if (message.stats) {
                loadStatistics();
            }
            break;
    }
});

/**
 * Performance monitoring
 */
const performanceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
            console.log(`⚡ Options page loaded in ${entry.loadEventEnd - entry.navigationStart}ms`);
        }
    }
});

performanceObserver.observe({ entryTypes: ['navigation'] });

console.log('⚙️ Digital Footprint Eraser: Options script loaded');
console.log('🎛️ Settings management: Ready');
console.log('🔄 Auto-sync: Enabled');
console.log('💾 Backup/restore: Available');