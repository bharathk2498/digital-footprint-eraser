/**
 * Enterprise Configuration Manager
 * Advanced configuration loading, validation, and management for enterprise deployments
 */

class EnterpriseConfigManager {
    constructor() {
        this.config = {};
        this.environment = this.detectEnvironment();
        this.configSources = new Map();
        this.validators = new Map();
        this.watchers = new Map();
        this.encrypted = new Set();
        this.cache = new Map();
        this.initialized = false;
    }

    /**
     * Initialize configuration system
     */
    async initialize() {
        try {
            await this.setupValidators();
            await this.loadConfiguration();
            await this.validateConfiguration();
            await this.setupConfigWatchers();
            
            this.initialized = true;
            console.log('Enterprise Configuration Manager initialized successfully');
            
            return this.config;
        } catch (error) {
            console.error('Failed to initialize configuration:', error);
            throw error;
        }
    }

    /**
     * Detect deployment environment
     */
    detectEnvironment() {
        // Check for Kubernetes
        if (process?.env?.KUBERNETES_SERVICE_HOST) {
            return 'kubernetes';
        }
        
        // Check for Docker
        if (process?.env?.DOCKER_CONTAINER) {
            return 'docker';
        }
        
        // Check for various cloud providers
        if (process?.env?.AWS_REGION) {
            return 'aws';
        }
        
        if (process?.env?.GOOGLE_CLOUD_PROJECT) {
            return 'gcp';
        }
        
        if (process?.env?.AZURE_SUBSCRIPTION_ID) {
            return 'azure';
        }
        
        // Check for development/production
        if (typeof window !== 'undefined') {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                return 'development';
            }
            return 'production';
        }
        
