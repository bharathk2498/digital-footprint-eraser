    /**
     * Download broker email templates
     */
    downloadBrokerEmails() {
        if (!this.results.brokers || !this.results.brokers.templates) {
            this.showError('No broker email templates available. Please generate removal requests first.');
            return;
        }
        
        try {
            const emailContent = DataBrokerRemover.generateEmailFileContent(this.results.brokers);
            const blob = new Blob([emailContent], { type: 'text/plain; charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `data-broker-removal-emails-${new Date().toISOString().split('T')[0]}.txt`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showSuccess('Email templates downloaded successfully!');
            this.trackEvent('broker_emails_downloaded', { 
                templateCount: Object.keys(this.results.brokers.templates).length 
            });
        } catch (error) {
            console.error('Download failed:', error);
            this.showError('Failed to download email templates. Please try again.');
        }
    }

    /**
     * Validate form inputs with enhanced validation
     */
    validateForm() {
        const personalInfo = this.getPersonalInfo();
        
        // Use the enhanced validation from DataBrokerRemover
        const validation = DataBrokerRemover.validatePersonalInfo(personalInfo);
        
        // Update UI based on validation
        const brokerBtn = document.getElementById('startBrokerRemoval');
        if (brokerBtn) {
            brokerBtn.disabled = !validation.isValid;
            brokerBtn.style.opacity = validation.isValid ? '1' : '0.6';
            
            // Update button text to show requirements
            if (!validation.isValid) {
                brokerBtn.title = 'Required: ' + validation.errors.join(', ');
            } else {
                brokerBtn.title = 'Generate removal requests for data brokers';
            }
        }
        
        // Show validation errors if form was attempted
        if (!validation.isValid && this.formAttempted) {
            this.showValidationErrors(validation.errors);
        }
        
        return validation.isValid;
    }

    /**
     * Show validation errors to user
     */
    showValidationErrors(errors) {
        const errorMessage = 'Please fix the following:\n• ' + errors.join('\n• ');
        this.showError(errorMessage);
    }

    /**
     * Enhanced broker removal with better error handling
     */
    async startBrokerRemoval() {
        if (this.isProcessing) return;
        
        this.formAttempted = true; // Mark that form was attempted
        
        const personalInfo = this.getPersonalInfo();
        const validation = DataBrokerRemover.validatePersonalInfo(personalInfo);
        
        if (!validation.isValid) {
            this.showValidationErrors(validation.errors);
            return;
        }
        
        this.updateStatus('brokerStatus', 'Processing...', 'processing');
        this.showLoading('Generating data broker removal requests...');
        
        try {
            const result = await DataBrokerRemover.generateRemovalRequests(personalInfo);
            
            this.results.brokers = result;
            this.updateStatus('brokerStatus', 'Completed', 'completed');
            this.showResults('brokerResults', this.formatBrokerResults(result));
            
            this.showSuccess(`Successfully generated ${result.totalRequests} removal requests!`);
            
            this.trackEvent('broker_removal_completed', { 
                requestsGenerated: result.totalRequests,
                emailsGenerated: result.emailsGenerated
            });
            
        } catch (error) {
            console.error('Broker removal failed:', error);
            this.updateStatus('brokerStatus', 'Error', 'error');
            this.showError('Data broker removal failed. Please check your information and try again.');
            this.trackEvent('broker_removal_failed', { error: error.message });
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Enhanced broker results formatting
     */
    formatBrokerResults(result) {
        const topBrokers = result.priorityBrokers.slice(0, 8); // Show top 8
        
        return `
            <h4>Data Broker Removal Results</h4>
            <div class="result-stats">
                <div class="stat-item">
                    <span class="stat-value">${result.totalRequests || 0}</span>
                    <span class="stat-label">Removal Requests Generated</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${result.emailsGenerated || 0}</span>
                    <span class="stat-label">Email Templates Created</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${topBrokers.length}</span>
                    <span class="stat-label">Priority Brokers Identified</span>
                </div>
            </div>
            
            <div class="broker-list">
                <h5>High Priority Data Brokers to Contact:</h5>
                <div class="broker-grid">
                    ${topBrokers.map(broker => `
                        <div class="broker-item">
                            <div class="broker-header">
                                <strong>${broker.name}</strong>
                                <span class="broker-category">${broker.category}</span>
                            </div>
                            <div class="broker-info">
                                <p class="broker-description">${broker.description || 'Major data broker with personal information'}</p>
                                <div class="broker-actions">
                                    <a href="${broker.url}" target="_blank" class="btn-platform" title="Visit removal page">
                                        <i class="fas fa-external-link-alt"></i> Remove Data
                                    </a>
                                    <span class="broker-method">${broker.method.replace('_', ' ').toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="broker-actions-panel">
                <button class="btn-primary" onclick="app.downloadBrokerEmails()">
                    <i class="fas fa-download"></i> Download All Email Templates
                </button>
                <button class="btn-secondary" onclick="app.showBrokerInstructions()">
                    <i class="fas fa-question-circle"></i> View Instructions
                </button>
            </div>
            
            <div class="next-steps">
                <h5>Next Steps:</h5>
                <ol>
                    <li><strong>Download Templates:</strong> Get all email templates to send removal requests</li>
                    <li><strong>Visit Removal Pages:</strong> Use the links above to access online opt-out forms</li>
                    <li><strong>Send Emails:</strong> Use templates for brokers requiring email contact</li>
                    <li><strong>Track Progress:</strong> Keep records of submitted requests and responses</li>
                    <li><strong>Follow Up:</strong> Contact non-responsive brokers after 30 days</li>
                </ol>
                <p class="privacy-note">
                    <i class="fas fa-info-circle"></i> 
                    <strong>Privacy Note:</strong> All processing happens locally. Your information never leaves your device.
                </p>
            </div>
        `;
    }

    /**
     * Show general broker removal instructions
     */
    showBrokerInstructions() {
        const instructions = `
            <h4>Data Broker Removal Instructions</h4>
            
            <div class="instruction-section">
                <h5><i class="fas fa-download"></i> Step 1: Download Email Templates</h5>
                <p>Click "Download All Email Templates" to get pre-written emails for each data broker. These templates include all necessary legal language and your personal information.</p>
            </div>
            
            <div class="instruction-section">
                <h5><i class="fas fa-globe"></i> Step 2: Use Online Forms</h5>
                <p>Many brokers provide online opt-out forms. Click the "Remove Data" links to access these forms directly. Online forms are often faster than email.</p>
            </div>
            
            <div class="instruction-section">
                <h5><i class="fas fa-envelope"></i> Step 3: Send Email Requests</h5>
                <p>For brokers requiring email contact:</p>
                <ul>
                    <li>Use the email address shown in templates</li>
                    <li>Send from the email you want removed</li>
                    <li>Keep copies of all sent emails</li>
                    <li>Use the exact subject lines provided</li>
                </ul>
            </div>
            
            <div class="instruction-section">
                <h5><i class="fas fa-clock"></i> Step 4: Timeline & Follow-up</h5>
                <ul>
                    <li><strong>Week 1-2:</strong> Send all removal requests</li>
                    <li><strong>Week 3-4:</strong> Check for acknowledgment emails</li>
                    <li><strong>Week 5-8:</strong> Follow up with non-responsive brokers</li>
                    <li><strong>Week 9-12:</strong> Contact regulatory authorities if needed</li>
                </ul>
            </div>
            
            <div class="instruction-section">
                <h5><i class="fas fa-shield-alt"></i> Important Tips</h5>
                <ul>
                    <li>Some brokers may require phone or address verification</li>
                    <li>Keep screenshots of confirmation pages</li>
                    <li>Check spam folders for broker responses</li>
                    <li>Be persistent - some brokers may require multiple requests</li>
                    <li>Consider using certified mail for unresponsive brokers</li>
                </ul>
            </div>
            
            <div class="legal-note">
                <p><strong>Legal Rights:</strong> Under CCPA, GDPR, and other privacy laws, you have the right to request deletion of your personal information. Brokers are legally required to respond within 30 days.</p>
            </div>
        `;
        
        this.showModal('Data Broker Removal Guide', instructions);
    }