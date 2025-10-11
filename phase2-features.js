// Phase 2 Features - Command Palette, Comparison Table, Video Demos
// Digital Footprint Eraser - Conversion Optimization

const Phase2Features = (() => {
    let commandPaletteOpen = false;
    let comparisonTableVisible = false;

    // Command Palette System
    const commands = [
        { name: 'Privacy Tools', icon: '🛡️', action: () => scrollToTools(), keywords: ['tools', 'privacy', 'free'] },
        { name: 'Dark Web Monitor', icon: '🕵️', action: () => window.location.href = 'dark-web-monitoring.html', keywords: ['dark', 'web', 'monitor', 'scan'] },
        { name: 'Social Media Audit', icon: '📱', action: () => window.location.href = 'social-media-auditor.html', keywords: ['social', 'media', 'audit', 'facebook', 'twitter'] },
        { name: 'Deepfake Detection', icon: '🎭', action: () => window.location.href = 'deepfake-detection.html', keywords: ['deepfake', 'detection', 'ai', 'verify'] },
        { name: 'AI Scanner', icon: '⚡', action: () => window.location.href = 'advanced-security-enhanced.html', keywords: ['ai', 'scanner', 'advanced', 'enterprise'] },
        { name: 'Clear Cookies', icon: '🍪', action: () => clearAllCookies(), keywords: ['cookie', 'clear', 'clean', 'delete'] },
        { name: 'Clear Storage', icon: '💾', action: () => clearBrowserStorage(), keywords: ['storage', 'clear', 'clean'] },
        { name: 'Privacy Scan', icon: '🔍', action: () => runPrivacyScan(), keywords: ['scan', 'privacy', 'health', 'check'] },
        { name: 'Upgrade to Pro', icon: '⭐', action: () => showUpgradeModal(), keywords: ['upgrade', 'pro', 'premium', 'paid'] },
        { name: 'Toggle Theme', icon: '🌓', action: () => toggleTheme(), keywords: ['theme', 'dark', 'light', 'mode'] },
        { name: 'Compare Plans', icon: '📊', action: () => showComparisonTable(), keywords: ['compare', 'plans', 'pricing', 'features'] },
        { name: 'View Demos', icon: '🎬', action: () => showVideoDemos(), keywords: ['demo', 'video', 'tutorial', 'how'] }
    ];

    function initCommandPalette() {
        // Create command palette HTML
        const paletteHTML = `
            <div id="commandPalette" class="command-palette" style="display: none;">
                <div class="command-palette-backdrop" onclick="Phase2Features.closeCommandPalette()"></div>
                <div class="command-palette-container">
                    <div class="command-palette-header">
                        <input 
                            type="text" 
                            id="commandSearch" 
                            class="command-search" 
                            placeholder="Type a command or search..."
                            autocomplete="off"
                        />
                        <span class="command-palette-hint">Press ESC to close</span>
                    </div>
                    <div class="command-palette-results" id="commandResults"></div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', paletteHTML);

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Cmd+K or Ctrl+K to open
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                Phase2Features.openCommandPalette();
            }
            // ESC to close
            if (e.key === 'Escape' && commandPaletteOpen) {
                Phase2Features.closeCommandPalette();
            }
        });

        // Search functionality
        const searchInput = document.getElementById('commandSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                filterCommands(e.target.value);
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const firstResult = document.querySelector('.command-item');
                    if (firstResult) {
                        firstResult.click();
                    }
                }
            });
        }

        // Initial render
        filterCommands('');
    }

    function filterCommands(query) {
        const resultsContainer = document.getElementById('commandResults');
        if (!resultsContainer) return;

        const lowerQuery = query.toLowerCase();
        const filtered = commands.filter(cmd => {
            return cmd.name.toLowerCase().includes(lowerQuery) ||
                   cmd.keywords.some(k => k.includes(lowerQuery));
        });

        if (filtered.length === 0) {
            resultsContainer.innerHTML = '<div class="command-empty">No commands found</div>';
            return;
        }

        resultsContainer.innerHTML = filtered.map(cmd => `
            <div class="command-item" onclick="Phase2Features.executeCommand('${cmd.name}')">
                <span class="command-icon">${cmd.icon}</span>
                <span class="command-name">${cmd.name}</span>
                <span class="command-arrow">→</span>
            </div>
        `).join('');
    }

    function openCommandPalette() {
        const palette = document.getElementById('commandPalette');
        if (palette) {
            palette.style.display = 'flex';
            commandPaletteOpen = true;
            setTimeout(() => {
                document.getElementById('commandSearch')?.focus();
            }, 100);
        }
    }

    function closeCommandPalette() {
        const palette = document.getElementById('commandPalette');
        if (palette) {
            palette.style.display = 'none';
            commandPaletteOpen = false;
            document.getElementById('commandSearch').value = '';
            filterCommands('');
        }
    }

    function executeCommand(commandName) {
        const command = commands.find(cmd => cmd.name === commandName);
        if (command) {
            closeCommandPalette();
            command.action();
        }
    }

    // Feature Comparison Table
    function showComparisonTable() {
        if (comparisonTableVisible) return;
        comparisonTableVisible = true;

        const tableHTML = `
            <div id="comparisonModal" class="comparison-modal">
                <div class="comparison-backdrop" onclick="Phase2Features.closeComparisonTable()"></div>
                <div class="comparison-container">
                    <button class="modal-close" onclick="Phase2Features.closeComparisonTable()">×</button>
                    <h2 class="comparison-title">Choose Your Protection Level</h2>
                    <p class="comparison-subtitle">Compare features across all plans</p>
                    
                    <div class="comparison-table">
                        <div class="comparison-header">
                            <div class="comparison-cell feature-name">Feature</div>
                            <div class="comparison-cell plan-column">
                                <div class="plan-badge free">Free</div>
                                <div class="plan-price">$0<span>/mo</span></div>
                            </div>
                            <div class="comparison-cell plan-column highlighted">
                                <div class="plan-badge popular">Popular</div>
                                <div class="plan-name">Pro</div>
                                <div class="plan-price">$29<span>/mo</span></div>
                            </div>
                            <div class="comparison-cell plan-column">
                                <div class="plan-badge enterprise">Enterprise</div>
                                <div class="plan-price">$99<span>/mo</span></div>
                            </div>
                        </div>

                        <div class="comparison-row">
                            <div class="comparison-cell feature-name">Cookie Cleaning</div>
                            <div class="comparison-cell">✓</div>
                            <div class="comparison-cell highlighted">✓</div>
                            <div class="comparison-cell">✓</div>
                        </div>

                        <div class="comparison-row">
                            <div class="comparison-cell feature-name">Storage Management</div>
                            <div class="comparison-cell">✓</div>
                            <div class="comparison-cell highlighted">✓</div>
                            <div class="comparison-cell">✓</div>
                        </div>

                        <div class="comparison-row">
                            <div class="comparison-cell feature-name">Password Analyzer</div>
                            <div class="comparison-cell">✓</div>
                            <div class="comparison-cell highlighted">✓</div>
                            <div class="comparison-cell">✓</div>
                        </div>

                        <div class="comparison-row">
                            <div class="comparison-cell feature-name">AI-Powered Scanning</div>
                            <div class="comparison-cell">✗</div>
                            <div class="comparison-cell highlighted">✓</div>
                            <div class="comparison-cell">✓</div>
                        </div>

                        <div class="comparison-row">
                            <div class="comparison-cell feature-name">Dark Web Monitoring</div>
                            <div class="comparison-cell">✗</div>
                            <div class="comparison-cell highlighted">✓</div>
                            <div class="comparison-cell">✓</div>
                        </div>

                        <div class="comparison-row">
                            <div class="comparison-cell feature-name">Social Media Audit</div>
                            <div class="comparison-cell">✗</div>
                            <div class="comparison-cell highlighted">✓</div>
                            <div class="comparison-cell">✓</div>
                        </div>

                        <div class="comparison-row">
                            <div class="comparison-cell feature-name">Deepfake Detection</div>
                            <div class="comparison-cell">✗</div>
                            <div class="comparison-cell highlighted">✓</div>
                            <div class="comparison-cell">✓</div>
                        </div>

                        <div class="comparison-row">
                            <div class="comparison-cell feature-name">Family Protection</div>
                            <div class="comparison-cell">✗</div>
                            <div class="comparison-cell highlighted">5 members</div>
                            <div class="comparison-cell">Unlimited</div>
                        </div>

                        <div class="comparison-row">
                            <div class="comparison-cell feature-name">Real-time Monitoring</div>
                            <div class="comparison-cell">✗</div>
                            <div class="comparison-cell highlighted">✓</div>
                            <div class="comparison-cell">✓</div>
                        </div>

                        <div class="comparison-row">
                            <div class="comparison-cell feature-name">Priority Support</div>
                            <div class="comparison-cell">✗</div>
                            <div class="comparison-cell highlighted">Email</div>
                            <div class="comparison-cell">24/7 Phone</div>
                        </div>

                        <div class="comparison-row">
                            <div class="comparison-cell feature-name">Custom Integrations</div>
                            <div class="comparison-cell">✗</div>
                            <div class="comparison-cell highlighted">✗</div>
                            <div class="comparison-cell">✓</div>
                        </div>

                        <div class="comparison-footer">
                            <div class="comparison-cell"></div>
                            <div class="comparison-cell">
                                <button class="comparison-btn btn-current" disabled>Current Plan</button>
                            </div>
                            <div class="comparison-cell highlighted">
                                <button class="comparison-btn btn-upgrade" onclick="Phase2Features.closeComparisonTable(); showUpgradeModal();">Upgrade to Pro</button>
                            </div>
                            <div class="comparison-cell">
                                <button class="comparison-btn btn-upgrade" onclick="Phase2Features.closeComparisonTable(); showUpgradeModal();">Upgrade to Enterprise</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', tableHTML);
    }

    function closeComparisonTable() {
        const modal = document.getElementById('comparisonModal');
        if (modal) {
            modal.remove();
            comparisonTableVisible = false;
        }
    }

    // Video Demos System
    function showVideoDemos() {
        const demoHTML = `
            <div id="videoDemoModal" class="video-demo-modal">
                <div class="demo-backdrop" onclick="Phase2Features.closeVideoDemos()"></div>
                <div class="demo-container">
                    <button class="modal-close" onclick="Phase2Features.closeVideoDemos()">×</button>
                    <h2 class="demo-title">Feature Demonstrations</h2>
                    <p class="demo-subtitle">See how our tools protect your privacy</p>
                    
                    <div class="demo-grid">
                        <div class="demo-card">
                            <div class="demo-thumbnail">
                                <div class="demo-play-icon">▶</div>
                                <div class="demo-duration">0:45</div>
                            </div>
                            <h3 class="demo-card-title">🍪 Cookie Cleaning</h3>
                            <p class="demo-card-desc">Watch how we eliminate tracking cookies in seconds</p>
                        </div>

                        <div class="demo-card">
                            <div class="demo-thumbnail">
                                <div class="demo-play-icon">▶</div>
                                <div class="demo-duration">1:20</div>
                            </div>
                            <h3 class="demo-card-title">🕵️ Dark Web Monitoring</h3>
                            <p class="demo-card-desc">Real-time scanning across 500+ threat sources</p>
                        </div>

                        <div class="demo-card">
                            <div class="demo-thumbnail">
                                <div class="demo-play-icon">▶</div>
                                <div class="demo-duration">1:05</div>
                            </div>
                            <h3 class="demo-card-title">📱 Social Media Audit</h3>
                            <p class="demo-card-desc">Comprehensive privacy analysis in one click</p>
                        </div>

                        <div class="demo-card">
                            <div class="demo-thumbnail">
                                <div class="demo-play-icon">▶</div>
                                <div class="demo-duration">0:55</div>
                            </div>
                            <h3 class="demo-card-title">🎭 Deepfake Detection</h3>
                            <p class="demo-card-desc">AI-powered media verification with 99% accuracy</p>
                        </div>

                        <div class="demo-card">
                            <div class="demo-thumbnail">
                                <div class="demo-play-icon">▶</div>
                                <div class="demo-duration">1:30</div>
                            </div>
                            <h3 class="demo-card-title">⚡ AI Attack Scanner</h3>
                            <p class="demo-card-desc">Enterprise threat intelligence and vulnerability assessment</p>
                        </div>

                        <div class="demo-card">
                            <div class="demo-thumbnail">
                                <div class="demo-play-icon">▶</div>
                                <div class="demo-duration">1:10</div>
                            </div>
                            <h3 class="demo-card-title">👨‍👩‍👧‍👦 Family Protection</h3>
                            <p class="demo-card-desc">Complete family safety setup walkthrough</p>
                        </div>
                    </div>

                    <div class="demo-cta">
                        <p>Ready to protect your digital identity?</p>
                        <button class="btn btn-primary" onclick="Phase2Features.closeVideoDemos(); scrollToTools();">Try Free Tools Now</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', demoHTML);
    }

    function closeVideoDemos() {
        const modal = document.getElementById('videoDemoModal');
        if (modal) {
            modal.remove();
        }
    }

    // Enhanced CTA System
    function addEnhancedCTAs() {
        // Add floating CTA hint
        const ctaHintHTML = `
            <div class="cta-hint" id="ctaHint">
                <span class="cta-hint-text">💡 Press <kbd>Cmd+K</kbd> for quick access</span>
                <button class="cta-hint-close" onclick="document.getElementById('ctaHint').style.display='none'">×</button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', ctaHintHTML);

        // Show hint after 5 seconds
        setTimeout(() => {
            const hint = document.getElementById('ctaHint');
            if (hint) {
                hint.classList.add('show');
            }
        }, 5000);

        // Hide hint after 10 seconds
        setTimeout(() => {
            const hint = document.getElementById('ctaHint');
            if (hint) {
                hint.classList.remove('show');
            }
        }, 15000);
    }

    // Initialize all Phase 2 features
    function init() {
        console.log('Phase 2 Features Initializing...');
        initCommandPalette();
        addEnhancedCTAs();
        console.log('Phase 2 Features Ready');
        console.log('Press Cmd+K or Ctrl+K to open command palette');
    }

    // Public API
    return {
        init,
        openCommandPalette,
        closeCommandPalette,
        executeCommand,
        showComparisonTable,
        closeComparisonTable,
        showVideoDemos,
        closeVideoDemos
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Phase2Features.init);
} else {
    Phase2Features.init();
}