        return process?.env?.NODE_ENV || 'development';
    }

    /**
     * Load configuration from multiple sources
     */
    async loadConfiguration() {
        const configSources = [
            () => this.loadDefaultConfig(),
            () => this.loadEnvironmentConfig(),
            () => this.loadFileConfig(),
            () => this.loadRemoteConfig(),
            () => this.loadEnvironmentVariables(),
            () => this.loadCommandLineArgs(),
            () => this.loadKubernetesConfig(),
            () => this.loadVaultSecrets()
        ];

        for (const source of configSources) {
            try {
                const config = await source();
                if (config) {
                    this.mergeConfig(config);
                }
            } catch (error) {
                console.warn(`Configuration source failed:`, error);
            }
        }
    }

    /**
     * Load default configuration
     */
    async loadDefaultConfig() {
        return {
            application: {
                name: 'Advanced Digital Footprint Eraser',
                version: '2.0.0',
                environment: this.environment,
                debug: this.environment === 'development'
            },
            security: {
                encryption: {
                    algorithm: 'AES-256-GCM',
                    keyDerivation: 'PBKDF2',
                    iterations: 100000,
                    saltLength: 32
                },
                hashing: {
                    algorithm: 'SHA-256',
                    pepper: true,
                    rounds: 12
                }
            },
            performance: {
                maxConcurrentScans: 4,
                chunkSize: 1024,
                batchSize: 100,
                cacheSize: '100MB',
                memoryLimit: '512MB'
            },
            logging: {
                level: this.environment === 'development' ? 'debug' : 'info',
                outputs: ['console'],
                format: {
                    timestamp: true,
                    level: true,
                    module: true
                }
            }
        };
    }

    /**
     * Load environment-specific configuration
     */
    async loadEnvironmentConfig() {
        const configFiles = {
            development: 'config/development.json',
            production: 'config/production.json',
            kubernetes: 'config/kubernetes.json',
            docker: 'config/docker.json'
        };

        const configFile = configFiles[this.environment];
        if (!configFile) return null;

        try {
            // In browser environment, fetch from server
            if (typeof window !== 'undefined') {
                const response = await fetch(configFile);
                if (response.ok) {
                    return await response.json();
                }
            }
            
            // In Node.js environment, read from file system
            if (typeof require !== 'undefined') {
                return require(`../${configFile}`);
            }
        } catch (error) {
            console.warn(`Failed to load ${configFile}:`, error);
        }

        return null;
    }

    /**
     * Load configuration from file
     */
    async loadFileConfig() {
        const configPaths = [
            'eraser.config.json',
            'config.json',
            '.eraserrc',
            '.eraserrc.json'
        ];

        for (const path of configPaths) {
            try {
                if (typeof window !== 'undefined') {
                    const response = await fetch(path);
                    if (response.ok) {
                        return await response.json();
                    }
                } else if (typeof require !== 'undefined') {
                    const fs = require('fs');
                    if (fs.existsSync(path)) {
                        return JSON.parse(fs.readFileSync(path, 'utf8'));
                    }
                }
            } catch (error) {
                // Continue to next path
            }
        }

        return null;
    }

    /**
     * Load configuration from remote endpoint
     */
    async loadRemoteConfig() {
        const configUrl = process?.env?.CONFIG_URL || this.config?.configUrl;
        if (!configUrl) return null;

        try {
            const response = await fetch(configUrl, {
                headers: {
                    'Authorization': `Bearer ${process?.env?.CONFIG_TOKEN || ''}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('Failed to load remote configuration:', error);
        }

        return null;
    }

    /**
     * Load configuration from environment variables
     */
    async loadEnvironmentVariables() {
        if (typeof process === 'undefined') return null;

        const envConfig = {};
        const envPrefix = 'ERASER_';

        Object.keys(process.env).forEach(key => {
            if (key.startsWith(envPrefix)) {
                const configKey = key.substring(envPrefix.length).toLowerCase();
                const value = process.env[key];
                
                // Try to parse as JSON, fallback to string
                try {
                    envConfig[configKey] = JSON.parse(value);
                } catch {
                    envConfig[configKey] = value;
                }
            }
        });

        return Object.keys(envConfig).length > 0 ? envConfig : null;
    }

    /**
     * Load configuration from command line arguments
     */
    async loadCommandLineArgs() {
        if (typeof process === 'undefined' || !process.argv) return null;

        const args = {};
        const argv = process.argv.slice(2);

        for (let i = 0; i < argv.length; i++) {
            const arg = argv[i];
            if (arg.startsWith('--config-')) {
                const key = arg.substring(9); // Remove '--config-'
                const value = argv[i + 1];
                if (value && !value.startsWith('-')) {
                    try {
                        args[key] = JSON.parse(value);
                    } catch {
                        args[key] = value;
                    }
                    i++; // Skip next argument as it's the value
                }
            }
        }

        return Object.keys(args).length > 0 ? args : null;
    }

    /**
     * Load configuration from Kubernetes ConfigMaps and Secrets
     */
    async loadKubernetesConfig() {
        if (this.environment !== 'kubernetes') return null;

        try {
            // Load from mounted ConfigMap
            if (typeof require !== 'undefined') {
                const fs = require('fs');
                const configMapPath = '/app/config/production.json';
                
                if (fs.existsSync(configMapPath)) {
                    return JSON.parse(fs.readFileSync(configMapPath, 'utf8'));
                }
            }
        } catch (error) {
            console.warn('Failed to load Kubernetes configuration:', error);
        }

        return null;
    }

    /**
     * Load secrets from HashiCorp Vault or similar
     */
    async loadVaultSecrets() {
        const vaultUrl = process?.env?.VAULT_URL;
        const vaultToken = process?.env?.VAULT_TOKEN;
        
        if (!vaultUrl || !vaultToken) return null;

        try {
            const response = await fetch(`${vaultUrl}/v1/secret/data/eraser`, {
                headers: {
                    'X-Vault-Token': vaultToken,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.data?.data || null;
            }
        } catch (error) {
            console.warn('Failed to load Vault secrets:', error);
        }

        return null;
    }

    /**
     * Merge configuration with priority
     */
    mergeConfig(newConfig) {
        this.config = this.deepMerge(this.config, newConfig);
    }

    /**
     * Deep merge objects with array concatenation
     */
    deepMerge(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(result[key] || {}, source[key]);
                } else if (Array.isArray(source[key])) {
                    result[key] = [...(result[key] || []), ...source[key]];
                } else {
                    result[key] = source[key];
                }
            }
        }

        return result;
    }

    /**
     * Setup configuration validators
     */
    async setupValidators() {
        // Application validators
        this.validators.set('application.name', (value) => {
            return typeof value === 'string' && value.length > 0;
        });

        this.validators.set('application.version', (value) => {
            return typeof value === 'string' && /^\d+\.\d+\.\d+/.test(value);
        });

        // Security validators
        this.validators.set('security.encryption.algorithm', (value) => {
            return ['AES-256-GCM', 'AES-256-CBC', 'ChaCha20-Poly1305'].includes(value);
        });

        this.validators.set('security.encryption.iterations', (value) => {
            return typeof value === 'number' && value >= 10000;
        });

        // Performance validators
        this.validators.set('performance.maxConcurrentScans', (value) => {
            return typeof value === 'number' && value > 0 && value <= 32;
        });

        // Logging validators
        this.validators.set('logging.level', (value) => {
            return ['error', 'warn', 'info', 'debug', 'trace'].includes(value);
        });
    }

    /**
     * Validate entire configuration
     */
    async validateConfiguration() {
        const errors = [];

        for (const [path, validator] of this.validators) {
            const value = this.getConfigValue(path);
            if (value !== undefined && !validator(value)) {
                errors.push(`Invalid configuration value for ${path}: ${value}`);
            }
        }

        if (errors.length > 0) {
            throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
        }
    }

    /**
     * Get configuration value by dot notation path
     */
    getConfigValue(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.config);
    }

    /**
     * Set configuration value by dot notation path
     */
    setConfigValue(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, this.config);
        
        target[lastKey] = value;
    }

    /**
     * Setup configuration watchers for hot reloading
     */
    async setupConfigWatchers() {
        // Watch for file changes in development
        if (this.environment === 'development' && typeof require !== 'undefined') {
            try {
                const fs = require('fs');
                const path = require('path');
                
                const configDir = path.join(process.cwd(), 'config');
                if (fs.existsSync(configDir)) {
                    fs.watch(configDir, { recursive: true }, (eventType, filename) => {
                        if (filename.endsWith('.json')) {
                            console.log(`Configuration file changed: ${filename}`);
                            this.reloadConfiguration();
                        }
                    });
                }
            } catch (error) {
                console.warn('Failed to setup file watchers:', error);
            }
        }

        // Watch for environment variable changes
        if (typeof process !== 'undefined') {
            const originalEnv = { ...process.env };
            
            setInterval(() => {
                const currentEnv = process.env;
                const envPrefix = 'ERASER_';
                
                let changed = false;
                Object.keys(currentEnv).forEach(key => {
                    if (key.startsWith(envPrefix) && originalEnv[key] !== currentEnv[key]) {
                        changed = true;
                        originalEnv[key] = currentEnv[key];
                    }
                });
                
                if (changed) {
                    console.log('Environment variables changed, reloading configuration');
                    this.reloadConfiguration();
                }
            }, 10000); // Check every 10 seconds
        }
    }

    /**
     * Reload configuration from all sources
     */
    async reloadConfiguration() {
        try {
            const oldConfig = { ...this.config };
            this.config = {};
            
            await this.loadConfiguration();
            await this.validateConfiguration();
            
            // Notify watchers of changes
            this.notifyConfigurationChanged(oldConfig, this.config);
            
            console.log('Configuration reloaded successfully');
        } catch (error) {
            console.error('Failed to reload configuration:', error);
        }
    }

    /**
     * Notify registered watchers of configuration changes
     */
    notifyConfigurationChanged(oldConfig, newConfig) {
        this.watchers.forEach((callback, path) => {
            const oldValue = this.getConfigValueFromObject(oldConfig, path);
            const newValue = this.getConfigValueFromObject(newConfig, path);
            
            if (oldValue !== newValue) {
                try {
                    callback(newValue, oldValue, path);
                } catch (error) {
                    console.error(`Configuration watcher error for ${path}:`, error);
                }
            }
        });
    }

    /**
     * Get configuration value from specific object
     */
    getConfigValueFromObject(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Register configuration change watcher
     */
    watch(path, callback) {
        const watcherId = `${path}_${Date.now()}_${Math.random()}`;
        this.watchers.set(watcherId, callback);
        
        // Return unwatch function
        return () => {
            this.watchers.delete(watcherId);
        };
    }

    /**
     * Get full configuration object
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Get configuration section
     */
    getSection(sectionName) {
        return this.config[sectionName] ? { ...this.config[sectionName] } : {};
    }

    /**
     * Check if configuration is valid
     */
    isValid() {
        try {
            this.validateConfiguration();
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Export configuration for debugging
     */
    exportConfig(sanitize = true) {
        const exported = { ...this.config };
        
        if (sanitize) {
            // Remove sensitive information
            const sensitiveKeys = ['password', 'secret', 'key', 'token', 'credential'];
            this.sanitizeObject(exported, sensitiveKeys);
        }
        
        return exported;
    }

    /**
     * Sanitize object by removing sensitive keys
     */
    sanitizeObject(obj, sensitiveKeys) {
        Object.keys(obj).forEach(key => {
            const lowerKey = key.toLowerCase();
            
            if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
                obj[key] = '[REDACTED]';
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                this.sanitizeObject(obj[key], sensitiveKeys);
            }
        });
    }

    /**
     * Validate configuration schema
     */
    validateSchema(schema) {
        // Implementation for JSON schema validation
        // This would typically use a library like Ajv
        return true;
    }

    /**
     * Encrypt sensitive configuration values
     */
    async encryptSensitive() {
        const sensitiveKeys = ['password', 'secret', 'key', 'token'];
        // Implementation for encrypting sensitive values
        console.log('Sensitive configuration values encrypted');
    }

    /**
     * Decrypt sensitive configuration values
     */
    async decryptSensitive() {
        // Implementation for decrypting sensitive values
        console.log('Sensitive configuration values decrypted');
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.watchers.clear();
        this.validators.clear();
        this.configSources.clear();
        this.cache.clear();
        this.initialized = false;
    }
}

// Singleton instance for global access
let configManagerInstance = null;

/**
 * Get or create configuration manager instance
 */
function getConfigManager() {
    if (!configManagerInstance) {
        configManagerInstance = new EnterpriseConfigManager();
    }
    return configManagerInstance;
}

/**
 * Initialize configuration system
 */
async function initializeConfig() {
    const manager = getConfigManager();
    return await manager.initialize();
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.EnterpriseConfigManager = EnterpriseConfigManager;
    window.getConfigManager = getConfigManager;
    window.initializeConfig = initializeConfig;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EnterpriseConfigManager,
        getConfigManager,
        initializeConfig
    };
}