// Phase 2 Features Module - Command Palette, Comparison Tables, Video Demos
// Optimized for performance and maintainability

const Phase2Features = (() => {
    let commandPaletteOpen = false;
    let searchIndex = [];

    // Initialize all Phase 2 features
    function init() {
        initCommandPalette();
        initComparisonTable();
        initVideoDemos();
        initROICalculator();
        initStrategicCTAs();
        buildSearchIndex();
    }

    // Command Palette (Cmd+K)
    function initCommandPalette() {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                toggleCommandPalette();
            }
            if (e.key === 'Escape' && commandPaletteOpen) {
                closeCommandPalette();
            }
        });
    }

    function buildSearchIndex() {
        searchIndex = [
            { title: 'Dark Web Monitor', icon: '🕵️', action: () => window.location.href = 'dark-web-monitoring.html', keywords: 'dark web monitoring scan threat' },
            { title: 'Social Media Auditor', icon: '📱', action: () => window.location.href = 'social-media-auditor.html', keywords: 'social media audit privacy facebook twitter' },
            { title: 'Deepfake Detection', icon: '🎭', action: () => window.location.href = 'deepfake-detection.html', keywords: 'deepfake ai detection fake media' },
            { title: 'AI Scanner', icon: '⚡', action: () => window.location.href = 'advanced-security-enhanced.html', keywords: 'ai scanner security threat intelligence' },
            { title: 'Clear Cookies', icon: '🍪', action: () => { closeCommandPalette(); clearAllCookies(); }, keywords: 'cookies clear delete privacy' },
            { title: 'Privacy Scan', icon: '🔍', action: () => { closeCommandPalette(); runPrivacyScan(); }, keywords: 'scan privacy health check' },
            { title: 'Password Analysis', icon: '🔒', action: () => { closeCommandPalette(); runPasswordAnalysis(); }, keywords: 'password security analysis strength' },
            { title: 'View Pricing', icon: '💳', action: () => { closeCommandPalette(); showUpgradeModal(); }, keywords: 'pricing plans upgrade pro enterprise' },
            { title: 'Compare Plans', icon: '📊', action: () => { closeCommandPalette(); showComparisonTable(); }, keywords: 'compare plans features pricing' },
            { title: 'Toggle Dark Mode', icon: '🌙', action: () => { closeCommandPalette(); toggleTheme(); }, keywords: 'dark mode light theme' },
            { title: 'Go to Tools', icon: '🛡️', action: () => { closeCommandPalette(); scrollToTools(); }, keywords: 'tools free privacy security' },
            { title: 'About Us', icon: 'ℹ️', action: () => { closeCommandPalette(); goToAbout(); }, keywords: 'about company information' }
        ];
    }

    function toggleCommandPalette() {
        if (commandPaletteOpen) {
            closeCommandPalette();
        } else {
            openCommandPalette();
        }
    }

    function openCommandPalette() {
        commandPaletteOpen = true;
        
        const palette = document.createElement('div');
        palette.id = 'commandPalette';
        palette.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                z-index: 10001;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding-top: 10vh;
                animation: fadeIn 0.2s ease;
            ">
                <div style="
                    background: linear-gradient(135deg, #0A0A0F, #1a1a2e);
                    border: 2px solid rgba(139, 92, 246, 0.4);
                    border-radius: 16px;
                    width: 90%;
                    max-width: 600px;
                    box-shadow: 0 20px 60px rgba(139, 92, 246, 0.3);
                ">
                    <div style="padding: 1.5rem; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
                        <input 
                            type="text" 
                            id="commandPaletteInput"
                            placeholder="Type a command or search..."
                            style="
                                width: 100%;
                                padding: 1rem;
                                background: rgba(139, 92, 246, 0.1);
                                border: 2px solid rgba(139, 92, 246, 0.3);
                                border-radius: 8px;
                                color: #F8FAFC;
                                font-size: 1.1rem;
                                outline: none;
                            "
                        />
                    </div>
                    <div id="commandPaletteResults" style="
                        max-height: 400px;
                        overflow-y: auto;
                        padding: 0.5rem;
                    "></div>
                    <div style="
                        padding: 1rem 1.5rem;
                        border-top: 1px solid rgba(139, 92, 246, 0.2);
                        font-size: 0.85rem;
                        color: #64748B;
                        display: flex;
                        justify-content: space-between;
                    ">
                        <span>↑↓ Navigate</span>
                        <span>↵ Select</span>
                        <span>ESC Close</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(palette);
        
        const input = document.getElementById('commandPaletteInput');
        input.focus();
        
        input.addEventListener('input', handleCommandSearch);
        input.addEventListener('keydown', handleCommandNavigation);
        
        palette.addEventListener('click', (e) => {
            if (e.target === palette) {
                closeCommandPalette();
            }
        });
        
        renderCommandResults(searchIndex);
    }

    function closeCommandPalette() {
        const palette = document.getElementById('commandPalette');
        if (palette) {
            palette.remove();
            commandPaletteOpen = false;
        }
    }

    function handleCommandSearch(e) {
        const query = e.target.value.toLowerCase();
        const results = searchIndex.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.keywords.includes(query)
        );
        renderCommandResults(results);
    }

    function handleCommandNavigation(e) {
        const results = document.querySelectorAll('.command-result-item');
        const activeIndex = Array.from(results).findIndex(r => r.classList.contains('active'));
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = Math.min(activeIndex + 1, results.length - 1);
            results.forEach((r, i) => r.classList.toggle('active', i === nextIndex));
            results[nextIndex]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = Math.max(activeIndex - 1, 0);
            results.forEach((r, i) => r.classList.toggle('active', i === prevIndex));
            results[prevIndex]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const activeItem = results[activeIndex];
            if (activeItem) {
                activeItem.click();
            }
        }
    }

    function renderCommandResults(results) {
        const container = document.getElementById('commandPaletteResults');
        
        if (results.length === 0) {
            container.innerHTML = '<div style="padding: 2rem; text-align: center; color: #64748B;">No results found</div>';
            return;
        }
        
        container.innerHTML = results.map((item, index) => `
            <div class="command-result-item ${index === 0 ? 'active' : ''}" data-index="${index}" style="
                padding: 1rem;
                margin: 0.25rem 0.5rem;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 1rem;
                transition: all 0.2s ease;
                background: ${index === 0 ? 'rgba(139, 92, 246, 0.2)' : 'transparent'};
            ">
                <span style="font-size: 1.5rem;">${item.icon}</span>
                <span style="color: #F8FAFC; font-weight: 500;">${item.title}</span>
            </div>
        `).join('');
        
        container.querySelectorAll('.command-result-item').forEach((el, index) => {
            el.addEventListener('mouseenter', () => {
                container.querySelectorAll('.command-result-item').forEach(r => r.classList.remove('active'));
                el.classList.add('active');
                el.style.background = 'rgba(139, 92, 246, 0.2)';
            });
            
            el.addEventListener('mouseleave', () => {
                if (!el.classList.contains('active')) {
                    el.style.background = 'transparent';
                }
            });
            
            el.addEventListener('click', () => {
                results[index].action();
            });
        });
    }

    // Comparison Table
    function initComparisonTable() {
        window.showComparisonTable = showComparisonTable;
    }

    function showComparisonTable() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            overflow-y: auto;
            padding: 2rem;
        `;
        
        modal.innerHTML = `
            <div style="
                max-width: 1200px;
                margin: 0 auto;
                background: linear-gradient(135deg, #0A0A0F, #1a1a2e);
                border: 2px solid rgba(139, 92, 246, 0.4);
                border-radius: 16px;
                padding: 2rem;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="font-size: 2rem; color: #8B5CF6;">Compare All Features</h2>
                    <button onclick="this.closest('[style*=fixed]').remove()" style="
                        background: transparent;
                        border: none;
                        color: #64748B;
                        font-size: 2rem;
                        cursor: pointer;
                        padding: 0.5rem;
                    ">×</button>
                </div>
                
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; color: #F8FAFC;">
                        <thead>
                            <tr style="border-bottom: 2px solid rgba(139, 92, 246, 0.3);">
                                <th style="text-align: left; padding: 1rem; font-size: 0.9rem; color: #CBD5E1;">Feature</th>
                                <th style="text-align: center; padding: 1rem;">
                                    <div style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem;">Free</div>
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #10B981;">$0</div>
                                    <div style="font-size: 0.8rem; color: #64748B;">per month</div>
                                </th>
                                <th style="text-align: center; padding: 1rem; background: rgba(139, 92, 246, 0.1);">
                                    <div style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem;">Pro</div>
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #8B5CF6;">$29</div>
                                    <div style="font-size: 0.8rem; color: #64748B;">per month</div>
                                </th>
                                <th style="text-align: center; padding: 1rem;">
                                    <div style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem;">Enterprise</div>
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #EC4899;">$99</div>
                                    <div style="font-size: 0.8rem; color: #64748B;">per month</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generateComparisonRows()}
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 2rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                    <button onclick="initiateUpgrade('pro')" style="
                        padding: 1rem 2rem;
                        background: linear-gradient(45deg, #7C3AED, #8B5CF6);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-weight: 700;
                        cursor: pointer;
                    ">Upgrade to Pro</button>
                    <button onclick="initiateUpgrade('enterprise')" style="
                        padding: 1rem 2rem;
                        background: linear-gradient(45deg, #EC4899, #BE185D);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-weight: 700;
                        cursor: pointer;
                    ">Upgrade to Enterprise</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    function generateComparisonRows() {
        const features = [
            { name: 'Cookie Cleaning', free: true, pro: true, enterprise: true },
            { name: 'Browser Storage Management', free: true, pro: true, enterprise: true },
            { name: 'Password Analysis', free: true, pro: true, enterprise: true },
            { name: 'Privacy Health Scanner', free: 'Basic', pro: 'Advanced', enterprise: 'Advanced' },
            { name: 'Dark Web Monitoring', free: false, pro: true, enterprise: true },
            { name: 'Social Media Auditor', free: false, pro: true, enterprise: true },
            { name: 'Deepfake Detection', free: false, pro: 'Limited', enterprise: 'Unlimited' },
            { name: 'AI Attack Surface Scanner', free: false, pro: true, enterprise: true },
            { name: 'Real-time Alerts', free: false, pro: true, enterprise: true },
            { name: 'Family Members Protected', free: '1', pro: '5', enterprise: 'Unlimited' },
            { name: 'Priority Support', free: false, pro: 'Email', enterprise: '24/7 Phone' },
            { name: 'Data Removal Requests', free: '5/month', pro: '50/month', enterprise: 'Unlimited' },
            { name: 'API Access', free: false, pro: false, enterprise: true },
            { name: 'Custom Integrations', free: false, pro: false, enterprise: true },
            { name: 'Dedicated Account Manager', free: false, pro: false, enterprise: true }
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
        if (value === true) return '<span style="color: #10B981; font-size: 1.5rem;">✓</span>';
        if (value === false) return '<span style="color: #64748B; font-size: 1.2rem;">—</span>';
        return `<span style="color: #8B5CF6; font-weight: 600;">${value}</span>`;
    }

    // Video Demos
    function initVideoDemos() {
        const videoSection = document.createElement('section');
        videoSection.className = 'video-demos-section';
        videoSection.style.cssText = 'padding: 4rem 2rem; max-width: 1400px; margin: 0 auto;';
        
        videoSection.innerHTML = `
            <h2 style="
                font-size: 2.5rem;
                font-weight: 700;
                text-align: center;
                margin-bottom: 3rem;
                background: linear-gradient(45deg, #F8FAFC, #8B5CF6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            ">See It In Action</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem;">
                ${generateVideoDemoCards()}
            </div>
        `;
        
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            featuresSection.parentNode.insertBefore(videoSection, featuresSection);
        }
    }

    function generateVideoDemoCards() {
        const demos = [
            {
                title: 'Cookie Cleaning in Action',
                description: 'Watch how our tool eliminates tracking cookies instantly',
                icon: '🍪',
                duration: '0:45'
            },
            {
                title: 'Dark Web Monitoring',
                description: 'See real-time scanning of 500+ dark web sources',
                icon: '🕵️',
                duration: '1:20'
            },
            {
                title: 'Privacy Score Analysis',
                description: 'Comprehensive privacy health check demonstration',
                icon: '📊',
                duration: '1:05'
            }
        ];
        
        return demos.map(demo => `
            <div style="
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(76, 29, 149, 0.1));
                border: 2px solid rgba(139, 92, 246, 0.3);
                border-radius: 16px;
                padding: 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 30px rgba(139, 92, 246, 0.4)';" onmouseout="this.style.transform=''; this.style.boxShadow='';">
                <div style="
                    width: 100%;
                    height: 200px;
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1rem;
                    position: relative;
                ">
                    <div style="font-size: 4rem;">${demo.icon}</div>
                    <div style="
                        position: absolute;
                        bottom: 10px;
                        right: 10px;
                        background: rgba(0, 0, 0, 0.8);
                        padding: 0.25rem 0.5rem;
                        border-radius: 4px;
                        font-size: 0.8rem;
                        color: white;
                    ">${demo.duration}</div>
                </div>
                <h3 style="color: #F8FAFC; font-size: 1.2rem; margin-bottom: 0.5rem;">${demo.title}</h3>
                <p style="color: #CBD5E1; font-size: 0.9rem; line-height: 1.5;">${demo.description}</p>
                <button style="
                    margin-top: 1rem;
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(45deg, #7C3AED, #8B5CF6);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    width: 100%;
                ">▶ Watch Demo</button>
            </div>
        `).join('');
    }

    // ROI Calculator
    function initROICalculator() {
        const calculatorBtn = document.createElement('button');
        calculatorBtn.innerHTML = '💰 Calculate Your ROI';
        calculatorBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: linear-gradient(45deg, #10B981, #059669);
            color: white;
            border: none;
            border-radius: 50px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
            z-index: 999;
            transition: all 0.3s ease;
        `;
        
        calculatorBtn.onmouseover = () => {
            calculatorBtn.style.transform = 'translateY(-3px)';
            calculatorBtn.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.6)';
        };
        
        calculatorBtn.onmouseout = () => {
            calculatorBtn.style.transform = '';
            calculatorBtn.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.4)';
        };
        
        calculatorBtn.onclick = showROICalculator;
        
        document.body.appendChild(calculatorBtn);
    }

    function showROICalculator() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
        `;
        
        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #0A0A0F, #1a1a2e);
                border: 2px solid rgba(139, 92, 246, 0.4);
                border-radius: 16px;
                padding: 2rem;
                max-width: 600px;
                width: 90%;
            ">
                <h2 style="color: #8B5CF6; margin-bottom: 2rem; text-align: center;">Calculate Your Privacy ROI</h2>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="color: #F8FAFC; display: block; margin-bottom: 0.5rem;">Average cost of a data breach for your company:</label>
                    <input type="number" id="breachCost" value="150000" style="
                        width: 100%;
                        padding: 0.75rem;
                        background: rgba(139, 92, 246, 0.1);
                        border: 2px solid rgba(139, 92, 246, 0.3);
                        border-radius: 8px;
                        color: #F8FAFC;
                        font-size: 1rem;
                    " />
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="color: #F8FAFC; display: block; margin-bottom: 0.5rem;">Number of employees to protect:</label>
                    <input type="number" id="employeeCount" value="50" style="
                        width: 100%;
                        padding: 0.75rem;
                        background: rgba(139, 92, 246, 0.1);
                        border: 2px solid rgba(139, 92, 246, 0.3);
                        border-radius: 8px;
                        color: #F8FAFC;
                        font-size: 1rem;
                    " />
                </div>
                
                <button onclick="calculateROI()" style="
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(45deg, #10B981, #059669);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 700;
                    cursor: pointer;
                    margin-bottom: 1rem;
                ">Calculate Savings</button>
                
                <div id="roiResults" style="
                    background: rgba(16, 185, 129, 0.1);
                    border: 2px solid rgba(16, 185, 129, 0.3);
                    border-radius: 8px;
                    padding: 1.5rem;
                    display: none;
                "></div>
                
                <button onclick="this.closest('[style*=fixed]').remove()" style="
                    width: 100%;
                    padding: 0.75rem;
                    background: transparent;
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    color: #64748B;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-top: 1rem;
                ">Close</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        window.calculateROI = () => {
            const breachCost = parseInt(document.getElementById('breachCost').value);
            const employees = parseInt(document.getElementById('employeeCount').value);
            
            const annualCost = employees * 99 * 12; // Enterprise plan
            const potentialLoss = breachCost * 0.15; // 15% chance of breach
            const savings = potentialLoss - annualCost;
            const roi = ((savings / annualCost) * 100).toFixed(0);
            
            const resultsDiv = document.getElementById('roiResults');
            resultsDiv.style.display = 'block';
            resultsDiv.innerHTML = `
                <h3 style="color: #10B981; margin-bottom: 1rem; font-size: 1.5rem;">Your Potential Savings</h3>
                <div style="color: #F8FAFC; font-size: 0.95rem; line-height: 1.8;">
                    <div style="margin-bottom: 0.5rem;">Annual Investment: <strong>$${annualCost.toLocaleString()}</strong></div>
                    <div style="margin-bottom: 0.5rem;">Potential Breach Cost: <strong>$${breachCost.toLocaleString()}</strong></div>
                    <div style="margin-bottom: 1rem;">Net Savings: <strong style="color: #10B981; font-size: 1.2rem;">$${savings.toLocaleString()}</strong></div>
                    <div style="padding: 1rem; background: rgba(16, 185, 129, 0.2); border-radius: 8px; text-align: center;">
                        <div style="font-size: 2.5rem; font-weight: 700; color: #10B981;">${roi}%</div>
                        <div style="color: #CBD5E1;">Return on Investment</div>
                    </div>
                </div>
            `;
        };
    }

    // Strategic CTAs
    function initStrategicCTAs() {
        addFloatingCTA();
        addScrollProgressCTA();
    }

    function addFloatingCTA() {
        let lastScrollTop = 0;
        const floatingCTA = document.createElement('div');
        floatingCTA.style.cssText = `
            position: fixed;
            bottom: -100px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(45deg, #7C3AED, #8B5CF6);
            padding: 1rem 2rem;
            border-radius: 50px;
            box-shadow: 0 10px 40px rgba(139, 92, 246, 0.5);
            z-index: 998;
            transition: bottom 0.3s ease;
            display: flex;
            gap: 1rem;
            align-items: center;
        `;
        
        floatingCTA.innerHTML = `
            <span style="color: white; font-weight: 600;">Ready to protect your privacy?</span>
            <button onclick="showUpgradeModal()" style="
                background: white;
                color: #7C3AED;
                border: none;
                padding: 0.5rem 1.5rem;
                border-radius: 50px;
                font-weight: 700;
                cursor: pointer;
            ">Get Started</button>
        `;
        
        document.body.appendChild(floatingCTA);
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 1000 && scrollTop > lastScrollTop) {
                floatingCTA.style.bottom = '20px';
            } else {
                floatingCTA.style.bottom = '-100px';
            }
            
            lastScrollTop = scrollTop;
        });
    }

    function addScrollProgressCTA() {
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #7C3AED, #8B5CF6);
            z-index: 10000;
            transition: width 0.1s ease;
            width: 0%;
        `;
        
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrolled = (window.pageYOffset / documentHeight) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }

    // Public API
    return {
        init
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Phase2Features.init);
} else {
    Phase2Features.init();
}

console.log('Phase 2 Features Loaded: Command Palette, Comparison Tables, Video Demos');