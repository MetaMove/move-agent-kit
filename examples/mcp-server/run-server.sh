set -e

# Export environment variables
export ANTHROPIC_API_KEY="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"
export APTOS_PRIVATE_KEY="0x3b1eff75e253e157ca2a1d50838a2a371b22d998069384c51dab316da083e744"
export ETH_PRIVATE_KEY="0xd08e7d00ad2c07aa85deaf4f93798e7e722be759bce064a35ffe0212d6d6313f"
export ALCHEMY_RPC_URL="https://base-mainnet.g.alchemy.com/v2/LQJAkg_rXWdGinhD1VApyddbtt5lBz-R"
export OPENROUTER_API_KEY="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"

# Change to the server directory
cd /Users/nisargthakkar/kit/move-agent-kit/examples/mcp-server

# Run with node directly (no pnpm output that might interfere)
NODE_OPTIONS="--no-warnings" exec node -e "require('ts-node').register({transpileOnly: true}); require('./src/index.ts');"