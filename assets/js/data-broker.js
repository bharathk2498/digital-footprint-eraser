/**
 * Data Broker Removal Module
 * Handles generation of removal requests for major data brokers
 */

class DataBrokerRemover {
    static async generateRemovalRequests(personalInfo) {
        const result = {
            totalRequests: 0,
            emailsGenerated: 0,
            priorityBrokers: [],
            allBrokers: [],
            templates: {},
            message: ''
        };

        try {
            // Load data broker database
            const brokers = await this.loadDataBrokers();
            
            // Filter and prioritize brokers
            const priorityBrokers = this.prioritizeBrokers(brokers, personalInfo);
            
            // Generate removal templates
            const templates = this.generateEmailTemplates(personalInfo, priorityBrokers);
            
            result.totalRequests = priorityBrokers.length;
            result.emailsGenerated = Object.keys(templates).length;
            result.priorityBrokers = priorityBrokers.slice(0, 10); // Top 10 for display
            result.allBrokers = brokers;
            result.templates = templates;
            result.message = `Generated ${result.totalRequests} removal requests for major data brokers.`;

        } catch (error) {
            console.error('Data broker removal error:', error);
            result.message = 'Failed to generate removal requests. Using fallback broker list.';
            result.priorityBrokers = this.getFallbackBrokers();
        }

        return result;
    }

    /**
     * Load data broker database
     */
    static async loadDataBrokers() {
        try {
            // Try to load from external JSON file
            const response = await fetch('assets/data/data-brokers.json');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('Could not load external broker database:', error);
        }

        // Fallback to embedded database
        return this.getEmbeddedBrokerDatabase();
    }

