/**
 * Advanced Digital Footprint Eraser - Main Application
 * Unified interface for comprehensive digital privacy and security
 */

class AdvancedDigitalFootprintEraser {
    constructor() {
        this.version = '2.0.0';
        this.initialized = false;
        this.modules = {};
        this.state = {
            scanning: false,
            cleaning: false,
            protecting: false,
            lastScan: null,
            threatLevel: 0,
            privacyScore: 0
        };
        this.config = {
            realTimeProtection: true,
            autoCleanup: false,
            privacyMode: 'balanced',
            securityLevel: 'high',
            alertLevel: 'medium'
        };
        this.dashboard = null;
        this.init();
    }

    /**
     * Initialize the advanced system
     */
    async init() {
        try {
            await this.loadModules();
            await this.initializeInterface();
            await this.startRealTimeProtection();
            this.initialized = true;
            console.log('Advanced Digital Footprint Eraser initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Advanced Digital Footprint Eraser:', error);
        }
    }

    /**
     * Load all advanced modules
     */
    async loadModules() {
        try {
            this.modules.scanner = new AdvancedSystemScanner();
            this.modules.processor = new SecureFileProcessor();
            this.modules.cleanup = new IntelligentCleanupEngine();
            this.modules.dashboard = new AdvancedDashboard();
            this.modules.realTime = new RealTimeProtection();
            
            console.log('All modules loaded successfully');
        } catch (error) {
            throw new Error(`Module loading failed: ${error.message}`);
        }
    }

    /**
     * Initialize the advanced interface
     */
    async initializeInterface() {
        this.dashboard = this.modules.dashboard;
        await this.dashboard.createAdvancedInterface();
        this.bindEventHandlers();
        await this.loadUserPreferences();
        await this.performInitialScan();
    }

    /**
     * Perform comprehensive system scan
     */
    async performComprehensiveScan(options = {}) {
        if (this.state.scanning) {
            return { error: 'Scan already in progress' };
        }

        this.state.scanning = true;
        this.dashboard.updateStatus('scanning', 'Performing comprehensive system scan...');

        try {
            const scanOptions = {
                ...this.config,
                ...options,
                scanDownloads: true,
                deepScan: true,
                realTime: true
            };

            // Phase 1: Advanced System Scanning
            const scanResults = await this.modules.scanner.performComprehensiveScan(scanOptions);
            
            // Phase 2: File Security Processing
            const securityResults = await this.processSecurityThreats(scanResults);
            
            // Phase 3: Update threat levels and privacy scores
            await this.updateSystemMetrics(scanResults, securityResults);
            
            // Phase 4: Generate comprehensive report
            const report = await this.generateAdvancedReport(scanResults, securityResults);
            
            this.state.lastScan = new Date().toISOString();
            this.dashboard.updateScanResults(report);
            
            return report;

        } catch (error) {
            this.dashboard.showError(`Scan failed: ${error.message}`);
            return { error: error.message };
        } finally {
            this.state.scanning = false;
            this.dashboard.updateStatus('idle', 'Scan completed');
        }
    }

    /**
     * Perform intelligent cleanup with AI optimization
     */
    async performIntelligentCleanup(strategy = 'balanced') {
        if (this.state.cleaning) {
            return { error: 'Cleanup already in progress' };
        }

        this.state.cleaning = true;
        this.dashboard.updateStatus('cleaning', 'Performing intelligent cleanup...');

        try {
            const cleanupOptions = {
                strategy: strategy,
                aiOptimization: true,
                preserveImportant: true,
                secureDelete: true,
                ...this.config
            };

            // Perform AI-driven cleanup
            const cleanupResults = await this.modules.cleanup.performIntelligentCleanup(cleanupOptions);
            
            // Update system state
            await this.updateSystemMetrics(null, null, cleanupResults);
            
            // Update dashboard
            this.dashboard.updateCleanupResults(cleanupResults);
            
            // Show success notification
            this.dashboard.showSuccess(`Cleanup completed: ${cleanupResults.summary.spaceSaved} freed, ${cleanupResults.summary.threatsRemoved} threats removed`);
            
            return cleanupResults;

        } catch (error) {
            this.dashboard.showError(`Cleanup failed: ${error.message}`);
            return { error: error.message };
        } finally {
            this.state.cleaning = false;
            this.dashboard.updateStatus('idle', 'Cleanup completed');
        }
    }

