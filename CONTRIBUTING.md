# Contributing to Digital Footprint Eraser

Thank you for your interest in contributing to Digital Footprint Eraser! This project is built by privacy advocates, for privacy advocates. Every contribution helps make the internet a more private place.

## 🎯 Project Mission

**Digital Footprint Eraser** aims to be the most comprehensive, privacy-focused tool for complete digital cleanup. Our core principles:

- **Privacy First**: Zero data collection, 100% local processing
- **Open Source**: Complete transparency through open development
- **User Empowerment**: Give users control over their digital privacy
- **Accessibility**: Privacy protection should be available to everyone
- **Security**: Robust protection against all forms of tracking

## 🚀 Quick Start for Contributors

### Prerequisites
- Basic knowledge of **HTML5**, **CSS3**, and **JavaScript**
- Understanding of **privacy concepts** and **browser security**
- **Git** for version control
- Text editor or IDE of your choice

### Setting Up Development Environment

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/digital-footprint-eraser.git
cd digital-footprint-eraser

# 3. Set up upstream remote
git remote add upstream https://github.com/bharathk2498/digital-footprint-eraser.git

# 4. Start development server
python3 -m http.server 8000
# Open http://localhost:8000

# 5. For extension development
# Load extension/manifest.json in browser developer mode
```

## 📋 Ways to Contribute

### 🐛 Bug Reports
Found a bug? Help us fix it!

**Before submitting:**
- Check if the issue already exists
- Test on multiple browsers if possible
- Gather detailed reproduction steps

**When reporting:**
- Use the bug report template
- Include browser version and OS
- Provide screenshots if relevant
- Describe expected vs actual behavior

### ✨ Feature Requests
Have ideas for new privacy features?

**Guidelines:**
- Align with our privacy-first principles
- Consider impact on all user types
- Provide clear use cases and benefits
- Consider technical feasibility

### 📝 Documentation Improvements
Help make our docs better!

**Areas needing help:**
- User guides and tutorials
- Technical documentation
- Translation to other languages
- Video tutorials and examples

### 💻 Code Contributions
Ready to write some code?

**Priority Areas:**
- New data broker integrations
- Browser compatibility improvements
- Performance optimizations
- Accessibility enhancements
- Mobile experience improvements

## 🛠️ Development Guidelines

### Code Structure

```
digital-footprint-eraser/
├── 📄 index.html              # Main web application
├── 📄 manifest.json           # PWA configuration  
├── 📄 sw.js                   # Service worker
├── 📁 assets/
│   ├── 📁 css/               # Stylesheets
│   │   ├── style.css         # Main styles
│   │   └── components.css    # Component styles
│   ├── 📁 js/                # JavaScript modules
│   │   ├── app.js            # Main application logic
│   │   ├── cookie-cleaner.js # Cookie cleanup module
│   │   ├── data-broker.js    # Data broker removal
│   │   ├── social-cleanup.js # Social media optimization
│   │   └── footprint-scanner.js # Privacy analysis
│   ├── 📁 data/              # Data files
│   │   └── data-brokers.json # Broker database
│   └── 📁 images/            # Assets and icons
├── 📁 extension/             # Browser extension
│   ├── manifest.json         # Extension manifest
│   ├── background.js         # Background script
│   ├── content.js           # Content script
│   ├── popup.html/js/css    # Extension popup
│   ├── options.html         # Settings page
│   └── rules.json           # Blocking rules
└── 📁 docs/                  # Documentation
    ├── PRIVACY_POLICY.md     # Privacy policy
    ├── USER_GUIDE.md         # User manual
    └── INSTALLATION.md       # Setup guide
```

### Coding Standards

#### JavaScript
```javascript
// Use modern ES6+ features
const scanResults = await FootprintScanner.scan();

// Clear, descriptive variable names
const trackersBlocked = 0;
const privacyScore = calculateScore(results);

// Comprehensive error handling
try {
    const results = await performCleanup();
    showSuccess('Cleanup completed successfully!');
} catch (error) {
    console.error('Cleanup failed:', error);
    showError('Cleanup encountered an error');
}

// Privacy-first principle: No external calls
// ❌ BAD
fetch('https://external-api.com/track');

// ✅ GOOD
const results = analyzeLocalData();
```

#### CSS
```css
/* Use CSS custom properties */
:root {
    --primary-color: #6366f1;
    --text-primary: #f8fafc;
    --border-radius: 8px;
}

/* Mobile-first responsive design */
.component {
    /* Base mobile styles */
}

@media (min-width: 768px) {
    .component {
        /* Tablet and desktop styles */
    }
}

/* Accessible focus states */
button:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}
```

#### HTML
```html
<!-- Semantic HTML5 structure -->
<main class="main-app">
    <section class="cleanup-section">
        <h2>Cookie Cleanup</h2>
        <!-- Use proper heading hierarchy -->
    </section>
