# Deployment Guide

This guide provides comprehensive instructions for deploying HELPDESK.AI across Development, Staging, and Production environments.

## Introduction

This deployment guide covers the process of deploying HELPDESK.AI, an AI-powered helpdesk platform, across different environments. The platform consists of:

- **Frontend**: React-based user interface (deployed to Vercel)
- **Backend**: FastAPI Python backend with AI models (deployed to Hugging Face Spaces)
- **Database**: Supabase for data persistence and real-time features
- **Mobile App**: React Native application for Android

### Supported Deployment Environments

| Environment | Purpose | Platform |
| :--- | :--- | :--- |
| **Development** | Local development and testing | Local machine |
| **Staging** | Pre-production testing | Vercel (Frontend), Hugging Face Spaces (Backend) |
| **Production** | Live production deployment | Vercel (Frontend), Hugging Face Spaces (Backend) |

For quick local setup instructions, refer to the [README.md](README.md#deploy) deployment section.

## Development Environment

### Prerequisites

Before setting up the development environment, ensure you have:

- **Node.js** version 20 or higher
- **Python** version 3.10 or higher
- **Git** for version control
- **npm** or **yarn** package manager
- **Supabase account** for database setup

### Environment Variables

Create a `.env` file in the `/Frontend` directory with the following variables:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_GROWTH_LINK=your_stripe_link
VITE_BACKEND_URL=http://localhost:8000
```

> [!NOTE]
> For detailed environment configuration and Supabase setup, refer to the [README.md](README.md#deploy) deployment section.

### Build Commands

```bash
# Clone the repository
git clone https://github.com/ritesh-1918/HELPDESK.AI.git
cd HELPDESK.AI

# Install Frontend dependencies
cd Frontend
npm install

# Install Backend dependencies
cd ../backend
pip install -r requirements.txt
```

### Deployment Commands

```bash
# Start Frontend development server
cd Frontend
npm run dev

# Start Backend development server
cd ../backend
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Verification Steps

1. **Frontend Verification**
   - Navigate to `http://localhost:5173` (default Vite port)
   - Verify the landing page loads correctly
   - Check browser console for errors

2. **Backend Verification**
   - Navigate to `http://localhost:8000/docs` (FastAPI Swagger UI)
   - Verify API documentation loads
   - Test health check endpoint: `http://localhost:8000/health`

3. **Database Verification**
   - Verify Supabase connection from frontend
   - Check real-time subscriptions work
   - Test authentication flow

## Staging Environment

### Purpose

The staging environment serves as a pre-production testing ground where:
- New features are tested before production deployment
- Integration testing occurs across all components
- Performance and load testing can be performed
- Stakeholders can review changes

### Prerequisites

- Active Vercel account
- Hugging Face Spaces account
- Supabase project for staging
- Domain name (optional, for custom staging URL)

### Environment Configuration

Configure staging environment variables in your deployment platforms:

**Vercel Environment Variables:**
```bash
VITE_SUPABASE_URL=https://STAGING_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=staging_anon_key
VITE_STRIPE_GROWTH_LINK=staging_stripe_link
VITE_BACKEND_URL=https://your-staging-backend.hf.space
```

**Hugging Face Spaces Secrets:**
- Configure Supabase service role keys
- Set API keys for external services (GitHub Models, etc.)
- Configure model paths and credentials

### Deployment Workflow

#### Frontend Deployment to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to staging
cd Frontend
vercel --env=staging
```

#### Backend Deployment to Hugging Face Spaces

```bash
# Clone your Hugging Face Space repository
git clone https://huggingface.co/spaces/YOUR_USERNAME/your-space-name
cd your-space-name

# Copy backend files
cp -r /path/to/HELPDESK.AI/backend/* .

# Commit and push
git add .
git commit -m "Deploy backend to staging"
git push
```

### Validation After Deployment

1. **Frontend Validation**
   - Access staging URL
   - Verify all pages load correctly
   - Test user authentication
   - Check responsive design on mobile devices

2. **Backend Validation**
   - Access Hugging Face Spaces URL
   - Verify API endpoints respond correctly
   - Test AI model inference
   - Check health check endpoint

3. **Integration Validation**
   - Test frontend-backend communication
   - Verify real-time features work
   - Test ticket creation and processing
   - Check AI categorization functionality

## Production Environment

### Deployment Checklist

Before deploying to production, ensure:

- [ ] All tests pass in staging environment
- [ ] Code review completed and approved
- [ ] Security audit performed
- [ ] Performance benchmarks met
- [ ] Database migrations tested
- [ ] Backup procedures verified
- [ ] Monitoring and alerting configured
- [ ] Rollback plan documented

### Production Prerequisites

- Production Supabase project with proper RLS policies
- Custom domain configured (if applicable)
- SSL/TLS certificates configured
- CDN configured for static assets
- Monitoring and logging services set up
- Error tracking service configured (e.g., Sentry)

### Environment Variables

**Vercel Production Environment Variables:**
```bash
VITE_SUPABASE_URL=https://PRODUCTION_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=production_anon_key
VITE_STRIPE_GROWTH_LINK=production_stripe_link
VITE_BACKEND_URL=https://your-production-backend.hf.space
```

**Hugging Face Spaces Production Secrets:**
- Production Supabase service role keys
- Production API keys for external services
- Model credentials and paths
- Webhook secrets for integrations

### Deployment Process

#### Frontend Production Deployment

```bash
# Deploy to production
cd Frontend
vercel --prod
```

Or use Vercel dashboard:
1. Connect your GitHub repository
2. Configure environment variables
3. Enable automatic deployments on main branch push
4. Deploy manually or wait for automatic deployment

#### Backend Production Deployment

```bash
# Deploy to production Hugging Face Space
git clone https://huggingface.co/spaces/YOUR_USERNAME/production-space-name
cd production-space-name

# Copy production backend files
cp -r /path/to/HELPDESK.AI/backend/* .

# Commit and push
git add .
git commit -m "Deploy backend to production"
git push
```

### Verification Checklist

1. **Functionality Verification**
   - [ ] All user flows work end-to-end
   - [ ] Authentication and authorization function correctly
   - [ ] AI categorization produces accurate results
   - [ ] Real-time features work as expected
   - [ ] Mobile app connects to production backend

2. **Performance Verification**
   - [ ] Page load times meet benchmarks (< 3 seconds)
   - [ ] API response times are acceptable (< 500ms for AI inference)
   - [ ] Database queries are optimized
   - [ ] Static assets are cached properly

3. **Security Verification**
   - [ ] HTTPS is enforced
   - [ ] Security headers are configured
   - [ ] API rate limiting is active
   - [ ] Supabase RLS policies are enforced
   - [ ] No sensitive data in logs

### Monitoring Recommendations

Set up monitoring for:

- **Application Performance**
  - Response times
  - Error rates
  - Throughput
  - Resource utilization

- **Business Metrics**
  - Ticket volume
  - Categorization accuracy
  - User engagement
  - Resolution times

- **Infrastructure Health**
  - Server uptime
  - Database performance
  - CDN hit rates
  - SSL certificate expiry

## Environment Variables

### Required Variables

| Variable | Purpose | Location |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase project URL | Frontend .env |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Frontend .env |
| `VITE_BACKEND_URL` | Backend API URL | Frontend .env |
| `VITE_STRIPE_GROWTH_LINK` | Stripe payment link | Frontend .env |

### Optional Variables

| Variable | Purpose | Default |
| :--- | :--- | :--- |
| `VITE_STRIPE_GROWTH_LINK` | Stripe integration for payments | Not required for basic functionality |

### Secure Handling Recommendations

> [!WARNING]
- Never commit environment variables to version control
- Use different values for development, staging, and production
- Rotate secrets regularly
- Use environment-specific secrets management
- Limit access to production secrets to authorized personnel
- Use secret scanning tools in CI/CD pipelines

For Vercel:
- Use Vercel Environment Variables dashboard
- Never hardcode secrets in code
- Use `.env.local` for local development only

For Hugging Face Spaces:
- Use Spaces Settings > Secrets
- Never include secrets in repository
- Rotate keys if compromised

## Rollback Procedures

### When Rollback Should Be Performed

Consider rollback when:
- Critical bugs are discovered post-deployment
- Performance degradation affects users
- Security vulnerabilities are identified
- Data corruption occurs
- Integration failures impact core functionality
- User experience is severely degraded

### Rollback Workflow

#### Frontend Rollback (Vercel)

```bash
# Using Vercel CLI
vercel rollback [deployment-url]

# Or deploy previous commit
cd Frontend
git log --oneline  # Find previous commit hash
git checkout [previous-commit-hash]
vercel --prod
```

#### Backend Rollback (Hugging Face Spaces)

```bash
# Clone the space repository
git clone https://huggingface.co/spaces/YOUR_USERNAME/your-space-name
cd your-space-name

# Checkout previous commit
git log --oneline  # Find previous commit hash
git checkout [previous-commit-hash]

# Push to rollback
git push --force
```

#### Database Rollback (Supabase)

1. **Identify the migration to rollback**
   ```bash
   # In your Supabase dashboard
   # Go to SQL Editor > Migrations
   # Identify the migration to rollback
   ```

2. **Execute rollback SQL**
   - Use the migration's down migration if available
   - Or manually revert changes using SQL

3. **Verify data integrity**
   - Check critical tables
   - Verify relationships
   - Test application functionality

### Verification After Rollback

1. **Application Verification**
   - Access the application
   - Verify core functionality works
   - Check for data consistency
   - Monitor error logs

2. **Performance Verification**
   - Check response times
   - Monitor resource usage
   - Verify no performance regression

3. **User Verification**
   - Communicate rollback to users
   - Monitor user feedback
   - Check support tickets for issues

## CI/CD Pipeline

### How Deployments Are Triggered

Deployments are triggered through:

1. **Manual Deployment**
   - Using Vercel CLI or dashboard
   - Using Git commands for Hugging Face Spaces
   - Manual approval in CI/CD workflows

2. **Automatic Deployment**
   - Push to main branch triggers Vercel deployment
   - Push to main branch triggers GitHub Pages deployment for docs
   - CI/CD workflows run on pull requests

### Which Workflows Are Involved

The project uses GitHub Actions for CI/CD:

- **ci.yml** - Continuous Integration
  - Runs on push to main branch
  - Pull requests to main branch
  - Frontend build verification
  - Backend AI model integrity checks

- **deploy-presentation.yml** - Documentation Deployment
  - Runs on push to main branch
  - Deploys docs folder to GitHub Pages
  - Triggered by changes in docs directory

- **codeql.yml** - Security Analysis
  - Runs CodeQL security scanning
  - Identifies potential vulnerabilities

- **models-evaluation.yml** - Model Evaluation
  - Evaluates AI model performance
  - Runs model benchmarking tests

- **sync_to_hf.yml** - Hugging Face Sync
  - Syncs models to Hugging Face
  - Updates model repositories

### Build Process

#### Frontend Build Process

1. **Checkout Code**
   ```yaml
   - uses: actions/checkout@v4
   ```

2. **Setup Node.js**
   ```yaml
   - uses: actions/setup-node@v4
     with:
       node-version: "20"
       cache: "npm"
   ```

3. **Install Dependencies**
   ```bash
   cd Frontend
   npm install
   ```

4. **Build Production**
   ```bash
   cd Frontend
   npm run build
   ```

#### Backend Build Process

1. **Setup Python**
   ```yaml
   - uses: actions/setup-python@v4
     with:
       python-version: "3.10"
       cache: "pip"
   ```

2. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Verify Model Loading**
   ```python
   from backend.services.classifier_service import ClassifierService
   service = ClassifierService()
   ```

### Deployment Stages

1. **Build Stage**
   - Install dependencies
   - Build assets
   - Run tests
   - Verify model integrity

2. **Deploy Stage**
   - Deploy frontend to Vercel
   - Deploy backend to Hugging Face Spaces
   - Deploy documentation to GitHub Pages

3. **Verification Stage**
   - Health checks
   - Smoke tests
   - Performance validation

### Approval Flow

Currently, the project uses:
- **Automatic deployment** on push to main branch
- **No manual approval gates** in current CI/CD configuration
- **Pull request reviews** required before merging to main

> [!NOTE]
- Consider adding manual approval gates for production deployments
- Implement staging environment deployment before production
- Add automated testing stages in CI/CD pipeline

## Troubleshooting

### Missing Environment Variables

**Symptoms:**
- Application fails to start
- API calls fail with authentication errors
- Supabase connection errors

**Solutions:**
1. Verify all required environment variables are set
2. Check variable names match exactly (case-sensitive)
3. Restart application after adding variables
4. Clear cache if using Vercel (deploy again)

```bash
# Verify environment variables locally
cd Frontend
cat .env

# On Vercel, check Environment Variables dashboard
# On Hugging Face Spaces, check Settings > Secrets
```

### Build Failures

**Frontend Build Failures:**

**Symptoms:**
- `npm run build` fails
- Module not found errors
- TypeScript errors

**Solutions:**
1. Clear node_modules and reinstall:
   ```bash
   cd Frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check Node.js version:
   ```bash
   node --version  # Should be 20 or higher
   ```

3. Check for syntax errors in code
4. Verify all imports are correct

**Backend Build Failures:**

**Symptoms:**
- `pip install` fails
- Model loading errors
- Import errors

**Solutions:**
1. Clear Python cache and reinstall:
   ```bash
   cd backend
   pip uninstall -r requirements.txt -y
   pip install -r requirements.txt
   ```

2. Check Python version:
   ```bash
   python --version  # Should be 3.10 or higher
   ```

3. Verify model files exist in correct paths
4. Check system dependencies are installed

### Deployment Failures

**Vercel Deployment Failures:**

**Symptoms:**
- Build fails on Vercel
- Deployment stuck in progress
- Environment variables not applied

**Solutions:**
1. Check deployment logs in Vercel dashboard
2. Verify environment variables are set correctly
3. Ensure build command is correct in vercel.json
4. Check for platform-specific issues

**Hugging Face Spaces Deployment Failures:**

**Symptoms:**
- Space fails to start
- Application crashes on startup
- Model loading errors

**Solutions:**
1. Check Space logs in Hugging Face dashboard
2. Verify Dockerfile is correct
3. Ensure all dependencies are in requirements.txt
4. Check model files are included in repository
5. Verify secrets are configured correctly

### Docker Issues

**Symptoms:**
- Container fails to start
- Port conflicts
- Volume mounting issues

**Solutions:**
1. Check Docker logs:
   ```bash
   docker logs <container-id>
   ```

2. Verify port is not in use:
   ```bash
   netstat -tuln | grep 7860
   ```

3. Check Dockerfile syntax
4. Verify all files are copied correctly
5. Ensure health check is passing

### Permission Problems

**Symptoms:**
- File permission errors
- Cannot write to directories
- Database connection permission errors

**Solutions:**
1. Check file permissions:
   ```bash
   ls -la
   ```

2. Fix permissions if needed:
   ```bash
   chmod 755 <directory>
   chmod 644 <file>
   ```

3. Verify Supabase RLS policies allow access
4. Check service role keys have correct permissions

### Health Check Failures

**Symptoms:**
- Health check endpoint returns errors
- Container marked as unhealthy
- Load balancer routing issues

**Solutions:**
1. Verify health check endpoint is accessible:
   ```bash
   curl http://localhost:7860/health
   ```

2. Check health check configuration in Dockerfile
3. Verify all dependencies are healthy
4. Check database connectivity
5. Review application logs for errors

## Best Practices

### Secrets Management

- **Use environment-specific secrets** - Different secrets for dev, staging, production
- **Never commit secrets** - Add `.env` files to `.gitignore`
- **Rotate secrets regularly** - Implement a rotation schedule
- **Use secret scanning** - Integrate tools like GitGuardian or TruffleHog
- **Limit access** - Only authorized personnel can access production secrets
- **Audit access** - Track who accesses secrets and when

### Deployment Verification

- **Automated testing** - Run automated tests before each deployment
- **Smoke tests** - Perform quick smoke tests after deployment
- **Feature testing** - Test new features thoroughly in staging
- **Performance testing** - Run load tests before production deployment
- **Security testing** - Perform security scans on each deployment
- **Rollback testing** - Test rollback procedures regularly

### Safe Production Deployments

- **Deploy during low-traffic periods** - Minimize impact on users
- **Use blue-green deployment** - Maintain two production environments
- **Implement feature flags** - Roll out features gradually
- **Monitor continuously** - Watch metrics closely after deployment
- **Have rollback ready** - Know rollback plan before deploying
- **Communicate with users** - Notify users of planned deployments

### Logging

- **Structured logging** - Use consistent log formats
- **Log levels** - Use appropriate log levels (DEBUG, INFO, WARN, ERROR)
- **Correlation IDs** - Track requests across services
- **Sensitive data** - Never log passwords, tokens, or PII
- **Log aggregation** - Centralize logs for analysis
- **Retention policy** - Define how long to keep logs

### Monitoring

- **Application metrics** - Monitor response times, error rates, throughput
- **Infrastructure metrics** - Monitor CPU, memory, disk, network
- **Business metrics** - Monitor user engagement, conversion rates
- **Alerting** - Set up alerts for critical issues
- **Dashboards** - Create dashboards for visual monitoring
- **Regular reviews** - Review metrics regularly to identify trends

---

For additional information about the project structure and components, refer to:
- [README.md](README.md) - Project overview and quick start
- [PLATFORM_MAP.md](PLATFORM_MAP.md) - Complete application structure
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
