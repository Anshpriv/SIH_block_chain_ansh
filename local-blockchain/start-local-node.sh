#!/bin/bash

echo "🚀 Starting Local Ethereum Node..."
echo "📍 Network: localhost:8545"
echo "⛓️  Chain ID: 31337"
echo "💰 Each account funded with 10,000 ETH"

npx hardhat node --hostname 0.0.0.0 --port 8545