</main>

<!-- Accessibility attributes -->
<button aria-label="Start privacy cleanup" class="btn-primary">
    <i class="fas fa-broom" aria-hidden="true"></i>
    Clean Now
</button>

<!-- Progressive enhancement -->
<noscript>
    <p>This application requires JavaScript for full functionality.</p>
</noscript>
```

### Privacy-First Development

#### ✅ Privacy-Compliant Practices
```javascript
// Local storage only
localStorage.setItem('userSettings', JSON.stringify(settings));

// Client-side processing
const analysisResults = analyzeLocalData();

// No external tracking
console.log('Privacy scan completed'); // Internal logging only

// User consent for any data processing
if (userConsented) {
    performAdvancedScan();
}
```

#### ❌ Privacy Violations to Avoid
```javascript
// Never send data externally
fetch('https://analytics.com/track', {
    method: 'POST',
    body: JSON.stringify(userData) // ❌ NEVER DO THIS
});

// Never include external tracking
<script src="https://google-analytics.com/ga.js"></script> // ❌ FORBIDDEN

// Never store sensitive data
localStorage.setItem('password', userPassword); // ❌ NEVER STORE SENSITIVE DATA
```

### Browser Extension Guidelines

#### Manifest V3 Best Practices
```json
{
    "manifest_version": 3,
    "permissions": [
        // Only request minimal necessary permissions
        "storage",
        "cookies",
        "activeTab"
    ],
    "host_permissions": [
        // Be specific about host permissions
        "*://*.tracking-site.com/*"
    ]
}
```

#### Content Script Guidelines
```javascript
// Minimal performance impact
const observer = new MutationObserver(handleDOMChanges);
observer.observe(document.body, { 
    childList: true, 
    subtree: false // Don't observe everything
});

// Graceful error handling
try {
    blockTrackingElements();
} catch (error) {
    console.warn('Could not block trackers:', error);
    // Continue execution - don't break the page
}
```

## 🧪 Testing Guidelines

### Manual Testing Checklist

#### Core Functionality
- [ ] Cookie cleanup removes all targeted cookies
- [ ] Data broker templates generate correctly
- [ ] Social media guides display properly
- [ ] Privacy scanner calculates accurate scores
- [ ] PWA installs and works offline
- [ ] Extension functions in all supported browsers

#### Privacy Compliance
- [ ] No external network requests in core functionality
- [ ] All data processing happens locally
- [ ] No analytics or tracking code present
- [ ] User data never transmitted externally
- [ ] Sensitive data is never stored

#### Cross-Browser Testing
- [ ] Chrome/Chromium (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)

#### Device Testing
- [ ] Desktop (Windows, macOS, Linux)
- [ ] Tablet (iPad, Android)
- [ ] Mobile (iOS, Android)

#### Accessibility Testing
- [ ] Keyboard navigation works completely
- [ ] Screen reader compatibility
- [ ] High contrast mode support
- [ ] Reduced motion preferences respected

### Automated Testing

```bash
# Run basic validation
npm run test

# Check code quality
npm run lint

# Validate PWA
npm run pwa-audit

# Test extension
npm run test-extension
```

## 📖 Documentation Standards

### User Documentation
- **Clear language**: Avoid technical jargon
- **Step-by-step instructions**: Include screenshots
- **Multiple skill levels**: Beginner to advanced
- **Cross-platform**: Cover all supported systems

### Technical Documentation
- **Code comments**: Explain complex logic
- **API documentation**: Document all public functions
- **Architecture notes**: Explain design decisions
- **Security considerations**: Document privacy implications

### Example Documentation
```javascript
/**
 * Analyzes current page for privacy risks
 * 
 * @param {Object} options - Scan configuration
 * @param {boolean} options.includeFingerprinting - Check for fingerprinting
 * @param {boolean} options.includeSocialWidgets - Scan social widgets
 * @returns {Promise<Object>} Analysis results with privacy score
 * 
 * @example
 * const results = await scanPrivacy({
 *     includeFingerprinting: true,
 *     includeSocialWidgets: true
 * });
 * console.log('Privacy score:', results.score);
 */
async function scanPrivacy(options = {}) {
    // Implementation...
}
```

## 🚀 Pull Request Process

### Before Submitting
1. **Test thoroughly** on multiple browsers
2. **Update documentation** for any new features
3. **Follow coding standards** outlined above
4. **Ensure privacy compliance** - no external data transmission
5. **Write clear commit messages**

### Commit Message Format
```
type(scope): brief description

Detailed explanation of changes if needed.

- List specific changes
- Include any breaking changes
- Reference issues: Fixes #123
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(scanner): add fingerprinting detection to privacy scanner

