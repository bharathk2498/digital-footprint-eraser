# Contributing to Digital Footprint Eraser

We're thrilled that you're interested in contributing to Digital Footprint Eraser! This document provides guidelines and information about how to contribute to this privacy-focused project.

## 🌟 Ways to Contribute

### 🐛 Bug Reports
- Use the [GitHub Issues](https://github.com/bharathk2498/digital-footprint-eraser/issues) page
- Search existing issues before creating a new one
- Provide detailed reproduction steps
- Include browser version, OS, and extension version (if applicable)

### 💡 Feature Requests
- Describe the privacy problem you're trying to solve
- Explain how your feature would benefit users
- Consider the privacy implications of your request
- Check if similar features are already planned in our roadmap

### 🔧 Code Contributions
- Fork the repository
- Create a feature branch
- Write clean, documented code
- Add tests where appropriate
- Submit a pull request

### 📚 Documentation
- Improve user guides and documentation
- Translate content to other languages
- Create tutorials and examples
- Update API documentation

### 🏢 Data Broker Database
- Add new data broker websites to our database
- Update removal URLs and procedures
- Test and verify removal processes
- Document new legal requirements

## 🚀 Getting Started

### Prerequisites
- Git for version control
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor (VS Code, Vim, etc.)
- Basic knowledge of HTML, CSS, JavaScript
- Understanding of privacy concepts

### Development Setup
```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/digital-footprint-eraser.git
cd digital-footprint-eraser

# 3. Add upstream remote
git remote add upstream https://github.com/bharathk2498/digital-footprint-eraser.git

# 4. Create a development branch
git checkout -b feature/your-feature-name

# 5. Start development server (optional)
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Browser Extension Development
```bash
# Load extension in Chrome for testing
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the extension/ folder

# Test PWA functionality
# 1. Open the web app in browser
# 2. Test offline functionality
# 3. Test installation prompts
```

## 📋 Development Guidelines

### Code Style
- Use modern JavaScript (ES6+)
- Follow consistent indentation (2 spaces)
- Use meaningful variable and function names
- Add comments for complex logic
- Maintain 100% local processing - no external API calls for core functionality

### JavaScript Guidelines
```javascript
// ✅ Good: Clear, privacy-focused function
async function removeTrackingCookies(domain) {
  const cookies = await getCookiesForDomain(domain);
  return await deleteCookies(cookies.filter(isTrackingCookie));
}

// ❌ Bad: Unclear purpose, potential privacy issue
async function sendData(data) {
  return await fetch('/api/collect', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  });
}
```

### CSS Guidelines
- Use CSS custom properties for theming
- Follow mobile-first responsive design
- Maintain dark theme compatibility
- Use semantic class names
- Optimize for performance

### Privacy Guidelines
- **NEVER** transmit user data to external servers
- **ALWAYS** process data locally in the browser
- **CLEARLY** document what data is accessed and why
- **MINIMIZE** data collection and storage
- **RESPECT** user choices and consent

## 🔐 Security Requirements

### Secure Coding Practices
- Validate all user inputs
- Use Content Security Policy
- Avoid eval() and innerHTML with user data
- Implement proper error handling
- Use HTTPS for any external resources

### Privacy-First Development
```javascript
// ✅ Privacy-compliant: Local processing only
function analyzePrivacyRisk(browserData) {
  // All analysis happens locally
  const score = calculateLocalPrivacyScore(browserData);
  return { score, recommendations: getLocalRecommendations(score) };
}

// ❌ Privacy violation: External data transmission
function analyzePrivacyRisk(browserData) {
  // DON'T DO THIS - violates our privacy principles
  return fetch('/api/analyze', {
    method: 'POST',
    body: JSON.stringify(browserData)
  });
}
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Cookie cleanup works across different browsers
- [ ] Privacy scanner accurately detects tracking
- [ ] Data broker removal generates correct emails
- [ ] Extension popup functions correctly
- [ ] PWA installs and works offline
- [ ] No console errors in any browser
- [ ] Privacy protection doesn't break legitimate websites

### Browser Testing Matrix
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Web App | ✅ | ✅ | ✅ | ✅ |
| Extension | ✅ | ✅ | ❌ | ✅ |
| PWA | ✅ | ✅ | ✅ | ✅ |

### Testing Guidelines
```javascript
// Test privacy scanner accuracy
describe('Privacy Scanner', () => {
  it('should detect tracking cookies correctly', () => {
    const mockCookies = [
      { name: 'session', domain: 'example.com' },
      { name: '_ga', domain: 'google-analytics.com' }
    ];
    const result = analyzeTrackingCookies(mockCookies);
    expect(result.trackingCookies).toHaveLength(1);
    expect(result.trackingCookies[0].name).toBe('_ga');
  });
});
```

## 🏢 Data Broker Contributions

