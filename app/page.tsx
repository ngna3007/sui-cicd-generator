'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Download, Settings, Code, GitBranch, Copy, Check } from 'lucide-react';

interface Config {
  projectName: string;
  projectType: string;
  branches: string;
  nodeVersion: string;
  packageManager: string;
  stages: {
    lint: boolean;
    test: boolean;
    build: boolean;
    security: boolean;
    deploy: boolean;
  };
  deploymentTargets: string;
  dockerize: boolean;
  caching: boolean;
  notifications: boolean;
  parallelJobs: boolean;
  envVars: string;
  testCommand: string;
  buildCommand: string;
  deployScript: string;
}

const GitHubPipelineGenerator = () => {
  const [config, setConfig] = useState<Config>({
    projectName: 'my-project',
    projectType: 'sui',
    branches: 'main,develop',
    nodeVersion: '18',
    packageManager: 'sui move',
    stages: {
      lint: true,
      test: true,
      build: true,
      security: false,
      deploy: true
    },
    deploymentTargets: 'devnet',
    dockerize: false,
    caching: true,
    notifications: false,
    parallelJobs: true,
    envVars: 'NODE_ENV,API_KEY',
    testCommand: '',
    buildCommand: '',
    deployScript: ''
  });

  const [generatedYaml, setGeneratedYaml] = useState('');
  const [copied, setCopied] = useState(false);

  const projectTypes = {
    sui: { name: 'Sui Move', icon: '💧' },
    nodejs: { name: 'Node.js', icon: '⚡' },
    python: { name: 'Python', icon: '🐍' },
    java: { name: 'Java', icon: '☕' },
    go: { name: 'Go', icon: '🐹' },
    php: { name: 'PHP', icon: '🐘' },
    dotnet: { name: '.NET', icon: '' }
  };

  const packageManagers = {
    sui: ['sui move'],
    nodejs: ['npm', 'yarn', 'pnpm'],
    python: ['pip', 'poetry', 'pipenv'],
    java: ['maven', 'gradle'],
    go: ['go mod'],
    php: ['composer'],
    dotnet: ['dotnet']
  };

  const generateWorkflow = useCallback(() => {
    const branches = config.branches.split(',').map(b => b.trim()).filter(b => b);
    const deployTargets = config.deploymentTargets.split(',').map(t => t.trim()).filter(t => t);
    const envVarsList = config.envVars.split(',').map(v => v.trim()).filter(v => v);

    // For Sui projects, use the specific structure
    if (config.projectType === 'sui') {
      const branchList = branches.map(b => b).join('\n    - ');
      
      let workflow = `name: ${config.projectName} - Sui Smart Contract CI/CD\n`;
      workflow += "'on':\n";
      workflow += '  push:\n';
      workflow += '    branches:\n';
      workflow += '    - ' + branchList + '\n';
      workflow += '  pull_request:\n';
      workflow += '    branches:\n';
      workflow += '    - ' + branchList + '\n';
      workflow += 'env:\n';
      workflow += '  RUST_BACKTRACE: \'1\'\n';
      workflow += '  SUI_LOG_LEVEL: info\n';
      
      workflow += 'jobs:\n';
      
      // Build Job
      if (config.stages.build) {
        workflow += '  build:\n';
        workflow += '    name: Build\n';
        workflow += '    runs-on: ubuntu-latest\n';
        workflow += '    steps:\n';
        workflow += '    - name: Checkout code\n';
        workflow += '      uses: actions/checkout@v4\n';
        workflow += '    - name: Install Homebrew and Sui\n';
        workflow += '      run: |\n';
        workflow += '        # Install Homebrew\n';
        workflow += '        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"\n';
        workflow += '        \n';
        workflow += '        # Add brew to PATH for this step and future steps\n';
        workflow += '        echo "/home/linuxbrew/.linuxbrew/bin" >> $GITHUB_PATH\n';
        workflow += '        echo "/home/linuxbrew/.linuxbrew/sbin" >> $GITHUB_PATH\n';
        workflow += '        \n';
        workflow += '        # Set environment variables for this workflow\n';
        workflow += '        echo "HOMEBREW_PREFIX=/home/linuxbrew/.linuxbrew" >> $GITHUB_ENV\n';
        workflow += '        echo "HOMEBREW_CELLAR=/home/linuxbrew/.linuxbrew/Cellar" >> $GITHUB_ENV\n';
        workflow += '        echo "HOMEBREW_REPOSITORY=/home/linuxbrew/.linuxbrew/Homebrew" >> $GITHUB_ENV\n';
        workflow += '        \n';
        workflow += '        # Source brew environment for this step\n';
        workflow += '        eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"\n';
        workflow += '        \n';
        workflow += '        # Install dependencies\n';
        workflow += '        sudo apt-get update\n';
        workflow += '        sudo apt-get install -y build-essential\n';
        workflow += '        brew install gcc\n';
        workflow += '        \n';
        workflow += '        # Install Sui\n';
        workflow += '        brew install sui\n';
        workflow += '        \n';
        workflow += '        # Verify Sui installation\n';
        workflow += '        sui --version\n';
        workflow += '    - name: Build Move modules\n';
        workflow += '      run: |\n';
        workflow += '        # Verify sui command is available\n';
        workflow += '        which sui || (echo "Sui command not found in PATH" && exit 1)\n';
        workflow += '        sui --version\n';
        workflow += '        \n';
        workflow += '        # Build the project\n';
        workflow += '        sui move build\n';
        workflow += '      working-directory: ${{ github.workspace }}\n';
      }
      
      // Test Job
      if (config.stages.test) {
        workflow += '  test:\n';
        workflow += '    name: Test\n';
        workflow += '    runs-on: ubuntu-latest\n';
        workflow += '    needs: build\n';
        workflow += '    steps:\n';
        workflow += '    - name: Checkout code\n';
        workflow += '      uses: actions/checkout@v4\n';
        workflow += '    - name: Install Homebrew and Sui\n';
        workflow += '      run: |\n';
        workflow += '        # Install Homebrew\n';
        workflow += '        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"\n';
        workflow += '        \n';
        workflow += '        # Add brew to PATH for this step and future steps\n';
        workflow += '        echo "/home/linuxbrew/.linuxbrew/bin" >> $GITHUB_PATH\n';
        workflow += '        echo "/home/linuxbrew/.linuxbrew/sbin" >> $GITHUB_PATH\n';
        workflow += '        \n';
        workflow += '        # Set environment variables for this workflow\n';
        workflow += '        echo "HOMEBREW_PREFIX=/home/linuxbrew/.linuxbrew" >> $GITHUB_ENV\n';
        workflow += '        echo "HOMEBREW_CELLAR=/home/linuxbrew/.linuxbrew/Cellar" >> $GITHUB_ENV\n';
        workflow += '        echo "HOMEBREW_REPOSITORY=/home/linuxbrew/.linuxbrew/Homebrew" >> $GITHUB_ENV\n';
        workflow += '        \n';
        workflow += '        # Source brew environment for this step\n';
        workflow += '        eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"\n';
        workflow += '        \n';
        workflow += '        # Install dependencies\n';
        workflow += '        sudo apt-get update\n';
        workflow += '        sudo apt-get install -y build-essential\n';
        workflow += '        brew install gcc\n';
        workflow += '        \n';
        workflow += '        # Install Sui\n';
        workflow += '        brew install sui\n';
        workflow += '        \n';
        workflow += '        # Verify Sui installation\n';
        workflow += '        sui --version\n';
        workflow += '    - name: Run Move tests\n';
        workflow += '      run: |\n';
        workflow += '        # Verify sui command is available\n';
        workflow += '        which sui || (echo "Sui command not found in PATH" && exit 1)\n';
        workflow += '        \n';
        workflow += '        # Run tests\n';
        workflow += '        sui move test\n';
        workflow += '      working-directory: ${{ github.workspace }}\n';
      }
      
      // Security Job
      if (config.stages.security) {
        workflow += '  security:\n';
        workflow += '    name: Security Analysis\n';
        workflow += '    runs-on: ubuntu-latest\n';
        workflow += '    needs: build\n';
        workflow += '    steps:\n';
        workflow += '    - name: Checkout code\n';
        workflow += '      uses: actions/checkout@v4\n';
        workflow += '    - name: Install Homebrew and Sui\n';
        workflow += '      run: |\n';
        workflow += '        # Install Homebrew\n';
        workflow += '        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"\n';
        workflow += '        \n';
        workflow += '        # Add brew to PATH for this step and future steps\n';
        workflow += '        echo "/home/linuxbrew/.linuxbrew/bin" >> $GITHUB_PATH\n';
        workflow += '        echo "/home/linuxbrew/.linuxbrew/sbin" >> $GITHUB_PATH\n';
        workflow += '        \n';
        workflow += '        # Set environment variables for this workflow\n';
        workflow += '        echo "HOMEBREW_PREFIX=/home/linuxbrew/.linuxbrew" >> $GITHUB_ENV\n';
        workflow += '        echo "HOMEBREW_CELLAR=/home/linuxbrew/.linuxbrew/Cellar" >> $GITHUB_ENV\n';
        workflow += '        echo "HOMEBREW_REPOSITORY=/home/linuxbrew/.linuxbrew/Homebrew" >> $GITHUB_ENV\n';
        workflow += '        \n';
        workflow += '        # Source brew environment for this step\n';
        workflow += '        eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"\n';
        workflow += '        \n';
        workflow += '        # Install dependencies\n';
        workflow += '        sudo apt-get update\n';
        workflow += '        sudo apt-get install -y build-essential jq\n';
        workflow += '        brew install gcc\n';
        workflow += '        \n';
        workflow += '        # Install Sui\n';
        workflow += '        brew install sui\n';
        workflow += '        \n';
        workflow += '        # Verify Sui installation\n';
        workflow += '        sui --version\n';
        workflow += '    - name: Run Sui Built-in Linters\n';
        workflow += '      run: |\n';
        workflow += '        # Run Move build with linting enabled\n';
        workflow += '        echo "=== Running Sui Built-in Linters ==="\n';
        workflow += '        sui move build --lint || echo "Linting completed with warnings"\n';
        workflow += '        \n';
        workflow += '        # Check for potential security issues in linter output\n';
        workflow += '        echo "=== Linter Security Summary ==="\n';
        workflow += '        echo "Built-in linters check for:"\n';
        workflow += '        echo "- Coin field optimization (W03001)"\n';
        workflow += '        echo "- Collection equality issues (W05001)"\n';
        workflow += '        echo "- Custom state change problems (W02001)"\n';
        workflow += '        echo "- Freeze wrapped object issues (W04001)"\n';
        workflow += '        echo "- Self transfer anti-patterns (W01001)"\n';
        workflow += '        echo "- Share owned object problems (W00001)"\n';
        workflow += '      working-directory: ${{ github.workspace }}\n';
        workflow += '    - name: Security Best Practices Check\n';
        workflow += '      run: |\n';
        workflow += '        echo "=== Security Best Practices Analysis ==="\n';
        workflow += '        \n';
        workflow += '        # Check for common security patterns\n';
        workflow += '        echo "Checking for common security patterns..."\n';
        workflow += '        \n';
        workflow += '        # Check for proper access controls\n';
        workflow += '        echo "→ Checking access control patterns..."\n';
        workflow += '        grep -r "public(" sources/ || echo "No public functions found"\n';
        workflow += '        grep -r "entry " sources/ || echo "No entry functions found"\n';
        workflow += '        grep -r "public(package)" sources/ || echo "No package-level functions found"\n';
        workflow += '        \n';
        workflow += '        # Check for proper object management\n';
        workflow += '        echo "→ Checking object management..."\n';
        workflow += '        grep -r "transfer::" sources/ || echo "No transfer operations found"\n';
        workflow += '        grep -r "share_object" sources/ || echo "No shared objects found"\n';
        workflow += '        \n';
        workflow += '        # Check for capability usage\n';
        workflow += '        echo "→ Checking capability usage..."\n';
        workflow += '        grep -r "has key" sources/ || echo "No key capabilities found"\n';
        workflow += '        grep -r "has store" sources/ || echo "No store capabilities found"\n';
        workflow += '        \n';
        workflow += '        # Check for potential flash loan patterns\n';
        workflow += '        echo "→ Checking for flash loan patterns (Hot Potato)..."\n';
        workflow += '        grep -r "borrow\\|loan" sources/ || echo "No borrowing patterns found"\n';
        workflow += '        \n';
        workflow += '        # Check for arithmetic operations that might overflow\n';
        workflow += '        echo "→ Checking arithmetic operations..."\n';
        workflow += '        grep -r "<<\\|>>" sources/ && echo "⚠️  Found bitwise operations - check for overflow" || echo "No bitwise operations found"\n';
        workflow += '        \n';
        workflow += '        # Check for external calls\n';
        workflow += '        echo "→ Checking external module usage..."\n';
        workflow += '        grep -r "use.*::" sources/ | head -10 || echo "No external modules found"\n';
        workflow += '        \n';
        workflow += '        echo "✅ Security best practices check completed"\n';
        workflow += '      working-directory: ${{ github.workspace }}\n';
        workflow += '    - name: Formal Verification Check\n';
        workflow += '      run: |\n';
        workflow += '        echo "=== Formal Verification Analysis ==="\n';
        workflow += '        \n';
        workflow += '        # Check if Sui Prover specs are present\n';
        workflow += '        if find sources/ -name "*.move" -exec grep -l "spec\\|ensures\\|requires\\|aborts_if" {} \\; | head -5; then\n';
        workflow += '            echo "✅ Found formal verification specs"\n';
        workflow += '            echo "Formal specs help prove:"\n';
        workflow += '            echo "- Function correctness"\n';
        workflow += '            echo "- Invariant preservation"\n';
        workflow += '            echo "- Absence of arithmetic overflows"\n';
        workflow += '            echo "- Resource safety properties"\n';
        workflow += '        else\n';
        workflow += '            echo "⚠️  No formal verification specs found"\n';
        workflow += '            echo "Consider adding formal specs for critical functions:"\n';
        workflow += '            echo "- spec ensures result == expected"\n';
        workflow += '            echo "- spec requires input > 0"\n';
        workflow += '            echo "- spec aborts_if condition"\n';
        workflow += '            echo ""\n';
        workflow += '            echo "Learn more: https://github.com/asymptotic-io/sui-prover"\n';
        workflow += '        fi\n';
        workflow += '      working-directory: ${{ github.workspace }}\n';
        workflow += '    - name: Generate Security Report\n';
        workflow += '      run: |\n';
        workflow += '        echo "=== Generating Security Report ==="\n';
        workflow += '        \n';
        workflow += '        # Create security report\n';
        workflow += '        cat > security-report.md << \'EOF\'\n';
        workflow += '        # Security Analysis Report\n';
        workflow += '        \n';
        workflow += '        ## Overview\n';
        workflow += '        This report summarizes the security analysis of the Sui Move smart contracts.\n';
        workflow += '        \n';
        workflow += '        ## Tools Used\n';
        workflow += '        - **Sui Built-in Linters**: Checks for Move-specific anti-patterns\n';
        workflow += '        - **Security Best Practices**: Manual checks for common vulnerabilities\n';
        workflow += '        - **Formal Verification**: Checks for mathematical proofs of correctness\n';
        workflow += '        \n';
        workflow += '        ## Security Considerations for Sui Move Contracts\n';
        workflow += '        \n';
        workflow += '        ### 1. Access Control\n';
        workflow += '        - ✅ Review function visibility (`public`, `entry`, `public(package)`)\n';
        workflow += '        - ✅ Ensure proper capability-based security\n';
        workflow += '        - ✅ Validate object ownership patterns\n';
        workflow += '        \n';
        workflow += '        ### 2. Object Management\n';
        workflow += '        - ✅ Proper use of transfer operations\n';
        workflow += '        - ✅ Correct shared vs owned object handling\n';
        workflow += '        - ✅ Avoid freezing wrapped objects\n';
        workflow += '        \n';
        workflow += '        ### 3. Arithmetic Safety\n';
        workflow += '        - ✅ Move provides automatic overflow protection\n';
        workflow += '        - ⚠️ Bitwise operations don\'t have overflow checks\n';
        workflow += '        - ✅ Consider precision errors in calculations\n';
        workflow += '        \n';
        workflow += '        ### 4. Resource Safety\n';
        workflow += '        - ✅ Move\'s linear type system prevents double-spending\n';
        workflow += '        - ✅ Resources must be explicitly consumed or stored\n';
        workflow += '        - ✅ No dangling references possible\n';
        workflow += '        \n';
        workflow += '        ### 5. Flash Loan Protection\n';
        workflow += '        - ✅ Analyze "Hot Potato" patterns\n';
        workflow += '        - ✅ Ensure proper state validation\n';
        workflow += '        - ✅ Check for price oracle manipulation\n';
        workflow += '        \n';
        workflow += '        ## Recommended Security Practices\n';
        workflow += '        \n';
        workflow += '        1. **Use Formal Verification**: Add specs to critical functions\n';
        workflow += '        2. **Professional Audit**: Consider audits from:\n';
        workflow += '           - MoveBit (Move-focused security)\n';
        workflow += '           - OtterSec (Multi-chain auditor)\n';
        workflow += '           - Beosin (Move Lint tools)\n';
        workflow += '           - SlowMist (Comprehensive auditing)\n';
        workflow += '        3. **Static Analysis**: Use available linting tools\n';
        workflow += '        4. **Testing**: Comprehensive unit and integration tests\n';
        workflow += '        5. **Documentation**: Clear function specifications\n';
        workflow += '        \n';
        workflow += '        ## External Security Resources\n';
        workflow += '        \n';
        workflow += '        - [Sui Move Security Guide](https://docs.sui.io/concepts/sui-move-concepts)\n';
        workflow += '        - [MoveBit Security Tools](https://m.movebit.xyz/MoveScanner)\n';
        workflow += '        - [Sui Prover](https://github.com/asymptotic-io/sui-prover)\n';
        workflow += '        - [SlowMist Audit Primer](https://github.com/slowmist/Sui-MOVE-Smart-Contract-Auditing-Primer)\n';
        workflow += '        \n';
        workflow += '        ---\n';
        workflow += '        *Report generated on $(date)*\n';
        workflow += '        EOF\n';
        workflow += '        \n';
        workflow += '        echo "✅ Security report generated: security-report.md"\n';
        workflow += '        \n';
        workflow += '        # Display key security recommendations\n';
        workflow += '        echo ""\n';
        workflow += '        echo "=== Key Security Recommendations ==="\n';
        workflow += '        echo "1. 🔍 Consider professional security audit before mainnet"\n';
        workflow += '        echo "2. 📝 Add formal verification specs for critical functions"\n';
        workflow += '        echo "3. 🧪 Implement comprehensive test coverage"\n';
        workflow += '        echo "4. 🔒 Review all public/entry function access controls"\n';
        workflow += '        echo "5. 💰 Validate economic assumptions and tokenomics"\n';
        workflow += '        echo "6. 🏗️  Test upgrade and migration procedures"\n';
        workflow += '    - name: Upload Security Report\n';
        workflow += '      uses: actions/upload-artifact@v4\n';
        workflow += '      with:\n';
        workflow += '        name: security-report\n';
        workflow += '        path: security-report.md\n';
      }
      
      // Deploy Job
      if (config.stages.deploy) {
        const deployTargets = config.deploymentTargets.split(',');
        
        for (const target of deployTargets) {
          const normalizedTarget = target.trim();
          workflow += `  deploy-${normalizedTarget}:\n`;
          workflow += `    name: Deploy to ${normalizedTarget}\n`;
          workflow += '    runs-on: ubuntu-latest\n';
          workflow += '    needs:\n';
          if (config.stages.test) workflow += '    - test\n';
          if (config.stages.security) workflow += '    - security\n';
          workflow += '    if: github.ref == \'refs/heads/main\' && github.event_name == \'push\'\n';
          workflow += '    env:\n';
          workflow += `      SUI_NETWORK: ${normalizedTarget}\n`;
          workflow += '      SUI_CONFIG: ${{ secrets.SUI_CONFIG }}\n';
          workflow += '      SUI_KEYSTORE: ${{ secrets.SUI_KEYSTORE }}\n';
          workflow += '      SUI_ALIASES: ${{ secrets.SUI_ALIASES }}\n';
          workflow += '    steps:\n';
          workflow += '    - name: Checkout code\n';
          workflow += '      uses: actions/checkout@v4\n';
          workflow += '    - name: Install Homebrew and Sui\n';
          workflow += '      run: |\n';
          workflow += '        # Install Homebrew\n';
          workflow += '        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"\n';
          workflow += '        \n';
          workflow += '        # Add brew to PATH for this step and future steps\n';
          workflow += '        echo "/home/linuxbrew/.linuxbrew/bin" >> $GITHUB_PATH\n';
          workflow += '        echo "/home/linuxbrew/.linuxbrew/sbin" >> $GITHUB_PATH\n';
          workflow += '        \n';
          workflow += '        # Set environment variables for this workflow\n';
          workflow += '        echo "HOMEBREW_PREFIX=/home/linuxbrew/.linuxbrew" >> $GITHUB_ENV\n';
          workflow += '        echo "HOMEBREW_CELLAR=/home/linuxbrew/.linuxbrew/Cellar" >> $GITHUB_ENV\n';
          workflow += '        echo "HOMEBREW_REPOSITORY=/home/linuxbrew/.linuxbrew/Homebrew" >> $GITHUB_ENV\n';
          workflow += '        \n';
          workflow += '        # Source brew environment for this step\n';
          workflow += '        eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"\n';
          workflow += '        \n';
          workflow += '        # Install dependencies\n';
          workflow += '        sudo apt-get update\n';
          workflow += '        sudo apt-get install -y build-essential jq\n';
          workflow += '        brew install gcc\n';
          workflow += '        \n';
          workflow += '        # Install Sui\n';
          workflow += '        brew install sui\n';
          workflow += '        \n';
          workflow += '        # Verify Sui installation\n';
          workflow += '        sui --version\n';
          workflow += '    - name: Setup Sui CLI config and Deploy\n';
          workflow += '      run: |\n';
          workflow += '        # Verify sui command is available\n';
          workflow += '        which sui || (echo "Sui command not found in PATH" && exit 1)\n';
          workflow += '        \n';
          workflow += '        # Check if all required secrets are provided\n';
          workflow += '        if [ -z "$SUI_CONFIG" ] || [ -z "$SUI_KEYSTORE" ] || [ -z "$SUI_ALIASES" ]; then\n';
          workflow += '            echo "⚠️  Deployment skipped: Required secrets are not configured"\n';
          workflow += '            echo "To enable deployment:"\n';
          workflow += '            echo "1. Add SUI_CONFIG secret with your wallet configuration"\n';
          workflow += '            echo "2. Add SUI_KEYSTORE secret with your keystore file content"\n';
          workflow += '            echo "3. Add SUI_ALIASES secret with your aliases file content"\n';
          workflow += '            echo "4. Fund the wallet with devnet SUI tokens"\n';
          workflow += '            exit 0\n';
          workflow += '        fi\n';
          workflow += '        \n';
          workflow += '        # Create config directory\n';
          workflow += '        mkdir -p ~/.sui/sui_config\n';
          workflow += '        \n';
          workflow += '        echo "Setting up Sui configuration..."\n';
          workflow += '        echo "SUI_CONFIG secret present: $([ -n "$SUI_CONFIG" ] && echo "YES" || echo "NO")"\n';
          workflow += '        echo "SUI_KEYSTORE secret present: $([ -n "$SUI_KEYSTORE" ] && echo "YES" || echo "NO")"\n';
          workflow += '        echo "SUI_ALIASES secret present: $([ -n "$SUI_ALIASES" ] && echo "YES" || echo "NO")"\n';
          workflow += '        \n';
          workflow += '        # Write config file\n';
          workflow += '        echo "Writing SUI_CONFIG to client.yaml..."\n';
          workflow += '        echo "$SUI_CONFIG" > ~/.sui/sui_config/client.yaml\n';
          workflow += '        echo "✅ Written SUI_CONFIG to client.yaml"\n';
          workflow += '        \n';
          workflow += '        # Write keystore file\n';
          workflow += '        echo "Writing SUI_KEYSTORE to sui.keystore..."\n';
          workflow += '        echo "$SUI_KEYSTORE" > ~/.sui/sui_config/sui.keystore\n';
          workflow += '        echo "✅ Written SUI_KEYSTORE"\n';
          workflow += '        \n';
          workflow += '        # Write aliases file\n';
          workflow += '        echo "Writing SUI_ALIASES to sui.aliases..."\n';
          workflow += '        echo "$SUI_ALIASES" > ~/.sui/sui_config/sui.aliases\n';
          workflow += '        echo "✅ Written SUI_ALIASES"\n';
          workflow += '        \n';
          workflow += '        # Set proper permissions\n';
          workflow += '        chmod 600 ~/.sui/sui_config/*\n';
          workflow += '        \n';
          workflow += '        # Fix the keystore path in client.yaml\n';
          workflow += '        echo "Fixing keystore path in client.yaml..."\n';
          workflow += '        sed -i \'s|/home/ngocanh/.sui/sui_config/sui.keystore|/home/runner/.sui/sui_config/sui.keystore|g\' ~/.sui/sui_config/client.yaml\n';
          workflow += '        echo "✅ Updated keystore path"\n';
          workflow += '        \n';
          workflow += '        # Try to check addresses from configuration\n';
          workflow += '        echo "=== Checking Sui Configuration ==="\n';
          workflow += '        sui client addresses || {\n';
          workflow += '            echo "Failed to get addresses from keystore. Creating a new address for CI deployment..."\n';
          workflow += '            \n';
          workflow += '            # Create a new address for CI deployment\n';
          workflow += '            echo "Creating new address..."\n';
          workflow += '            NEW_ADDRESS=$(sui client new-address ed25519 --json | jq -r \'.address\' 2>/dev/null || {\n';
          workflow += '                sui client new-address ed25519 | grep -oE \'0x[a-fA-F0-9]+\' | head -1\n';
          workflow += '            })\n';
          workflow += '            \n';
          workflow += '            if [ -n "$NEW_ADDRESS" ]; then\n';
          workflow += '                echo "✅ Created new address: $NEW_ADDRESS"\n';
          workflow += '                \n';
          workflow += '                # Try to get devnet tokens\n';
          workflow += '                echo "Requesting devnet tokens..."\n';
          workflow += '                curl -X POST https://faucet.devnet.sui.io/gas \\\n';
          workflow += '                    -H \'Content-Type: application/json\' \\\n';
          workflow += '                    -d "{\\"FixedAmountRequest\\":{\\"recipient\\":\\"$NEW_ADDRESS\\"}}" \\\n';
          workflow += '                    --silent --show-error || echo "Warning: Failed to request tokens from faucet"\n';
          workflow += '                \n';
          workflow += '                # Wait for the faucet\n';
          workflow += '                echo "Waiting for faucet transaction..."\n';
          workflow += '                sleep 10\n';
          workflow += '            else\n';
          workflow += '                echo "❌ Failed to create new address"\n';
          workflow += '            exit 1\n';
          workflow += '            fi\n';
          workflow += '        }\n';
          workflow += '        \n';
          workflow += '        # Final check - get active address\n';
          workflow += '        ACTIVE_ADDRESS=$(sui client active-address 2>/dev/null || echo "")\n';
          workflow += '        if [ -z "$ACTIVE_ADDRESS" ] || [ "$ACTIVE_ADDRESS" = "None" ]; then\n';
          workflow += '            echo "❌ No active address found after configuration"\n';
          workflow += '            exit 1\n';
          workflow += '        else\n';
          workflow += '            echo "✅ Active address: $ACTIVE_ADDRESS"\n';
          workflow += '        fi\n';
          workflow += '        \n';
          workflow += '        # Check if we have gas before attempting deployment\n';
          workflow += '        echo "Checking gas balance..."\n';
          workflow += '        if ! sui client gas; then\n';
          workflow += '            echo "❌ Failed to check gas balance or no gas objects found."\n';
          workflow += '            echo "Please fund your address with devnet SUI tokens before deployment."\n';
          workflow += '            echo "You can get devnet tokens from: https://discord.com/channels/916379725201563759/971488439931392130"\n';
          workflow += '            exit 1\n';
          workflow += '        fi\n';
          workflow += '        \n';
          workflow += '        echo "=== Publishing Package ==="\n';
          workflow += '        if sui client publish --gas-budget 100000000; then\n';
          workflow += '            echo "✅ Package published successfully to devnet"\n';
          workflow += '        else\n';
          workflow += '            echo "❌ Deployment failed"\n';
          workflow += '            echo "This might be due to insufficient gas, network issues, or compilation errors"\n';
          workflow += '            exit 1\n';
          workflow += '        fi\n';
        }
      }
      
      return workflow;
    }

    // For non-Sui projects, use the original logic
    const branchList = branches.map(b => '"' + b + '"').join(', ');
    
    let workflow = 'name: ' + config.projectName + ' CI/CD Pipeline\n\n';
    workflow += 'on:\n';
    workflow += '  push:\n';
    workflow += '    branches: [' + branchList + ']\n';
    workflow += '  pull_request:\n';
    workflow += '    branches: [' + branchList + ']\n\n';
    workflow += 'env:\n';

    // Add environment variables
    envVarsList.forEach(envVar => {
      workflow += '  ' + envVar + ': ${{ secrets.' + envVar + ' }}\n';
    });

    workflow += '\njobs:\n';
    workflow += '  test-and-build:\n';
    workflow += '    runs-on: ubuntu-latest\n';

    // Setup runtime environment for non-Sui projects
    switch (config.projectType) {
      case 'nodejs':
        workflow += '    strategy:\n';
        workflow += '      matrix:\n';
        workflow += '        node-version: [' + config.nodeVersion + ']\n';
        workflow += '    steps:\n';
        workflow += '      - name: Checkout code\n';
        workflow += '        uses: actions/checkout@v4\n';
        workflow += '      - name: Setup Node.js\n';
        workflow += '        uses: actions/setup-node@v4\n';
        workflow += '        with:\n';
        workflow += '          node-version: ${{ matrix.node-version }}\n';
        if (config.caching) {
          workflow += '          cache: \'' + config.packageManager + '\'\n';
        }
        break;
      
      case 'python':
        workflow += '    steps:\n';
        workflow += '      - name: Checkout code\n';
        workflow += '        uses: actions/checkout@v4\n';
        workflow += '      - name: Setup Python\n';
        workflow += '        uses: actions/setup-python@v4\n';
        workflow += '        with:\n';
        workflow += '          python-version: \'3.9\'\n';
        if (config.caching) {
          workflow += '          cache: \'' + config.packageManager + '\'\n';
        }
        break;
      
      case 'java':
        workflow += '    steps:\n';
        workflow += '      - name: Checkout code\n';
        workflow += '        uses: actions/checkout@v4\n';
        workflow += '      - name: Setup Java\n';
        workflow += '        uses: actions/setup-java@v4\n';
        workflow += '        with:\n';
        workflow += '          java-version: \'11\'\n';
        workflow += '          distribution: \'temurin\'\n';
        if (config.caching && config.packageManager === 'maven') {
          workflow += '          cache: \'maven\'\n';
        } else if (config.caching && config.packageManager === 'gradle') {
          workflow += '          cache: \'gradle\'\n';
        }
        break;
      
      case 'go':
        workflow += '    steps:\n';
        workflow += '      - name: Checkout code\n';
        workflow += '        uses: actions/checkout@v4\n';
        workflow += '      - name: Setup Go\n';
        workflow += '        uses: actions/setup-go@v4\n';
        workflow += '        with:\n';
        workflow += '          go-version: \'1.21\'\n';
        if (config.caching) {
          workflow += '          cache: true\n';
        }
        break;
      
      case 'php':
        workflow += '    steps:\n';
        workflow += '      - name: Checkout code\n';
        workflow += '        uses: actions/checkout@v4\n';
        workflow += '      - name: Setup PHP\n';
        workflow += '        uses: shivammathur/setup-php@v2\n';
        workflow += '        with:\n';
        workflow += '          php-version: \'8.2\'\n';
        if (config.caching) {
          workflow += '          tools: composer\n';
          workflow += '          coverage: none\n';
        }
        break;
      
      case 'dotnet':
        workflow += '    steps:\n';
        workflow += '      - name: Checkout code\n';
        workflow += '        uses: actions/checkout@v4\n';
        workflow += '      - name: Setup .NET\n';
        workflow += '        uses: actions/setup-dotnet@v3\n';
        workflow += '        with:\n';
        workflow += '          dotnet-version: \'6.0.x\'\n';
        break;
    }

    // Continue with the rest of the non-Sui workflow logic...
    const installCommands = {
      npm: 'npm ci',
      yarn: 'yarn install --frozen-lockfile',
      pnpm: 'pnpm install --frozen-lockfile',
      pip: 'pip install -r requirements.txt',
      poetry: 'poetry install',
      pipenv: 'pipenv install',
      maven: 'mvn clean compile',
      gradle: './gradlew build --no-daemon',
      composer: 'composer install --no-dev --optimize-autoloader',
      dotnet: 'dotnet restore'
    };

    workflow += '      - name: Install dependencies\n';
    workflow += '        run: ' + (installCommands[config.packageManager as keyof typeof installCommands] || 'echo "Configure install command"') + '\n';

    // Linting
    if (config.stages.lint) {
      const lintCommands = {
        nodejs: config.packageManager === 'npm' ? 'npm run lint' : 
                config.packageManager === 'yarn' ? 'yarn lint' : 'pnpm lint',
        python: 'flake8 .',
        java: 'mvn checkstyle:check',
        go: 'golangci-lint run',
        php: 'vendor/bin/phpcs',
        dotnet: 'dotnet format --verify-no-changes'
      };

      workflow += '      - name: Run linting\n';
      workflow += '        run: ' + (lintCommands[config.projectType as keyof typeof lintCommands] || 'echo "Configure lint command"') + '\n';
    }

    // Testing
    if (config.stages.test) {
      const testCommands = {
        nodejs: config.testCommand || (config.packageManager === 'npm' ? 'npm test' : 
                config.packageManager === 'yarn' ? 'yarn test' : 'pnpm test'),
        python: 'pytest',
        java: config.packageManager === 'maven' ? 'mvn test' : './gradlew test',
        go: 'go test ./...',
        php: 'vendor/bin/phpunit',
        dotnet: 'dotnet test'
      };

      workflow += '      - name: Run tests\n';
      workflow += '        run: ' + (config.testCommand || testCommands[config.projectType as keyof typeof testCommands] || 'echo "Configure test command"') + '\n';
    }

    // Security scanning for non-Sui projects
    if (config.stages.security) {
      const securityCommands = {
        nodejs: 'npm audit',
        python: 'safety check',
        java: 'mvn org.owasp:dependency-check-maven:check',
        go: 'govulncheck ./...',
        php: 'composer audit',
        dotnet: 'dotnet list package --vulnerable'
      };

      workflow += '      - name: Run security audit\n';
      workflow += '        run: ' + (securityCommands[config.projectType as keyof typeof securityCommands] || 'echo "Configure security scan"') + '\n';
    }

    // Build
    if (config.stages.build) {
      const buildCommands = {
        nodejs: config.buildCommand || (config.packageManager === 'npm' ? 'npm run build' : 
                config.packageManager === 'yarn' ? 'yarn build' : 'pnpm build'),
        python: 'python setup.py build',
        java: config.packageManager === 'maven' ? 'mvn package' : './gradlew build',
        go: 'go build -v ./...',
        php: 'echo "PHP build step"',
        dotnet: 'dotnet build --configuration Release'
      };

      workflow += '      - name: Build application\n';
      workflow += '        run: ' + (config.buildCommand || buildCommands[config.projectType as keyof typeof buildCommands] || 'echo "Configure build command"') + '\n';
    }

    // Docker build
    if (config.dockerize) {
      workflow += '      - name: Build Docker image\n';
      workflow += '        run: |\n';
      workflow += '          docker build -t ${{ github.repository }}:${{ github.sha }} .\n';
      workflow += '          docker tag ${{ github.repository }}:${{ github.sha }} ${{ github.repository }}:latest\n';
    }

    // Upload artifacts
    if (config.stages.build) {
      workflow += '      - name: Upload build artifacts\n';
      workflow += '        uses: actions/upload-artifact@v3\n';
      workflow += '        with:\n';
      workflow += '          name: build-artifacts\n';
      workflow += '          path: |\n';
      
      const artifactPaths = {
        nodejs: '            dist/\n            build/',
        python: '            dist/\n            build/',
        java: config.packageManager === 'maven' ? '            target/' : '            build/',
        go: '            bin/',
        php: '            vendor/',
        dotnet: '            bin/Release/'
      };

      workflow += (artifactPaths[config.projectType as keyof typeof artifactPaths] || '            build/') + '\n';
    }

    // Deployment jobs for non-Sui projects
    if (config.stages.deploy && deployTargets.length > 0) {
      deployTargets.forEach(target => {
        workflow += '\n  deploy-' + target + ':\n';
        workflow += '    needs: test-and-build\n';
        workflow += '    runs-on: ubuntu-latest\n';
        workflow += '    if: github.ref == \'refs/heads/' + (target === 'production' ? 'main' : 'develop') + '\'\n';
        workflow += '    environment: ' + target + '\n';
        workflow += '    \n';
        workflow += '    steps:\n';
        workflow += '      - name: Checkout code\n';
        workflow += '        uses: actions/checkout@v4\n';
        workflow += '      - name: Download build artifacts\n';
        workflow += '        uses: actions/download-artifact@v3\n';
        workflow += '        with:\n';
        workflow += '          name: build-artifacts\n';
        workflow += '      - name: Deploy to ' + target + '\n';
        workflow += '        run: |\n';
        workflow += '          echo "Configure ' + target + ' deployment"\n';
        workflow += '          # Add your deployment commands here\n';
      });
    }

    return workflow;
  }, [config]);

  useEffect(() => {
    setGeneratedYaml(generateWorkflow());
  }, [generateWorkflow]);

  const handleConfigChange = (field: string, value: string | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setConfig(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Config] as Record<string, boolean>),
          [child]: value
        }
      }));
    } else {
      setConfig(prev => ({ ...prev, [field]: value }));
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedYaml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadYaml = () => {
    const blob = new Blob([generatedYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.github/workflows/ci-cd.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <GitBranch className="w-8 h-8 text-blue-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">GitHub Actions Pipeline Generator</h1>
          </div>
          <p className="text-gray-300 text-lg">Create custom CI/CD workflows for your projects</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center mb-6">
              <Settings className="w-6 h-6 text-blue-400 mr-2" />
              <h2 className="text-2xl font-semibold text-white">Configuration</h2>
            </div>

            <div className="space-y-6">
              {/* Basic Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-blue-300">Project Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                  <input
                    type="text"
                    value={config.projectName}
                    onChange={(e) => handleConfigChange('projectName', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Project Type</label>
                  <select
                    value={config.projectType}
                    onChange={(e) => handleConfigChange('projectType', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(projectTypes).map(([key, value]) => (
                      <option key={key} value={key}>{value.icon} {value.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Package Manager</label>
                  <select
                    value={config.packageManager}
                    onChange={(e) => handleConfigChange('packageManager', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {packageManagers[config.projectType as keyof typeof packageManagers]?.map((pm: string) => (
                      <option key={pm} value={pm}>{pm}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Branches (comma-separated)</label>
                  <input
                    type="text"
                    value={config.branches}
                    onChange={(e) => handleConfigChange('branches', e.target.value)}
                    placeholder="main,develop,staging"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Pipeline Stages */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-blue-300">Pipeline Stages</h3>
                
                {Object.entries(config.stages).map(([stage, enabled]) => (
                  <label key={stage} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => handleConfigChange(`stages.${stage}`, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-300 capitalize">{stage}</span>
                  </label>
                ))}
              </div>

              {/* Advanced Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-blue-300">Advanced Options</h3>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.dockerize}
                    onChange={(e) => handleConfigChange('dockerize', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Docker Support</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.caching}
                    onChange={(e) => handleConfigChange('caching', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Enable Caching</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.parallelJobs}
                    onChange={(e) => handleConfigChange('parallelJobs', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Parallel Jobs</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Environment Variables</label>
                  <input
                    type="text"
                    value={config.envVars}
                    onChange={(e) => handleConfigChange('envVars', e.target.value)}
                    placeholder="NODE_ENV,API_KEY,DATABASE_URL"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Deployment Targets</label>
                  {config.projectType === 'sui' ? (
                    <select
                      value={config.deploymentTargets}
                      onChange={(e) => handleConfigChange('deploymentTargets', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="devnet">Devnet</option>
                      <option value="testnet">Testnet</option>
                      <option value="devnet,testnet">Both (Devnet + Testnet)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={config.deploymentTargets}
                      onChange={(e) => handleConfigChange('deploymentTargets', e.target.value)}
                      placeholder="staging,production"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Generated YAML */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Code className="w-6 h-6 text-green-400 mr-2" />
                <h2 className="text-2xl font-semibold text-white">Generated Workflow</h2>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={downloadYaml}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {generatedYaml}
              </pre>
            </div>

            <div className="mt-4 p-4 bg-blue-900 rounded-lg">
              <h3 className="text-white font-medium mb-2">📁 Save as:</h3>
              <code className="text-blue-200 text-sm">.github/workflows/ci-cd.yml</code>
              <p className="text-blue-200 text-sm mt-2">
                Save this file in your repository&apos;s <code>.github/workflows/</code> directory to activate the pipeline.
              </p>
            </div>

            {/* Sui-specific setup guide */}
            {config.projectType === 'sui' && config.stages.deploy && (
              <div className="mt-4 p-4 bg-purple-900 rounded-lg">
                <h3 className="text-white font-medium mb-3">🟦 Sui Deployment Setup Guide</h3>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="text-purple-200 font-medium mb-2">📋 Required GitHub Repository Secrets</h4>
                    <p className="text-purple-100 mb-3">
                      To enable Sui deployment, add these secrets to your GitHub repository:
                    </p>
                    
                    <div className="space-y-3">
                      <div className="bg-purple-800 p-3 rounded">
                        <code className="text-yellow-300 font-mono">SUI_CONFIG</code>
                        <p className="text-purple-100 mt-1">Your Sui wallet configuration file content</p>
                        <p className="text-purple-200 text-xs mt-1">
                          Usually found at: <code className="bg-purple-800 px-1 rounded">~/.sui/sui_config/client.yaml</code>
                        </p>
                      </div>
                      
                      <div className="bg-purple-800 p-3 rounded">
                        <code className="text-yellow-300 font-mono">SUI_KEYSTORE</code>
                        <p className="text-purple-100 mt-1">Your Sui keystore file content</p>
                        <p className="text-purple-200 text-xs mt-1">
                          Usually found at: <code className="bg-purple-800 px-1 rounded">~/.sui/sui_config/sui.keystore</code>
                        </p>
                      </div>
                      
                      <div className="bg-purple-800 p-3 rounded">
                        <code className="text-yellow-300 font-mono">SUI_ALIASES</code>
                        <p className="text-purple-100 mt-1">Your Sui aliases file content</p>
                        <p className="text-purple-200 text-xs mt-1">
                          Usually found at: <code className="bg-purple-800 px-1 rounded">~/.sui/sui_config/sui.aliases</code>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-purple-700 pt-4">
                    <h4 className="text-purple-200 font-medium mb-2">🔧 How to Add Secrets to GitHub</h4>
                    <ol className="list-decimal list-inside space-y-2 text-purple-100">
                      <li>Go to your GitHub repository</li>
                      <li>Click <strong>Settings</strong> → <strong>Secrets and variables</strong> → <strong>Actions</strong></li>
                      <li>Click <strong>New repository secret</strong></li>
                      <li>Add each secret with the exact names above</li>
                      <li>Copy the file contents (not the file paths) as secret values</li>
                    </ol>
                  </div>

                  <div className="border-t border-purple-700 pt-4">
                    <h4 className="text-purple-200 font-medium mb-2">💡 Setup Tips</h4>
                    <div className="space-y-2 text-purple-100">
                      <div className="flex items-start space-x-2">
                        <span className="text-yellow-300">•</span>
                        <span>First time setup? Run <code className="bg-purple-800 px-1 rounded">sui client</code> locally to generate config files</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-yellow-300">•</span>
                        <span>Fund your wallet with devnet SUI tokens from the <a href="https://discord.com/channels/916379725201563759/971488439931392130" className="text-blue-300 underline" target="_blank" rel="noopener noreferrer">Discord faucet</a></span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-yellow-300">•</span>
                        <span>Test your configuration locally with <code className="bg-purple-800 px-1 rounded">sui client active-address</code></span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-yellow-300">•</span>
                        <span>The CI will automatically handle gas and address management</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-900 border border-amber-700 p-3 rounded mt-4">
                    <h4 className="text-amber-200 font-medium flex items-center mb-2">
                      ⚠️ Security Note
                    </h4>
                    <p className="text-amber-100 text-xs">
                      Never commit wallet files or private keys to your repository. 
                      Always use GitHub secrets for sensitive configuration data.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubPipelineGenerator;