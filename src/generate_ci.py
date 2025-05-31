#!/usr/bin/env python3

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

    def generate_env_setup(self) -> Dict[str, Any]:
        """Generate environment setup and deployment steps."""
        return {
            'name': 'Build and Deploy',
            'runs-on': '${{ matrix.os }}',
            'strategy': {
                'matrix': {
                    'os': ['ubuntu-latest'],
                    'rust': ['stable']
                }
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
                },
                {
                    'name': 'Run Move tests',
                    'if': "github.event_name == 'pull_request' || github.ref == 'refs/heads/main'",
                    'run': '''
                        # Verify sui command is available
                        which sui || (echo "Sui command not found in PATH" && exit 1)
                        
                        # Run tests
                        sui move test
                    ''',
                    'working-directory': '${{ github.workspace }}'
                },
                {
                    'name': 'Setup Sui CLI config and Deploy',
                    'if': "github.ref == 'refs/heads/main' && github.event_name == 'push'",
                    'env': {
                        'SUI_NETWORK': 'devnet',
                        'SUI_CONFIG': '${{ secrets.SUI_CONFIG }}',
                        'SUI_KEYSTORE': '${{ secrets.SUI_KEYSTORE }}',
                        'SUI_ALIASES': '${{ secrets.SUI_ALIASES }}'
                    },
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
                        
                        # Verify the files have correct content
                        echo "=== Debugging Configuration Files ==="
                        echo "client.yaml content:"
                        cat ~/.sui/sui_config/client.yaml
                        echo ""
                        echo "keystore content:"
                        cat ~/.sui/sui_config/sui.keystore
                        echo ""
                        
                        # Try to check if Sui recognizes the configuration
                        echo "=== Testing Sui Configuration ==="
                        echo "Active environment:"
                        sui client active-env || echo "Failed to get active env"
                        
                        echo "Checking addresses (this might fail):"
                        sui client addresses || {
                            echo "Failed to get addresses from keystore. Creating a new address for CI deployment..."
                            
                            # Create a new address for CI deployment
                            echo "Creating new address..."
                            NEW_ADDRESS=$(sui client new-address ed25519 --json | jq -r '.address' 2>/dev/null || {
                                # Fallback if JSON parsing fails
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
                                
                                # Wait a bit for the faucet
                                echo "Waiting for faucet transaction..."
                                sleep 10
                                
                                # Check if we received tokens
                                echo "Checking gas objects..."
                                sui client gas || {
                                    echo "❌ No gas objects found. Deployment cannot proceed."
                                    echo "Please manually fund the address: $NEW_ADDRESS"
                                    echo "You can use the faucet at: https://discord.com/channels/916379725201563759/971488439931392130"
                                    exit 1
                                }
                            else
                                echo "❌ Failed to create new address"
                                exit 1
                            fi
                        }
                        
                        # Final check - get active address
                        echo "=== Final Configuration Check ==="
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
                },
                {
                    'name': 'Request Test Tokens',
                    'if': "failure() && github.ref == 'refs/heads/main'",
                    'run': '''
                        ACTIVE_ADDRESS=$(sui client active-address)
                        echo "Requesting test tokens for $ACTIVE_ADDRESS"
                        curl -X POST https://faucet.devnet.sui.io/gas \
                            -H 'Content-Type: application/json' \
                            -d '{"FixedAmountRequest":{"recipient":"$ACTIVE_ADDRESS"}}'
                    '''
                },
                {
                    'name': 'Deploy to testnet',
                    'if': "github.ref == 'refs/heads/main' && github.event_name == 'push'",
                    'env': {
                        'SUI_NETWORK': 'devnet',
                        'SUI_CONFIG': '${{ secrets.SUI_CONFIG }}',
                        'SUI_KEYSTORE': '${{ secrets.SUI_KEYSTORE }}',
                        'SUI_ALIASES': '${{ secrets.SUI_ALIASES }}'
                    },
                    'run': '''
                        # Verify sui command is available
                        which sui || (echo "Sui command not found in PATH" && exit 1)
                        
                        # Check if both SUI_CONFIG and SUI_KEYSTORE are provided
                        if [ -z "$SUI_CONFIG" ] || [ -z "$SUI_KEYSTORE" ]; then
                            echo "⚠️  Deployment skipped: SUI_CONFIG or SUI_KEYSTORE secret is not configured"
                            echo "To enable deployment:"
                            echo "1. Add SUI_CONFIG secret with your wallet configuration"
                            echo "2. Add SUI_KEYSTORE secret with your keystore file content"
                            echo "3. Fund the wallet with testnet SUI tokens"
                            exit 0
                        fi
                        
                        echo "Current active address:"
                        sui client active-address || {
                            echo "❌ No active address found. Please check your SUI_CONFIG and SUI_KEYSTORE secrets."
                            exit 1
                        }
                        
                        # Check if we have gas before attempting deployment
                        echo "Checking gas balance..."
                        sui client gas || {
                            echo "❌ Failed to check gas balance. Address may not be funded."
                            echo "Please fund your address with testnet SUI tokens before deployment."
                            exit 1
                        }
                        
                        echo "Publishing package..."
                        if sui client publish --gas-budget 100000000; then
                            echo "✅ Package published successfully"
                        else
                            echo "❌ Deployment failed"
                            echo "This might be due to insufficient gas or network issues"
                            exit 1
                        fi
                    '''
                },
                {
                    'name': 'Verify deployment',
                    'if': "github.ref == 'refs/heads/main' && github.event_name == 'push'",
                    'env': {
                        'SUI_CONFIG': '${{ secrets.SUI_CONFIG }}'
                    },
                    'run': '''
                        # Verify sui command is available
                        which sui || (echo "Sui command not found in PATH" && exit 1)
                        
                        # Skip verification if no SUI_CONFIG was provided
                        if [ -z "$SUI_CONFIG" ]; then
                            echo "⚠️  Deployment verification skipped: No SUI_CONFIG provided"
                            exit 0
                        fi
                        
                        # Get the latest transaction status
                        echo "Checking recent transactions..."
                        sui client transactions --limit 5 || true
                        
                        LATEST_TX=$(sui client transactions --limit 1 | tail -n 1 | awk '{print $1}' 2>/dev/null || echo "")
                        if [ -n "$LATEST_TX" ] && [ "$LATEST_TX" != "digest" ]; then
                            echo "Verifying transaction: $LATEST_TX"
                            # Check transaction status
                            if sui client transaction "$LATEST_TX" | grep -q "Status.*Success"; then
                                echo "✅ Deployment verified successfully"
                            else
                                echo "❌ Deployment verification failed"
                                sui client transaction "$LATEST_TX" || true
                                exit 1
                            fi
                        else
                            echo "⚠️  No recent transaction found to verify, but deployment may have succeeded"
                            echo "Check the Sui explorer for your package deployment"
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
                'SUI_LOG_LEVEL': 'info',
                'SUI_BRANCH': 'devnet'  # Can be overridden in GitHub Actions
            },
            'jobs': {
                'build-and-deploy': self.generate_env_setup()
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