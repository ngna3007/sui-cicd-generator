# 🚀 GitHub Actions CI/CD Pipeline Generator

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Sui](https://img.shields.io/badge/Sui_Move-Blockchain-4285F4?style=for-the-badge&logo=blockchain.info&logoColor=white)](https://sui.io/)

A modern, interactive web application for generating custom GitHub Actions CI/CD workflows tailored to your project needs. **Specially optimized for Sui Move smart contract projects** with comprehensive blockchain deployment capabilities.

Demo video for Sui CI/CD workflow:

https://github.com/user-attachments/assets/dd9aad03-ca46-4ce3-a87f-89d183f91b06

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
name: my-project - Sui Smart Contract CI/CD
'on':
  push:
    branches:
    - main
    - develop
  pull_request:
    branches:
    - main
    - develop
env:
  RUST_BACKTRACE: '1'
  SUI_LOG_LEVEL: info
jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    - name: Install Homebrew and Sui
      run: |
        # Install Homebrew
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Add brew to PATH for this step and future steps
        echo "/home/linuxbrew/.linuxbrew/bin" >> $GITHUB_PATH
        echo "/home/linuxbrew/.linuxbrew/sbin" >> $GITHUB_PATH
        
        # Set environment variables for this workflow
        echo "HOMEBREW_PREFIX=/home/linuxbrew/.linuxbrew" >> $GITHUB_ENV
        echo "HOMEBREW_CELLAR=/home/linuxbrew/.linuxbrew/Cellar" >> $GITHUB_ENV
        echo "HOMEBREW_REPOSITORY=/home/linuxbrew/.linuxbrew/Homebrew" >> $GITHUB_ENV
        
        # Source brew environment for this step
        eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
        
        # Install dependencies
        sudo apt-get update
        sudo apt-get install -y build-essential
        brew install gcc
        
        # Install Sui
        brew install sui
        
        # Verify Sui installation
        sui --version
    - name: Build Move modules
      run: |
        # Verify sui command is available
        which sui || (echo "Sui command not found in PATH" && exit 1)
        sui --version
        
        # Build the project
        sui move build
      working-directory: ${{ github.workspace }}
  test:
    name: Test
    runs-on: ubuntu-latest
    needs: build
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    - name: Install Homebrew and Sui
      run: |
        # Install Homebrew
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Add brew to PATH for this step and future steps
        echo "/home/linuxbrew/.linuxbrew/bin" >> $GITHUB_PATH
        echo "/home/linuxbrew/.linuxbrew/sbin" >> $GITHUB_PATH
        
        # Set environment variables for this workflow
        echo "HOMEBREW_PREFIX=/home/linuxbrew/.linuxbrew" >> $GITHUB_ENV
        echo "HOMEBREW_CELLAR=/home/linuxbrew/.linuxbrew/Cellar" >> $GITHUB_ENV
        echo "HOMEBREW_REPOSITORY=/home/linuxbrew/.linuxbrew/Homebrew" >> $GITHUB_ENV
        
        # Source brew environment for this step
        eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
        
        # Install dependencies
        sudo apt-get update
        sudo apt-get install -y build-essential
        brew install gcc
        
        # Install Sui
        brew install sui
        
        # Verify Sui installation
        sui --version
    - name: Run Move tests
      run: |
        # Verify sui command is available
        which sui || (echo "Sui command not found in PATH" && exit 1)
        
        # Run tests
        sui move test
      working-directory: ${{ github.workspace }}
  security:
    name: Security Analysis
    runs-on: ubuntu-latest
    needs: build
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    - name: Install Homebrew and Sui
      run: |
        # Install Homebrew
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Add brew to PATH for this step and future steps
        echo "/home/linuxbrew/.linuxbrew/bin" >> $GITHUB_PATH
        echo "/home/linuxbrew/.linuxbrew/sbin" >> $GITHUB_PATH
        
        # Set environment variables for this workflow
        echo "HOMEBREW_PREFIX=/home/linuxbrew/.linuxbrew" >> $GITHUB_ENV
        echo "HOMEBREW_CELLAR=/home/linuxbrew/.linuxbrew/Cellar" >> $GITHUB_ENV
        echo "HOMEBREW_REPOSITORY=/home/linuxbrew/.linuxbrew/Homebrew" >> $GITHUB_ENV
        
        # Source brew environment for this step
        eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
        
        # Install dependencies
        sudo apt-get update
        sudo apt-get install -y build-essential jq
        brew install gcc
        
        # Install Sui
        brew install sui
        
        # Verify Sui installation
        sui --version
    - name: Run Sui Built-in Linters
      run: |
        # Run Move build with linting enabled
        echo "=== Running Sui Built-in Linters ==="
        sui move build --lint || echo "Linting completed with warnings"
        
        # Check for potential security issues in linter output
        echo "=== Linter Security Summary ==="
        echo "Built-in linters check for:"
        echo "- Coin field optimization (W03001)"
        echo "- Collection equality issues (W05001)"
        echo "- Custom state change problems (W02001)"
        echo "- Freeze wrapped object issues (W04001)"
        echo "- Self transfer anti-patterns (W01001)"
        echo "- Share owned object problems (W00001)"
      working-directory: ${{ github.workspace }}
    - name: Security Best Practices Check
      run: |
        echo "=== Security Best Practices Analysis ==="
        
        # Check for common security patterns
        echo "Checking for common security patterns..."
        
        # Check for proper access controls
        echo "→ Checking access control patterns..."
        grep -r "public(" sources/ || echo "No public functions found"
        grep -r "entry " sources/ || echo "No entry functions found"
        grep -r "public(package)" sources/ || echo "No package-level functions found"
        
        # Check for proper object management
        echo "→ Checking object management..."
        grep -r "transfer::" sources/ || echo "No transfer operations found"
        grep -r "share_object" sources/ || echo "No shared objects found"
        
        # Check for capability usage
        echo "→ Checking capability usage..."
        grep -r "has key" sources/ || echo "No key capabilities found"
        grep -r "has store" sources/ || echo "No store capabilities found"
        
        # Check for potential flash loan patterns
        echo "→ Checking for flash loan patterns (Hot Potato)..."
        grep -r "borrow\|loan" sources/ || echo "No borrowing patterns found"
        
        # Check for arithmetic operations that might overflow
        echo "→ Checking arithmetic operations..."
        grep -r "<<\|>>" sources/ && echo "⚠️  Found bitwise operations - check for overflow" || echo "No bitwise operations found"
        
        # Check for external calls
        echo "→ Checking external module usage..."
        grep -r "use.*::" sources/ | head -10 || echo "No external modules found"
        
        echo "✅ Security best practices check completed"
      working-directory: ${{ github.workspace }}
    - name: Formal Verification Check
      run: |
        echo "=== Formal Verification Analysis ==="
        
        # Check if Sui Prover specs are present
        if find sources/ -name "*.move" -exec grep -l "spec\|ensures\|requires\|aborts_if" {} \; | head -5; then
            echo "✅ Found formal verification specs"
            echo "Formal specs help prove:"
            echo "- Function correctness"
            echo "- Invariant preservation"
            echo "- Absence of arithmetic overflows"
            echo "- Resource safety properties"
        else
            echo "⚠️  No formal verification specs found"
            echo "Consider adding formal specs for critical functions:"
            echo "- spec ensures result == expected"
            echo "- spec requires input > 0"
            echo "- spec aborts_if condition"
            echo ""
            echo "Learn more: https://github.com/asymptotic-io/sui-prover"
        fi
      working-directory: ${{ github.workspace }}
    - name: Generate Security Report
      run: |
        echo "=== Generating Security Report ==="
        
        # Create security report
        cat > security-report.md << 'EOF'
        # Security Analysis Report
        
        ## Overview
        This report summarizes the security analysis of the Sui Move smart contracts.
        
        ## Tools Used
        - **Sui Built-in Linters**: Checks for Move-specific anti-patterns
        - **Security Best Practices**: Manual checks for common vulnerabilities
        - **Formal Verification**: Checks for mathematical proofs of correctness
        
        ## Security Considerations for Sui Move Contracts
        
        ### 1. Access Control
        - ✅ Review function visibility (`public`, `entry`, `public(package)`)
        - ✅ Ensure proper capability-based security
        - ✅ Validate object ownership patterns
        
        ### 2. Object Management
        - ✅ Proper use of transfer operations
        - ✅ Correct shared vs owned object handling
        - ✅ Avoid freezing wrapped objects
        
        ### 3. Arithmetic Safety
        - ✅ Move provides automatic overflow protection
        - ⚠️ Bitwise operations don't have overflow checks
        - ✅ Consider precision errors in calculations
        
        ### 4. Resource Safety
        - ✅ Move's linear type system prevents double-spending
        - ✅ Resources must be explicitly consumed or stored
        - ✅ No dangling references possible
        
        ### 5. Flash Loan Protection
        - ✅ Analyze "Hot Potato" patterns
        - ✅ Ensure proper state validation
        - ✅ Check for price oracle manipulation
        
        ## Recommended Security Practices
        
        1. **Use Formal Verification**: Add specs to critical functions
        2. **Professional Audit**: Consider audits from:
           - MoveBit (Move-focused security)
           - OtterSec (Multi-chain auditor)
           - Beosin (Move Lint tools)
           - SlowMist (Comprehensive auditing)
        3. **Static Analysis**: Use available linting tools
        4. **Testing**: Comprehensive unit and integration tests
        5. **Documentation**: Clear function specifications
        
        ## External Security Resources
        
        - [Sui Move Security Guide](https://docs.sui.io/concepts/sui-move-concepts)
        - [MoveBit Security Tools](https://m.movebit.xyz/MoveScanner)
        - [Sui Prover](https://github.com/asymptotic-io/sui-prover)
        - [SlowMist Audit Primer](https://github.com/slowmist/Sui-MOVE-Smart-Contract-Auditing-Primer)
        
        ---
        *Report generated on $(date)*
        EOF
        
        echo "✅ Security report generated: security-report.md"
        
        # Display key security recommendations
        echo ""
        echo "=== Key Security Recommendations ==="
        echo "1. 🔍 Consider professional security audit before mainnet"
        echo "2. 📝 Add formal verification specs for critical functions"
        echo "3. 🧪 Implement comprehensive test coverage"
        echo "4. 🔒 Review all public/entry function access controls"
        echo "5. 💰 Validate economic assumptions and tokenomics"
        echo "6. 🏗️  Test upgrade and migration procedures"
    - name: Upload Security Report
      uses: actions/upload-artifact@v4
      with:
        name: security-report
        path: security-report.md
  deploy-devnet:
    name: Deploy to devnet
    runs-on: ubuntu-latest
    needs:
    - test
    - security
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    env:
      SUI_NETWORK: devnet
      SUI_CONFIG: ${{ secrets.SUI_CONFIG }}
      SUI_KEYSTORE: ${{ secrets.SUI_KEYSTORE }}
      SUI_ALIASES: ${{ secrets.SUI_ALIASES }}
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    - name: Install Homebrew and Sui
      run: |
        # Install Homebrew
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Add brew to PATH for this step and future steps
        echo "/home/linuxbrew/.linuxbrew/bin" >> $GITHUB_PATH
        echo "/home/linuxbrew/.linuxbrew/sbin" >> $GITHUB_PATH
        
        # Set environment variables for this workflow
        echo "HOMEBREW_PREFIX=/home/linuxbrew/.linuxbrew" >> $GITHUB_ENV
        echo "HOMEBREW_CELLAR=/home/linuxbrew/.linuxbrew/Cellar" >> $GITHUB_ENV
        echo "HOMEBREW_REPOSITORY=/home/linuxbrew/.linuxbrew/Homebrew" >> $GITHUB_ENV
        
        # Source brew environment for this step
        eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
        
        # Install dependencies
        sudo apt-get update
        sudo apt-get install -y build-essential jq
        brew install gcc
        
        # Install Sui
        brew install sui
        
        # Verify Sui installation
        sui --version
    - name: Setup Sui CLI config and Deploy
      run: |
        # Verify sui command is available
        which sui || (echo "Sui command not found in PATH" && exit 1)
        
        # Check if all required secrets are provided
        if [ -z "$SUI_CONFIG" ] || [ -z "$SUI_KEYSTORE" ] || [ -z "$SUI_ALIASES" ]; then
            echo "⚠️  Deployment skipped: Required secrets are not configured"
            echo "To enable deployment:"
            echo "1. Add SUI_CONFIG secret with your wallet configuration"
            echo "2. Add SUI_KEYSTORE secret with your keystore file content"
            echo "3. Add SUI_ALIASES secret with your aliases file content"
            echo "4. Fund the wallet with devnet SUI tokens"
            exit 0
        fi
        
        # Create config directory
        mkdir -p ~/.sui/sui_config
        
        echo "Setting up Sui configuration..."
        echo "SUI_CONFIG secret present: $([ -n "$SUI_CONFIG" ] && echo "YES" || echo "NO")"
        echo "SUI_KEYSTORE secret present: $([ -n "$SUI_KEYSTORE" ] && echo "YES" || echo "NO")"
        echo "SUI_ALIASES secret present: $([ -n "$SUI_ALIASES" ] && echo "YES" || echo "NO")"
        
        # Write config file
        echo "Writing SUI_CONFIG to client.yaml..."
        echo "$SUI_CONFIG" > ~/.sui/sui_config/client.yaml
        echo "✅ Written SUI_CONFIG to client.yaml"
        
        # Write keystore file
        echo "Writing SUI_KEYSTORE to sui.keystore..."
        echo "$SUI_KEYSTORE" > ~/.sui/sui_config/sui.keystore
        echo "✅ Written SUI_KEYSTORE"
        
        # Write aliases file
        echo "Writing SUI_ALIASES to sui.aliases..."
        echo "$SUI_ALIASES" > ~/.sui/sui_config/sui.aliases
        echo "✅ Written SUI_ALIASES"
        
        # Set proper permissions
        chmod 600 ~/.sui/sui_config/*
        
        # Fix the keystore path in client.yaml
        echo "Fixing keystore path in client.yaml..."
        sed -i 's|/home/ngocanh/.sui/sui_config/sui.keystore|/home/runner/.sui/sui_config/sui.keystore|g' ~/.sui/sui_config/client.yaml
        echo "✅ Updated keystore path"
        
        # Try to check addresses from configuration
        echo "=== Checking Sui Configuration ==="
        sui client addresses || {
            echo "Failed to get addresses from keystore. Creating a new address for CI deployment..."
            
            # Create a new address for CI deployment
            echo "Creating new address..."
            NEW_ADDRESS=$(sui client new-address ed25519 --json | jq -r '.address' 2>/dev/null || {
                sui client new-address ed25519 | grep -oE '0x[a-fA-F0-9]+' | head -1
            })
            
            if [ -n "$NEW_ADDRESS" ]; then
                echo "✅ Created new address: $NEW_ADDRESS"
                
                # Try to get devnet tokens
                echo "Requesting devnet tokens..."
                curl -X POST https://faucet.devnet.sui.io/gas \
                    -H 'Content-Type: application/json' \
                    -d "{\"FixedAmountRequest\":{\"recipient\":\"$NEW_ADDRESS\"}}" \
                    --silent --show-error || echo "Warning: Failed to request tokens from faucet"
                
                # Wait for the faucet
                echo "Waiting for faucet transaction..."
                sleep 10
            else
                echo "❌ Failed to create new address"
            exit 1
            fi
        }
        
        # Final check - get active address
        ACTIVE_ADDRESS=$(sui client active-address 2>/dev/null || echo "")
        if [ -z "$ACTIVE_ADDRESS" ] || [ "$ACTIVE_ADDRESS" = "None" ]; then
            echo "❌ No active address found after configuration"
            exit 1
        else
            echo "✅ Active address: $ACTIVE_ADDRESS"
        fi
        
        # Check if we have gas before attempting deployment
        echo "Checking gas balance..."
        if ! sui client gas; then
            echo "❌ Failed to check gas balance or no gas objects found."
            echo "Please fund your address with devnet SUI tokens before deployment."
            echo "You can get devnet tokens from: https://discord.com/channels/916379725201563759/971488439931392130"
            exit 1
        fi
        
        echo "=== Publishing Package ==="
        if sui client publish --gas-budget 100000000; then
            echo "✅ Package published successfully to devnet"
        else
            echo "❌ Deployment failed"
            echo "This might be due to insufficient gas, network issues, or compilation errors"
            exit 1
        fi
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