    /**
     * Embedded data broker database (top priority brokers)
     */
    static getEmbeddedBrokerDatabase() {
        return [
            // People Search Sites
            {
                name: "Spokeo",
                category: "People Search",
                url: "https://www.spokeo.com/opt-out",
                email: "customercare@spokeo.com",
                priority: 10,
                method: "online_form",
                requirements: ["name", "email", "address"],
                description: "Major people search engine with extensive personal data"
            },
            {
                name: "WhitePages",
                category: "People Search", 
                url: "https://www.whitepages.com/suppression-requests",
                email: "support@whitepages.com",
                priority: 10,
                method: "online_form",
                requirements: ["name", "phone", "address"],
                description: "Leading directory service with phone and address data"
            },
            {
                name: "BeenVerified",
                category: "Background Check",
                url: "https://www.beenverified.com/app/optout/search",
                email: "optout@beenverified.com",
                priority: 9,
                method: "online_form",
                requirements: ["name", "email", "address"],
                description: "Background check service with criminal and public records"
            },
            {
                name: "Intelius",
                category: "Background Check",
                url: "https://www.intelius.com/opt-out/submit/",
                email: "privacy@intelius.com",
                priority: 9,
                method: "online_form",
                requirements: ["name", "email"],
                description: "Background screening and people search platform"
            },
            {
                name: "PeopleFinder",
                category: "People Search",
                url: "https://www.peoplefinder.com/opt-out",
                email: "optout@peoplefinder.com",
                priority: 8,
                method: "online_form",
                requirements: ["name", "email", "address"],
                description: "People search with social media and contact information"
            },
            {
                name: "TruePeopleSearch",
                category: "People Search",
                url: "https://www.truepeoplesearch.com/removal",
                email: "support@truepeoplesearch.com",
                priority: 9,
                method: "online_form",
                requirements: ["name", "address"],
                description: "Free people search with detailed personal information"
            },
            {
                name: "FastPeopleSearch",
                category: "People Search",
                url: "https://www.fastpeoplesearch.com/removal",
                email: "removal@fastpeoplesearch.com",
                priority: 8,
                method: "email",
                requirements: ["name", "address"],
                description: "Fast people search with current and historical data"
            },
            {
                name: "InstantCheckmate",
                category: "Background Check",
                url: "https://www.instantcheckmate.com/opt-out/",
                email: "privacy@instantcheckmate.com",
                priority: 8,
                method: "online_form",
                requirements: ["name", "email"],
                description: "Background check service with criminal records"
            },
            {
                name: "MyLife",
                category: "People Search",
                url: "https://www.mylife.com/privacy-policy",
                email: "privacy@mylife.com",
                priority: 7,
                method: "email",
                requirements: ["name", "email"],
                description: "Social network-style people search with reputation scores"
            },
            {
                name: "FamilyTreeNow",
                category: "Genealogy",
                url: "https://www.familytreenow.com/optout",
                email: "support@familytreenow.com",
                priority: 7,
                method: "online_form",
                requirements: ["name", "address"],
                description: "Free family tree service with public records"
            },

            // Data Aggregators
            {
                name: "Acxiom",
                category: "Data Aggregator",
                url: "https://isapps.acxiom.com/optout/optout.aspx",
                email: "privacy@acxiom.com",
                priority: 10,
                method: "online_form",
                requirements: ["name", "email", "address"],
                description: "Major data broker supplying information to other companies"
            },
            {
                name: "LexisNexis",
                category: "Data Aggregator",
                url: "https://optout.lexisnexis.com/",
                email: "privacy@lexisnexis.com",
                priority: 10,
                method: "online_form",
                requirements: ["name", "address"],
                description: "Professional data provider for legal and business use"
            },
            {
                name: "Epsilon",
                category: "Marketing Data",
                url: "https://www.epsilon.com/privacy-policy",
                email: "privacy@epsilon.com",
                priority: 8,
                method: "email",
                requirements: ["name", "email"],
                description: "Marketing data provider for targeted advertising"
            },
            {
                name: "Experian",
                category: "Credit Bureau",
                url: "https://www.experian.com/privacy/opt-out",
                email: "privacy@experian.com",
                priority: 9,
                method: "online_form",
                requirements: ["name", "address", "ssn_partial"],
                description: "Credit bureau with extensive financial and personal data"
            },
            {
                name: "TransUnion",
                category: "Credit Bureau", 
                url: "https://www.transunion.com/privacy/personal-information-disclosures",
                email: "privacy@transunion.com",
                priority: 9,
                method: "phone",
                requirements: ["name", "address"],
                description: "Credit reporting agency with financial profiles"
            }
        ];
    }

    /**
     * Prioritize brokers based on risk level and data exposure
     */
    static prioritizeBrokers(brokers, personalInfo) {
        return brokers
            .filter(broker => {
                // Check if we have required information for this broker
                return broker.requirements.every(req => {
                    switch(req) {
                        case 'name': return personalInfo.firstName && personalInfo.lastName;
                        case 'email': return personalInfo.email;
                        case 'phone': return personalInfo.phone;
                        case 'address': return personalInfo.address;
                        case 'ssn_partial': return false; // Never require SSN
                        default: return true;
                    }
                });
            })
            .sort((a, b) => b.priority - a.priority);
    }

    /**
     * Generate email templates for removal requests
     */
    static generateEmailTemplates(personalInfo, brokers) {
        const templates = {};

        brokers.forEach(broker => {
            templates[broker.name] = this.createEmailTemplate(personalInfo, broker);
        });

        return templates;
    }

