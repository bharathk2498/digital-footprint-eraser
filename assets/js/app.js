/**
 * Digital Footprint Eraser - Main Application
 * Handles core application logic, UI interactions, and orchestration
 */

class DigitalFootprintEraser {
    constructor() {
        this.progress = 0;
        this.tasks = [];
        this.isProcessing = false;
        this.results = {
            cookies: null,
            brokers: null,
            social: null,
            scanner: null
        };
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.bindEvents();
        this.initializeComponents();
        this.checkBrowserCapabilities();
        console.log('🧹 Digital Footprint Eraser initialized');
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Navigation events
        document.getElementById('startCleanup')?.addEventListener('click', () => this.showMainApp());
        document.getElementById('heroStartBtn')?.addEventListener('click', () => this.showMainApp());
        document.getElementById('scanFootprint')?.addEventListener('click', () => this.startFootprintScan());

        // Main action buttons
        document.getElementById('startFullCleanup')?.addEventListener('click', () => this.startFullCleanup());
        document.getElementById('downloadReport')?.addEventListener('click', () => this.downloadReport());

        // Individual cleanup sections
        document.getElementById('startCookieCleanup')?.addEventListener('click', () => this.startCookieCleanup());
        document.getElementById('startBrokerRemoval')?.addEventListener('click', () => this.startBrokerRemoval());
        document.getElementById('startSocialCleanup')?.addEventListener('click', () => this.startSocialCleanup());
        document.getElementById('startFootprintScan')?.addEventListener('click', () => this.startFootprintScan());

        // Social platform buttons
        document.querySelectorAll('.btn-platform').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const platform = e.target.closest('.btn-platform').dataset.platform;
                this.showPlatformInstructions(platform);
            });
        });

        // Modal events
        document.querySelector('.modal-close')?.addEventListener('click', () => this.hideModal());
        document.getElementById('modalCloseBtn')?.addEventListener('click', () => this.hideModal());
        
        // Close modal on outside click
        document.getElementById('instructionModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'instructionModal') {
                this.hideModal();
            }
        });

        // Mobile menu toggle
        document.querySelector('.mobile-menu-toggle')?.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Form validation
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('input', () => this.validateForm());
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    /**
     * Initialize application components
     */
    initializeComponents() {
        // Initialize progress tracking
        this.updateProgress(0, 'Ready to start cleanup');
        
        // Set initial status
        this.updateStatus('cookieStatus', 'Ready', 'pending');
        this.updateStatus('brokerStatus', 'Ready', 'pending');
        this.updateStatus('socialStatus', 'Ready', 'pending');
        this.updateStatus('scannerStatus', 'Ready', 'pending');

        // Initialize privacy metrics
        this.updateMetric('privacyScore', '--');
        this.updateMetric('exposureLevel', '--');
        this.updateMetric('riskFactors', '--');
    }

    /**
     * Check browser capabilities and show warnings if needed
     */
    checkBrowserCapabilities() {
        const capabilities = {
            localStorage: typeof(Storage) !== "undefined",
            cookieAccess: navigator.cookieEnabled,
            clipboardAPI: !!navigator.clipboard,
            downloadAPI: !!document.createElement('a').download !== undefined
        };

        if (!capabilities.localStorage) {
            this.showWarning('Local storage not available. Some features may be limited.');
        }

        if (!capabilities.cookieAccess) {
            this.showWarning('Cookie access disabled. Cookie cleanup features will be limited.');
        }

        return capabilities;
    }

    /**
     * Show the main application interface
     */
    showMainApp() {
        document.querySelector('.hero').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Analytics (privacy-focused - local only)
        this.trackEvent('app_opened');
    }

    /**
     * Start the complete cleanup process
     */
    async startFullCleanup() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.showLoading('Starting complete digital cleanup...');
        
        try {
            this.updateProgress(10, 'Initializing cleanup process...');
            
            // Step 1: Cookie cleanup
            await this.executeCookieCleanup();
            this.updateProgress(35, 'Cookies cleaned successfully');
            
            // Step 2: Generate broker removal requests
            await this.executeBrokerRemoval();
            this.updateProgress(65, 'Data broker removal requests generated');
            
            // Step 3: Social media optimization
            await this.executeSocialOptimization();
            this.updateProgress(85, 'Social media privacy optimized');
            
            // Step 4: Final scan
            await this.executeFootprintScan();
            this.updateProgress(100, 'Complete cleanup finished successfully!');
            
            this.showSuccess('Digital footprint cleanup completed successfully!');
            this.trackEvent('full_cleanup_completed');
            
        } catch (error) {
            console.error('Cleanup failed:', error);
            this.showError('Cleanup process encountered an error. Please try individual sections.');
            this.trackEvent('full_cleanup_failed', { error: error.message });
        } finally {
            this.isProcessing = false;
            this.hideLoading();
        }
    }

    /**
     * Start cookie cleanup process
     */
    async startCookieCleanup() {
        if (this.isProcessing) return;
        
        this.updateStatus('cookieStatus', 'Processing...', 'processing');
        
        try {
            const options = this.getCookieCleanupOptions();
            const result = await CookieCleaner.cleanup(options);
            
            this.results.cookies = result;
            this.updateStatus('cookieStatus', 'Completed', 'completed');
            this.showResults('cookieResults', this.formatCookieResults(result));
            
            this.trackEvent('cookie_cleanup_completed', { 
                cookiesRemoved: result.cookiesRemoved,
                storageCleared: result.storageCleared 
            });
            
        } catch (error) {
            console.error('Cookie cleanup failed:', error);
            this.updateStatus('cookieStatus', 'Error', 'error');
            this.showError('Cookie cleanup failed. Please check browser permissions.');
        }
    }

    /**
     * Start data broker removal process
     */
    async startBrokerRemoval() {
        if (this.isProcessing) return;
        
        const personalInfo = this.getPersonalInfo();
        if (!this.validatePersonalInfo(personalInfo)) {
            this.showError('Please fill in at least your first name, last name, and email address.');
            return;
        }
        
        this.updateStatus('brokerStatus', 'Processing...', 'processing');
        
        try {
            const result = await DataBrokerRemover.generateRemovalRequests(personalInfo);
            
            this.results.brokers = result;
            this.updateStatus('brokerStatus', 'Completed', 'completed');
            this.showResults('brokerResults', this.formatBrokerResults(result));
            
            this.trackEvent('broker_removal_completed', { 
                requestsGenerated: result.totalRequests 
            });
            
        } catch (error) {
            console.error('Broker removal failed:', error);
            this.updateStatus('brokerStatus', 'Error', 'error');
            this.showError('Data broker removal failed. Please try again.');
        }
    }

    /**
     * Start social media cleanup process
     */
    async startSocialCleanup() {
        if (this.isProcessing) return;
        
        this.updateStatus('socialStatus', 'Processing...', 'processing');
        
        try {
            const result = await SocialMediaOptimizer.generateInstructions();
            
            this.results.social = result;
            this.updateStatus('socialStatus', 'Completed', 'completed');
            this.showResults('socialResults', this.formatSocialResults(result));
            
            this.trackEvent('social_cleanup_completed', { 
                platformsOptimized: result.platforms.length 
            });
            
        } catch (error) {
            console.error('Social cleanup failed:', error);
            this.updateStatus('socialStatus', 'Error', 'error');
            this.showError('Social media optimization failed. Please try again.');
        }
    }

    /**
     * Start digital footprint scan
     */
    async startFootprintScan() {
        if (this.isProcessing) return;
        
        this.updateStatus('scannerStatus', 'Processing...', 'processing');
        
        try {
            const result = await FootprintScanner.scanDigitalFootprint();
            
            this.results.scanner = result;
            this.updateStatus('scannerStatus', 'Completed', 'completed');
            
            // Update metrics display
            this.updateMetric('privacyScore', result.privacyScore + '/100');
            this.updateMetric('exposureLevel', result.exposureLevel);
            this.updateMetric('riskFactors', result.riskFactors);
            
            this.showResults('scannerResults', this.formatScannerResults(result));
            
            this.trackEvent('footprint_scan_completed', { 
                privacyScore: result.privacyScore 
            });
            
        } catch (error) {
            console.error('Footprint scan failed:', error);
            this.updateStatus('scannerStatus', 'Error', 'error');
            this.showError('Digital footprint scan failed. Please try again.');
        }
    }

    /**
     * Execute individual cleanup steps (used by full cleanup)
     */
    async executeCookieCleanup() {
        const options = this.getCookieCleanupOptions();
        this.results.cookies = await CookieCleaner.cleanup(options);
        this.updateStatus('cookieStatus', 'Completed', 'completed');
    }

    async executeBrokerRemoval() {
        const personalInfo = this.getPersonalInfo();
        if (personalInfo.firstName && personalInfo.lastName && personalInfo.email) {
            this.results.brokers = await DataBrokerRemover.generateRemovalRequests(personalInfo);
            this.updateStatus('brokerStatus', 'Completed', 'completed');
        }
    }

    async executeSocialOptimization() {
        this.results.social = await SocialMediaOptimizer.generateInstructions();
        this.updateStatus('socialStatus', 'Completed', 'completed');
    }

    async executeFootprintScan() {
        this.results.scanner = await FootprintScanner.scanDigitalFootprint();
        this.updateStatus('scannerStatus', 'Completed', 'completed');
    }

    /**
     * Get cookie cleanup options from form
     */
    getCookieCleanupOptions() {
        return {
            clearCookies: document.getElementById('clearCookies').checked,
            clearCache: document.getElementById('clearCache').checked,
            clearSessions: document.getElementById('clearSessions').checked
        };
    }

    /**
     * Get personal information from form
     */
    getPersonalInfo() {
        return {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim()
        };
    }

    /**
     * Validate personal information
     */
    validatePersonalInfo(info) {
        return info.firstName && info.lastName && info.email && 
               /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email);
    }

    /**
     * Validate form inputs
     */
    validateForm() {
        const personalInfo = this.getPersonalInfo();
        const isValid = this.validatePersonalInfo(personalInfo);
        
        // Enable/disable broker removal button based on validation
        const brokerBtn = document.getElementById('startBrokerRemoval');
        if (brokerBtn) {
            brokerBtn.disabled = !isValid;
            brokerBtn.style.opacity = isValid ? '1' : '0.6';
        }
    }

    /**
     * Show platform-specific instructions
     */
    showPlatformInstructions(platform) {
        const instructions = SocialMediaOptimizer.getPlatformInstructions(platform);
        this.showModal(
            `${platform.charAt(0).toUpperCase() + platform.slice(1)} Privacy Optimization`,
            instructions
        );
    }

    /**
     * Update progress bar and text
     */
    updateProgress(percentage, text) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = text;
        
        this.progress = percentage;
    }

    /**
     * Update status indicator
     */
    updateStatus(elementId, text, type) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const statusSpan = element.querySelector('span');
        if (statusSpan) {
            statusSpan.textContent = text;
            statusSpan.className = `status-${type}`;
        }
    }

    /**
     * Update metric display
     */
    updateMetric(metricId, value) {
        const element = document.getElementById(metricId);
        if (element) {
            element.textContent = value;
        }
    }

    /**
     * Show results in a card
     */
    showResults(resultsPanelId, content) {
        const panel = document.getElementById(resultsPanelId);
        if (!panel) return;
        
        const contentDiv = panel.querySelector('.results-content');
        if (contentDiv) {
            contentDiv.innerHTML = content;
        }
        
        panel.style.display = 'block';
        
        // Smooth scroll to results
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Format cookie cleanup results
     */
    formatCookieResults(result) {
        return `
            <h4>🍪 Cookie Cleanup Results</h4>
            <div class="result-stats">
                <div class="stat-item">
                    <span class="stat-value">${result.cookiesRemoved || 0}</span>
                    <span class="stat-label">Cookies Removed</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${result.storageCleared || 0}</span>
                    <span class="stat-label">Storage Items Cleared</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${result.cacheCleared ? 'Yes' : 'No'}</span>
                    <span class="stat-label">Cache Cleared</span>
                </div>
            </div>
            <p class="result-message">${result.message || 'Cleanup completed successfully!'}</p>
        `;
    }

    /**
     * Format broker removal results
     */
    formatBrokerResults(result) {
        return `
            <h4>🏢 Data Broker Removal Results</h4>
            <div class="result-stats">
                <div class="stat-item">
                    <span class="stat-value">${result.totalRequests || 0}</span>
                    <span class="stat-label">Removal Requests Generated</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${result.emailsGenerated || 0}</span>
                    <span class="stat-label">Email Templates Created</span>
                </div>
            </div>
            <div class="broker-list">
                <h5>Top Priority Removals:</h5>
                <ul>
                    ${result.priorityBrokers?.map(broker => 
                        `<li><a href="${broker.url}" target="_blank">${broker.name}</a> - ${broker.category}</li>`
                    ).join('') || '<li>No priority brokers identified</li>'}
                </ul>
            </div>
            <button class="btn-secondary" onclick="app.downloadBrokerEmails()">
                <i class="fas fa-download"></i> Download Email Templates
            </button>
        `;
    }

    /**
     * Format social media results
     */
    formatSocialResults(result) {
        return `
            <h4>📱 Social Media Optimization Results</h4>
            <div class="social-results">
                ${result.platforms?.map(platform => `
                    <div class="platform-result">
                        <h5>${platform.name}</h5>
                        <ul>
                            ${platform.optimizations?.map(opt => `<li>${opt}</li>`).join('') || '<li>No optimizations available</li>'}
                        </ul>
                        <a href="${platform.settingsUrl}" target="_blank" class="btn-platform">
                            <i class="fas fa-external-link-alt"></i> Open Settings
                        </a>
                    </div>
                `).join('') || '<p>No platform optimizations available</p>'}
            </div>
        `;
    }

    /**
     * Format scanner results
     */
    formatScannerResults(result) {
        return `
            <h4>🔍 Digital Footprint Analysis</h4>
            <div class="scan-results">
                <div class="privacy-score-detail">
                    <h5>Privacy Score: ${result.privacyScore}/100</h5>
                    <div class="score-breakdown">
                        ${result.scoreBreakdown?.map(item => `
                            <div class="score-item">
                                <span>${item.category}</span>
                                <span class="score-value ${item.score >= 70 ? 'good' : item.score >= 40 ? 'warning' : 'poor'}">${item.score}/100</span>
                            </div>
                        `).join('') || '<p>No detailed breakdown available</p>'}
                    </div>
                </div>
                <div class="recommendations">
                    <h5>Recommendations:</h5>
                    <ul>
                        ${result.recommendations?.map(rec => `<li>${rec}</li>`).join('') || '<li>No specific recommendations at this time</li>'}
                    </ul>
                </div>
            </div>
        `;
    }

    /**
     * Download privacy report
     */
    downloadReport() {
        const report = this.generatePrivacyReport();
        const blob = new Blob([report], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `digital-footprint-report-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.trackEvent('report_downloaded');
    }

    /**
     * Generate comprehensive privacy report
     */
    generatePrivacyReport() {
        const date = new Date().toLocaleDateString();
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Digital Footprint Privacy Report - ${date}</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .section { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
                    .stat { display: inline-block; margin: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
                    .recommendation { background: #fff3cd; padding: 10px; margin: 10px 0; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🧹 Digital Footprint Privacy Report</h1>
                    <p>Generated on ${date}</p>
                </div>
                
                ${this.results.cookies ? this.generateCookieReportSection() : ''}
                ${this.results.brokers ? this.generateBrokerReportSection() : ''}
                ${this.results.social ? this.generateSocialReportSection() : ''}
                ${this.results.scanner ? this.generateScannerReportSection() : ''}
                
                <div class="section">
                    <h2>📋 Summary & Next Steps</h2>
                    <p>This report summarizes your digital footprint cleanup activities. Continue monitoring your privacy settings regularly and repeat this process quarterly for optimal protection.</p>
                </div>
                
                <footer style="text-align: center; margin-top: 30px; color: #666;">
                    <p>Generated by Digital Footprint Eraser | <a href="https://github.com/yourusername/digital-footprint-eraser">Open Source</a></p>
                </footer>
            </body>
            </html>
        `;
    }

    /**
     * Generate cookie report section
     */
    generateCookieReportSection() {
        const result = this.results.cookies;
        return `
            <div class="section">
                <h2>🍪 Cookie Cleanup Results</h2>
                <div class="stat">Cookies Removed: ${result.cookiesRemoved || 0}</div>
                <div class="stat">Storage Cleared: ${result.storageCleared || 0} items</div>
                <div class="stat">Cache Cleared: ${result.cacheCleared ? 'Yes' : 'No'}</div>
                <p>${result.message || 'Cookie cleanup completed successfully.'}</p>
            </div>
        `;
    }

    /**
     * Generate broker report section
     */
    generateBrokerReportSection() {
        const result = this.results.brokers;
        return `
            <div class="section">
                <h2>🏢 Data Broker Removal</h2>
                <div class="stat">Removal Requests: ${result.totalRequests || 0}</div>
                <div class="stat">Email Templates: ${result.emailsGenerated || 0}</div>
                <h3>Priority Brokers to Contact:</h3>
                <ul>
                    ${result.priorityBrokers?.map(broker => 
                        `<li>${broker.name} (${broker.category}) - <a href="${broker.url}">${broker.url}</a></li>`
                    ).join('') || '<li>No priority brokers identified</li>'}
                </ul>
            </div>
        `;
    }

    /**
     * Generate social report section
     */
    generateSocialReportSection() {
        const result = this.results.social;
        return `
            <div class="section">
                <h2>📱 Social Media Privacy</h2>
                ${result.platforms?.map(platform => `
                    <h3>${platform.name}</h3>
                    <ul>
                        ${platform.optimizations?.map(opt => `<li>${opt}</li>`).join('') || '<li>No optimizations available</li>'}
                    </ul>
                `).join('') || '<p>No platform data available</p>'}
            </div>
        `;
    }

    /**
     * Generate scanner report section
     */
    generateScannerReportSection() {
        const result = this.results.scanner;
        return `
            <div class="section">
                <h2>🔍 Digital Footprint Analysis</h2>
                <div class="stat">Privacy Score: ${result.privacyScore}/100</div>
                <div class="stat">Exposure Level: ${result.exposureLevel}</div>
                <div class="stat">Risk Factors: ${result.riskFactors}</div>
                
                <h3>Recommendations:</h3>
                ${result.recommendations?.map(rec => 
                    `<div class="recommendation">${rec}</div>`
                ).join('') || '<p>No specific recommendations available</p>'}
            </div>
        `;
    }

    /**
     * Download broker email templates
     */
    downloadBrokerEmails() {
        if (!this.results.brokers) return;
        
        const emailContent = DataBrokerRemover.generateEmailTemplates(this.results.brokers);
        const blob = new Blob([emailContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-broker-removal-emails-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Show modal dialog
     */
    showModal(title, content) {
        const modal = document.getElementById('instructionModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');
        
        if (modal && modalTitle && modalContent) {
            modalTitle.textContent = title;
            modalContent.innerHTML = content;
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hide modal dialog
     */
    hideModal() {
        const modal = document.getElementById('instructionModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    /**
     * Show loading overlay
     */
    showLoading(text = 'Processing...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        
        if (overlay) {
            if (loadingText) loadingText.textContent = text;
            overlay.style.display = 'flex';
        }
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show warning message
     */
    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 8px;
            color: white;
            z-index: 4000;
            max-width: 400px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease-in-out;
        `;
        
        // Set background color based on type
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
        closeBtn.addEventListener('click', () => this.removeNotification(notification));
        
        // Auto remove after 5 seconds
        setTimeout(() => this.removeNotification(notification), 5000);
    }

    /**
     * Remove notification
     */
    removeNotification(notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Escape key closes modal
        if (e.key === 'Escape') {
            this.hideModal();
        }
        
        // Ctrl/Cmd + Enter starts cleanup
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (!this.isProcessing) {
                this.startFullCleanup();
            }
        }
    }

    /**
     * Track events (privacy-focused, local only)
     */
    trackEvent(eventName, data = {}) {
        const event = {
            name: eventName,
            timestamp: new Date().toISOString(),
            data: data
        };
        
        // Store in local storage for analytics (stays local)
        try {
            const events = JSON.parse(localStorage.getItem('dfe_events') || '[]');
            events.push(event);
            
            // Keep only last 100 events
            if (events.length > 100) {
                events.splice(0, events.length - 100);
            }
            
            localStorage.setItem('dfe_events', JSON.stringify(events));
        } catch (error) {
            console.warn('Could not store analytics event:', error);
        }
        
        console.log('📊 Event tracked:', eventName, data);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DigitalFootprintEraser();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DigitalFootprintEraser;
}
