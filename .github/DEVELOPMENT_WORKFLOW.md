# 🚀 UPID Suchana Portal - Development Workflow

## 🔄 Git Workflow

### Branch Strategy
- **main**: Production-ready code deployed to GitHub Pages
- **develop**: Integration branch for new features
- **feature/***: Individual feature development branches
- **hotfix/***: Critical bug fixes for production

### Commit Message Convention
```
feat: add hierarchical admin system for UP Irrigation Department
fix: resolve download counting synchronization issue
docs: update README with admin credentials
style: improve responsive design for mobile devices
refactor: optimize file service performance
test: add unit tests for hierarchical admin service
```

## 📋 Development Checklist

### Before Starting Development
- [ ] Pull latest changes from main branch
- [ ] Create feature branch from develop
- [ ] Install dependencies with `npm install`
- [ ] Run tests with `ng test` to ensure baseline

### During Development
- [ ] Follow Angular style guide conventions
- [ ] Use TypeScript strict mode
- [ ] Implement proper error handling
- [ ] Add unit tests for new functionality
- [ ] Update documentation as needed

### Before Committing
- [ ] Run `ng lint` to check code quality
- [ ] Run `ng test` to ensure all tests pass
- [ ] Run `ng build` to verify build success
- [ ] Test functionality manually in browser
- [ ] Update CHANGELOG.md if applicable

### Code Review Requirements
- [ ] All TypeScript files properly typed
- [ ] Angular best practices followed
- [ ] Bootstrap classes used consistently
- [ ] Responsive design verified
- [ ] Accessibility considerations addressed
- [ ] Performance impact evaluated

## 🧪 Testing Guidelines

### Unit Testing
```bash
ng test                    # Run all unit tests
ng test --watch=false     # Run tests once
ng test --code-coverage   # Generate coverage report
```

### Manual Testing Scenarios
1. **User Registration Flow**
   - Enter invalid email → Should show validation error
   - Enter valid name/email → Should navigate to announcement portal
   - Logout and return → Should redirect to landing page

2. **Admin Authentication**
   - Try invalid credentials → Should show error message
   - Login with valid admin credentials → Should access dashboard
   - Test different hierarchy levels → Should respect permissions

3. **File Operations**
   - Upload files exceeding 10MB → Should show error
   - Download files as normal user → Should increment download count
   - View admin dashboard → Should show updated statistics

4. **Responsive Design**
   - Test on mobile (< 768px width)
   - Test on tablet (768px - 1024px width)
   - Test on desktop (> 1024px width)

## 🔧 Environment Setup

### Required Node.js Version
- **Minimum**: Node.js 16.x
- **Recommended**: Node.js 18.x or higher
- **Package Manager**: npm (comes with Node.js)

### IDE Configuration
**Recommended: Visual Studio Code with extensions:**
- Angular Language Service
- TypeScript Importer
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
- Prettier
- ESLint

### Local Development Commands
```bash
# Install dependencies
npm install

# Start development server
ng serve
# or with specific port
ng serve --port 4200

# Build for development
ng build

# Build for production
ng build --configuration production

# Run tests
ng test

# Run linting
ng lint

# Generate new component
ng generate component pages/new-page

# Generate new service
ng generate service services/new-service

# Deploy to GitHub Pages
npm run deploy
```

## 📊 Performance Monitoring

### Bundle Analysis
```bash
# Analyze bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/announcement-portal/stats.json
```

### Performance Metrics to Monitor
- **Initial Bundle Size**: Keep main bundle under 250KB
- **Lazy Loaded Chunks**: Individual chunks under 50KB
- **First Contentful Paint**: Target < 2 seconds
- **Time to Interactive**: Target < 3 seconds
- **Lighthouse Score**: Maintain 90+ across all categories

## 🔄 CI/CD Pipeline

### GitHub Actions (Future Enhancement)
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: ng test --watch=false
      - run: ng lint
      - run: ng build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run deploy
```

### Deployment Checklist
- [ ] All tests passing
- [ ] Build successful
- [ ] Admin credentials verified
- [ ] File upload/download working
- [ ] Responsive design confirmed
- [ ] Performance metrics acceptable

## 🐛 Debugging Guide

### Common Issues & Solutions

**Issue**: Download counts not updating
**Solution**: Check FileService callback setup in components

**Issue**: Admin login failing
**Solution**: Verify credentials in hierarchical-admin.service.ts

**Issue**: File upload not working
**Solution**: Check file size limits and Base64 encoding

**Issue**: Responsive layout broken
**Solution**: Verify Bootstrap classes and CSS media queries

**Issue**: Angular build errors
**Solution**: Check TypeScript strict mode compliance

### Debug Configuration
```typescript
// Enable Angular development mode
import { isDevMode } from '@angular/core';

if (isDevMode()) {
  console.log('Development mode enabled');
  // Add debug logging
}
```

## 📚 Learning Resources

### Angular 16+ Resources
- [Angular Official Documentation](https://angular.io/docs)
- [Angular Signals Guide](https://angular.io/guide/signals)
- [Angular Standalone Components](https://angular.io/guide/standalone-components)

### TypeScript Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Angular TypeScript Configuration](https://angular.io/guide/typescript-configuration)

### Bootstrap 5 Resources
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.0/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)

## 🚨 Emergency Procedures

### Rollback Deployment
```bash
# If deployment fails, revert to previous commit
git log --oneline -10
git checkout <previous-commit-hash>
npm run deploy
```

### Database Recovery (LocalStorage)
```javascript
// Clear corrupted LocalStorage data
localStorage.clear();
// Restart application to regenerate default data
```

### Contact Information
- **Primary Developer**: Available via GitHub issues
- **Repository**: https://github.com/ratna3/angular-essential-training-3266043
- **Live Site**: https://ratna3.github.io/angular-essential-training-3266043/

---

*This workflow document should be updated as the project evolves and new practices are established.*