    /**
     * Enable advanced protection mode
     */
    async enableAdvancedProtection() {
        if (this.state.protecting) {
            return { message: 'Advanced protection already enabled' };
        }

        this.state.protecting = true;
        this.dashboard.updateStatus('protecting', 'Enabling advanced protection...');

        try {
            // Start real-time protection
            await this.modules.realTime.enableAdvancedProtection({
                blockTrackers: true,
                preventFingerprinting: true,
                secureConnections: true,
                autoCleanup: this.config.autoCleanup,
                alertLevel: this.config.alertLevel
            });

            // Enable browser-level protections
            await this.enableBrowserProtections();
            
            // Start continuous monitoring
            await this.startContinuousMonitoring();
            
            this.dashboard.showSuccess('Advanced protection enabled');
            this.dashboard.updateProtectionStatus(true);
            
            return { success: true, message: 'Advanced protection enabled' };

        } catch (error) {
            this.dashboard.showError(`Failed to enable protection: ${error.message}`);
            this.state.protecting = false;
            return { error: error.message };
        }
    }

    /**
     * Process security threats found during scan
     */
    async processSecurityThreats(scanResults) {
        const threats = [
            ...scanResults.detailedFindings.scripts?.filter(s => s.risk === 'high') || [],
            ...scanResults.detailedFindings.localStorage?.filter(s => s.risk === 'high') || [],
            ...scanResults.detailedFindings.fingerprinting?.filter(f => f.exposed) || []
        ];

        if (threats.length === 0) {
            return { threatsProcessed: 0, threatsRemoved: 0 };
        }

        const processingResults = await this.modules.processor.processFilesSecurely(threats, {
            autoQuarantine: true,
            secureDelete: true,
            generateReport: true
        });

        return {
            threatsProcessed: processingResults.processed,
            threatsRemoved: processingResults.secured,
            quarantined: processingResults.quarantined,
            details: processingResults.securityReport
        };
    }

    /**
     * Update system metrics based on scan and cleanup results
     */
    async updateSystemMetrics(scanResults, securityResults, cleanupResults) {
        if (scanResults) {
            this.state.threatLevel = this.calculateThreatLevel(scanResults);
            this.state.privacyScore = this.calculatePrivacyScore(scanResults);
        }

        if (securityResults) {
            this.state.threatLevel = Math.max(0, this.state.threatLevel - securityResults.threatsRemoved);
        }

        if (cleanupResults) {
            this.state.privacyScore += cleanupResults.summary.privacyIssuesFixed * 5;
            this.state.privacyScore = Math.min(100, this.state.privacyScore);
        }

        this.dashboard.updateMetrics({
            threatLevel: this.state.threatLevel,
            privacyScore: this.state.privacyScore,
            lastScan: this.state.lastScan
        });
    }

    /**
     * Generate advanced comprehensive report
     */
    async generateAdvancedReport(scanResults, securityResults) {
        const report = {
            timestamp: new Date().toISOString(),
            version: this.version,
            systemHealth: {
                threatLevel: this.state.threatLevel,
                privacyScore: this.state.privacyScore,
                overallStatus: this.getOverallStatus()
            },
            scanSummary: {
                filesScanned: scanResults.filesScanned,
                threatsFound: scanResults.suspiciousFilesFound + scanResults.securityThreats,
                privacyRisks: scanResults.privacyRisks,
                trackingItems: scanResults.trackingFilesFound
            },
            securitySummary: securityResults ? {
                threatsProcessed: securityResults.threatsProcessed,
                threatsRemoved: securityResults.threatsRemoved,
                quarantined: securityResults.quarantined
            } : null,
            detailedFindings: scanResults.detailedFindings,
            recommendations: [
                ...scanResults.recommendations,
                ...this.generateAdvancedRecommendations(scanResults)
            ],
            nextActions: this.generateNextActions(scanResults)
        };

        return report;
    }

