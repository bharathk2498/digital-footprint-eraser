// Phase 2 Enhancements - Command Palette, Comparison Tables, Video Demos
// Digital Footprint Eraser - Conversion Optimization Features

(function() {
    'use strict';

    // Command Palette Implementation
    class CommandPalette {
        constructor() {
            this.isOpen = false;
            this.commands = [
                { name: 'Clear Cookies', icon: '🍪', action: () => window.clearAllCookies(), category: 'Tools' },
                { name: 'Clear Browser Storage', icon: '💾', action: () => window.clearBrowserStorage(), category: 'Tools' },
                { name: 'Run Privacy Scan', icon: '🔍', action: () => window.runPrivacyScan(), category: 'Tools' },
                { name: 'Password Analysis', icon: '🔒', action: () => window.runPasswordAnalysis(), category: 'Tools' },
                { name: 'Dark Web Monitor', icon: '🕵️', action: () => window.location.href = 'dark-web-monitoring.html', category: 'Features' },
                { name: 'Social Media Audit', icon: '📱', action: () => window.location.href = 'social-media-auditor.html', category: 'Features' },
                { name: 'Deepfake Detection', icon: '🎭', action: () => window.location.href = 'deepfake-detection.html', category: 'Features' },
                { name: 'AI Scanner', icon: '⚡', action: () => window.location.href = 'advanced-security-enhanced.html', category: 'Features' },
                { name: 'Toggle Dark Mode', icon: '🌙', action: () => window.toggleTheme(), category: 'Settings' },
                { name: 'Upgrade Account', icon: '⬆️', action: () => window.showUpgradeModal(), category: 'Account' },
                { name: 'View Pricing', icon: '💰', action: () => this.showComparisonTable(), category: 'Info' },
            ];
            this.init();
        }

        init() {
            this.createPalette();
            this.setupKeyboardShortcuts();
        }

        createPalette() {
            const palette = document.createElement('div');
            palette.id = 'commandPalette';
            palette.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                z-index: 10001;
                display: none;
                justify-content: center;
                align-items: flex-start;
                padding-top: 10vh;
            `;

            palette.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #0A0A0F, #1a1a2e);
                    border: 2px solid rgba(139, 92, 246, 0.4);
                    border-radius: 16px;
                    width: 90%;
                    max-width: 600px;
                    box-shadow: 0 20px 60px rgba(139, 92, 246, 0.4);
                ">
                    <div style="padding: 1.5rem; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
                        <input 
                            type="text" 
                            id="commandSearch" 
                            placeholder="Type a command or search..." 
                            style="
                                width: 100%;
                                padding: 1rem;
                                background: rgba(76, 29, 149, 0.1);
                                border: 2px solid rgba(139, 92, 246, 0.3);
                                border-radius: 8px;
                                color: #F8FAFC;
                                font-size: 1rem;
                                outline: none;
                            "
                        >
                    </div>
                    <div id="commandList" style="
                        max-height: 400px;
                        overflow-y: auto;
                        padding: 0.5rem;
                    "></div>
                    <div style="
                        padding: 1rem;
                        border-top: 1px solid rgba(139, 92, 246, 0.2);
                        color: #64748B;
                        font-size: 0.85rem;
                        text-align: center;
                    ">
                        Press <kbd style="padding: 0.2rem 0.5rem; background: rgba(139, 92, 246, 0.2); border-radius: 4px;">ESC</kbd> to close
                    </div>
                </div>
            `;

            document.body.appendChild(palette);

            // Event listeners
            const search = document.getElementById('commandSearch');
            search.addEventListener('input', (e) => this.filterCommands(e.target.value));
            palette.addEventListener('click', (e) => {
                if (e.target === palette) this.close();
            });

            this.renderCommands();
        }

        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    this.toggle();
                }
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        }

        renderCommands(filter = '') {
            const list = document.getElementById('commandList');
            const filtered = this.commands.filter(cmd => 
                cmd.name.toLowerCase().includes(filter.toLowerCase())
            );

            list.innerHTML = filtered.map(cmd => `
                <div class="command-item" data-action="${cmd.name}" style="
                    padding: 1rem;
                    margin: 0.25rem 0;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    color: #F8FAFC;
                ">
                    <span style="font-size: 1.5rem;">${cmd.icon}</span>
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">${cmd.name}</div>
                        <div style="font-size: 0.75rem; color: #94A3B8;">${cmd.category}</div>
                    </div>
                </div>
            `).join('');

            // Add hover and click events
            document.querySelectorAll('.command-item').forEach(item => {
                item.addEventListener('mouseenter', function() {
                    this.style.background = 'rgba(139, 92, 246, 0.2)';
                });
                item.addEventListener('mouseleave', function() {
                    this.style.background = 'transparent';
                });
                item.addEventListener('click', () => {
                    const cmdName = item.dataset.action;
                    const command = this.commands.find(c => c.name === cmdName);
                    if (command) {
                        command.action();
                        this.close();
                    }
                });
            });
        }

        filterCommands(query) {
            this.renderCommands(query);
        }

        toggle() {
            this.isOpen ? this.close() : this.open();
        }

        open() {
            const palette = document.getElementById('commandPalette');
            palette.style.display = 'flex';
            this.isOpen = true;
            setTimeout(() => {
                document.getElementById('commandSearch').focus();
            }, 100);
        }

        close() {
            const palette = document.getElementById('commandPalette');
            palette.style.display = 'none';
            this.isOpen = false;
            document.getElementById('commandSearch').value = '';
            this.renderCommands();
        }

        showComparisonTable() {
            if (window.showUpgradeModal) {
                window.showUpgradeModal();
            }
        }
    }

    // Feature Comparison Table
    function createComparisonTable() {
        const section = document.createElement('section');
        section.id = 'comparisonTable';
        section.style.cssText = `
            padding: 4rem 2rem;
            max-width: 1400px;
            margin: 0 auto;
        `;

        section.innerHTML = `
            <h2 style="
                font-size: 2.5rem;
                font-weight: 700;
                text-align: center;
                margin-bottom: 3rem;
                background: linear-gradient(45deg, var(--text-primary), var(--accent-violet));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            ">Choose Your Protection Level</h2>
            
            <div style="
                background: linear-gradient(135deg, rgba(76, 29, 149, 0.1), rgba(139, 92, 246, 0.05));
                border: 2px solid rgba(139, 92, 246, 0.3);
                border-radius: 16px;
                padding: 2rem;
                overflow-x: auto;
            ">
                <table style="
                    width: 100%;
                    border-collapse: collapse;
                    color: var(--text-primary);
                ">
                    <thead>
                        <tr style="border-bottom: 2px solid rgba(139, 92, 246, 0.3);">
                            <th style="text-align: left; padding: 1rem; font-size: 1.1rem;">Features</th>
                            <th style="text-align: center; padding: 1rem;">
                                <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">Free</div>
                                <div style="font-size: 1.5rem; font-weight: bold; color: var(--success);">$0</div>
                            </th>
                            <th style="text-align: center; padding: 1rem; background: rgba(139, 92, 246, 0.1);">
                                <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">Pro</div>
                                <div style="font-size: 1.5rem; font-weight: bold; color: var(--accent-violet);">$29</div>
                                <div style="background: linear-gradient(45deg, #F59E0B, #D97706); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; margin-top: 0.5rem; display: inline-block;">POPULAR</div>
                            </th>
                            <th style="text-align: center; padding: 1rem;">
                                <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">Enterprise</div>
                                <div style="font-size: 1.5rem; font-weight: bold; color: #EC4899;">$99</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateFeatureRows()}
                    </tbody>
                </table>
            </div>

            <div style="text-align: center; margin-top: 2rem;">
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">Not sure which plan is right for you?</p>
                <button onclick="showROICalculator()" style="
                    padding: 1rem 2rem;
                    background: linear-gradient(45deg, var(--primary-violet), var(--accent-violet));
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">Calculate Your ROI</button>
            </div>
        `;

        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            aboutSection.parentNode.insertBefore(section, aboutSection);
        }
    }

    function generateFeatureRows() {
        const features = [
            { name: 'Cookie Cleaning', free: true, pro: true, enterprise: true },
            { name: 'Browser Storage Management', free: true, pro: true, enterprise: true },
            { name: 'Privacy Health Scanner', free: true, pro: true, enterprise: true },
            { name: 'Password Analysis', free: true, pro: true, enterprise: true },
            { name: 'AI-Powered Dark Web Monitoring', free: false, pro: true, enterprise: true },
            { name: 'Social Media Privacy Audit', free: false, pro: true, enterprise: true },
            { name: 'Deepfake Detection', free: false, pro: true, enterprise: true },
            { name: 'Real-Time Threat Alerts', free: false, pro: true, enterprise: true },
            { name: 'Family Protection (Members)', free: '0', pro: '5', enterprise: 'Unlimited' },
            { name: 'Priority Support', free: false, pro: 'Email', enterprise: '24/7 Phone' },
            { name: 'Custom Integrations', free: false, pro: false, enterprise: true },
            { name: 'Quantum Encryption', free: false, pro: false, enterprise: true },
        ];

        return features.map(feature => `
            <tr style="border-bottom: 1px solid rgba(139, 92, 246, 0.1);">
                <td style="padding: 1rem; font-weight: 500;">${feature.name}</td>
                <td style="text-align: center; padding: 1rem;">${formatFeatureValue(feature.free)}</td>
                <td style="text-align: center; padding: 1rem; background: rgba(139, 92, 246, 0.05);">${formatFeatureValue(feature.pro)}</td>
                <td style="text-align: center; padding: 1rem;">${formatFeatureValue(feature.enterprise)}</td>
            </tr>
        `).join('');
    }

    function formatFeatureValue(value) {
        if (value === true) return '<span style="color: var(--success); font-size: 1.5rem;">✓</span>';
        if (value === false) return '<span style="color: #475569;">—</span>';
        return `<span style="color: var(--accent-violet); font-weight: 600;">${value}</span>`;
    }

    // Video Demo Cards
    function createVideoDemoSection() {
        const section = document.createElement('section');
        section.id = 'videoDemo';
        section.style.cssText = `
            padding: 4rem 2rem;
            max-width: 1400px;
            margin: 0 auto;
            background: linear-gradient(135deg, rgba(76, 29, 149, 0.05), rgba(139, 92, 246, 0.05));
            border-radius: 20px;
        `;

        section.innerHTML = `
            <h2 style="
                font-size: 2.5rem;
                font-weight: 700;
                text-align: center;
                margin-bottom: 1rem;
                background: linear-gradient(45deg, var(--text-primary), var(--accent-violet));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            ">See It In Action</h2>
            <p style="text-align: center; color: var(--text-secondary); margin-bottom: 3rem; font-size: 1.1rem;">Watch how our tools protect your digital privacy in seconds</p>
            
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
            ">
                ${createDemoCard('Cookie Cleaner', '🍪', 'Watch how we eliminate tracking cookies in one click', 'cookie-demo')}
                ${createDemoCard('Dark Web Monitor', '🕵️', 'See real-time dark web scanning in action', 'darkweb-demo')}
                ${createDemoCard('Privacy Scanner', '🔍', 'Complete privacy audit demonstration', 'scanner-demo')}
            </div>
        `;

        const toolsSection = document.getElementById('tools-section');
        if (toolsSection) {
            toolsSection.parentNode.insertBefore(section, toolsSection.nextSibling);
        }
    }

    function createDemoCard(title, icon, description, demoId) {
        return `
            <div class="demo-card" style="
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(76, 29, 149, 0.1));
                border: 2px solid rgba(139, 92, 246, 0.3);
                border-radius: 16px;
                padding: 2rem;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            ">
                <div style="font-size: 3rem; margin-bottom: 1rem;">${icon}</div>
                <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary);">${title}</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">${description}</p>
                
                <div class="demo-animation" style="
                    width: 100%;
                    height: 200px;
                    background: rgba(10, 10, 15, 0.8);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1rem;
                    border: 1px solid rgba(139, 92, 246, 0.3);
                ">
                    <div class="loading-animation" style="
                        width: 60px;
                        height: 60px;
                        border: 4px solid rgba(139, 92, 246, 0.3);
                        border-top: 4px solid var(--accent-violet);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></div>
                </div>
                
                <button onclick="playDemo('${demoId}')" style="
                    width: 100%;
                    padding: 0.75rem;
                    background: linear-gradient(45deg, var(--primary-violet), var(--accent-violet));
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">▶ Watch Demo</button>
            </div>
        `;
    }

    // ROI Calculator
    window.showROICalculator = function() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;

        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #0A0A0F, #1a1a2e);
                border: 2px solid var(--accent-violet);
                border-radius: 16px;
                padding: 2rem;
                max-width: 600px;
                width: 90%;
                color: #F8FAFC;
                box-shadow: 0 20px 60px rgba(139, 92, 246, 0.4);
            ">
                <h2 style="color: var(--accent-violet); margin-bottom: 2rem; text-align: center;">ROI Calculator</h2>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Average Cost of Data Breach:</label>
                    <input type="number" id="breachCost" value="4500000" style="
                        width: 100%;
                        padding: 0.75rem;
                        background: rgba(76, 29, 149, 0.1);
                        border: 2px solid rgba(139, 92, 246, 0.3);
                        border-radius: 8px;
                        color: white;
                        font-size: 1rem;
                    ">
                    <small style="color: #64748B;">Average enterprise data breach costs $4.5M</small>
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Number of Employees:</label>
                    <input type="number" id="employees" value="100" style="
                        width: 100%;
                        padding: 0.75rem;
                        background: rgba(76, 29, 149, 0.1);
                        border: 2px solid rgba(139, 92, 246, 0.3);
                        border-radius: 8px;
                        color: white;
                        font-size: 1rem;
                    ">
                </div>

                <button onclick="calculateROI()" style="
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(45deg, var(--primary-violet), var(--accent-violet));
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    margin-bottom: 1rem;
                ">Calculate ROI</button>

                <div id="roiResults" style="
                    padding: 1.5rem;
                    background: rgba(139, 92, 246, 0.1);
                    border: 2px solid rgba(139, 92, 246, 0.3);
                    border-radius: 12px;
                    margin-bottom: 1rem;
                    display: none;
                "></div>

                <button onclick="this.parentElement.parentElement.remove()" style="
                    width: 100%;
                    padding: 0.75rem;
                    background: transparent;
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    color: var(--text-secondary);
                    border-radius: 8px;
                    cursor: pointer;
                ">Close</button>
            </div>
        `;

        document.body.appendChild(modal);
    };

    window.calculateROI = function() {
        const breachCost = parseFloat(document.getElementById('breachCost').value);
        const employees = parseInt(document.getElementById('employees').value);
        
        const annualCost = employees * 99 * 12; // Enterprise plan
        const potentialSavings = breachCost * 0.7; // 70% reduction in breach likelihood
        const roi = ((potentialSavings - annualCost) / annualCost * 100).toFixed(0);

        const results = document.getElementById('roiResults');
        results.style.display = 'block';
        results.innerHTML = `
            <h3 style="color: var(--accent-violet); margin-bottom: 1rem;">Your Investment Analysis</h3>
            <div style="display: grid; gap: 1rem;">
                <div>
                    <div style="color: #64748B; font-size: 0.85rem;">Annual Investment</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-primary);">$${annualCost.toLocaleString()}</div>
                </div>
                <div>
                    <div style="color: #64748B; font-size: 0.85rem;">Potential Savings</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--success);">$${potentialSavings.toLocaleString()}</div>
                </div>
                <div>
                    <div style="color: #64748B; font-size: 0.85rem;">Return on Investment</div>
                    <div style="font-size: 2rem; font-weight: bold; color: var(--accent-violet);">${roi}%</div>
                </div>
            </div>
            <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
                <p style="color: var(--success); font-weight: 600;">✓ Investing in Digital Footprint Eraser could save you $${(potentialSavings - annualCost).toLocaleString()} annually</p>
            </div>
        `;
    };

    window.playDemo = function(demoId) {
        alert(`Demo video for ${demoId} would play here. Integration with video player coming soon!`);
    };

    // Strategic CTA Injection
    function injectStrategicCTAs() {
        // Add CTA after features section
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            const cta = document.createElement('div');
            cta.style.cssText = `
                text-align: center;
                padding: 3rem 2rem;
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(76, 29, 149, 0.1));
                border-radius: 16px;
                margin: 2rem auto;
                max-width: 800px;
            `;
            cta.innerHTML = `
                <h3 style="font-size: 2rem; margin-bottom: 1rem; color: var(--text-primary);">Ready to Erase Your Digital Footprint?</h3>
                <p style="color: var(--text-secondary); margin-bottom: 2rem; font-size: 1.1rem;">Join 2,847 users who protected their privacy today</p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button onclick="scrollToTools()" class="btn btn-primary">Start Free Trial</button>
                    <button onclick="showUpgradeModal()" class="btn btn-secondary">View Plans</button>
                </div>
            `;
            featuresSection.parentNode.insertBefore(cta, featuresSection.nextSibling);
        }
    }

    // Initialize Phase 2 Features
    function initPhase2() {
        console.log('Initializing Phase 2 Enhancements...');
        
        // Command Palette
        new CommandPalette();
        
        // Comparison Table
        setTimeout(() => createComparisonTable(), 500);
        
        // Video Demos
        setTimeout(() => createVideoDemoSection(), 1000);
        
        // Strategic CTAs
        setTimeout(() => injectStrategicCTAs(), 1500);

        // Add spin animation for demo cards
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .demo-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
            }
        `;
        document.head.appendChild(style);

        console.log('Phase 2 Enhancements Loaded Successfully');
        console.log('Press Cmd+K (Mac) or Ctrl+K (Windows) to open Command Palette');
    }

    // Load when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPhase2);
    } else {
        initPhase2();
    }

})();