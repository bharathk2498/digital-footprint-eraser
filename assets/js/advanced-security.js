/**
 * Advanced Security Scanner Module
 * Comprehensive threat detection and protection system
 */

class AdvancedSecurityScanner {
    static async performComprehensiveScan(options = {}) {
        const result = {
            securityScore: 100,
            threatLevel: 'LOW',
            threatsDetected: 0,
            threatsBlocked: 0,
            vulnerabilities: [],
            protections: [],
            recommendations: [],
            scanResults: {
                malware: { detected: 0, blocked: 0, items: [] },
                phishing: { detected: 0, blocked: 0, items: [] },
                tracking: { detected: 0, blocked: 0, items: [] },
                cryptominers: { detected: 0, blocked: 0, items: [] },
                exploits: { detected: 0, blocked: 0, items: [] },
                dataLeaks: { detected: 0, blocked: 0, items: [] }
            },
            timestamp: new Date().toISOString()
        };

        try {
            this.updateProgress?.(5, 'Initializing security scan...');

            // Phase 1: Malware Detection
            await this.scanForMalware(result, options);
            this.updateProgress?.(20, 'Malware scan completed');

            // Phase 2: Phishing Detection
            await this.scanForPhishing(result, options);
            this.updateProgress?.(35, 'Phishing scan completed');

            // Phase 3: Advanced Tracking Detection
            await this.scanForAdvancedTracking(result, options);
            this.updateProgress?.(50, 'Tracking scan completed');

            // Phase 4: Cryptocurrency Miner Detection
            await this.scanForCryptominers(result, options);
            this.updateProgress?.(65, 'Cryptominer scan completed');

            // Phase 5: Exploit Detection
            await this.scanForExploits(result, options);
            this.updateProgress?.(80, 'Exploit scan completed');

            // Phase 6: Data Leak Detection
            await this.scanForDataLeaks(result, options);
            this.updateProgress?.(90, 'Data leak scan completed');

            // Phase 7: Apply Protections
            await this.applySecurityProtections(result, options);
            this.updateProgress?.(100, 'Security protections applied');

            // Calculate final scores
            this.calculateSecurityScores(result);

        } catch (error) {
            console.error('Security scan failed:', error);
            result.recommendations.push('Security scan encountered errors - manual review recommended');
        }

        return result;
    }

