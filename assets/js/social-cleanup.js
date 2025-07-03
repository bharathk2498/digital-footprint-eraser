/**
 * Social Media Optimizer Module
 * Handles privacy optimization for major social media platforms
 */

class SocialMediaOptimizer {
    static async generateInstructions() {
        const result = {
            platforms: [],
            totalOptimizations: 0,
            privacyScore: 0,
            message: ''
        };

        try {
            // Get instructions for all major platforms
            const platforms = this.getSupportedPlatforms();
            
            platforms.forEach(platform => {
                const instructions = this.getPlatformInstructions(platform.id);
                result.platforms.push({
                    name: platform.name,
                    id: platform.id,
                    icon: platform.icon,
                    optimizations: instructions.steps,
                    settingsUrl: instructions.settingsUrl,
                    difficulty: instructions.difficulty,
                    timeEstimate: instructions.timeEstimate
                });
            });

            result.totalOptimizations = result.platforms.reduce((total, platform) => 
                total + platform.optimizations.length, 0);
            
            result.privacyScore = this.calculatePrivacyScore(result.platforms);
            result.message = `Generated privacy optimization steps for ${result.platforms.length} platforms.`;

        } catch (error) {
            console.error('Social media optimization error:', error);
            result.message = 'Failed to generate social media instructions.';
        }

        return result;
    }

