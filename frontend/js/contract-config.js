// Auto-generated contract configuration
// This file will be updated when you deploy your contracts
const CONTRACT_CONFIG = {
    network: "localhost",
    contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Will be updated after deployment
    contractABI: [
        // Basic ERC20 functions - will be replaced with full ABI after deployment
        {
            "inputs": [],
            "name": "name",
            "outputs": [{"internalType": "string", "name": "", "type": "string"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [{"internalType": "string", "name": "", "type": "string"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        }
    ],
    accounts: {
        owner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        ngo: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        government: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        company: "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
    },
    deploymentDate: new Date().toISOString()
};

console.log('✅ Contract configuration loaded');
