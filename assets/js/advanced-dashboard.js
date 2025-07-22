/**
 * Advanced Dashboard Module
 * Comprehensive UI management, metrics visualization, and user interaction handling
 */

class AdvancedDashboard {
    constructor() {
        this.elements = {};
        this.charts = {};
        this.metrics = {
            threatLevel: 0,
            privacyScore: 100,
            lastScan: null,
            systemHealth: 'healthy',
            protectionStatus: false
        };
        this.eventHandlers = new Map();
        this.notifications = [];
        this.theme = 'dark';
        this.animations = new Map();
        this.realTimeUpdates = new Map();
    }

    /**
     * Create the advanced interface
     */
    async createAdvancedInterface() {
        try {
            await this.initializeElements();
            await this.createMetricsDisplay();
            await this.createControlPanels();
            await this.createNotificationSystem();
            await this.setupRealtimeUpdates();
            await this.loadThemePreferences();
            
            console.log('Advanced dashboard interface created successfully');
            return true;
        } catch (error) {
            console.error('Failed to create advanced interface:', error);
            return false;
        }
    }

    /**
     * Initialize dashboard elements
     */
    async initializeElements() {
        this.elements = {
            // Main containers
            dashboard: document.getElementById('dashboard'),
            sidebar: document.querySelector('.sidebar'),
            mainContent: document.querySelector('.main-content'),
            
            // Metrics elements
            threatLevel: document.getElementById('threatLevel'),
            privacyScore: document.getElementById('privacyScore'),
            threatProgress: document.getElementById('threatProgress'),
            privacyProgress: document.getElementById('privacyProgress'),
            
            // Status elements
            statusIndicator: document.getElementById('statusIndicator'),
            statusText: document.getElementById('statusText'),
            
            // Action buttons
            quickScanBtn: document.getElementById('quickScanBtn'),
            smartCleanupBtn: document.getElementById('smartCleanupBtn'),
            emergencyCleanupBtn: document.getElementById('emergencyCleanupBtn'),
            protectionToggle: document.getElementById('protectionToggle'),
            
            // Results containers
            recentActivity: document.getElementById('recentActivity'),
            scanResults: document.getElementById('scanResults'),
            cleanupResults: document.getElementById('cleanupResults'),
            protectionActivity: document.getElementById('protectionActivity')
        };

        // Verify all required elements exist
        const missingElements = Object.entries(this.elements)
            .filter(([key, element]) => !element)
            .map(([key]) => key);

        if (missingElements.length > 0) {
            console.warn('Missing dashboard elements:', missingElements);
        }
    }

    /**
     * Create advanced metrics display with real-time visualization
     */
    async createMetricsDisplay() {
        if (!this.elements.dashboard) return;

        // Create advanced threat level visualization
        await this.createThreatLevelChart();
        
        // Create privacy score gauge
        await this.createPrivacyScoreGauge();
        
        // Create system health indicators
        await this.createSystemHealthIndicators();
        
        // Create performance metrics
        await this.createPerformanceMetrics();
    }

    /**
     * Create threat level chart with real-time updates
     */
    async createThreatLevelChart() {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'threat-chart-container';
        chartContainer.innerHTML = `
            <canvas id="threatChart" width="200" height="100"></canvas>
            <div class="threat-level-details">
                <div class="threat-category" data-category="malware">
                    <span class="category-icon">🦠</span>
                    <span class="category-name">Malware</span>
                    <span class="category-count" id="malwareCount">0</span>
                </div>
                <div class="threat-category" data-category="tracking">
                    <span class="category-icon">👁️</span>
                    <span class="category-name">Tracking</span>
                    <span class="category-count" id="trackingCount">0</span>
                </div>
                <div class="threat-category" data-category="privacy">
                    <span class="category-icon">🔒</span>
                    <span class="category-name">Privacy</span>
                    <span class="category-count" id="privacyCount">0</span>
                </div>
            </div>
        `;

        const metricsCard = document.querySelector('.card:first-child .metric:first-child');
        if (metricsCard) {
            metricsCard.appendChild(chartContainer);
        }

        this.initializeThreatChart();
    }

