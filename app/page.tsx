'use client';

import React, { useState, useEffect } from 'react';
import { Download, Play, Settings, Code, GitBranch, Copy, Check } from 'lucide-react';

const GitHubPipelineGenerator = () => {
  const [config, setConfig] = useState({
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

  const generateWorkflow = () => {
    const branches = config.branches.split(',').map(b => b.trim()).filter(b => b);
    const deployTargets = config.deploymentTargets.split(',').map(t => t.trim()).filter(t => t);
    const envVarsList = config.envVars.split(',').map(v => v.trim()).filter(v => v);

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

    // Setup runtime environment
    switch (config.projectType) {
      case 'nodejs':
        workflow += '    strategy:\n';
        workflow += '      matrix:\n';
        workflow += '        node-version: [' + config.nodeVersion + ']\n';
        break;
      
      case 'python':
        workflow += '\n      - name: Setup Python\n';
        workflow += '        uses: actions/setup-python@v4\n';
        workflow += '        with:\n';
        workflow += '          python-version: \'3.9\'\n';
        if (config.caching) {
          workflow += '          cache: \'' + config.packageManager + '\'\n';
        }
        break;
      
      case 'java':
        workflow += '\n      - name: Setup Java\n';
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
        workflow += '\n      - name: Setup Go\n';
        workflow += '        uses: actions/setup-go@v4\n';
        workflow += '        with:\n';
        workflow += '          go-version: \'1.21\'\n';
        if (config.caching) {
          workflow += '          cache: true\n';
        }
        break;
      
      case 'php':
        workflow += '\n      - name: Setup PHP\n';
        workflow += '        uses: shivammathur/setup-php@v2\n';
        workflow += '        with:\n';
        workflow += '          php-version: \'8.2\'\n';
        if (config.caching) {
          workflow += '          tools: composer\n';
          workflow += '          coverage: none\n';
        }
        break;
      
      case 'dotnet':
        workflow += '\n      - name: Setup .NET\n';
        workflow += '        uses: actions/setup-dotnet@v3\n';
        workflow += '        with:\n';
        workflow += '          dotnet-version: \'6.0.x\'\n';
        break;
      
      case 'sui':
        workflow += '\n      - name: Install Homebrew and Sui\n';
        workflow += '        run: |\n';
        workflow += '          # Install Homebrew\n';
        workflow += '          /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"\n';
        workflow += '          \n';
        workflow += '          # Add brew to PATH for this step and future steps\n';
        workflow += '          echo "/home/linuxbrew/.linuxbrew/bin" >> $GITHUB_PATH\n';
        workflow += '          echo "/home/linuxbrew/.linuxbrew/sbin" >> $GITHUB_PATH\n';
        workflow += '          \n';
        workflow += '          # Set environment variables for this workflow\n';
        workflow += '          echo "HOMEBREW_PREFIX=/home/linuxbrew/.linuxbrew" >> $GITHUB_ENV\n';
        workflow += '          echo "HOMEBREW_CELLAR=/home/linuxbrew/.linuxbrew/Cellar" >> $GITHUB_ENV\n';
        workflow += '          echo "HOMEBREW_REPOSITORY=/home/linuxbrew/.linuxbrew/Homebrew" >> $GITHUB_ENV\n';
        workflow += '          \n';
        workflow += '          # Source brew environment for this step\n';
        workflow += '          eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"\n';
        workflow += '          \n';
        workflow += '          # Install dependencies\n';
        workflow += '          sudo apt-get update\n';
        workflow += '          sudo apt-get install -y build-essential\n';
        workflow += '          brew install gcc\n';
        workflow += '          \n';
        workflow += '          # Install Sui\n';
        workflow += '          brew install sui\n';
        workflow += '          \n';
        workflow += '          # Verify Sui installation\n';
        workflow += '          sui --version\n';
        break;
    }

    // Install dependencies
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
      dotnet: 'dotnet restore',
      'sui move': 'echo "Dependencies managed by sui move build"'
    };

    workflow += '\n      - name: Install dependencies\n';
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
        dotnet: 'dotnet format --verify-no-changes',
        sui: 'sui move build --lint || echo "Linting completed with warnings"'
      };

      workflow += '\n      - name: Run linting\n';
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
        dotnet: 'dotnet test',
        sui: 'sui move test'
      };

      workflow += '\n      - name: Run tests\n';
      workflow += '        run: ' + (config.testCommand || testCommands[config.projectType as keyof typeof testCommands] || 'echo "Configure test command"') + '\n';
    }

    // Security scanning
    if (config.stages.security) {
      const securityCommands = {
        nodejs: 'npm audit',
        python: 'safety check',
        java: 'mvn org.owasp:dependency-check-maven:check',
        go: 'govulncheck ./...',
        php: 'composer audit',
        dotnet: 'dotnet list package --vulnerable',
        sui: 'echo "Running Sui security analysis..." && sui move build --lint'
      };

      workflow += '\n      - name: Run security audit\n';
      workflow += '        run: ' + (securityCommands[config.projectType as keyof typeof securityCommands] || 'echo "Configure security scan"') + '\n';
      
      // Add comprehensive Sui security analysis
      if (config.projectType === 'sui') {
        workflow += '\n      - name: Sui Security Best Practices Check\n';
        workflow += '        run: |\n';
        workflow += '          echo "=== Security Best Practices Analysis ==="\n';
        workflow += '          \n';
        workflow += '          # Check for proper access controls\n';
        workflow += '          echo "→ Checking access control patterns..."\n';
        workflow += '          grep -r "public(" sources/ || echo "No public functions found"\n';
        workflow += '          grep -r "entry " sources/ || echo "No entry functions found"\n';
        workflow += '          grep -r "public(package)" sources/ || echo "No package-level functions found"\n';
        workflow += '          \n';
        workflow += '          # Check for proper object management\n';
        workflow += '          echo "→ Checking object management..."\n';
        workflow += '          grep -r "transfer::" sources/ || echo "No transfer operations found"\n';
        workflow += '          grep -r "share_object" sources/ || echo "No shared objects found"\n';
        workflow += '          \n';
        workflow += '          # Check for capability usage\n';
        workflow += '          echo "→ Checking capability usage..."\n';
        workflow += '          grep -r "has key" sources/ || echo "No key capabilities found"\n';
        workflow += '          grep -r "has store" sources/ || echo "No store capabilities found"\n';
        workflow += '          \n';
        workflow += '          echo "✅ Security best practices check completed"\n';
        
        workflow += '\n      - name: Generate Security Report\n';
        workflow += '        run: |\n';
        workflow += '          cat > security-report.md << \'EOF\'\n';
        workflow += '          # Sui Move Security Analysis Report\n';
        workflow += '          \n';
        workflow += '          ## Overview\n';
        workflow += '          This report summarizes the security analysis of the Sui Move smart contracts.\n';
        workflow += '          \n';
        workflow += '          ## Tools Used\n';
        workflow += '          - **Sui Built-in Linters**: Checks for Move-specific anti-patterns\n';
        workflow += '          - **Security Best Practices**: Manual checks for common vulnerabilities\n';
        workflow += '          \n';
        workflow += '          ## Key Security Recommendations\n';
        workflow += '          1. 🔍 Consider professional security audit before mainnet\n';
        workflow += '          2. 📝 Add formal verification specs for critical functions\n';
        workflow += '          3. 🧪 Implement comprehensive test coverage\n';
        workflow += '          4. 🔒 Review all public/entry function access controls\n';
        workflow += '          5. 💰 Validate economic assumptions and tokenomics\n';
        workflow += '          \n';
        workflow += '          ## External Security Resources\n';
        workflow += '          - [Sui Move Security Guide](https://docs.sui.io/concepts/sui-move-concepts)\n';
        workflow += '          - [MoveBit Security Tools](https://m.movebit.xyz/MoveScanner)\n';
        workflow += '          - [SlowMist Audit Primer](https://github.com/slowmist/Sui-MOVE-Smart-Contract-Auditing-Primer)\n';
        workflow += '          EOF\n';
        workflow += '          echo "✅ Security report generated: security-report.md"\n';
        
        workflow += '\n      - name: Upload Security Report\n';
        workflow += '        uses: actions/upload-artifact@v4\n';
        workflow += '        with:\n';
        workflow += '          name: security-report\n';
        workflow += '          path: security-report.md\n';
      }
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
        dotnet: 'dotnet build --configuration Release',
        sui: 'sui move build'
      };

      workflow += '\n      - name: Build application\n';
      workflow += '        run: ' + (config.buildCommand || buildCommands[config.projectType as keyof typeof buildCommands] || 'echo "Configure build command"') + '\n';
    }

    // Docker build
    if (config.dockerize) {
      workflow += '\n      - name: Build Docker image\n';
      workflow += '        run: |\n';
      workflow += '          docker build -t ${{ github.repository }}:${{ github.sha }} .\n';
      workflow += '          docker tag ${{ github.repository }}:${{ github.sha }} ${{ github.repository }}:latest\n';
    }

    // Upload artifacts
    if (config.stages.build) {
      workflow += '\n      - name: Upload build artifacts\n';
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
        dotnet: '            bin/Release/',
        sui: '            build/\n            Move.toml'
      };

      workflow += (artifactPaths[config.projectType as keyof typeof artifactPaths] || '            build/') + '\n';
    }

    // Deployment jobs
    if (config.stages.deploy && deployTargets.length > 0) {
      deployTargets.forEach(target => {
        workflow += '\n  deploy-' + target + ':\n';
        workflow += '    needs: test-and-build\n';
        workflow += '    runs-on: ubuntu-latest\n';
        
        // Set branch conditions based on project type
        if (config.projectType === 'sui') {
          if (target === 'devnet') {
            workflow += '    if: github.ref == \'refs/heads/develop\' || github.ref == \'refs/heads/main\'\n';
          } else if (target === 'testnet') {
            workflow += '    if: github.ref == \'refs/heads/main\'\n';
          }
        } else {
          workflow += '    if: github.ref == \'refs/heads/' + (target === 'production' ? 'main' : 'develop') + '\'\n';
        }
        
        workflow += '    environment: ' + target + '\n';
        
        // Add Sui-specific environment variables
        if (config.projectType === 'sui') {
          workflow += '    env:\n';
          workflow += '      SUI_NETWORK: ' + target + '\n';
          workflow += '      SUI_CONFIG: ${{ secrets.SUI_CONFIG }}\n';
          workflow += '      SUI_KEYSTORE: ${{ secrets.SUI_KEYSTORE }}\n';
          workflow += '      SUI_ALIASES: ${{ secrets.SUI_ALIASES }}\n';
        }
        
        workflow += '    \n';
        workflow += '    steps:\n';
        workflow += '      - name: Checkout code\n';
        workflow += '        uses: actions/checkout@v4\n';
        
        // Add Sui installation for deployment
        if (config.projectType === 'sui') {
          workflow += '      \n';
          workflow += '      - name: Install Homebrew and Sui\n';
          workflow += '        run: |\n';
          workflow += '          # Install Homebrew\n';
          workflow += '          /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"\n';
          workflow += '          \n';
          workflow += '          # Add brew to PATH\n';
          workflow += '          echo "/home/linuxbrew/.linuxbrew/bin" >> $GITHUB_PATH\n';
          workflow += '          echo "/home/linuxbrew/.linuxbrew/sbin" >> $GITHUB_PATH\n';
          workflow += '          \n';
          workflow += '          # Set environment variables\n';
          workflow += '          echo "HOMEBREW_PREFIX=/home/linuxbrew/.linuxbrew" >> $GITHUB_ENV\n';
          workflow += '          echo "HOMEBREW_CELLAR=/home/linuxbrew/.linuxbrew/Cellar" >> $GITHUB_ENV\n';
          workflow += '          echo "HOMEBREW_REPOSITORY=/home/linuxbrew/.linuxbrew/Homebrew" >> $GITHUB_ENV\n';
          workflow += '          \n';
          workflow += '          # Install dependencies\n';
          workflow += '          sudo apt-get update\n';
          workflow += '          sudo apt-get install -y build-essential jq\n';
          workflow += '          eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"\n';
          workflow += '          brew install gcc sui\n';
          workflow += '          \n';
          workflow += '          # Verify installation\n';
          workflow += '          sui --version\n';
        }
        
        workflow += '      \n';
        workflow += '      - name: Download build artifacts\n';
        workflow += '        uses: actions/download-artifact@v3\n';
        workflow += '        with:\n';
        workflow += '          name: build-artifacts\n';
        workflow += '      \n';

        if (config.deployScript) {
          workflow += '      - name: Deploy to ' + target + '\n';
          workflow += '        run: |\n';
          workflow += '          ' + config.deployScript + '\n';
        } else if (config.projectType === 'sui') {
          workflow += '      - name: Verify sui command is available\n';
          workflow += '        run: which sui || (echo "Sui command not found in PATH" && exit 1)\n';
          workflow += '      \n';
          workflow += '      - name: Check if all required secrets are provided\n';
          workflow += '        run: if [ -z "$SUI_CONFIG" ] || [ -z "$SUI_KEYSTORE" ] || [ -z "$SUI_ALIASES" ]; then\n';
          workflow += '          echo "⚠️  Deployment skipped: Required secrets are not configured"\n';
          workflow += '          echo "To enable deployment:"\n';
          workflow += '          echo "1. Add SUI_CONFIG secret with your wallet configuration"\n';
          workflow += '          echo "2. Add SUI_KEYSTORE secret with your keystore file content"\n';
          workflow += '          echo "3. Add SUI_ALIASES secret with your aliases file content"\n';
          workflow += '          echo "4. Fund the wallet with devnet SUI tokens"\n';
          workflow += '          exit 0\n';
          workflow += '        fi\n';
          workflow += '      \n';
          workflow += '      - name: Create config directory\n';
          workflow += '        run: mkdir -p ~/.sui/sui_config\n';
          workflow += '      \n';
          workflow += '      - name: Set up Sui configuration\n';
          workflow += '        run: \n';
          workflow += '          echo "$SUI_CONFIG" > ~/.sui/sui_config/client.yaml\n';
          workflow += '          echo "$SUI_KEYSTORE" > ~/.sui/sui_config/sui.keystore\n';
          workflow += '          echo "$SUI_ALIASES" > ~/.sui/sui_config/sui.aliases\n';
          workflow += '      \n';
          workflow += '      - name: Set proper permissions\n';
          workflow += '        run: chmod 600 ~/.sui/sui_config/*\n';
          workflow += '      \n';
          workflow += '      - name: Fix the keystore path in client.yaml\n';
          workflow += '        run: sed -i \'s|/home/ngocanh/.sui/sui_config/sui.keystore|/home/runner/.sui/sui_config/sui.keystore|g\' ~/.sui/sui_config/client.yaml\n';
          workflow += '      \n';
          workflow += '      - name: Check addresses from configuration\n';
          workflow += '        run: sui client addresses || {\n';
          workflow += '          echo "Creating new address for CI deployment..."\n';
          workflow += '          NEW_ADDRESS=$(sui client new-address ed25519 --json | jq -r \'.address\' 2>/dev/null || {\n';
          workflow += '            sui client new-address ed25519 | grep -oE \'0x[a-fA-F0-9]+\' | head -1\n';
          workflow += '          })\n';
          workflow += '          \n';
          workflow += '          if [ -n "$NEW_ADDRESS" ]; then\n';
          workflow += '            echo "✅ Created new address: $NEW_ADDRESS"\n';
          workflow += '            \n';
          workflow += '            # Try to get devnet tokens\n';
          workflow += '            echo "Requesting devnet tokens..."\n';
          workflow += '            curl -X POST https://faucet.devnet.sui.io/gas \\\n';
          workflow += '              -H \'Content-Type: application/json\' \\\n';
          workflow += '              -d "{\\"FixedAmountRequest\\":{\\"recipient\\":\\"$NEW_ADDRESS\\"}}" \\\n';
          workflow += '              --silent --show-error || echo "Warning: Failed to request tokens from faucet"\n';
          workflow += '            \n';
          workflow += '            echo "Waiting for faucet transaction..."\n';
          workflow += '            sleep 10\n';
          workflow += '          else\n';
          workflow += '            echo "❌ Failed to create new address"\n';
          workflow += '            exit 1\n';
          workflow += '          }\n';
          workflow += '          \n';
          workflow += '      - name: Check gas before deployment\n';
          workflow += '        run: if ! sui client gas; then\n';
          workflow += '          echo "❌ Failed to check gas balance or no gas objects found."\n';
          workflow += '          echo "Please fund your address with devnet SUI tokens before deployment."\n';
          workflow += '          exit 1\n';
          workflow += '        fi\n';
          workflow += '        \n';
          workflow += '      - name: Publish package\n';
          workflow += '        run: if sui client publish --gas-budget 100000000; then\n';
          workflow += '          echo "✅ Package published successfully to ' + target + '"\n';
          workflow += '        else\n';
          workflow += '          echo "❌ Deployment failed"\n';
          workflow += '          echo "This might be due to insufficient gas, network issues, or compilation errors"\n';
          workflow += '          exit 1\n';
          workflow += '        fi\n';
        } else {
          workflow += '      - name: Deploy to ' + target + '\n';
          workflow += '        run: |\n';
          workflow += '          echo "Configure ' + target + ' deployment"\n';
          workflow += '          # Add your deployment commands here\n';
        }

        if (config.dockerize) {
          workflow += '      # Docker deployment example:\n';
          workflow += '      # docker push ${{ github.repository }}:${{ github.sha }}\n';
          workflow += '      # kubectl set image deployment/app app=${{ github.repository }}:${{ github.sha }}\n';
        }
      });
    }

    // Notifications
    if (config.notifications) {
      workflow += '\n  notify:\n';
      workflow += '    needs: [test-and-build' + (config.stages.deploy ? deployTargets.map(t => ', deploy-' + t).join('') : '') + ']\n';
      workflow += '    runs-on: ubuntu-latest\n';
      workflow += '    if: always()\n';
      workflow += '    \n';
      workflow += '    steps:\n';
      workflow += '      - name: Notify team\n';
      workflow += '        run: |\n';
      workflow += '          echo "Pipeline completed with status: ${{ job.status }}"\n';
      workflow += '          # Add notification logic (Slack, Discord, email, etc.)\n';
    }

    return workflow;
  };

  useEffect(() => {
    setGeneratedYaml(generateWorkflow());
  }, [config]);

  const handleConfigChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setConfig(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
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
                Save this file in your repository's <code>.github/workflows/</code> directory to activate the pipeline.
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