    /**
     * Start real-time protection monitoring
     */
    async startRealTimeProtection() {
        if (!this.config.realTimeProtection) return;

        try {
            await this.modules.realTime.initialize();
            
            // Monitor for new threats
            this.modules.realTime.onThreatDetected((threat) => {
                this.handleRealTimeThreat(threat);
            });

            // Monitor for privacy violations
            this.modules.realTime.onPrivacyViolation((violation) => {
                this.handlePrivacyViolation(violation);
            });

            console.log('Real-time protection started');
        } catch (error) {
            console.warn('Real-time protection failed to start:', error);
        }
    }

    /**
     * Handle real-time threat detection
     */
    async handleRealTimeThreat(threat) {
        this.state.threatLevel += threat.severity;
        
        if (threat.severity >= 5) {
            this.dashboard.showAlert(`High-severity threat detected: ${threat.description}`, 'error');
            
            if (this.config.autoCleanup) {
                await this.performEmergencyCleanup(threat);
            }
        } else {
            this.dashboard.showAlert(`Threat detected: ${threat.description}`, 'warning');
        }

        this.dashboard.updateThreatLevel(this.state.threatLevel);
    }

    /**
     * Handle privacy violations
     */
    async handlePrivacyViolation(violation) {
        this.state.privacyScore = Math.max(0, this.state.privacyScore - violation.impact);
        
        this.dashboard.showAlert(`Privacy violation: ${violation.description}`, 'warning');
        this.dashboard.updatePrivacyScore(this.state.privacyScore);

        if (this.config.autoCleanup && violation.autoFixable) {
            await this.fixPrivacyViolation(violation);
        }
    }

    /**
     * Bind event handlers for the interface
     */
    bindEventHandlers() {
        // Quick scan button
        this.dashboard.bindEvent('quickScan', async () => {
            await this.performComprehensiveScan({ quick: true });
        });

        // Deep scan button
        this.dashboard.bindEvent('deepScan', async () => {
            await this.performComprehensiveScan({ deep: true });
        });

        // Intelligent cleanup buttons
        this.dashboard.bindEvent('cleanupConservative', async () => {
            await this.performIntelligentCleanup('conservative');
        });

        this.dashboard.bindEvent('cleanupBalanced', async () => {
            await this.performIntelligentCleanup('balanced');
        });

        this.dashboard.bindEvent('cleanupAggressive', async () => {
            await this.performIntelligentCleanup('aggressive');
        });

        // Protection toggle
        this.dashboard.bindEvent('toggleProtection', async () => {
            if (this.state.protecting) {
                await this.disableAdvancedProtection();
            } else {
                await this.enableAdvancedProtection();
            }
        });

        // Settings update
        this.dashboard.bindEvent('updateSettings', (settings) => {
            this.updateConfiguration(settings);
        });
    }

    /**
     * Calculate threat level from scan results
     */
    calculateThreatLevel(scanResults) {
        const weights = {
            suspiciousFiles: 2,
            securityThreats: 5,
            privacyRisks: 3,
            trackingFiles: 1
        };

        return Math.min(100, 
            (scanResults.suspiciousFilesFound * weights.suspiciousFiles) +
            (scanResults.securityThreats * weights.securityThreats) +
            (scanResults.privacyRisks * weights.privacyRisks) +
            (scanResults.trackingFilesFound * weights.trackingFiles)
        );
    }

    /**
     * Calculate privacy score from scan results
     */
    calculatePrivacyScore(scanResults) {
        const baseScore = 100;
        const deductions = {
            trackingFiles: scanResults.trackingFilesFound * 2,
            privacyRisks: scanResults.privacyRisks * 5,
            fingerprinting: scanResults.detailedFindings.fingerprinting?.exposureLevel * 3 || 0
        };

        const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
        return Math.max(0, baseScore - totalDeductions);
    }