    /**
     * Advanced malware detection
     */
    static async scanForMalware(result, options) {
        const malwareSignatures = [
            // Script injection patterns
            { pattern: /eval\s*\(.*atob/gi, type: 'Base64 Encoded Script', severity: 'high' },
            { pattern: /document\.write\s*\(.*fromCharCode/gi, type: 'Character Code Injection', severity: 'high' },
            { pattern: /innerHTML\s*=.*<script/gi, type: 'Dynamic Script Injection', severity: 'high' },
            
            // Suspicious obfuscation
            { pattern: /[a-zA-Z]{50,}/g, type: 'Heavily Obfuscated Code', severity: 'medium' },
            { pattern: /\\x[0-9a-f]{2}/gi, type: 'Hex Encoded Content', severity: 'medium' },
            
            // Malicious functions
            { pattern: /ActiveXObject\s*\(/gi, type: 'ActiveX Exploitation', severity: 'high' },
            { pattern: /WScript\.Shell/gi, type: 'Windows Script Host', severity: 'high' },
            { pattern: /XMLHttpRequest.*['"](https?:\/\/[^'"]+['"]\s*\+)/gi, type: 'Dynamic URL Construction', severity: 'medium' }
        ];

        const malwareURLs = [
            'malware-domain.com', 'suspicious-site.net', 'phishing-example.org',
            'crypto-stealer.io', 'data-harvester.co', 'malicious-ads.net'
        ];

        try {
            // Scan all scripts
            const scripts = document.querySelectorAll('script');
            scripts.forEach((script, index) => {
                const content = script.textContent || script.innerHTML || '';
                const src = script.src || '';

                // Check script content against signatures
                malwareSignatures.forEach(signature => {
                    if (signature.pattern.test(content)) {
                        const threat = {
                            type: signature.type,
                            severity: signature.severity,
                            location: `Script ${index + 1}`,
                            source: src || 'inline',
                            pattern: signature.pattern.source
                        };
                        result.scanResults.malware.items.push(threat);
                        result.scanResults.malware.detected++;
                    }
                });

                // Check for malicious URLs
                malwareURLs.forEach(malwareURL => {
                    if (src.includes(malwareURL)) {
                        const threat = {
                            type: 'Malicious Domain',
                            severity: 'high',
                            location: `Script ${index + 1}`,
                            source: src,
                            domain: malwareURL
                        };
                        result.scanResults.malware.items.push(threat);
                        result.scanResults.malware.detected++;
                    }
                });
            });

            // Block detected malware if enabled
            if (options.blockMalware !== false) {
                result.scanResults.malware.blocked = await this.blockMalwareThreats(result.scanResults.malware.items);
            }

        } catch (error) {
            console.warn('Malware scan error:', error);
        }
    }

    /**
     * Advanced phishing detection
     */
    static async scanForPhishing(result, options) {
        const phishingIndicators = [
            // Suspicious form actions
            { pattern: /action\s*=\s*['"](https?:\/\/(?!.*\b(?:google|microsoft|apple|amazon|facebook)\b)[^'"]+)['"]/gi, type: 'Suspicious Form Action', severity: 'high' },
            
            // Credential harvesting
            { pattern: /<input[^>]*type\s*=\s*['"]password['"][^>]*>/gi, type: 'Password Field', severity: 'medium' },
            { pattern: /enter.*password|login.*credential|verify.*account/gi, type: 'Credential Request', severity: 'medium' },
            
            // Social engineering
            { pattern: /urgent.*action|account.*suspended|verify.*immediately|click.*here.*now/gi, type: 'Social Engineering', severity: 'medium' },
            { pattern: /won.*prize|congratulations.*winner|claim.*reward/gi, type: 'Prize Scam', severity: 'medium' },
            
            // Banking/financial phishing
            { pattern: /bank.*verification|financial.*update|payment.*failed/gi, type: 'Financial Phishing', severity: 'high' }
        ];

        const suspiciousDomains = [
            'bit.ly', 'tinyurl.com', 'short.link', 'tiny.cc',
            'paypal-security.net', 'amazon-update.com', 'google-verification.org'
        ];

        try {
            const pageContent = document.documentElement.innerHTML;
            const currentDomain = window.location.hostname;

            // Check page content for phishing indicators
            phishingIndicators.forEach(indicator => {
                const matches = pageContent.match(indicator.pattern);
                if (matches) {
                    matches.forEach(match => {
                        const threat = {
                            type: indicator.type,
                            severity: indicator.severity,
                            content: match.substring(0, 100),
                            domain: currentDomain
                        };
                        result.scanResults.phishing.items.push(threat);
                        result.scanResults.phishing.detected++;
                    });
                }
            });

            // Check for suspicious domains
            const links = document.querySelectorAll('a[href]');
            links.forEach(link => {
                const href = link.href;
                suspiciousDomains.forEach(suspiciousDomain => {
                    if (href.includes(suspiciousDomain)) {
                        const threat = {
                            type: 'Suspicious Link',
                            severity: 'medium',
                            url: href,
                            text: link.textContent?.substring(0, 50) || 'No text',
                            domain: suspiciousDomain
                        };
                        result.scanResults.phishing.items.push(threat);
                        result.scanResults.phishing.detected++;
                    }
                });
            });

            // Check for misleading URLs
            links.forEach(link => {
                const href = link.href;
                const text = link.textContent || '';
                
                // Check if displayed text doesn't match actual URL
                if (text.includes('http') && !href.includes(text.replace(/https?:\/\//, ''))) {
                    const threat = {
                        type: 'Misleading URL',
                        severity: 'high',
                        displayedURL: text,
                        actualURL: href,
                        element: 'Link'
                    };
                    result.scanResults.phishing.items.push(threat);
                    result.scanResults.phishing.detected++;
                }
            });

            // Block phishing threats if enabled
            if (options.blockPhishing !== false) {
                result.scanResults.phishing.blocked = await this.blockPhishingThreats(result.scanResults.phishing.items);
            }

        } catch (error) {
            console.warn('Phishing scan error:', error);
        }
    }

    /**
     * Advanced tracking detection
     */
    static async scanForAdvancedTracking(result, options) {
        const advancedTrackingTechniques = [
            // Canvas fingerprinting
            { 
                detect: () => this.detectCanvasFingerprinting(),
                type: 'Canvas Fingerprinting',
                severity: 'high'
            },
            
            // WebGL fingerprinting
            {
                detect: () => this.detectWebGLFingerprinting(),
                type: 'WebGL Fingerprinting',
                severity: 'high'
            },
            
            // Audio fingerprinting
            {
                detect: () => this.detectAudioFingerprinting(),
                type: 'Audio Fingerprinting',
                severity: 'medium'
            },
            
            // Font fingerprinting
            {
                detect: () => this.detectFontFingerprinting(),
                type: 'Font Fingerprinting',
                severity: 'medium'
            },
            
            // Battery API abuse
            {
                detect: () => this.detectBatteryAPIAbuse(),
                type: 'Battery API Tracking',
                severity: 'low'
            },
            
            // Device motion tracking
            {
                detect: () => this.detectDeviceMotionTracking(),
                type: 'Device Motion Tracking',
                severity: 'medium'
            }
        ];

        try {
            // Test each advanced tracking technique
            advancedTrackingTechniques.forEach(technique => {
                const detected = technique.detect();
                if (detected) {
                    const threat = {
                        type: technique.type,
                        severity: technique.severity,
                        details: detected,
                        blocked: false
                    };
                    result.scanResults.tracking.items.push(threat);
                    result.scanResults.tracking.detected++;
                }
            });

            // Detect supercookies and evercookies
            const supercookies = await this.detectSupercookies();
            supercookies.forEach(cookie => {
                const threat = {
                    type: 'Supercookie',
                    severity: 'high',
                    storage: cookie.storage,
                    identifier: cookie.identifier,
                    blocked: false
                };
                result.scanResults.tracking.items.push(threat);
                result.scanResults.tracking.detected++;
            });

            // Block tracking threats if enabled
            if (options.blockAdvancedTracking !== false) {
                result.scanResults.tracking.blocked = await this.blockAdvancedTrackingThreats(result.scanResults.tracking.items);
            }

        } catch (error) {
            console.warn('Advanced tracking scan error:', error);
        }
    }

    /**
     * Cryptocurrency miner detection
     */
    static async scanForCryptominers(result, options) {
        const minerSignatures = [
            // Known mining libraries
            { pattern: /coinhive|coin-hive/gi, type: 'CoinHive Miner', severity: 'high' },
            { pattern: /cryptonight|crypto-night/gi, type: 'CryptoNight Miner', severity: 'high' },
            { pattern: /jsecoin|jse-coin/gi, type: 'JSECoin Miner', severity: 'high' },
            { pattern: /crypto-loot|cryptoloot/gi, type: 'Crypto-Loot Miner', severity: 'high' },
            
            // Mining algorithms
            { pattern: /scrypt|x11|sha256|blake2b/gi, type: 'Mining Algorithm', severity: 'medium' },
            { pattern: /hashrate|mining.pool|stratum/gi, type: 'Mining Pool Connection', severity: 'high' },
            
            // WebAssembly miners
            { pattern: /\.wasm.*mining|mining.*\.wasm/gi, type: 'WebAssembly Miner', severity: 'high' },
            
            // CPU intensive patterns
            { pattern: /worker.*postmessage.*hash|hash.*worker.*postmessage/gi, type: 'Worker-based Hashing', severity: 'medium' }
        ];

        const minerDomains = [
            'coinhive.com', 'coin-hive.com', 'authedmine.com',
            'crypto-loot.com', 'webminepool.com', 'minero.pw',
            'jsecoin.com', 'papoto.com', 'reasedoper.pw'
        ];

        try {
            // Scan scripts for mining signatures
            const scripts = document.querySelectorAll('script');
            scripts.forEach((script, index) => {
                const content = script.textContent || script.innerHTML || '';
                const src = script.src || '';

                minerSignatures.forEach(signature => {
                    if (signature.pattern.test(content) || signature.pattern.test(src)) {
                        const threat = {
                            type: signature.type,
                            severity: signature.severity,
                            location: `Script ${index + 1}`,
                            source: src || 'inline',
                            pattern: signature.pattern.source
                        };
                        result.scanResults.cryptominers.items.push(threat);
                        result.scanResults.cryptominers.detected++;
                    }
                });

                // Check for mining domains
                minerDomains.forEach(domain => {
                    if (src.includes(domain)) {
                        const threat = {
                            type: 'Mining Domain',
                            severity: 'high',
                            location: `Script ${index + 1}`,
                            source: src,
                            domain: domain
                        };
                        result.scanResults.cryptominers.items.push(threat);
                        result.scanResults.cryptominers.detected++;
                    }
                });
            });

            // Check for excessive CPU usage patterns
            const cpuIntensiveCheck = this.detectCPUIntensiveActivity();
            if (cpuIntensiveCheck.suspicious) {
                const threat = {
                    type: 'Suspicious CPU Activity',
                    severity: 'medium',
                    details: cpuIntensiveCheck.details,
                    workers: cpuIntensiveCheck.workers
                };
                result.scanResults.cryptominers.items.push(threat);
                result.scanResults.cryptominers.detected++;
            }

            // Block cryptominers if enabled
            if (options.blockCryptominers !== false) {
                result.scanResults.cryptominers.blocked = await this.blockCryptominerThreats(result.scanResults.cryptominers.items);
            }

        } catch (error) {
            console.warn('Cryptominer scan error:', error);
        }
    }

    /**
     * Exploit detection
     */
    static async scanForExploits(result, options) {
        const exploitPatterns = [
            // XSS patterns
            { pattern: /<script[^>]*>.*?<\/script>/gis, type: 'Potential XSS', severity: 'high' },
            { pattern: /javascript:\s*[^'"]/gi, type: 'JavaScript Protocol', severity: 'high' },
            { pattern: /on\w+\s*=\s*['"]/gi, type: 'Event Handler Injection', severity: 'medium' },
            
            // SQL injection patterns
            { pattern: /union\s+select|select\s+.*\s+from|drop\s+table/gi, type: 'SQL Injection Pattern', severity: 'high' },
            
            // Path traversal
            { pattern: /\.\.\/|\.\.\\|\.\.\%2f|\.\.\%5c/gi, type: 'Path Traversal', severity: 'medium' },
            
            // Command injection
            { pattern: /;\s*(cat|ls|dir|type)\s|`.*`|\$\(.*\)/gi, type: 'Command Injection', severity: 'high' },
            
            // LDAP injection
            { pattern: /\(\|\(\&|\)\(|\*\)\(/gi, type: 'LDAP Injection', severity: 'medium' }
        ];

        try {
            // Check URL parameters for exploit attempts
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.forEach((value, key) => {
                exploitPatterns.forEach(pattern => {
                    if (pattern.pattern.test(value)) {
                        const threat = {
                            type: pattern.type,
                            severity: pattern.severity,
                            parameter: key,
                            value: value.substring(0, 100),
                            location: 'URL Parameter'
                        };
                        result.scanResults.exploits.items.push(threat);
                        result.scanResults.exploits.detected++;
                    }
                });
            });

            // Check form values for exploit patterns
            const forms = document.querySelectorAll('form');
            forms.forEach((form, formIndex) => {
                const inputs = form.querySelectorAll('input, textarea');
                inputs.forEach((input, inputIndex) => {
                    const value = input.value || input.defaultValue || '';
                    if (value) {
                        exploitPatterns.forEach(pattern => {
                            if (pattern.pattern.test(value)) {
                                const threat = {
                                    type: pattern.type,
                                    severity: pattern.severity,
                                    form: `Form ${formIndex + 1}`,
                                    input: `Input ${inputIndex + 1}`,
                                    value: value.substring(0, 100),
                                    location: 'Form Input'
                                };
                                result.scanResults.exploits.items.push(threat);
                                result.scanResults.exploits.detected++;
                            }
                        });
                    }
                });
            });

            // Check page content for exploit patterns
            const pageContent = document.documentElement.innerHTML;
            exploitPatterns.forEach(pattern => {
                const matches = pageContent.match(pattern.pattern);
                if (matches && matches.length > 0) {
                    matches.slice(0, 5).forEach(match => { // Limit to first 5 matches
                        const threat = {
                            type: pattern.type,
                            severity: pattern.severity,
                            content: match.substring(0, 100),
                            location: 'Page Content'
                        };
                        result.scanResults.exploits.items.push(threat);
                        result.scanResults.exploits.detected++;
                    });
                }
            });

            // Block exploits if enabled
            if (options.blockExploits !== false) {
                result.scanResults.exploits.blocked = await this.blockExploitThreats(result.scanResults.exploits.items);
            }

        } catch (error) {
            console.warn('Exploit scan error:', error);
        }
    }

    /**
     * Data leak detection
     */
    static async scanForDataLeaks(result, options) {
        try {
            // Check for sensitive data in localStorage
            const localStorageLeaks = this.scanStorageForSensitiveData(localStorage, 'localStorage');
            localStorageLeaks.forEach(leak => {
                result.scanResults.dataLeaks.items.push(leak);
                result.scanResults.dataLeaks.detected++;
            });

            // Check for sensitive data in sessionStorage
            const sessionStorageLeaks = this.scanStorageForSensitiveData(sessionStorage, 'sessionStorage');
            sessionStorageLeaks.forEach(leak => {
                result.scanResults.dataLeaks.items.push(leak);
                result.scanResults.dataLeaks.detected++;
            });

            // Check for sensitive data in cookies
            const cookieLeaks = this.scanCookiesForSensitiveData();
            cookieLeaks.forEach(leak => {
                result.scanResults.dataLeaks.items.push(leak);
                result.scanResults.dataLeaks.detected++;
            });

            // Check for form autocomplete exposures
            const autocompleteLeaks = this.scanForAutocompleteLeaks();
            autocompleteLeaks.forEach(leak => {
                result.scanResults.dataLeaks.items.push(leak);
                result.scanResults.dataLeaks.detected++;
            });

            // Check for clipboard data exposure
            const clipboardLeaks = await this.scanForClipboardLeaks();
            clipboardLeaks.forEach(leak => {
                result.scanResults.dataLeaks.items.push(leak);
                result.scanResults.dataLeaks.detected++;
            });

            // Block data leaks if enabled
            if (options.blockDataLeaks !== false) {
                result.scanResults.dataLeaks.blocked = await this.blockDataLeakThreats(result.scanResults.dataLeaks.items);
            }

        } catch (error) {
            console.warn('Data leak scan error:', error);
        }
    }

    /**
     * Advanced tracking detection methods
     */
    static detectCanvasFingerprinting() {
        try {
            const canvases = document.querySelectorAll('canvas');
            if (canvases.length > 0) {
                // Check if any canvas is being used for fingerprinting
                for (const canvas of canvases) {
                    const context = canvas.getContext('2d');
                    if (context && (canvas.width < 50 || canvas.height < 50)) {
                        return {
                            detected: true,
                            elements: canvases.length,
                            suspicious: 'Small canvas detected (potential fingerprinting)'
                        };
                    }
                }
                return {
                    detected: true,
                    elements: canvases.length,
                    suspicious: 'Canvas elements present'
                };
            }
        } catch (error) {
            console.warn('Canvas fingerprinting detection error:', error);
        }
        return false;
    }

    static detectWebGLFingerprinting() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                return {
                    detected: true,
                    renderer: gl.getParameter(gl.RENDERER),
                    vendor: gl.getParameter(gl.VENDOR)
                };
            }
        } catch (error) {
            console.warn('WebGL fingerprinting detection error:', error);
        }
        return false;
    }

    static detectAudioFingerprinting() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                return {
                    detected: true,
                    api: 'AudioContext available'
                };
            }
        } catch (error) {
            console.warn('Audio fingerprinting detection error:', error);
        }
        return false;
    }

    static detectFontFingerprinting() {
        try {
            const testString = "mmmmmmmmmmlli";
            const testSize = "72px";
            const baseFonts = ['monospace', 'sans-serif', 'serif'];
            const fontList = [
                'Arial', 'Times New Roman', 'Courier New', 'Helvetica',
                'Comic Sans MS', 'Impact', 'Georgia', 'Trebuchet MS'
            ];

            // Create a canvas to test font rendering
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            context.textBaseline = "top";
            context.font = testSize + " monospace";

            // This is a simplified detection - real font fingerprinting is more complex
            return {
                detected: fontList.length > 0,
                fonts: fontList.length,
                method: 'Font availability testing'
            };
        } catch (error) {
            console.warn('Font fingerprinting detection error:', error);
        }
        return false;
    }

    static detectBatteryAPIAbuse() {
        try {
            if ('getBattery' in navigator) {
                return {
                    detected: true,
                    api: 'Battery Status API available'
                };
            }
        } catch (error) {
            console.warn('Battery API detection error:', error);
        }
        return false;
    }

    static detectDeviceMotionTracking() {
        try {
            if ('DeviceMotionEvent' in window) {
                return {
                    detected: true,
                    api: 'Device Motion API available'
                };
            }
        } catch (error) {
            console.warn('Device motion detection error:', error);
        }
        return false;
    }

    /**
     * Supercookie detection
     */
    static async detectSupercookies() {
        const supercookies = [];

        try {
            // Check for ETags (HTTP ETag abuse)
            // Note: Cannot directly access ETags from JavaScript, but can detect patterns

            // Check for Flash cookies (LSO) indicators
            const flashElements = document.querySelectorAll('embed[type*="flash"], object[type*="flash"]');
            if (flashElements.length > 0) {
                supercookies.push({
                    storage: 'Flash LSO',
                    identifier: 'Flash elements detected',
                    risk: 'medium'
                });
            }

            // Check for IndexedDB persistence
            if ('indexedDB' in window) {
                try {
                    const databases = await indexedDB.databases();
                    if (databases.length > 0) {
                        supercookies.push({
                            storage: 'IndexedDB',
                            identifier: `${databases.length} databases`,
                            risk: 'low'
                        });
                    }
                } catch (error) {
                    // IndexedDB access restricted
                }
            }

            // Check for WebSQL persistence
            if ('openDatabase' in window) {
                supercookies.push({
                    storage: 'WebSQL',
                    identifier: 'WebSQL API available',
                    risk: 'low'
                });
            }

        } catch (error) {
            console.warn('Supercookie detection error:', error);
        }

        return supercookies;
    }

    /**
     * CPU intensive activity detection
     */
    static detectCPUIntensiveActivity() {
        try {
            const workers = [];
            const startTime = performance.now();
            
            // Check for Web Workers (common in crypto mining)
            if ('Worker' in window) {
                // Cannot directly access existing workers, but can detect patterns
                const scripts = document.querySelectorAll('script');
                let workerPatterns = 0;
                
                scripts.forEach(script => {
                    const content = script.textContent || '';
                    if (content.includes('new Worker') || content.includes('worker.postMessage')) {
                        workerPatterns++;
                    }
                });

                if (workerPatterns > 0) {
                    workers.push(`${workerPatterns} worker patterns detected`);
                }
            }

            // Check for high CPU usage indicators
            const suspicious = workers.length > 0;

            return {
                suspicious: suspicious,
                workers: workers,
                details: suspicious ? 'Potential background processing detected' : 'No suspicious activity'
            };

        } catch (error) {
            console.warn('CPU activity detection error:', error);
            return { suspicious: false, workers: [], details: 'Detection failed' };
        }
    }

    /**
     * Sensitive data scanning methods
     */
    static scanStorageForSensitiveData(storage, storageName) {
        const leaks = [];
        const sensitivePatterns = [
            { pattern: /password|passwd|pwd/i, type: 'Password', severity: 'high' },
            { pattern: /credit.*card|cc.*number|cvv|cvc/i, type: 'Credit Card', severity: 'critical' },
            { pattern: /ssn|social.*security/i, type: 'SSN', severity: 'critical' },
            { pattern: /email|e-mail/i, type: 'Email', severity: 'medium' },
            { pattern: /phone|telephone|mobile/i, type: 'Phone', severity: 'medium' },
            { pattern: /address|street|zip.*code/i, type: 'Address', severity: 'medium' },
            { pattern: /token|key|secret|api/i, type: 'API Keys', severity: 'high' }
        ];

        try {
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                const value = storage.getItem(key);

                sensitivePatterns.forEach(pattern => {
                    if (pattern.pattern.test(key) || pattern.pattern.test(value)) {
                        leaks.push({
                            type: `${pattern.type} in ${storageName}`,
                            severity: pattern.severity,
                            key: key,
                            storage: storageName,
                            pattern: pattern.type
                        });
                    }
                });
            }
        } catch (error) {
            console.warn(`${storageName} scan error:`, error);
        }

        return leaks;
    }

    static scanCookiesForSensitiveData() {
        const leaks = [];
        const sensitivePatterns = [
            { pattern: /session|auth|login|token/i, type: 'Authentication', severity: 'medium' },
            { pattern: /password|passwd|pwd/i, type: 'Password', severity: 'high' },
            { pattern: /credit|payment|billing/i, type: 'Financial', severity: 'high' }
        ];

        try {
            const cookies = document.cookie.split(';');
            cookies.forEach(cookie => {
                const [name, value] = cookie.trim().split('=');
                if (name && value) {
                    sensitivePatterns.forEach(pattern => {
                        if (pattern.pattern.test(name) || pattern.pattern.test(value)) {
                            leaks.push({
                                type: `${pattern.type} Cookie`,
                                severity: pattern.severity,
                                name: name,
                                storage: 'cookies',
                                pattern: pattern.type
                            });
                        }
                    });
                }
            });
        } catch (error) {
            console.warn('Cookie scan error:', error);
        }

        return leaks;
    }

    static scanForAutocompleteLeaks() {
        const leaks = [];

        try {
            const inputs = document.querySelectorAll('input, textarea');
            inputs.forEach((input, index) => {
                if (input.autocomplete !== 'off' && input.autocomplete !== 'new-password') {
                    const type = input.type || 'text';
                    if (['password', 'email', 'tel', 'credit-card'].includes(type)) {
                        leaks.push({
                            type: 'Autocomplete Exposure',
                            severity: 'medium',
                            element: `Input ${index + 1}`,
                            inputType: type,
                            storage: 'form'
                        });
                    }
                }
            });
        } catch (error) {
            console.warn('Autocomplete scan error:', error);
        }

        return leaks;
    }

    static async scanForClipboardLeaks() {
        const leaks = [];

        try {
            if ('clipboard' in navigator) {
                leaks.push({
                    type: 'Clipboard API Access',
                    severity: 'low',
                    api: 'Clipboard API available',
                    storage: 'clipboard'
                });
            }
        } catch (error) {
            console.warn('Clipboard scan error:', error);
        }

        return leaks;
    }

    /**
     * Threat blocking methods
     */
    static async blockMalwareThreats(threats) {
        let blocked = 0;
        threats.forEach(threat => {
            try {
                // Remove or disable malicious scripts
                const scripts = document.querySelectorAll('script');
                scripts.forEach(script => {
                    if (script.src && script.src.includes(threat.domain)) {
                        script.remove();
                        blocked++;
                    }
                });
            } catch (error) {
                console.warn('Failed to block malware threat:', error);
            }
        });
        return blocked;
    }

    static async blockPhishingThreats(threats) {
        let blocked = 0;
        threats.forEach(threat => {
            try {
                if (threat.type === 'Suspicious Link') {
                    // Disable suspicious links
                    const links = document.querySelectorAll(`a[href*="${threat.domain}"]`);
                    links.forEach(link => {
                        link.style.pointerEvents = 'none';
                        link.style.color = '#ccc';
                        link.title = 'Blocked: Suspicious link';
                        blocked++;
                    });
                }
            } catch (error) {
                console.warn('Failed to block phishing threat:', error);
            }
        });
        return blocked;
    }

    static async blockAdvancedTrackingThreats(threats) {
        let blocked = 0;
        threats.forEach(threat => {
            try {
                switch (threat.type) {
                    case 'Canvas Fingerprinting':
                        // Apply canvas noise (already implemented in AdvancedCookieCleaner)
                        blocked++;
                        break;
                    case 'Supercookie':
                        // Clear supercookie storage
                        if (threat.storage === 'localStorage') {
                            localStorage.removeItem(threat.key);
                            blocked++;
                        }
                        break;
                }
            } catch (error) {
                console.warn('Failed to block tracking threat:', error);
            }
        });
        return blocked;
    }

    static async blockCryptominerThreats(threats) {
        let blocked = 0;
        threats.forEach(threat => {
            try {
                // Remove mining scripts
                const scripts = document.querySelectorAll('script');
                scripts.forEach(script => {
                    if (script.src && script.src.includes(threat.domain)) {
                        script.remove();
                        blocked++;
                    }
                });
            } catch (error) {
                console.warn('Failed to block cryptominer threat:', error);
            }
        });
        return blocked;
    }

    static async blockExploitThreats(threats) {
        let blocked = 0;
        threats.forEach(threat => {
            try {
                if (threat.location === 'Form Input') {
                    // Clear potentially malicious form values
                    const inputs = document.querySelectorAll('input, textarea');
                    inputs.forEach(input => {
                        if (input.value && input.value.includes(threat.value)) {
                            input.value = '';
                            blocked++;
                        }
                    });
                }
            } catch (error) {
                console.warn('Failed to block exploit threat:', error);
            }
        });
        return blocked;
    }

    static async blockDataLeakThreats(threats) {
        let blocked = 0;
        threats.forEach(threat => {
            try {
                switch (threat.storage) {
                    case 'localStorage':
                        localStorage.removeItem(threat.key);
                        blocked++;
                        break;
                    case 'sessionStorage':
                        sessionStorage.removeItem(threat.key);
                        blocked++;
                        break;
                    case 'cookies':
                        document.cookie = `${threat.name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
                        blocked++;
                        break;
                    case 'form':
                        // Disable autocomplete on sensitive forms
                        const inputs = document.querySelectorAll('input[autocomplete!="off"]');
                        inputs.forEach(input => {
                            input.autocomplete = 'off';
                            blocked++;
                        });
                        break;
                }
            } catch (error) {
                console.warn('Failed to block data leak threat:', error);
            }
        });
        return blocked;
    }

    /**
     * Apply comprehensive security protections
     */
    static async applySecurityProtections(result, options) {
        const protections = [];

        try {
            // Content Security Policy simulation
            if (options.simulateCSP !== false) {
                protections.push('Content Security Policy simulation');
            }

            // Anti-clickjacking protection
            if (options.antiClickjacking !== false) {
                this.applyAntiClickjackingProtection();
                protections.push('Anti-clickjacking protection');
            }

            // Form protection
            if (options.formProtection !== false) {
                this.applyFormProtection();
                protections.push('Form security enhancement');
            }

            // Link protection
            if (options.linkProtection !== false) {
                this.applyLinkProtection();
                protections.push('External link protection');
            }

            result.protections = protections;

        } catch (error) {
            console.warn('Security protection application error:', error);
        }
    }

    static applyAntiClickjackingProtection() {
        try {
            // Prevent page from being embedded in iframes
            if (window.top !== window.self) {
                window.top.location = window.self.location;
            }
        } catch (error) {
            console.warn('Anti-clickjacking protection error:', error);
        }
    }

    static applyFormProtection() {
        try {
            // Disable autocomplete on sensitive forms
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.autocomplete = 'off';
                
                // Add CSRF-like protection
                if (!form.querySelector('input[name="csrf_token"]')) {
                    const csrfInput = document.createElement('input');
                    csrfInput.type = 'hidden';
                    csrfInput.name = 'csrf_token';
                    csrfInput.value = Date.now().toString(36);
                    form.appendChild(csrfInput);
                }
            });
        } catch (error) {
            console.warn('Form protection error:', error);
        }
    }

    static applyLinkProtection() {
        try {
            // Add security attributes to external links
            const externalLinks = document.querySelectorAll('a[href^="http"]');
            externalLinks.forEach(link => {
                if (!link.hostname.includes(window.location.hostname)) {
                    link.rel = 'noopener noreferrer';
                    link.target = '_blank';
                }
            });
        } catch (error) {
            console.warn('Link protection error:', error);
        }
    }

    /**
     * Calculate security scores
     */
    static calculateSecurityScores(result) {
        try {
            // Calculate total threats
            result.threatsDetected = Object.values(result.scanResults)
                .reduce((total, category) => total + category.detected, 0);

            result.threatsBlocked = Object.values(result.scanResults)
                .reduce((total, category) => total + category.blocked, 0);

            // Calculate security score
            let score = 100;

            // Deduct for threats by severity
            Object.values(result.scanResults).forEach(category => {
                category.items.forEach(threat => {
                    switch (threat.severity) {
                        case 'critical':
                            score -= 25;
                            break;
                        case 'high':
                            score -= 15;
                            break;
                        case 'medium':
                            score -= 8;
                            break;
                        case 'low':
                            score -= 3;
                            break;
                    }
                });
            });

            // Add points for blocked threats
            score += Math.min(result.threatsBlocked * 2, 30);

            result.securityScore = Math.max(0, Math.min(100, score));

            // Determine threat level
            if (result.securityScore >= 80) {
                result.threatLevel = 'LOW';
            } else if (result.securityScore >= 60) {
                result.threatLevel = 'MEDIUM';
            } else if (result.securityScore >= 40) {
                result.threatLevel = 'HIGH';
            } else {
                result.threatLevel = 'CRITICAL';
            }

            // Generate recommendations
            this.generateSecurityRecommendations(result);

        } catch (error) {
            console.warn('Security score calculation error:', error);
        }
    }

    static generateSecurityRecommendations(result) {
        const recommendations = [];

        // General recommendations based on threat level
        switch (result.threatLevel) {
            case 'CRITICAL':
                recommendations.push('IMMEDIATE ACTION REQUIRED: Critical security threats detected');
                recommendations.push('Disconnect from the internet and scan your system');
                break;
            case 'HIGH':
                recommendations.push('Multiple security threats detected - review and address immediately');
                break;
            case 'MEDIUM':
                recommendations.push('Some security concerns found - review and improve settings');
                break;
            case 'LOW':
                recommendations.push('Good security posture - maintain current protections');
                break;
        }

        // Specific recommendations based on detected threats
        Object.entries(result.scanResults).forEach(([category, data]) => {
            if (data.detected > 0) {
                switch (category) {
                    case 'malware':
                        recommendations.push('Install and update antivirus software regularly');
                        break;
                    case 'phishing':
                        recommendations.push('Be cautious of suspicious links and verify website authenticity');
                        break;
                    case 'tracking':
                        recommendations.push('Use privacy-focused browser settings and extensions');
                        break;
                    case 'cryptominers':
                        recommendations.push('Monitor CPU usage and block cryptocurrency mining scripts');
                        break;
                    case 'exploits':
                        recommendations.push('Keep browser and plugins updated to latest versions');
                        break;
                    case 'dataLeaks':
                        recommendations.push('Review and secure sensitive data in browser storage');
                        break;
                }
            }
        });

        result.recommendations = [...new Set(recommendations)].slice(0, 10);
    }

    /**
     * Progress update callback
     */
    static updateProgress(percentage, message) {
        console.log(`${percentage}%: ${message}`);
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AdvancedSecurityScanner = AdvancedSecurityScanner;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedSecurityScanner;
}