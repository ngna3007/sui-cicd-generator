<<<<<<< HEAD
# Sui Move CI/CD Generator

A dynamic CI/CD configuration generator for Sui Move smart contract projects. This tool automatically generates GitHub Actions workflows tailored to your Sui blockchain project needs.

## Features

- 🔍 Automatic project structure detection
- 🛠 Complete CI/CD pipeline generation
- 🧪 Integrated testing and gas profiling
- 🚀 Automated testnet deployment
- 📊 Artifact collection and reporting
- 🔐 Secure secret handling
- 🎨 Customizable workflow stages

## Prerequisites

- Python 3.7+
- PyYAML
- Sui CLI
- GitHub repository with Sui Move project

## Installation

```bash
git clone https://github.com/yourusername/sui-cicd.git
cd sui-cicd
pip install -r requirements.txt
```

## Usage

1. Create a configuration file based on `src/config.example.json`:

```bash
cp src/config.example.json config.json
```

2. Edit the configuration file to match your project needs:

```json
{
    "project_root": "path/to/your/project",
    "enable_deployment": true,
    "network": "testnet"
    // ... other settings
}
```

3. Run the generator:

```bash
python src/generate_ci.py --config config.json
```

Or use command line arguments:

```bash
python src/generate_ci.py --project-root ./my-project --enable-deployment
```

## Configuration Options

### Basic Settings

- `project_root`: Path to your Sui Move project
- `enable_deployment`: Enable automatic testnet deployment
- `network`: Target network (devnet/testnet/mainnet)

### Branch Configuration

```json
"branches": {
    "main": {
        "deploy": true,
        "run_tests": true
    },
    "develop": {
        "deploy": false,
        "run_tests": true
    }
}
```

### Gas Profiling

```json
"gas_profiling": {
    "enabled": true,
    "threshold_warning": 1000,
    "threshold_error": 5000
}
```

### Test Coverage

```json
"test_coverage": {
    "enabled": true,
    "minimum": 80
}
```

## GitHub Secrets Required

For deployment functionality, set up these secrets in your GitHub repository:

- `SUI_CONFIG`: Your Sui client configuration
- `DEPLOYER_MNEMONIC`: Wallet mnemonic for deployment

## Generated Workflow Structure

The generator creates a `.github/workflows/sui-ci.yml` file with the following stages:

1. Environment Setup
   - OS matrix configuration
   - Rust toolchain installation
   - Sui CLI setup

2. Build & Test
   - Move module compilation
   - Unit tests execution
   - Gas profiling
   - Storage analysis

3. Deployment (optional)
   - Network configuration
   - Smart contract deployment
   - Deployment verification

## Extending the Pipeline

### Adding Custom Steps

Modify the `generate_workflow()` method in `src/generate_ci.py` to add custom steps:

```python
def generate_custom_steps(self) -> Dict[str, Any]:
    return {
        'name': 'Custom Analysis',
        'run': 'your-custom-command'
    }
```

### Integration with External Services

The generator supports webhook notifications for:
- Discord
- Slack
- Custom webhooks

## Best Practices

1. Always version control your configuration file
2. Use environment-specific settings
3. Regularly update dependencies
4. Monitor gas usage trends
5. Implement comprehensive testing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please use the GitHub issue tracker. 
=======

>>>>>>> 634e92587e96a0795996519ff5dd15c8f7e6f720
