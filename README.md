# 🚀 GitHub Actions CI/CD Pipeline Generator

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Sui](https://img.shields.io/badge/Sui_Move-Blockchain-4285F4?style=for-the-badge&logo=blockchain.info&logoColor=white)](https://sui.io/)

A modern, interactive web application for generating custom GitHub Actions CI/CD workflows tailored to your project needs. **Specially optimized for Sui Move smart contract projects** with comprehensive blockchain deployment capabilities.

## ✨ Features

### 🎯 **Universal Project Support**
- **Sui Move Smart Contracts** - Complete blockchain CI/CD with security auditing
- **Node.js/TypeScript** - Modern JavaScript applications
- **Python** - Data science and web applications  
- **Java** - Enterprise applications with Maven/Gradle
- **Go** - High-performance backend services
- **PHP** - Web applications and APIs
- **.NET** - Microsoft stack applications

### 🔧 **Advanced CI/CD Capabilities**
- 🧪 **Automated Testing** - Unit tests, integration tests, and gas profiling
- 🔍 **Code Quality** - Linting, security scanning, and best practices validation
- 🚀 **Multi-Environment Deployment** - Devnet, Testnet, and Production
- 📦 **Artifact Management** - Build output collection and distribution
- 🔐 **Secure Secret Handling** - GitHub Secrets integration for wallet management
- 🐳 **Docker Support** - Containerized deployment workflows
- ⚡ **Performance Optimization** - Caching and parallel job execution

### 🟦 **Sui Move Specialization**
- **Smart Contract Security Analysis** - Automated vulnerability detection
- **Gas Usage Profiling** - Cost optimization and monitoring
- **Multi-Network Deployment** - Seamless devnet and testnet publishing
- **Wallet Integration** - Secure key management through GitHub Secrets
- **Move Language Linting** - Sui-specific code quality checks
- **Capability Analysis** - Object ownership and transfer pattern validation

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Git** for version control
- **GitHub repository** for your project
- For Sui projects: **Sui CLI** installed locally ([Installation Guide](https://docs.sui.io/guides/developer/getting-started/sui-install))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cicd-generator.git
cd cicd-generator

# Install dependencies
npm install
# or
yarn install
# or 
pnpm install

# Start the development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the generator.

### Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 📋 Usage Guide

### 1. **Configure Your Project**
- Select your project type (Sui Move recommended for blockchain projects)
- Choose package manager and deployment targets
- Enable desired pipeline stages (lint, test, build, security, deploy)

### 2. **Customize Pipeline Settings**
- Set environment variables and secrets
- Configure branch-specific deployment rules
- Enable advanced features like Docker support and caching

### 3. **Generate & Download**
- Copy the generated YAML or download the workflow file
- Save as `.github/workflows/ci-cd.yml` in your repository
- Commit and push to activate the pipeline

## 🟦 Sui Move Project Setup Guide

### Required GitHub Secrets

For Sui smart contract deployment, configure these secrets in your GitHub repository:

| Secret Name | Description | Location |
|-------------|-------------|----------|
| `SUI_CONFIG` | Wallet configuration file content | `~/.sui/sui_config/client.yaml` |
| `SUI_KEYSTORE` | Wallet keystore file content | `~/.sui/sui_config/sui.keystore` |
| `SUI_ALIASES` | Wallet aliases file content | `~/.sui/sui_config/sui.aliases` |

### Setting Up Secrets

1. **Generate Sui Wallet Configuration** (if you haven't already):
   ```bash
   sui client new-address ed25519
   sui client active-address
   ```

2. **Access GitHub Repository Settings**:
   - Navigate to your GitHub repository
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**

3. **Add Each Secret**:
   ```bash
   # Get configuration content
   cat ~/.sui/sui_config/client.yaml
   cat ~/.sui/sui_config/sui.keystore  
   cat ~/.sui/sui_config/sui.aliases
   ```
   Copy each file's content as the secret value.

### Funding Your Wallet

```bash
# For Devnet (testing)
curl -X POST https://faucet.devnet.sui.io/gas \
  -H 'Content-Type: application/json' \
  -d '{"FixedAmountRequest":{"recipient":"YOUR_SUI_ADDRESS"}}'

# Verify balance
sui client gas
```

### Example Sui Move Project Structure

```
my-sui-project/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # Generated workflow
├── sources/
│   ├── my_module.move         # Your Move modules
│   └── tests/
│       └── my_module_test.move
├── Move.toml                  # Project configuration
└── README.md
```

## 🔧 Generated Workflow Features

### For Sui Move Projects

```yaml
name: Sui Smart Contract CI/CD Pipeline

on:
  push:
    branches: ["main", "develop"]
  pull_request:
    branches: ["main", "develop"]

jobs:
  test-and-build:
    runs-on: ubuntu-latest
    steps:
      # Environment setup with Sui CLI
      - name: Install Sui
        run: brew install sui
      
      # Security analysis
      - name: Sui Security Best Practices Check
        run: |
          echo "→ Checking access control patterns..."
          grep -r "public(" sources/
          grep -r "entry " sources/
          
      # Build and test
      - name: Build Move modules
        run: sui move build
        
      - name: Run Move tests
        run: sui move test
        
      # Deploy to devnet/testnet
      - name: Deploy to Devnet
        run: sui client publish --gas-budget 100000000
        if: github.ref == 'refs/heads/develop'
```

### Security Features

- **Access Control Analysis** - Identifies public and entry functions
- **Capability Validation** - Checks proper use of `has key`, `has store`
- **Transfer Pattern Review** - Validates object ownership transfers
- **Gas Usage Monitoring** - Tracks deployment costs
- **Automated Security Reports** - Generated and stored as artifacts

## 🛠️ Customization

### Adding Custom Build Steps

The generator supports custom commands for different project stages:

```typescript
// Example custom configuration
{
  projectType: 'sui',
  testCommand: 'sui move test --coverage',
  buildCommand: 'sui move build --profile release',
  deployScript: 'bash scripts/deploy.sh'
}
```

### Environment-Specific Configuration

```yaml
# Production deployment (main branch)
deploy-mainnet:
  if: github.ref == 'refs/heads/main'
  environment: production
  
# Development deployment (develop branch)  
deploy-devnet:
  if: github.ref == 'refs/heads/develop'
  environment: development
```

## 📊 Monitoring & Analytics

### Deployment Tracking
- **Transaction Hashes** - Recorded for each deployment
- **Gas Usage Reports** - Cost analysis and optimization suggestions  
- **Contract Addresses** - Automatically tracked and documented
- **Deployment History** - Full audit trail with GitHub Actions logs

### Security Monitoring
- **Vulnerability Scanning** - Automated security analysis
- **Best Practice Validation** - Move-specific pattern checking
- **Dependency Auditing** - Third-party module validation

## 🔍 Troubleshooting

### Common Issues

**❌ Deployment fails with "insufficient gas"**
```bash
# Solution: Fund your wallet or increase gas budget
sui client gas  # Check current balance
# Request more tokens from devnet faucet
```

**❌ "Sui command not found"**
```bash
# Solution: Verify Sui CLI installation
which sui
sui --version
```

**❌ Secrets not configured**
```bash
# Solution: Verify all required secrets are set
# Check Settings → Secrets and variables → Actions
```

### Debug Commands

```bash
# Local testing
sui move build --dump-bytecode-as-base64
sui move test --verbose
sui client active-address

# Network connectivity
sui client call --help
sui client gas
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Use **TypeScript** for type safety
- Follow **ESLint** and **Prettier** configurations
- Add **tests** for new features
- Update **documentation** for API changes
- Ensure **accessibility** compliance

## 📚 Resources

### Sui Development
- [Sui Documentation](https://docs.sui.io/) - Official Sui blockchain documentation
- [Move Language Guide](https://move-language.github.io/move/) - Learn Move programming
- [Sui Examples](https://github.com/MystenLabs/sui/tree/main/examples) - Sample smart contracts
- [Discord Community](https://discord.gg/sui) - Get help from the community

### CI/CD Best Practices
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Security Hardening](https://docs.github.com/en/actions/security-guides)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🚀 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/cicd-generator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/cicd-generator/discussions)  
- **Email**: support@yourproject.com

---

<div align="center">

**⭐ Star this repository if it helped you!**

Made with ❤️ for the **Sui Move** and **DevOps** communities

[🌐 Website](https://your-deployed-app.vercel.app) • [📖 Documentation](https://docs.yourproject.com) • [🐦 Twitter](https://twitter.com/yourproject)

</div>
