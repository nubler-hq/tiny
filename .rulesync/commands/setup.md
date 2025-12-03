---
description: 'Start setup' # command description
targets: ["*"] # * = all, or specific tools
---

## 🎯 Overview
This command executes the complete environment setup for SaaS Boilerplate development, ensuring everything is ready to start building your SaaS.

## 🔍 Prerequisites Verification

### Operating System
- ✅ **macOS**: Fully supported
- ✅ **Linux**: Fully supported  
- ✅ **Windows**: Supported via WSL2

### Minimum Required Versions
```
Node.js: 22.0.0 or higher
Docker: 20.0.0 or higher
Git: 2.30.0 or higher
Github CLI
Ensure access of GitHub CLI connected account to vibe-dev/saas-boilerplate
```

### Recommended Package Managers
1. **bun** (Recommended) - Superior performance
2. **pnpm** - Space efficiency
3. **npm** - Universal compatibility

## 📋 Automated Setup Steps

### 1. Environment Verification
```
VERIFY_SYSTEM:
- Check Node.js version
- Verify Docker installation
- Check package manager
- Verify available disk space
- Check file permissions
```

### 2. Dependencies Installation
```
INSTALL_DEPENDENCIES:
- Install project dependencies
- Check version compatibility
- Resolve dependency conflicts
- Install development dependencies
```

### 3. Environment Configuration
```
CONFIGURE_ENVIRONMENT:
- Copy .env.example to .env
- Configure basic environment variables
- Generate encryption keys if needed
- Configure development URLs
```

### 4. Database Setup
```
CONFIGURE_DATABASE:
- Start PostgreSQL Docker container
- Wait for database to be ready
- Run Prisma migrations
- Populate database with initial data (seed)
```

### 5. Igniter.js Configuration
```
CONFIGURE_IGNITER:
- Verify Igniter.js configuration
- Configure service providers
- Test external API connections
- Validate security configurations
```

### 6. Final Verification
```
VERIFY_SETUP:
- Run connectivity tests
- Check if APIs are responding
- Test basic functionalities
- Validate security configurations
```

## 🚀 Quick Execution

```bash
# 1. Install dependencies
bun install

# 2. Configure environment (If not already created)
cp .env.sample .env

# 3. Start database
bun run docker:up

# 4. Run migrations
bun run db:migrate:dev

# 5. Populate database (optional)
bun run db:seed

# 6. Start server
bun run dev
```

## ⚙️ Essential Configurations

### Environment Variables (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/saas_boilerplate"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (for payments)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET_NAME="your-bucket-name"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"
```

### Docker Compose
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: saas_boilerplate
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🔧 Common Troubleshooting

### Issue: Port 3000 already in use
```
SOLUTION:
- Find process using the port: lsof -i :3000
- Kill process: kill -9 <PID>
- Or use alternative port: bun run dev --port 3001
```

### Issue: Database connection error
```
SOLUTION:
- Check if Docker is running: docker ps
- Restart container: bun run docker:restart
- Verify environment variables in .env
```

### Issue: Dependencies won't install
```
SOLUTION:
- Clear cache: bun pm cache rm
- Reinstall: rm -rf node_modules && bun install
- Check Node.js version: node --version
```

## 📊 Post-Setup Verification

### ✅ Application Running
- [ ] http://localhost:3000 - Home page
- [ ] http://localhost:3000/auth/signin - Login page
- [ ] http://localhost:3000/dashboard - Dashboard (after login)

### ✅ Database
- [ ] PostgreSQL connection established
- [ ] Tables created by Prisma
- [ ] Initial data populated

### ✅ Functional APIs
- [ ] Authentication endpoint responding
- [ ] Igniter.js API working
- [ ] Webhooks configured (if applicable)

## 🎯 Next Steps After Setup

### For Beginners
1. **Explore project structure**
2. **Read basic documentation**
3. **Run `/init` command for onboarding**
4. **Create your first simple feature**

### For Experienced Developers
1. **Analyze Igniter.js architecture**
2. **Review security configurations**
3. **Set up CI/CD**
4. **Implement advanced features**

## 🔗 Support Resources

### Documentation
- [Installation Guide](./docs/installation.md)
- [Environment Setup](./docs/environment-setup.md)
- [Troubleshooting](./docs/troubleshooting.md)

### Community
- [Igniter.js Discord](https://discord.com/invite/JKGEQpjvJ6)
- [GitHub Issues](https://github.com/felipebarcelospro/saas-boilerplate/issues)
- [Vibe Dev YouTube](https://www.youtube.com/@vibedev.official)

## 📈 Setup Monitoring

### Success Metrics
- ⏱️ **Setup time**: < 10 minutes
- ✅ **Success rate**: > 95%
- 🐛 **Issues resolved**: Automatically
- 🚀 **Ready to code**: Immediate

### Important Logs
```
📁 Logs saved in: .logs/setup-$(date).log
🐛 Issues reported in: .logs/issues-$(date).log
✅ Success metrics in: .logs/metrics-$(date).log
```

## 🎉 Setup Complete!

After successfully running this command, you will have:
- ✅ Completely configured environment
- ✅ Database running locally
- ✅ Development server active
- ✅ All dependencies installed
- ✅ Basic configurations applied

**Now you're ready to start developing your SaaS! 🚀**

Use the `/init` command to continue with personalized onboarding or start exploring the source code.