    /**
     * Get list of supported platforms
     */
    static getSupportedPlatforms() {
        return [
            { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook' },
            { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram' },
            { id: 'twitter', name: 'Twitter/X', icon: 'fab fa-twitter' },
            { id: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin' },
            { id: 'tiktok', name: 'TikTok', icon: 'fab fa-tiktok' },
            { id: 'youtube', name: 'YouTube', icon: 'fab fa-youtube' },
            { id: 'snapchat', name: 'Snapchat', icon: 'fab fa-snapchat' },
            { id: 'discord', name: 'Discord', icon: 'fab fa-discord' },
            { id: 'reddit', name: 'Reddit', icon: 'fab fa-reddit' },
            { id: 'pinterest', name: 'Pinterest', icon: 'fab fa-pinterest' }
        ];
    }

    /**
     * Get platform-specific privacy instructions
     */
    static getPlatformInstructions(platformId) {
        const instructions = {
            facebook: {
                settingsUrl: 'https://www.facebook.com/settings/privacy',
                difficulty: 'Moderate',
                timeEstimate: '15-20 minutes',
                steps: [
                    'Go to Settings & Privacy > Settings > Privacy',
                    'Set "Who can see your posts" to Friends or Custom',
                    'Set "Who can see your friends list" to Only you',
                    'Review "Who can look you up" settings - restrict email/phone search',
                    'Go to Settings > Your Facebook Information > Off-Facebook Activity',
                    'Turn off "Future off-Facebook activity" and clear history',
                    'Settings > Ads > Ad Settings - turn off ads based on data from partners',
                    'Review and delete old posts using Activity Log',
                    'Settings > Apps and Websites - remove unnecessary connected apps',
                    'Settings > Location > Location History - turn off location services',
                    'Settings > Face Recognition - turn off face recognition',
                    'Review tagged photos and approve tags before posting'
                ]
            },
            instagram: {
                settingsUrl: 'https://www.instagram.com/accounts/privacy_and_security/',
                difficulty: 'Easy',
                timeEstimate: '10-15 minutes',
                steps: [
                    'Go to Settings > Privacy > Account Privacy - make account private',
                    'Settings > Privacy > Activity Status - turn off activity status',
                    'Settings > Privacy > Story - set to "Hide story from" specific people',
                    'Settings > Privacy > Comments - filter comments and restrict accounts',
                    'Settings > Privacy > Tags - manually approve tags',
                    'Settings > Privacy > Contacts Syncing - turn off contact syncing',
                    'Settings > Security > Data Download - review what data Instagram has',
                    'Settings > Ads > Ad Interests - clear and opt out of personalized ads',
                    'Review old posts and delete sensitive content',
                    'Remove location data from past posts'
                ]
            },
            twitter: {
                settingsUrl: 'https://twitter.com/settings/privacy_and_safety',
                difficulty: 'Moderate', 
                timeEstimate: '15-20 minutes',
                steps: [
                    'Settings > Privacy and Safety > Audience and Tagging',
                    'Set "Protect your posts" if you want private account',
                    'Uncheck "Let others find you by email/phone number"',
                    'Settings > Privacy and Safety > Data Sharing and Off-Twitter Activity',
                    'Turn off "Allow use of where you see Twitter content across the web"',
                    'Settings > Privacy and Safety > Ads Preferences',
                    'Turn off "Personalized ads" and clear all ad interests',
                    'Settings > Privacy and Safety > Location Information',
                    'Turn off "Precise location" and clear location history',
                    'Review and delete old tweets using Twitter Archive',
                    'Settings > Account Information > Download your data',
                    'Block or mute accounts that violate your privacy'
                ]
            },
            linkedin: {
                settingsUrl: 'https://www.linkedin.com/psettings/privacy',
                difficulty: 'Easy',
                timeEstimate: '10-15 minutes',
                steps: [
                    'Settings & Privacy > Visibility > Public Profile',
                    'Customize your public profile visibility - turn off unwanted sections',
                    'Settings & Privacy > Data Privacy > How LinkedIn uses your data',
                    'Turn off "Personalized advertising" and data sharing',
                    'Settings & Privacy > Communications > Who can reach you',
                    'Limit who can send you invitations and messages',
                    'Settings & Privacy > Visibility > Profile viewing options',
                    'Browse in private mode when viewing other profiles',
                    'Settings & Privacy > Data Privacy > Search by email/phone',
                    'Turn off discoverability by email and phone number',
                    'Review connections and remove unwanted contacts',
                    'Settings & Privacy > Advertising > Advertising preferences - opt out'
                ]
            },
            tiktok: {
                settingsUrl: 'https://www.tiktok.com/setting/privacy',
                difficulty: 'Easy',
                timeEstimate: '10 minutes',
                steps: [
                    'Settings > Privacy > Account Privacy - make account private',
                    'Settings > Privacy > Safety > Who can interact with you',
                    'Limit comments, duets, and mentions to friends only',
                    'Settings > Privacy > Data > Download Your Data',
                    'Review what data TikTok has collected about you',
                    'Settings > Privacy > Ads > Ad Authorization',
                    'Turn off personalized ads and clear ad interests',
                    'Settings > Privacy > Data > Off-TikTok Activity',
                    'Turn off advertiser data sharing',
                    'Delete old videos with personal information',
                    'Settings > Privacy > Safety > Contacts - turn off contact syncing'
                ]
            },
            youtube: {
                settingsUrl: 'https://myaccount.google.com/privacy',
                difficulty: 'Moderate',
                timeEstimate: '15 minutes',
                steps: [
                    'YouTube Settings > Privacy > Keep all my subscriptions private',
                    'YouTube Settings > Privacy > Keep all my saved playlists private',
                    'Google Account > Data & Privacy > YouTube History',
                    'Turn off "YouTube History" and delete existing history',
                    'Google Account > Data & Privacy > Ad Personalization',
                    'Turn off ad personalization across Google services',
                    'YouTube Settings > Connected Apps - remove unnecessary apps',
                    'Review uploaded videos and set appropriate privacy levels',
                    'YouTube Settings > Community - manage who can comment',
                    'Google Account > Data & Privacy > Location History - turn off',
                    'Delete or private old videos with personal information'
                ]
            },
            snapchat: {
                settingsUrl: 'https://support.snapchat.com/en-US/a/privacy-settings2',
                difficulty: 'Easy',
                timeEstimate: '10 minutes',
                steps: [
                    'Settings > Privacy Controls > Contact Me - set to "My Friends"',
                    'Settings > Privacy Controls > View My Story - set to "My Friends"',
                    'Settings > See My Location - turn off Snap Map or set to "My Friends"',
                    'Settings > Ads > Ad Preferences - limit ad personalization',
                    'Settings > Privacy Controls > See Me in Quick Add - turn off',
                    'Settings > Data Export - download your data to see what Snapchat has',
                    'Delete old saved messages and media',
                    'Settings > Notifications - limit notification sharing',
                    'Review friend list and remove unwanted contacts'
                ]
            },
            discord: {
                settingsUrl: 'https://discord.com/safety',
                difficulty: 'Easy',
                timeEstimate: '5-10 minutes',
                steps: [
                    'Settings > Privacy & Safety > Who can send you friend requests',
                    'Settings > Privacy & Safety > Who can add you to servers',
                    'Settings > Privacy & Safety > Data Request - download your data',
                    'Settings > Privacy & Safety > Use data to improve Discord - turn off',
                    'Settings > Privacy & Safety > Use data for personalized tips - turn off',
                    'Review server memberships and leave unnecessary servers',
                    'Settings > Connections - review and remove unnecessary connections',
                    'Enable two-factor authentication for account security'
                ]
            },
            reddit: {
                settingsUrl: 'https://www.reddit.com/settings/privacy',
                difficulty: 'Easy',
                timeEstimate: '5-10 minutes',
                steps: [
                    'Settings > Privacy Options > Make your posts visible to search engines - turn off',
                    'Settings > Privacy Options > Let other users show your profile - turn off',
                    'Settings > Privacy Options > Personalize ads based on activity - turn off',
                    'Settings > Privacy Options > Personalize ads based on information - turn off',
                    'Settings > Chat & Messaging > Who can send you chat requests',
                    'Review post history and delete sensitive content',
                    'Settings > Notifications > Manage email notifications',
                    'Consider using a separate email for Reddit account'
                ]
            },
            pinterest: {
                settingsUrl: 'https://www.pinterest.com/settings/privacy/',
                difficulty: 'Easy',
                timeEstimate: '5-10 minutes',
                steps: [
                    'Settings > Privacy > Search Privacy - turn off search engine indexing',
                    'Settings > Privacy > Social Permissions - limit social features',
                    'Settings > Privacy > Ad Privacy - turn off personalized ads',
                    'Settings > Account Settings > Visibility - make profile private',
                    'Review boards and make personal boards secret',
                    'Settings > Privacy > Data Export - download your data',
                    'Delete pins with personal information',
                    'Review following/followers and clean up connections'
                ]
            }
        };

        return instructions[platformId] || {
            settingsUrl: '#',
            difficulty: 'Unknown',
            timeEstimate: 'Varies',
            steps: ['Platform-specific instructions not available']
        };
    }

    /**
     * Calculate overall privacy score
     */
    static calculatePrivacyScore(platforms) {
        // Base score calculation - more platforms optimized = higher score
        const maxPossibleOptimizations = platforms.length * 12; // Assume average 12 optimizations per platform
        const totalOptimizations = platforms.reduce((total, platform) => 
            total + platform.optimizations.length, 0);
        
        return Math.min(100, Math.round((totalOptimizations / maxPossibleOptimizations) * 100));
    }

    /**
     * Generate comprehensive privacy checklist
     */
    static generatePrivacyChecklist() {
        return {
            critical: [
                'Make profiles private/friends-only where possible',
                'Turn off location sharing and clear location history', 
                'Disable ad personalization and data sharing',
                'Remove personal information from bio/about sections',
                'Review and delete old posts with sensitive content'
            ],
            important: [
                'Turn off contact syncing and phone/email discovery',
                'Limit who can tag you in photos and posts',
                'Disable face recognition features',
                'Remove unnecessary third-party app connections',
                'Set up two-factor authentication for security'
            ],
            recommended: [
                'Regularly review and clean up friend/follower lists',
                'Download your data to see what platforms have collected',
                'Use privacy-focused browsers and extensions',
                'Consider using separate email addresses for social media',
                'Regularly audit your digital footprint'
            ]
        };
    }

    /**
     * Get platform-specific data deletion instructions
     */
    static getDataDeletionInstructions(platformId) {
        const deletionInstructions = {
            facebook: {
                accountDeletion: 'https://www.facebook.com/help/delete_account',
                dataDownload: 'https://www.facebook.com/dyi',
                steps: [
                    'Download your data first (Settings > Your Facebook Information)',
                    'Delete individual posts using Activity Log',
                    'Remove photos and videos manually',
                    'Delete account: Settings > Your Facebook Information > Deactivation and Deletion',
                    'Choose "Delete Account" and follow confirmation steps',
                    'Account deletion takes 30 days to complete'
                ],
                timeline: '30 days',
                reversible: 'Yes, within 30 days'
            },
            instagram: {
                accountDeletion: 'https://help.instagram.com/370452623149242',
                dataDownload: 'https://help.instagram.com/181231772500920',
                steps: [
                    'Download your data (Settings > Security > Download Data)',
                    'Delete posts, stories, and highlights manually if desired',
                    'Go to Delete Your Account page (must use web browser)',
                    'Select reason for deletion and enter password',
                    'Click "Delete Account" to confirm',
                    'Account deletion takes 30 days to complete'
                ],
                timeline: '30 days',
                reversible: 'Yes, within 30 days'
            },
            twitter: {
                accountDeletion: 'https://help.twitter.com/en/managing-your-account/how-to-deactivate-twitter-account',
                dataDownload: 'https://help.twitter.com/en/managing-your-account/how-to-download-your-twitter-archive',
                steps: [
                    'Download your Twitter data first (Settings > Your account > Download data)',
                    'Delete individual tweets if preferred (use third-party tools for bulk deletion)',
                    'Settings > Your account > Deactivate your account',
                    'Follow deactivation prompts and confirm',
                    'Account stays deactivated for 30 days before permanent deletion',
                    'Can reactivate by logging in within 30 days'
                ],
                timeline: '30 days',
                reversible: 'Yes, within 30 days'
            },
            linkedin: {
                accountDeletion: 'https://www.linkedin.com/help/linkedin/answer/63',
                dataDownload: 'https://www.linkedin.com/help/linkedin/answer/50191',
                steps: [
                    'Download your data (Settings > Get a copy of your data)',
                    'Settings > Account > Closing your LinkedIn account',
                    'Select reason for closing account',
                    'Enter password and click "Close account"',
                    'Account deletion is immediate but data removal takes time',
                    'Some data may remain in backups for up to 20 days'
                ],
                timeline: 'Immediate',
                reversible: 'No, deletion is permanent'
            },
            tiktok: {
                accountDeletion: 'https://support.tiktok.com/en/account-and-privacy/deleting-an-account',
                dataDownload: 'https://support.tiktok.com/en/account-and-privacy/personalized-ads-and-data/requesting-your-data',
                steps: [
                    'Download your data (Settings > Privacy > Download your data)',
                    'Settings > Manage account > Delete account',
                    'Follow verification steps (may require SMS verification)',
                    'Account enters 30-day deactivation period',
                    'After 30 days, account and data are permanently deleted',
                    'Can reactivate by logging in within 30 days'
                ],
                timeline: '30 days',
                reversible: 'Yes, within 30 days'
            }
        };

        return deletionInstructions[platformId] || {
            steps: ['Visit platform settings to find account deletion options'],
            timeline: 'Varies by platform',
            reversible: 'Check platform policy'
        };
    }
}

// Additional utility class for social media footprint scanning
class FootprintScanner {
    static async scanDigitalFootprint() {
        const result = {
            privacyScore: 0,
            exposureLevel: 'Unknown',
            riskFactors: 0,
            scoreBreakdown: [],
            recommendations: []
        };

        try {
            // Analyze browser privacy settings
            const browserScore = await this.analyzeBrowserPrivacy();
            
            // Check for common tracking elements
            const trackingScore = this.analyzeTrackingExposure();
            
            // Assess local data exposure
            const dataScore = this.analyzeLocalDataExposure();
            
            // Calculate overall scores
            result.scoreBreakdown = [
                { category: 'Browser Privacy', score: browserScore },
                { category: 'Tracking Protection', score: trackingScore },
                { category: 'Data Exposure', score: dataScore }
            ];

            result.privacyScore = Math.round((browserScore + trackingScore + dataScore) / 3);
            result.exposureLevel = this.getExposureLevel(result.privacyScore);
            result.riskFactors = this.countRiskFactors(result.scoreBreakdown);
            result.recommendations = this.generateRecommendations(result);

        } catch (error) {
            console.error('Footprint scan error:', error);
            result.privacyScore = 50;
            result.exposureLevel = 'Unknown';
            result.recommendations = ['Unable to complete scan. Check browser permissions.'];
        }

        return result;
    }

    static async analyzeBrowserPrivacy() {
        let score = 100;
        
        // Check Do Not Track
        if (navigator.doNotTrack !== '1') {
            score -= 10;
        }
        
        // Check cookie settings (simplified)
        if (navigator.cookieEnabled) {
            score -= 15; // Cookies enabled reduces privacy score
        }
        
        // Check for geolocation access
        if ('geolocation' in navigator) {
            score -= 10; // Geolocation available reduces score
        }
        
        // Check for local storage
        try {
            if (localStorage && localStorage.length > 10) {
                score -= 15; // Lots of stored data reduces score
            }
        } catch (e) {
            // Storage blocked - good for privacy
            score += 5;
        }

        return Math.max(0, Math.min(100, score));
    }

    static analyzeTrackingExposure() {
        let score = 100;
        
        // Check for common tracking scripts
        const scripts = document.querySelectorAll('script[src]');
        const trackers = ['google-analytics', 'facebook', 'doubleclick', 'googletagmanager'];
        
        scripts.forEach(script => {
            const src = script.src.toLowerCase();
            trackers.forEach(tracker => {
                if (src.includes(tracker)) {
                    score -= 5;
                }
            });
        });

        // Check for tracking pixels
        const images = document.querySelectorAll('img[src*="track"], img[src*="pixel"]');
        score -= images.length * 3;

        return Math.max(0, Math.min(100, score));
    }

    static analyzeLocalDataExposure() {
        let score = 100;
        
        try {
            // Check localStorage usage
            if (localStorage) {
                score -= Math.min(20, localStorage.length * 2);
            }
            
            // Check sessionStorage
            if (sessionStorage) {
                score -= Math.min(10, sessionStorage.length);
            }
            
            // Check for cookies
            const cookieCount = document.cookie.split(';').length;
            score -= Math.min(30, cookieCount * 2);
            
        } catch (error) {
            // If we can't access storage, privacy is better
            score += 10;
        }

        return Math.max(0, Math.min(100, score));
    }

    static getExposureLevel(score) {
        if (score >= 80) return 'Low';
        if (score >= 60) return 'Moderate';
        if (score >= 40) return 'High';
        return 'Very High';
    }

    static countRiskFactors(breakdown) {
        return breakdown.filter(item => item.score < 60).length;
    }

    static generateRecommendations(result) {
        const recommendations = [];
        
        if (result.privacyScore < 60) {
            recommendations.push('Enable Do Not Track in browser settings');
            recommendations.push('Install privacy-focused browser extensions');
            recommendations.push('Clear cookies and local storage regularly');
        }
        
        if (result.riskFactors > 1) {
            recommendations.push('Review and optimize social media privacy settings');
            recommendations.push('Use incognito/private browsing for sensitive activities');
        }
        
        recommendations.push('Regularly audit your digital footprint');
        recommendations.push('Consider using a VPN for additional privacy');
        
        return recommendations;
    }
}

// Export classes for use in other modules
if (typeof window !== 'undefined') {
    window.SocialMediaOptimizer = SocialMediaOptimizer;
    window.FootprintScanner = FootprintScanner;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SocialMediaOptimizer, FootprintScanner };
}