    /**
     * Create individual email template
     */
    static createEmailTemplate(personalInfo, broker) {
        const subject = `Data Removal Request - ${personalInfo.firstName} ${personalInfo.lastName}`;
        
        let body = `Dear ${broker.name} Privacy Team,

I am writing to request the complete removal of my personal information from your database and any associated services.

PERSONAL INFORMATION TO REMOVE:
- Full Name: ${personalInfo.firstName} ${personalInfo.lastName}`;

        if (personalInfo.email) {
            body += `\n- Email Address: ${personalInfo.email}`;
        }

        if (personalInfo.phone) {
            body += `\n- Phone Number: ${personalInfo.phone}`;
        }

        if (personalInfo.address) {
            body += `\n- Address: ${personalInfo.address}`;
        }

        body += `

LEGAL BASIS FOR REQUEST:
I am requesting this removal under applicable privacy laws including:
- California Consumer Privacy Act (CCPA)
- General Data Protection Regulation (GDPR) if applicable
- Other applicable state and federal privacy regulations

REQUESTED ACTIONS:
1. Remove all personal information associated with the above details
2. Remove information from all affiliated websites and databases
3. Ensure information is not sold or transferred to third parties
4. Confirm completion of removal within 30 days
5. Implement suppression to prevent future data collection

I understand this request covers all current and historical data you may have collected, purchased, or obtained about me from any source.

Please confirm receipt of this request and provide a timeline for completion. If you require additional verification, please contact me at this email address.

If you do not remove my information within 30 days, I will file complaints with relevant regulatory authorities and consider additional legal action.

Thank you for your prompt attention to this matter.

Sincerely,
${personalInfo.firstName} ${personalInfo.lastName}

---
Date: ${new Date().toLocaleDateString()}
Reference: Data Removal Request - ${broker.name}`;

        return {
            to: broker.email,
            subject: subject,
            body: body,
            method: broker.method,
            url: broker.url,
            priority: broker.priority
        };
    }

    /**
     * Generate comprehensive email file for download
     */
    static generateEmailTemplates(result) {
        let emailContent = `DATA BROKER REMOVAL EMAIL TEMPLATES
Generated on: ${new Date().toLocaleDateString()}
Total Templates: ${Object.keys(result.templates).length}

INSTRUCTIONS:
1. Copy each email template below
2. Send to the specified email address
3. Keep records of sent emails and responses
4. Follow up if no response within 30 days
5. Use online forms when email is not sufficient

===========================================

`;

        Object.entries(result.templates).forEach(([brokerName, template], index) => {
            emailContent += `EMAIL ${index + 1}: ${brokerName.toUpperCase()}
==========================================

TO: ${template.to}
SUBJECT: ${template.subject}

METHOD: ${template.method.toUpperCase()}
${template.method === 'online_form' ? `FORM URL: ${template.url}` : ''}
${template.method === 'phone' ? `NOTE: This broker requires phone contact` : ''}

MESSAGE:
${template.body}

==========================================

`;
        });

        emailContent += `ADDITIONAL TIPS:
- Send emails from the address you want removed
- Keep copies of all correspondence
- Check spam folders for responses
- Some brokers may require additional verification
- Process can take 30-90 days for complete removal
- Consider using certified mail for high-priority removals

FOLLOW-UP SCHEDULE:
- Week 2: Check for acknowledgment emails
- Week 4: Send follow-up if no response
- Week 8: Contact regulatory authorities if non-compliant
- Week 12: Consider legal consultation if necessary

Generated by Digital Footprint Eraser
https://github.com/yourusername/digital-footprint-eraser`;

        return emailContent;
    }

    /**
     * Get fallback broker list when database fails to load
     */
    static getFallbackBrokers() {
        return [
            {
                name: "Spokeo",
                category: "People Search",
                url: "https://www.spokeo.com/opt-out",
                priority: 10
            },
            {
                name: "WhitePages", 
                category: "People Search",
                url: "https://www.whitepages.com/suppression-requests",
                priority: 10
            },
            {
                name: "BeenVerified",
                category: "Background Check",
                url: "https://www.beenverified.com/app/optout/search",
                priority: 9
            },
            {
                name: "Acxiom",
                category: "Data Aggregator",
                url: "https://isapps.acxiom.com/optout/optout.aspx",
                priority: 10
            },
            {
                name: "LexisNexis",
                category: "Data Aggregator", 
                url: "https://optout.lexisnexis.com/",
                priority: 10
            }
        ];
    }
}

// Export the class for use in other modules
if (typeof window !== 'undefined') {
    window.DataBrokerRemover = DataBrokerRemover;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataBrokerRemover;
}
