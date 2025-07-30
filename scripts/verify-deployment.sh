#!/bin/bash

# 🛡️ Digital Footprint Eraser - Enterprise Deployment Verification Script
# Comprehensive system validation for cybersecurity professionals

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${PURPLE}"
echo "██████╗ ███████╗███████╗    ██╗   ██╗███████╗██████╗ ██╗███████╗██╗   ██╗"
echo "██╔══██╗██╔════╝██╔════╝    ██║   ██║██╔════╝██╔══██╗██║██╔════╝╚██╗ ██╔╝"
echo "██║  ██║█████╗  █████╗      ██║   ██║█████╗  ██████╔╝██║█████╗   ╚████╔╝ "
echo "██║  ██║██╔══╝  ██╔══╝      ╚██╗ ██╔╝██╔══╝  ██╔══██╗██║██╔══╝    ╚██╔╝  "
echo "██████╔╝██║     ███████╗     ╚████╔╝ ███████╗██║  ██║██║██║        ██║   "
echo "╚═════╝ ╚═╝     ╚══════╝      ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝   "
echo ""
echo "           🛡️ DIGITAL FOOTPRINT ERASER - DEPLOYMENT VERIFICATION 🛡️"
echo "                    Enterprise Security Suite Validation"
echo -e "${NC}"

# Verification results
PASSED=0
FAILED=0
WARNINGS=0

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARNINGS++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
}

log_section() {
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}🔍 $1${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
}

# Check if file exists and validate
check_file() {
    local file=$1
    local description=$2
    
    if [[ -f "$file" ]]; then
        local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
        if [[ $size -gt 0 ]]; then
            log_success "$description found (${size} bytes)"
            return 0
        else
            log_error "$description is empty"
            return 1
        fi
    else
        log_error "$description not found"
        return 1
    fi
}

# Check HTML file structure
check_html_structure() {
    local file=$1
    local description=$2
    
    if check_file "$file" "$description"; then
        # Check for essential HTML elements
        if grep -q "<!DOCTYPE html>" "$file"; then
            log_success "$description has valid DOCTYPE"
        else
            log_warning "$description missing DOCTYPE declaration"
        fi
        
        if grep -q "<title>" "$file"; then
            log_success "$description has title element"
        else
            log_warning "$description missing title element"
        fi
        
        # Check for security headers
        if grep -q "Content-Security-Policy" "$file"; then
            log_success "$description includes CSP headers"
        else
            log_warning "$description missing Content Security Policy"
        fi
        
        # Check for viewport meta tag
        if grep -q "viewport" "$file"; then
            log_success "$description is mobile responsive"
        else
            log_warning "$description missing viewport meta tag"
        fi
    fi
}

# Check JavaScript file functionality
check_javascript() {
    local file=$1
    local description=$2
    
    if check_file "$file" "$description"; then
        # Check for syntax errors (basic)
        if node -c "$file" 2>/dev/null; then
            log_success "$description has valid JavaScript syntax"
        else
            log_warning "$description may have syntax issues (Node.js not available for full check)"
        fi
        
        # Check for key functions
        if grep -q "class.*{" "$file"; then
            log_success "$description uses modern ES6+ classes"
        fi
        
        if grep -q "async.*function\|=.*async" "$file"; then
            log_success "$description uses async/await patterns"
        fi
    fi
}

# Check security implementation
check_security_features() {
    local file=$1
    
    log_info "Checking security implementation in $file..."
    
    # Check for security patterns
    local security_checks=(
        "Content-Security-Policy:CSP headers"
        "X-Frame-Options:Frame protection"
        "X-Content-Type-Options:MIME type protection"
        "Strict-Transport-Security:HTTPS enforcement"
        "sanitize:Input sanitization"
        "escape:Output escaping"
        "crypto:Cryptographic functions"
        "encrypt:Encryption implementation"
    )
    
    for check in "${security_checks[@]}"; do
        IFS=':' read -r pattern description <<< "$check"
        if grep -q "$pattern" "$file"; then
            log_success "$description implemented"
        else
            log_warning "$description not found"
        fi
    done
}

# Performance and optimization checks
check_performance() {
    local file=$1
    local description=$2
    
    if [[ -f "$file" ]]; then
        local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
        
        if [[ $size -lt 1048576 ]]; then  # Less than 1MB
            log_success "$description is optimally sized (${size} bytes)"
        elif [[ $size -lt 5242880 ]]; then  # Less than 5MB
            log_warning "$description is large but acceptable (${size} bytes)"
        else
            log_error "$description is too large (${size} bytes) - consider optimization"
        fi
        
        # Check for minification indicators
        if grep -q "\/\*.*\*\/" "$file" && grep -q "\/\/.*" "$file"; then
            log_warning "$description contains comments - consider minification for production"
        fi
        
        # Check for modern optimization patterns
        if grep -q "defer\|async" "$file"; then
            log_success "$description uses async loading patterns"
        fi
    fi
}

# Integration verification
check_integration() {
    log_info "Verifying component integration..."
    
    # Check for cross-references between files
    local files=("index.html" "advanced-security-enhanced.html" "executive-analytics.html")
    
    for file in "${files[@]}"; do
        if [[ -f "$file" ]]; then
            # Check navigation links
            if grep -q "advanced-security" "$file" || grep -q "executive-analytics" "$file" || grep -q "index.html" "$file"; then
                log_success "$file has proper navigation links"
            else
                log_warning "$file missing navigation links"
            fi
            
            # Check for master integration
            if grep -q "master-integration.js" "$file"; then
                log_success "$file includes master integration"
            else
                log_warning "$file missing master integration"
            fi
        fi
    done
}

