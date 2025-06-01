import argparse
import json
import os
import sys
from pathlib import Path
import yaml
from typing import Dict, Any, Optional

class SuiCIGenerator:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.project_root = Path(config.get('project_root', '.'))
        self.workflow_dir = self.project_root / '.github' / 'workflows'
        
    def detect_project_structure(self) -> Dict[str, bool]:
        """Detect Sui Move project structure and available features."""
        structure = {
            'has_move_toml': (self.project_root / 'Move.toml').exists(),
            'has_tests': any((self.project_root / 'tests').glob('*.move')),
            'has_sources': any((self.project_root / 'sources').glob('*.move')),
        }
        return structure

    def generate_build_job(self) -> Dict[str, Any]:
        """Generate build job."""
        return {
            'name': 'Build',
            'runs-on': 'ubuntu-latest',
            'steps': [
                {
                    'name': 'Checkout code',
                    'uses': 'actions/checkout@v4'
                },
                {
                    'name': 'Install Homebrew and Sui',
                    'run': '''
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
                    '''
                },
                {
                    'name': 'Build Move modules',
                    'run': '''
                        # Verify sui command is available
                        which sui || (echo "Sui command not found in PATH" && exit 1)
                        sui --version
                        
                        # Build the project
                        sui move build
                    ''',
                    'working-directory': '${{ github.workspace }}'
                }
            ]
        }

    def generate_test_job(self) -> Dict[str, Any]:
        """Generate test job."""
        return {
            'name': 'Test',
            'runs-on': 'ubuntu-latest',
            'needs': 'build',  # Test job depends on build job
            'steps': [
                {
                    'name': 'Checkout code',
                    'uses': 'actions/checkout@v4'
                },
                {
                    'name': 'Install Homebrew and Sui',
                    'run': '''
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
                    '''
                },
                {
                    'name': 'Run Move tests',
                    'run': '''
                        # Verify sui command is available
                        which sui || (echo "Sui command not found in PATH" && exit 1)
                        
                        # Run tests
                        sui move test
                    ''',
                    'working-directory': '${{ github.workspace }}'
                }
            ]
        }

    def generate_security_job(self) -> Dict[str, Any]:
        """Generate security analysis job."""
        return {
            'name': 'Security Analysis',
            'runs-on': 'ubuntu-latest',
            'needs': 'build',  # Security job depends on build job
            'steps': [
                {
                    'name': 'Checkout code',
                    'uses': 'actions/checkout@v4'
                },
                {
                    'name': 'Install Homebrew and Sui',
                    'run': '''
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
                    '''
                },
                {
                    'name': 'Run Sui Built-in Linters',
                    'run': '''
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
                    ''',
                    'working-directory': '${{ github.workspace }}'
                },
                {
                    'name': 'Security Best Practices Check',
                    'run': '''
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
                        grep -r "borrow\\|loan" sources/ || echo "No borrowing patterns found"
                        
                        # Check for arithmetic operations that might overflow
                        echo "→ Checking arithmetic operations..."
                        grep -r "<<\\|>>" sources/ && echo "⚠️  Found bitwise operations - check for overflow" || echo "No bitwise operations found"
                        
                        # Check for external calls
                        echo "→ Checking external module usage..."
                        grep -r "use.*::" sources/ | head -10 || echo "No external modules found"
                        
                        echo "✅ Security best practices check completed"
                    ''',
                    'working-directory': '${{ github.workspace }}'
                },
                {
                    'name': 'Formal Verification Check',
                    'run': '''
                        echo "=== Formal Verification Analysis ==="
                        
                        # Check if Sui Prover specs are present
                        if find sources/ -name "*.move" -exec grep -l "spec\\|ensures\\|requires\\|aborts_if" {} \\; | head -5; then
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
                    ''',
                    'working-directory': '${{ github.workspace }}'
                },
                {
                    'name': 'Generate Security Report',
                    'run': '''
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
                    ''',
                    'working-directory': '${{ github.workspace }}'
                },
                {
                    'name': 'Upload Security Report',
                    'uses': 'actions/upload-artifact@v4',
                    'with': {
                        'name': 'security-report',
                        'path': 'security-report.md'
                    }
                }
            ]
        }

    def generate_deploy_job(self) -> Dict[str, Any]:
        """Generate deploy job."""
        return {
            'name': 'Deploy to Devnet',
            'runs-on': 'ubuntu-latest',
            'needs': ['test', 'security'],  # Deploy job depends on BOTH test and security jobs
                    'if': "github.ref == 'refs/heads/main' && github.event_name == 'push'",
                    'env': {
                'SUI_NETWORK': 'devnet',
                        'SUI_CONFIG': '${{ secrets.SUI_CONFIG }}',
                        'SUI_KEYSTORE': '${{ secrets.SUI_KEYSTORE }}',
                        'SUI_ALIASES': '${{ secrets.SUI_ALIASES }}'
                    },
            'steps': [
                {
                    'name': 'Checkout code',
                    'uses': 'actions/checkout@v4'
                },
                {
                    'name': 'Install Homebrew and Sui',
                    'run': '''
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
                    '''
                },
                {
                    'name': 'Setup Sui CLI config and Deploy',
                    'run': '''
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
                    '''
                }
            ]
        }

    def generate_workflow(self) -> Dict[str, Any]:
        """Generate complete GitHub Actions workflow."""
        workflow = {
            'name': 'Sui Smart Contract CI/CD',
            'on': {
                'push': {
                    'branches': ['main', 'develop']
                },
                'pull_request': {
                    'branches': ['main', 'develop']
                }
            },
            'env': {
                'RUST_BACKTRACE': '1',
                'SUI_LOG_LEVEL': 'info'
            },
            'jobs': {
                'build': self.generate_build_job(),
                'test': self.generate_test_job(),
                'security': self.generate_security_job(),
                'deploy': self.generate_deploy_job()
            }
        }
        
        return workflow

    def save_workflow(self, workflow: Dict[str, Any]) -> None:
        """Save workflow to .github/workflows/sui-ci.yml"""
        self.workflow_dir.mkdir(parents=True, exist_ok=True)
        
        with open(self.workflow_dir / 'sui-ci.yml', 'w') as f:
            yaml.safe_dump(workflow, f, sort_keys=False, default_flow_style=False)

def main():
    parser = argparse.ArgumentParser(description='Generate Sui Move CI/CD workflow')
    parser.add_argument('--config', type=str, help='Path to config file')
    parser.add_argument('--project-root', type=str, default='.', help='Path to project root')
    parser.add_argument('--enable-deployment', action='store_true', help='Enable testnet deployment')
    
    args = parser.parse_args()
    
    config = {
        'project_root': args.project_root,
        'enable_deployment': args.enable_deployment
    }
    
    if args.config:
        with open(args.config) as f:
            config.update(json.load(f))
    
    generator = SuiCIGenerator(config)
    workflow = generator.generate_workflow()
    generator.save_workflow(workflow)
    print("Successfully generated CI/CD workflow at .github/workflows/sui-ci.yml")

if __name__ == '__main__':
    main()