### Adding New Data Brokers
1. Research legitimate data broker websites
2. Verify they actually collect personal information
3. Find their privacy policy and opt-out procedures
4. Test the removal process manually
5. Add entry to `assets/data/data-brokers.json`

### Data Broker Entry Format
```json
{
  "id": "unique-identifier",
  "name": "Data Broker Name",
  "category": "people_search",
  "domain": "example.com",
  "description": "Brief description of what data they collect",
  "removal_url": "https://example.com/opt-out",
  "removal_method": "form",
  "removal_difficulty": "easy",
  "legal_basis": ["GDPR", "CCPA"],
  "verified_date": "2025-07-20",
  "instructions": [
    "Visit the opt-out page",
    "Fill in your information",
    "Submit the form"
  ]
}
```

### Verification Process
- Test removal URLs are working
- Verify removal forms accept submissions
- Document any special requirements
- Note response times and confirmation methods

## 📝 Documentation Contributions

### Documentation Standards
- Write in clear, simple English
- Include code examples where helpful
- Add screenshots for UI instructions
- Keep security and privacy in mind
- Update table of contents when needed

### Writing Guidelines
```markdown
# ✅ Good: Clear, actionable instruction
## How to Block Social Media Trackers

1. Open the extension popup
2. Click "Block Social Trackers"
3. Confirm the action when prompted

This will remove Facebook, Twitter, and LinkedIn tracking widgets from the current page.

# ❌ Bad: Vague, unhelpful instruction
## Social Stuff

Click things to make privacy better maybe.
```

## 🔄 Pull Request Process

### Before Submitting
- [ ] Code follows our style guidelines
- [ ] All tests pass (if applicable)
- [ ] Documentation is updated
- [ ] Privacy implications are considered
- [ ] No external data transmission added
- [ ] Browser compatibility verified

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Data broker addition
- [ ] Security improvement

## Privacy Impact
- [ ] No privacy impact
- [ ] Improves user privacy
- [ ] Changes how data is processed (explain below)

## Testing
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested extension functionality
- [ ] Tested PWA functionality

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No external API calls added
```

### Review Process
1. Automated checks run automatically
2. Privacy review by maintainers
3. Code review and feedback
4. Security assessment if needed
5. Final approval and merge

## 🌍 Internationalization

### Adding Translations
1. Create language file in `i18n/` directory
2. Follow existing JSON structure
3. Translate all user-facing strings
4. Test UI with longer translations
5. Consider right-to-left languages if applicable

### Translation Guidelines
- Maintain the privacy-focused tone
- Use culturally appropriate language
- Keep technical terms consistent
- Consider local privacy laws and regulations

## 📋 Issue Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature or request |
| `documentation` | Improvements to docs |
| `privacy` | Privacy-related concerns |
| `security` | Security vulnerabilities |
| `data-broker` | Data broker database updates |
| `extension` | Browser extension issues |
| `pwa` | Progressive Web App issues |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |

## 🏆 Recognition

### Contributors
- All contributors are listed in our README
- Significant contributions are highlighted in release notes
- Privacy researchers receive special recognition

### Attribution
- Code contributions maintain original authorship
- Documentation improvements are credited
- Data broker research is acknowledged

## ❓ Questions?

### Getting Help
- Join our [GitHub Discussions](https://github.com/bharathk2498/digital-footprint-eraser/discussions)
- Ask questions in existing issues
- Read our documentation thoroughly first

### Contact Information
- **Privacy Questions**: privacy@digitalfootprinteraser.com
- **Security Issues**: security@digitalfootprinteraser.com  
- **General Contributions**: Open a GitHub issue

## 📜 Legal Considerations

### Contributor License Agreement
By contributing, you agree that:
- Your contributions will be licensed under the MIT License
- You have the right to submit your contributions
- Your contributions don't violate any third-party rights

### Privacy Commitment
All contributors must respect our privacy-first principles:
- No user data leaves the user's device
- All processing happens locally
- User consent and control are paramount
- Transparency in all data handling

## 🎯 Contribution Areas

### High Priority
- 🔍 **Privacy scanner improvements** - Better detection algorithms
- 🏢 **Data broker database** - More removal sites and verification
- 🌐 **Browser compatibility** - Better cross-browser support
- 📱 **Mobile experience** - PWA and responsive design improvements

### Medium Priority
- 🧪 **Testing infrastructure** - Automated testing setup
- 📚 **Documentation** - User guides and developer docs
- 🌍 **Internationalization** - Multi-language support
- 🎨 **UI/UX improvements** - Better user experience

### Expert Level
- 🔐 **Security hardening** - Advanced security features
- ⚡ **Performance optimization** - Faster scanning and cleanup
- 🤖 **Advanced privacy detection** - Machine learning approaches
- 🏢 **Enterprise features** - Business and compliance tools

---

Thank you for contributing to Digital Footprint Eraser! Together, we're building a more private internet. 🔐✨