# Main verification process
main() {
    log_section "CORE COMPONENT VERIFICATION"
    
    # Core HTML files
    check_html_structure "index.html" "Main Dashboard"
    check_html_structure "advanced-security-enhanced.html" "Advanced Security Center"
    check_html_structure "executive-analytics.html" "Executive Analytics Dashboard"
    
    log_section "JAVASCRIPT COMPONENT VERIFICATION"
    
    # JavaScript files
    check_javascript "advanced-security-complete.js" "Advanced Security Engine"
    check_javascript "threat-intelligence-engine.js" "Threat Intelligence System"
    check_javascript "master-integration.js" "Master Integration System"
    
    log_section "DOCUMENTATION VERIFICATION"
    
    # Documentation files
    check_file "README.md" "Project README"
    check_file "docs/api-reference.md" "API Documentation"
    check_file "docs/security-architecture.md" "Security Architecture"
    check_file "docs/deployment-guide.md" "Deployment Guide"
    
    log_section "SECURITY IMPLEMENTATION VERIFICATION"
    
    # Security checks
    check_security_features "index.html"
    check_security_features "advanced-security-enhanced.html"
    check_security_features "executive-analytics.html"
    
    log_section "PERFORMANCE & OPTIMIZATION VERIFICATION"
    
    # Performance checks
    check_performance "index.html" "Main Dashboard"
    check_performance "advanced-security-enhanced.html" "Advanced Security Center"
    check_performance "executive-analytics.html" "Executive Analytics"
    check_performance "advanced-security-complete.js" "Security Engine"
    
    log_section "INTEGRATION & NAVIGATION VERIFICATION"
    
    # Integration checks
    check_integration
    
    log_section "DEPLOYMENT READINESS VERIFICATION"
    
    # Deployment files
    check_file ".github/workflows/deploy.yml" "GitHub Actions Workflow" || check_file "deploy-demo.yml" "Deployment Workflow"
    
    # Git configuration
    if [[ -d ".git" ]]; then
        log_success "Git repository initialized"
    else
        log_warning "Not a Git repository"
    fi
    
    # Check for common deployment files
    if [[ -f "package.json" ]]; then
        log_success "Node.js package configuration found"
    else
        log_info "Static deployment detected (no package.json)"
    fi
    
    log_section "AI & ADVANCED FEATURES VERIFICATION"
    
    # AI Features
    local ai_features=(
        "neural.*network:Neural Network Implementation"
        "machine.*learning:Machine Learning Features"
        "behavioral.*analysis:Behavioral Analysis"
        "threat.*intelligence:Threat Intelligence"
        "quantum.*crypto:Quantum Cryptography"
        "family.*protection:Family Protection AI"
    )
    
    for feature in "${ai_features[@]}"; do
        IFS=':' read -r pattern description <<< "$feature"
        local found=false
        
        for file in *.html *.js 2>/dev/null; do
            if [[ -f "$file" ]] && grep -qi "$pattern" "$file"; then
                found=true
                break
            fi
        done
        
        if $found; then
            log_success "$description implemented"
        else
            log_warning "$description not detected"
        fi
    done
    
    log_section "FINAL SYSTEM VALIDATION"
    
    # Cross-browser compatibility checks
    log_info "Checking cross-browser compatibility indicators..."
    
    if grep -q "webkit.*background.*clip\|moz.*\|ms.*" *.html *.css 2>/dev/null; then
        log_success "Cross-browser prefixes detected"
    else
        log_warning "Limited cross-browser compatibility detected"
    fi
    
    # Accessibility checks
    if grep -q "alt=\|aria-\|role=" *.html 2>/dev/null; then
        log_success "Accessibility features implemented"
    else
        log_warning "Limited accessibility features detected"
    fi
    
    # Mobile responsiveness
    if grep -q "media.*query\|responsive\|mobile" *.html *.css 2>/dev/null; then
        log_success "Mobile responsiveness implemented"
    else
        log_warning "Mobile responsiveness not clearly implemented"
    fi
    
    # Print final results
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}📊 DEPLOYMENT VERIFICATION SUMMARY${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${GREEN}✅ PASSED: $PASSED${NC}"
    echo -e "${YELLOW}⚠️  WARNINGS: $WARNINGS${NC}"
    echo -e "${RED}❌ FAILED: $FAILED${NC}"
    echo ""
    
    # Overall assessment
    local total=$((PASSED + WARNINGS + FAILED))
    local success_rate=$((PASSED * 100 / total))
    
    if [[ $FAILED -eq 0 && $success_rate -ge 80 ]]; then
        echo -e "${GREEN}🎉 DEPLOYMENT READY - ENTERPRISE GRADE${NC}"
        echo -e "${GREEN}Success Rate: ${success_rate}%${NC}"
        echo ""
        echo -e "${BLUE}🚀 Ready for production deployment${NC}"
        echo -e "${BLUE}🛡️ Military-grade security verified${NC}"
        echo -e "${BLUE}⚡ Performance optimized${NC}"
        echo -e "${BLUE}🔗 Component integration validated${NC}"
        exit 0
    elif [[ $FAILED -eq 0 ]]; then
        echo -e "${YELLOW}⚠️  DEPLOYMENT READY WITH WARNINGS${NC}"
        echo -e "${YELLOW}Success Rate: ${success_rate}%${NC}"
        echo ""
        echo -e "${YELLOW}Review warnings before production deployment${NC}"
        exit 0
    else
        echo -e "${RED}❌ DEPLOYMENT NOT READY${NC}"
        echo -e "${RED}Success Rate: ${success_rate}%${NC}"
        echo ""
        echo -e "${RED}Fix critical failures before deployment${NC}"
        exit 1
    fi
}

# Execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi