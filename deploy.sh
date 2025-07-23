#!/bin/bash

# DigitalShield Pro - One-Click Deployment Script
# Professional cybersecurity suite deployment automation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script configuration
REPO_NAME="digital-footprint-eraser"
COMMIT_MESSAGE="🚀 Deploy DigitalShield Pro v2.0 - Functional cybersecurity suite"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}"
    echo "=================================================="
    echo "🛡️  DigitalShield Pro Deployment Script"
    echo "   Enterprise-Grade Cybersecurity Suite"
    echo "=================================================="
    echo -e "${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git and try again."
        exit 1
    fi
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        print_warning "Not in a Git repository. Initializing..."
        git init
        print_success "Git repository initialized"
    fi
    
    print_success "Prerequisites check completed"
}

# Function to validate files
validate_files() {
    print_status "Validating required files..."
    
    required_files=(
        "index.html"
        "README.md"
        "LICENSE"
        ".gitignore"
        "SECURITY.md"
        "CONTRIBUTING.md"
        "CHANGELOG.md"
        "DEPLOYMENT.md"
    )
    
    missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -ne 0 ]; then
        print_error "Missing required files:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        print_error "Please ensure all files are present before deployment"
        exit 1
    fi
    
    # Check if workflows directory exists
    if [ ! -d ".github/workflows" ]; then
        print_warning "GitHub Actions workflow directory not found"
        mkdir -p .github/workflows
        print_success "Created .github/workflows directory"
    fi
    
    print_success "File validation completed"
}

# Function to perform security checks
security_check() {
    print_status "Running security checks..."
    
    # Check for potential secrets
    if grep -r "api_key\|password\|secret\|token" --include="*.html" --include="*.js" --include="*.css" . 2>/dev/null; then
        print_warning "Potential secrets found in code. Please review before deployment."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled for security review"
            exit 1
        fi
    fi
    
    # Check for tracking scripts
    if grep -q "google-analytics\|gtag\|facebook\|tracking" index.html; then
        print_warning "Tracking scripts detected - this may impact privacy claims"
    fi
    
    # Validate HTML structure
    if ! grep -q "<!DOCTYPE html>" index.html; then
        print_error "Invalid HTML structure - missing DOCTYPE"
        exit 1
    fi
    
    print_success "Security checks passed"
}

# Function to get repository information
get_repo_info() {
    print_status "Configuring repository information..."
    
    # Try to get remote origin URL
    REMOTE_URL=$(git config --get remote.origin.url 2>/dev/null || echo "")
    
    if [ -z "$REMOTE_URL" ]; then
        echo -e "${YELLOW}GitHub repository URL not configured.${NC}"
        echo "Please provide your GitHub username:"
        read -p "Username: " GITHUB_USERNAME
        
        if [ -z "$GITHUB_USERNAME" ]; then
            print_error "GitHub username is required"
            exit 1
        fi
        
        REMOTE_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
        git remote add origin "$REMOTE_URL" 2>/dev/null || git remote set-url origin "$REMOTE_URL"
        
        print_success "Repository URL configured: $REMOTE_URL"
    else
        print_success "Using existing repository: $REMOTE_URL"
    fi
    
    # Extract username from URL for GitHub Pages URL
    if [[ $REMOTE_URL =~ github\.com[:/]([^/]+)/ ]]; then
        GITHUB_USERNAME="${BASH_REMATCH[1]}"
        GITHUB_PAGES_URL="https://$GITHUB_USERNAME.github.io/$REPO_NAME"
    fi
}

# Function to commit and push changes
deploy_to_github() {
    print_status "Deploying to GitHub..."
    
    # Add all files
    git add .
    
    # Check if there are changes to commit
    if git diff --cached --quiet; then
        print_warning "No changes to commit"
    else
        # Commit changes
        git commit -m "$COMMIT_MESSAGE"
        print_success "Changes committed"
    fi
    
    # Get current branch
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
    
    # Push to repository
    print_status "Pushing to GitHub..."
    if git push origin "$CURRENT_BRANCH" 2>/dev/null; then
        print_success "Successfully pushed to GitHub"
    else
        print_status "Setting upstream branch and pushing..."
        git push --set-upstream origin "$CURRENT_BRANCH"
        print_success "Successfully pushed to GitHub with upstream"
    fi
}