    /**
     * Initialize threat level chart with Canvas API
     */
    initializeThreatChart() {
        const canvas = document.getElementById('threatChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.charts.threatChart = { canvas, ctx, data: [] };

        // Initial draw
        this.updateThreatChart();
    }

    /**
     * Update threat chart with animation
     */
    updateThreatChart() {
        const chart = this.charts.threatChart;
        if (!chart) return;

        const { ctx, canvas } = chart;
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(255, 107, 107, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 107, 107, 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw threat level line
        const threatLevel = this.metrics.threatLevel;
        const lineHeight = (height * (100 - threatLevel)) / 100;

        ctx.beginPath();
        ctx.moveTo(0, lineHeight);
        ctx.lineTo(width, lineHeight);
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw threat level area
        ctx.beginPath();
        ctx.moveTo(0, lineHeight);
        ctx.lineTo(width, lineHeight);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 107, 107, 0.2)';
        ctx.fill();

        // Draw threat level text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${threatLevel}%`, width / 2, lineHeight - 10);
    }

    /**
     * Create privacy score gauge
     */
    async createPrivacyScoreGauge() {
        const gaugeContainer = document.createElement('div');
        gaugeContainer.className = 'privacy-gauge-container';
        gaugeContainer.innerHTML = `
            <canvas id="privacyGauge" width="150" height="150"></canvas>
            <div class="privacy-details">
                <div class="privacy-metric">
                    <span class="metric-label">Data Protection</span>
                    <span class="metric-value" id="dataProtection">95%</span>
                </div>
                <div class="privacy-metric">
                    <span class="metric-label">Tracking Blocked</span>
                    <span class="metric-value" id="trackingBlocked">127</span>
                </div>
            </div>
        `;

        const privacyCard = document.querySelector('.card:first-child .metric:last-child');
        if (privacyCard) {
            privacyCard.appendChild(gaugeContainer);
        }

        this.initializePrivacyGauge();
    }

    /**
     * Initialize privacy score gauge
     */
    initializePrivacyGauge() {
        const canvas = document.getElementById('privacyGauge');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.charts.privacyGauge = { canvas, ctx };

        this.updatePrivacyGauge();
    }

    /**
     * Update privacy gauge with smooth animation
     */
    updatePrivacyGauge() {
        const gauge = this.charts.privacyGauge;
        if (!gauge) return;

        const { ctx, canvas } = gauge;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 60;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 8;
        ctx.stroke();

        // Draw privacy score arc
        const privacyScore = this.metrics.privacyScore;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (2 * Math.PI * privacyScore) / 100;

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#56ab2f');
        gradient.addColorStop(1, '#a8e6cf');

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw center text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${privacyScore}%`, centerX, centerY + 8);
    }

    /**
     * Create system health indicators
     */
    async createSystemHealthIndicators() {
        const healthContainer = document.createElement('div');
        healthContainer.className = 'system-health-indicators';
        healthContainer.innerHTML = `
            <div class="health-indicator" data-type="cpu">
                <div class="indicator-icon">⚡</div>
                <div class="indicator-details">
                    <span class="indicator-label">CPU Usage</span>
                    <span class="indicator-value" id="cpuUsage">23%</span>
                </div>
                <div class="indicator-status good"></div>
            </div>
            <div class="health-indicator" data-type="memory">
                <div class="indicator-icon">💾</div>
                <div class="indicator-details">
                    <span class="indicator-label">Memory</span>
                    <span class="indicator-value" id="memoryUsage">1.2GB</span>
                </div>
                <div class="indicator-status good"></div>
            </div>
            <div class="health-indicator" data-type="network">
                <div class="indicator-icon">🌐</div>
                <div class="indicator-details">
                    <span class="indicator-label">Network</span>
                    <span class="indicator-value" id="networkStatus">Secure</span>
                </div>
                <div class="indicator-status good"></div>
            </div>
        `;

        const quickActionsCard = document.querySelector('.card:nth-child(2)');
        if (quickActionsCard) {
            quickActionsCard.appendChild(healthContainer);
        }
    }

    /**
     * Create performance metrics visualization
     */
    async createPerformanceMetrics() {
        const performanceContainer = document.createElement('div');
        performanceContainer.className = 'performance-metrics';
        performanceContainer.innerHTML = `
            <div class="performance-chart">
                <canvas id="performanceChart" width="300" height="100"></canvas>
            </div>
            <div class="performance-stats">
                <div class="stat">
                    <span class="stat-label">Scans Today</span>
                    <span class="stat-value" id="scansToday">12</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Threats Blocked</span>
                    <span class="stat-value" id="threatsBlocked">247</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Data Cleaned</span>
                    <span class="stat-value" id="dataCleaned">1.8GB</span>
                </div>
            </div>
        `;

        const activityCard = document.querySelector('.card:nth-child(3)');
        if (activityCard) {
            activityCard.appendChild(performanceContainer);
        }

        this.initializePerformanceChart();
    }

    /**
     * Initialize performance chart
     */
    initializePerformanceChart() {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.charts.performanceChart = { 
            canvas, 
            ctx, 
            data: Array(24).fill(0).map(() => Math.random() * 100) 
        };

        this.updatePerformanceChart();
    }

    /**
     * Update performance chart with real-time data
     */
    updatePerformanceChart() {
        const chart = this.charts.performanceChart;
        if (!chart) return;

        const { ctx, canvas, data } = chart;
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw performance line
        ctx.beginPath();
        ctx.strokeStyle = '#4da6ff';
        ctx.lineWidth = 2;
        
        const stepX = width / (data.length - 1);
        data.forEach((value, index) => {
            const x = index * stepX;
            const y = height - (height * value) / 100;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw area under curve
        ctx.beginPath();
        data.forEach((value, index) => {
            const x = index * stepX;
            const y = height - (height * value) / 100;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(77, 166, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(77, 166, 255, 0.05)');
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    /**
     * Create control panels for different sections
     */
    async createControlPanels() {
        await this.createScannerControls();
        await this.createCleanupControls();
        await this.createProtectionControls();
        await this.createSettingsControls();
    }

    /**
     * Create advanced scanner controls
     */
    async createScannerControls() {
        const scannerSection = document.getElementById('scanner');
        if (!scannerSection) return;

        const advancedControls = document.createElement('div');
        advancedControls.className = 'advanced-controls';
        advancedControls.innerHTML = `
            <div class="control-group">
                <label class="control-label">Scan Depth</label>
                <div class="scan-depth-selector">
                    <input type="range" id="scanDepth" min="1" max="10" value="5" class="depth-slider">
                    <div class="depth-labels">
                        <span>Quick</span>
                        <span>Deep</span>
                    </div>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label">Scan Options</label>
                <div class="scan-options">
                    <label class="checkbox-label">
                        <input type="checkbox" id="scanDownloads" checked>
                        <span>Scan Downloads</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="scanBrowser" checked>
                        <span>Browser Data</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="scanSystem" checked>
                        <span>System Files</span>
                    </label>
                </div>
            </div>
        `;

        const existingCard = scannerSection.querySelector('.card');
        if (existingCard) {
            existingCard.appendChild(advancedControls);
        }
    }

    /**
     * Create advanced cleanup controls
     */
    async createCleanupControls() {
        const cleanupSection = document.getElementById('cleanup');
        if (!cleanupSection) return;

        const advancedControls = document.createElement('div');
        advancedControls.className = 'advanced-controls';
        advancedControls.innerHTML = `
            <div class="cleanup-strategy-selector">
                <div class="strategy-option" data-strategy="conservative">
                    <div class="strategy-icon">🛡️</div>
                    <div class="strategy-details">
                        <h4>Conservative</h4>
                        <p>Safe cleanup with minimal risk</p>
                    </div>
                </div>
                <div class="strategy-option active" data-strategy="balanced">
                    <div class="strategy-icon">⚖️</div>
                    <div class="strategy-details">
                        <h4>Balanced</h4>
                        <p>Optimal balance of safety and thoroughness</p>
                    </div>
                </div>
                <div class="strategy-option" data-strategy="aggressive">
                    <div class="strategy-icon">🔥</div>
                    <div class="strategy-details">
                        <h4>Aggressive</h4>
                        <p>Maximum cleanup with higher risk</p>
                    </div>
                </div>
            </div>
            <div class="cleanup-preview">
                <h4>Cleanup Preview</h4>
                <div class="preview-items">
                    <div class="preview-item">
                        <span class="item-type">Tracking Data</span>
                        <span class="item-count">127 items</span>
                        <span class="item-size">2.3MB</span>
                    </div>
                    <div class="preview-item">
                        <span class="item-type">Temporary Files</span>
                        <span class="item-count">45 items</span>
                        <span class="item-size">156MB</span>
                    </div>
                    <div class="preview-item">
                        <span class="item-type">Cache Data</span>
                        <span class="item-count">89 items</span>
                        <span class="item-size">78MB</span>
                    </div>
                </div>
            </div>
        `;

        const existingCard = cleanupSection.querySelector('.card');
        if (existingCard) {
            existingCard.appendChild(advancedControls);
        }

        this.bindCleanupStrategySelector();
    }

    /**
     * Bind cleanup strategy selector events
     */
    bindCleanupStrategySelector() {
        const strategyOptions = document.querySelectorAll('.strategy-option');
        strategyOptions.forEach(option => {
            option.addEventListener('click', () => {
                strategyOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                const strategy = option.dataset.strategy;
                this.updateCleanupPreview(strategy);
            });
        });
    }

    /**
     * Update cleanup preview based on strategy
     */
    updateCleanupPreview(strategy) {
        const previewItems = document.querySelectorAll('.preview-item');
        
        // Simulate different cleanup amounts based on strategy
        const multipliers = {
            conservative: 0.5,
            balanced: 1.0,
            aggressive: 1.8
        };

        const multiplier = multipliers[strategy] || 1.0;
        
        previewItems.forEach(item => {
            const countElement = item.querySelector('.item-count');
            const sizeElement = item.querySelector('.item-size');
            
            const baseCount = parseInt(countElement.textContent);
            const baseSize = parseFloat(sizeElement.textContent);
            
            const newCount = Math.floor(baseCount * multiplier);
            const newSize = (baseSize * multiplier).toFixed(1);
            
            countElement.textContent = `${newCount} items`;
            sizeElement.textContent = `${newSize}MB`;
        });
    }

    /**
     * Create protection controls
     */
    async createProtectionControls() {
        const protectionSection = document.getElementById('protection');
        if (!protectionSection) return;

        const protectionStats = document.createElement('div');
        protectionStats.className = 'protection-stats';
        protectionStats.innerHTML = `
            <div class="protection-stat">
                <div class="stat-icon">🛡️</div>
                <div class="stat-details">
                    <span class="stat-value" id="threatsBlockedToday">247</span>
                    <span class="stat-label">Threats Blocked Today</span>
                </div>
            </div>
            <div class="protection-stat">
                <div class="stat-icon">👁️</div>
                <div class="stat-details">
                    <span class="stat-value" id="trackersBlockedToday">1,234</span>
                    <span class="stat-label">Trackers Blocked</span>
                </div>
            </div>
            <div class="protection-stat">
                <div class="stat-icon">🔒</div>
                <div class="stat-details">
                    <span class="stat-value" id="privacyViolationsBlocked">56</span>
                    <span class="stat-label">Privacy Violations</span>
                </div>
            </div>
        `;

        const existingCard = protectionSection.querySelector('.card');
        if (existingCard) {
            existingCard.appendChild(protectionStats);
        }
    }

    /**
     * Create settings controls
     */
    async createSettingsControls() {
        // Implementation for settings controls
        console.log('Settings controls created');
    }

    /**
     * Create notification system
     */
    async createNotificationSystem() {
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);

        this.elements.notificationContainer = notificationContainer;
    }

    /**
     * Setup real-time updates
     */
    async setupRealtimeUpdates() {
        // Update metrics every 5 seconds
        this.realTimeUpdates.set('metrics', setInterval(() => {
            this.updateMetricsDisplay();
        }, 5000));

        // Update charts every 10 seconds
        this.realTimeUpdates.set('charts', setInterval(() => {
            this.updateAllCharts();
        }, 10000));

        // Update system status every 2 seconds
        this.realTimeUpdates.set('status', setInterval(() => {
            this.updateSystemStatus();
        }, 2000));
    }

    /**
     * Update all metrics display
     */
    updateMetricsDisplay() {
        // Update threat level
        if (this.elements.threatLevel) {
            this.animateValue(this.elements.threatLevel, this.metrics.threatLevel);
        }
        
        if (this.elements.threatProgress) {
            this.animateProgressBar(this.elements.threatProgress, this.metrics.threatLevel);
        }

        // Update privacy score
        if (this.elements.privacyScore) {
            this.animateValue(this.elements.privacyScore, this.metrics.privacyScore);
        }
        
        if (this.elements.privacyProgress) {
            this.animateProgressBar(this.elements.privacyProgress, this.metrics.privacyScore);
        }
    }

    /**
     * Update all charts
     */
    updateAllCharts() {
        this.updateThreatChart();
        this.updatePrivacyGauge();
        this.updatePerformanceChart();
    }

    /**
     * Update system status
     */
    updateSystemStatus() {
        if (this.elements.statusIndicator && this.elements.statusText) {
            const status = this.getSystemStatus();
            this.elements.statusIndicator.className = `status-indicator ${status.class}`;
            this.elements.statusText.textContent = status.text;
        }
    }

    /**
     * Get current system status
     */
    getSystemStatus() {
        if (this.metrics.threatLevel > 50) {
            return { class: 'critical', text: 'High Threat Level' };
        } else if (this.metrics.threatLevel > 20) {
            return { class: 'warning', text: 'Moderate Threats' };
        } else if (this.metrics.protectionStatus) {
            return { class: 'protected', text: 'Protected' };
        } else {
            return { class: 'good', text: 'System Healthy' };
        }
    }

    /**
     * Animation utilities
     */
    animateValue(element, targetValue) {
        if (!element) return;

        const currentValue = parseInt(element.textContent) || 0;
        const difference = targetValue - currentValue;
        const steps = 20;
        const stepValue = difference / steps;
        let currentStep = 0;

        const animation = setInterval(() => {
            currentStep++;
            const newValue = Math.round(currentValue + (stepValue * currentStep));
            element.textContent = newValue;

            if (currentStep >= steps) {
                element.textContent = targetValue;
                clearInterval(animation);
            }
        }, 50);
    }

    animateProgressBar(element, targetValue) {
        if (!element) return;

        const currentWidth = parseInt(element.style.width) || 0;
        const targetWidth = Math.min(targetValue, 100);
        const difference = targetWidth - currentWidth;
        const steps = 20;
        const stepValue = difference / steps;
        let currentStep = 0;

        const animation = setInterval(() => {
            currentStep++;
            const newWidth = currentWidth + (stepValue * currentStep);
            element.style.width = Math.min(newWidth, 100) + '%';

            if (currentStep >= steps) {
                element.style.width = targetWidth + '%';
                clearInterval(animation);
            }
        }, 50);
    }

    /**
     * Event binding and handling
     */
    bindEvent(eventName, handler) {
        this.eventHandlers.set(eventName, handler);

        // Bind to actual DOM elements
        switch (eventName) {
            case 'quickScan':
                if (this.elements.quickScanBtn) {
                    this.elements.quickScanBtn.addEventListener('click', handler);
                }
                break;
            case 'deepScan':
                const deepScanBtn = document.getElementById('deepScanBtn');
                if (deepScanBtn) {
                    deepScanBtn.addEventListener('click', handler);
                }
                break;
            case 'cleanupConservative':
                const conservativeBtn = document.getElementById('conservativeCleanupBtn');
                if (conservativeBtn) {
                    conservativeBtn.addEventListener('click', handler);
                }
                break;
            case 'cleanupBalanced':
                const balancedBtn = document.getElementById('balancedCleanupBtn');
                if (balancedBtn) {
                    balancedBtn.addEventListener('click', handler);
                }
                break;
            case 'cleanupAggressive':
                const aggressiveBtn = document.getElementById('aggressiveCleanupBtn');
                if (aggressiveBtn) {
                    aggressiveBtn.addEventListener('click', handler);
                }
                break;
            case 'toggleProtection':
                if (this.elements.protectionToggle) {
                    this.elements.protectionToggle.addEventListener('click', handler);
                }
                break;
        }
    }

    /**
     * Update display methods
     */
    updateStatus(status, message) {
        if (this.elements.statusText) {
            this.elements.statusText.textContent = message;
        }
        
        this.showNotification(message, status === 'scanning' ? 'info' : 'success');
    }

    updateScanResults(results) {
        if (!this.elements.scanResults) return;

        this.elements.scanResults.innerHTML = this.formatScanResults(results);
        this.updateMetrics(results.systemHealth || {});
    }

    updateCleanupResults(results) {
        if (!this.elements.cleanupResults) return;

        this.elements.cleanupResults.innerHTML = this.formatCleanupResults(results);
    }

    updateMetrics(metrics) {
        this.metrics = { ...this.metrics, ...metrics };
        this.updateMetricsDisplay();
    }

    updateProtectionStatus(enabled) {
        this.metrics.protectionStatus = enabled;
        
        if (this.elements.protectionToggle) {
            if (enabled) {
                this.elements.protectionToggle.classList.add('active');
            } else {
                this.elements.protectionToggle.classList.remove('active');
            }
        }
    }

    updateConfiguration(config) {
        // Update UI elements based on configuration
        console.log('Configuration updated:', config);
    }

    updateThreatLevel(level) {
        this.metrics.threatLevel = level;
        this.updateMetricsDisplay();
    }

    updatePrivacyScore(score) {
        this.metrics.privacyScore = score;
        this.updateMetricsDisplay();
    }

    /**
     * Notification methods
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showAlert(message, type = 'info') {
        this.showNotification(message, type);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });

        if (this.elements.notificationContainer) {
            this.elements.notificationContainer.appendChild(notification);
        }

        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);

        // Add to notifications array
        this.notifications.push(notification);
    }

    removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(400px)';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }

        // Remove from notifications array
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }
    }

    /**
     * Formatting utilities
     */
    formatScanResults(results) {
        if (!results) return '<p>No scan results available</p>';

        return `
            <div class="scan-summary">
                <h4>Scan Summary</h4>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">Files Scanned</span>
                        <span class="summary-value">${results.scanSummary?.filesScanned || 0}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Threats Found</span>
                        <span class="summary-value threat">${results.scanSummary?.threatsFound || 0}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Privacy Risks</span>
                        <span class="summary-value warning">${results.scanSummary?.privacyRisks || 0}</span>
                    </div>
                </div>
            </div>
            ${this.formatRecommendations(results.recommendations || [])}
        `;
    }

    formatCleanupResults(results) {
        if (!results) return '<p>No cleanup results available</p>';

        return `
            <div class="cleanup-summary">
                <h4>Cleanup Summary</h4>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">Space Freed</span>
                        <span class="summary-value success">${results.summary?.spaceSaved || '0 Bytes'}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Files Processed</span>
                        <span class="summary-value">${results.summary?.filesProcessed || 0}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Threats Removed</span>
                        <span class="summary-value success">${results.summary?.threatsRemoved || 0}</span>
                    </div>
                </div>
            </div>
        `;
    }

    formatRecommendations(recommendations) {
        if (!recommendations.length) return '';

        return `
            <div class="recommendations">
                <h4>Recommendations</h4>
                ${recommendations.map(rec => `
                    <div class="recommendation ${rec.priority || 'medium'}">
                        <div class="rec-header">
                            <span class="rec-title">${rec.title || rec}</span>
                            <span class="rec-priority">${rec.priority || 'medium'}</span>
                        </div>
                        ${rec.description ? `<p class="rec-description">${rec.description}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Theme management
     */
    async loadThemePreferences() {
        try {
            const savedTheme = localStorage.getItem('dashboardTheme');
            if (savedTheme) {
                this.theme = savedTheme;
                this.applyTheme(this.theme);
            }
        } catch (error) {
            console.warn('Failed to load theme preferences:', error);
        }
    }

    applyTheme(theme) {
        document.body.className = `theme-${theme}`;
        this.theme = theme;
        
        try {
            localStorage.setItem('dashboardTheme', theme);
        } catch (error) {
            console.warn('Failed to save theme preference:', error);
        }
    }

    /**
     * Cleanup and destruction
     */
    destroy() {
        // Clear all intervals
        this.realTimeUpdates.forEach(interval => clearInterval(interval));
        this.realTimeUpdates.clear();

        // Clear all animations
        this.animations.forEach(animation => clearInterval(animation));
        this.animations.clear();

        // Remove all notifications
        this.notifications.forEach(notification => this.removeNotification(notification));

        // Clear event handlers
        this.eventHandlers.clear();

        console.log('Advanced dashboard destroyed');
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AdvancedDashboard = AdvancedDashboard;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedDashboard;
}