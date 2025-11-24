set -e

# Export environment variables
export ANTHROPIC_API_KEY=""
export APTOS_PRIVATE_KEY=""
export ETH_PRIVATE_KEY=""
export ALCHEMY_RPC_URL=""
export OPENROUTER_API_KEY=""

# Change to the server directory
cd /Users/nisargthakkar/kit/move-agent-kit/examples/mcp-server

# Run with node directly (no pnpm output that might interfere)
NODE_OPTIONS="--no-warnings" exec node -e "require('ts-node').register({transpileOnly: true}); require('./src/index.ts');"