- Implement canvas fingerprinting detection
- Add WebGL fingerprinting protection
- Update privacy score calculation
- Add tests for new detection methods

Fixes #45
```

### Pull Request Template
When submitting a PR, please include:

- [ ] **Description** of changes and motivation
- [ ] **Type of change** (bug fix, new feature, breaking change)
- [ ] **Testing** performed and results
- [ ] **Privacy impact** assessment
- [ ] **Browser compatibility** verified
- [ ] **Documentation** updated if needed

## 🏆 Recognition

### Contributors Hall of Fame
We recognize contributors in multiple ways:
- 🏅 **Contributors list** in README
- 🎖️ **Special mentions** in release notes
- 👤 **Profile features** on project website
- 🎁 **Digital badges** for significant contributions

### Contribution Types
- 🐛 **Bug hunters** - Finding and reporting issues
- 💻 **Code contributors** - Pull requests and features
- 📚 **Documentation writers** - Improving guides and docs
- 🌍 **Translators** - Multi-language support
- 🎨 **Designers** - UI/UX improvements
- 🧪 **Testers** - Quality assurance and compatibility
- 💡 **Idea contributors** - Feature suggestions and feedback

## 🤝 Community Guidelines

### Code of Conduct
We are committed to providing a welcoming and inclusive experience for everyone:

- **Be respectful** and considerate of others
- **Use inclusive language** in all communications
- **Accept constructive criticism** gracefully
- **Focus on what's best** for the community
- **Show empathy** towards other community members

### Communication Channels
- 💬 **GitHub Discussions** - General questions and ideas
- 🐛 **GitHub Issues** - Bug reports and feature requests
- 📧 **Email** - Private security concerns
- 🐦 **Twitter** - Updates and community engagement

### Getting Help
- 📚 Read the **documentation** first
- 🔍 **Search existing issues** before creating new ones
- 💬 Ask questions in **GitHub Discussions**
- 📧 **Email maintainers** for sensitive security issues

## 🔒 Security Contributions

### Reporting Security Vulnerabilities
If you discover a security vulnerability:

1. **DO NOT** create a public issue
2. **Email** security@footprinteraser.com
3. **Include** detailed reproduction steps
4. **Provide** your assessment of the impact
5. **Allow** reasonable time for fixes before disclosure

### Security Review Process
All security-related contributions go through:
- **Code review** by security-focused maintainers
- **Privacy impact assessment**
- **Cross-browser security testing**
- **Documentation** of security implications

## 📊 Performance Considerations

### Performance Guidelines
- **Bundle size**: Keep total assets under 500KB
- **Load time**: Target <2 seconds on 3G
- **Memory usage**: Limit to <50MB RAM
- **CPU impact**: <1% during active scanning
- **Battery**: Minimal impact on mobile devices

### Optimization Techniques
```javascript
// Efficient DOM queries
const elements = document.querySelectorAll('.tracker-element');

// Batch DOM updates
const fragment = document.createDocumentFragment();
// ... add elements to fragment
document.body.appendChild(fragment);

// Debounce expensive operations
const debouncedScan = debounce(performScan, 1000);

// Use efficient algorithms
const trackersSet = new Set(knownTrackers); // O(1) lookup
```

## 🌍 Internationalization

### Translation Guidelines
- **Use semantic keys** in translation files
- **Provide context** for translators
- **Consider text expansion** in different languages
- **Test layout** with longer translations
- **Include RTL support** where applicable

### Adding New Languages
1. Create `assets/i18n/[language-code].json`
2. Translate all interface strings
3. Update language selector in UI
4. Test thoroughly with new language
5. Add to documentation

## 📅 Release Process

### Version Numbering
We use **Semantic Versioning** (SemVer):
- **Major** (1.0.0): Breaking changes
- **Minor** (1.1.0): New features, backward compatible
- **Patch** (1.1.1): Bug fixes, backward compatible

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Browser compatibility verified
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Translation updates included

## 🙏 Thank You

Thank you for contributing to Digital Footprint Eraser! Your efforts help protect user privacy across the globe. Together, we're building a more private and secure internet for everyone.

**Privacy is a fundamental human right. Help us protect it.** 🛡️

---

## 🔗 Quick Links

- 📖 **[Documentation](docs/)** - Complete project documentation
- 🐛 **[Issues](https://github.com/bharathk2498/digital-footprint-eraser/issues)** - Bug reports and features
- 💬 **[Discussions](https://github.com/bharathk2498/digital-footprint-eraser/discussions)** - Community discussion
- 🔒 **[Security](mailto:security@footprinteraser.com)** - Security vulnerability reports
- 🌐 **[Live Demo](https://bharathk2498.github.io/digital-footprint-eraser)** - Try the application

*Built with ❤️ for privacy by the open source community.*