# Function to check GitHub Pages status
check_github_pages() {
    print_status "Checking GitHub Pages configuration..."
    
    if [ -n "$GITHUB_PAGES_URL" ]; then
        echo -e "${GREEN}"
        echo "=================================================="
        echo "🎉 Deployment Successful!"
        echo "=================================================="
        echo -e "${NC}"
        echo "Your DigitalShield Pro site will be available at:"
        echo -e "${BLUE}$GITHUB_PAGES_URL${NC}"
        echo ""
        echo "⏰ Note: GitHub Pages may take 5-10 minutes to update"
        echo ""
        echo "📋 Next Steps:"
        echo "1. Go to your repository on GitHub"
        echo "2. Navigate to Settings > Pages"
        echo "3. Ensure source is set to 'Deploy from a branch'"
        echo "4. Select '$CURRENT_BRANCH' branch"
        echo "5. Wait for deployment to complete"
        echo ""
        echo "🧪 Test your deployment:"
        echo "- Cookie Cleaner functionality"
        echo "- Password Analyzer tool"
        echo "- Email Privacy Scanner"
        echo "- URL Security Analysis"
        echo "- Mobile responsiveness"
        echo ""
        echo "🚀 Ready to showcase your cybersecurity expertise!"
    fi
}

# Function to display deployment summary
deployment_summary() {
    echo -e "${PURPLE}"
    echo "=================================================="
    echo "📊 Deployment Summary"
    echo "=================================================="
    echo -e "${NC}"
    echo "✅ Repository: $REMOTE_URL"
    echo "✅ Branch: $CURRENT_BRANCH"
    echo "✅ Files: $(git ls-files | wc -l) files committed"
    echo "✅ Security: Validated"
    echo "✅ Structure: Professional"
    echo ""
    echo -e "${GREEN}🛡️ DigitalShield Pro is ready for action!${NC}"
    echo ""
    echo "📈 Business Impact:"
    echo "• Professional cybersecurity portfolio"
    echo "• Client consultation tool"
    echo "• Technical demonstration platform"
    echo "• LinkedIn showcase content"
    echo ""
    echo "🔧 Technical Features:"
    echo "• 6 functional privacy tools"
    echo "• Real-time security metrics"
    echo "• Mobile-responsive design"
    echo "• Zero external dependencies"
    echo "• Privacy-first architecture"
}

# Main deployment function
main() {
    print_header
    
    echo "This script will deploy your DigitalShield Pro cybersecurity suite"
    echo "to GitHub Pages with professional automation and validation."
    echo ""
    read -p "Continue with deployment? (Y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_error "Deployment cancelled by user"
        exit 1
    fi
    
    echo ""
    
    # Run deployment steps
    check_prerequisites
    validate_files
    security_check
    get_repo_info
    deploy_to_github
    check_github_pages
    deployment_summary
    
    echo ""
    print_success "🎉 DigitalShield Pro deployment completed successfully!"
    
    # Optional: Open GitHub Pages URL
    if [ -n "$GITHUB_PAGES_URL" ]; then
        echo ""
        read -p "Open your deployed site in browser? (Y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            if command -v open &> /dev/null; then
                open "$GITHUB_PAGES_URL"
            elif command -v xdg-open &> /dev/null; then
                xdg-open "$GITHUB_PAGES_URL"
            else
                print_status "Please manually open: $GITHUB_PAGES_URL"
            fi
        fi
    fi
}

# Error handling
trap 'print_error "Deployment failed! Check the error message above."' ERR

# Run main function
main "$@"