    /**
     * Get overall system status
     */
    getOverallStatus() {
        if (this.state.threatLevel >= 50) return 'critical';
        if (this.state.threatLevel >= 25) return 'warning';
        if (this.state.privacyScore <= 50) return 'privacy_concern';
        return 'healthy';
    }

    /**
     * Generate advanced recommendations
     */
    generateAdvancedRecommendations(scanResults) {
        const recommendations = [];

        if (scanResults.trackingFilesFound > 10) {
            recommendations.push({
                type: 'privacy',
                priority: 'high',
                title: 'Enable Advanced Tracking Protection',
                description: 'High number of tracking items detected. Enable advanced protection mode.',
                action: 'enableProtection'
            });
        }

        if (scanResults.securityThreats > 0) {
            recommendations.push({
                type: 'security',
                priority: 'critical',
                title: 'Immediate Security Action Required',
                description: 'Security threats detected. Run aggressive cleanup immediately.',
                action: 'aggressiveCleanup'
            });
        }

        if (scanResults.privacyRisks > 5) {
            recommendations.push({
                type: 'privacy',
                priority: 'medium',
                title: 'Privacy Configuration Review',
                description: 'Multiple privacy risks found. Review browser and system settings.',
                action: 'reviewSettings'
            });
        }

        return recommendations;
    }

    /**
     * Generate next action items
     */
    generateNextActions(scanResults) {
        const actions = [];

        if (scanResults.suspiciousFilesFound > 0) {
            actions.push('Run intelligent cleanup to remove suspicious files');
        }

        if (scanResults.trackingFilesFound > 0) {
            actions.push('Enable real-time tracking protection');
        }

        if (scanResults.privacyRisks > 0) {
            actions.push('Review and adjust privacy settings');
        }

        if (actions.length === 0) {
            actions.push('System is clean - enable real-time protection for ongoing security');
        }

        return actions;
    }

    /**
     * Update configuration
     */
    updateConfiguration(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.saveUserPreferences();
        this.dashboard.showSuccess('Configuration updated successfully');
    }

    /**
     * Save user preferences
     */
    saveUserPreferences() {
        try {
            localStorage.setItem('advancedEraserConfig', JSON.stringify({
                config: this.config,
                lastUpdate: new Date().toISOString()
            }));
        } catch (error) {
            console.warn('Failed to save preferences:', error);
        }
    }

    /**
     * Load user preferences
     */
    async loadUserPreferences() {
        try {
            const saved = localStorage.getItem('advancedEraserConfig');
            if (saved) {
                const data = JSON.parse(saved);
                this.config = { ...this.config, ...data.config };
                this.dashboard.updateConfiguration(this.config);
            }
        } catch (error) {
            console.warn('Failed to load preferences:', error);
        }
    }

    /**
     * Perform initial system scan on startup
     */
    async performInitialScan() {
        setTimeout(async () => {
            if (this.config.autoCleanup) {
                await this.performComprehensiveScan({ quick: true, background: true });
            }
        }, 2000);
    }

    /**
     * Get system status for external APIs
     */
    getSystemStatus() {
        return {
            version: this.version,
            initialized: this.initialized,
            state: { ...this.state },
            config: { ...this.config },
            lastScan: this.state.lastScan,
            threatLevel: this.state.threatLevel,
            privacyScore: this.state.privacyScore
        };
    }

    /**
     * Manual trigger for emergency cleanup
     */
    async emergencyCleanup() {
        this.dashboard.showAlert('Initiating emergency cleanup...', 'info');
        
        const results = await this.performIntelligentCleanup('aggressive');
        
        if (results.error) {
            this.dashboard.showError('Emergency cleanup failed');
        } else {
            this.dashboard.showSuccess('Emergency cleanup completed successfully');
        }
        
        return results;
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.AdvancedDigitalFootprintEraser = AdvancedDigitalFootprintEraser;
    
    // Auto-initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.digitalFootprintEraser = new AdvancedDigitalFootprintEraser();
        });
    } else {
        window.digitalFootprintEraser = new AdvancedDigitalFootprintEraser();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedDigitalFootprintEraser;
}