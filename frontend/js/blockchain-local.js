// BlueTrust DApp - Blockchain Utilities for Local Network
// This file handles all blockchain-specific operations

class BlockchainUtils {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.isInitialized = false;
        this.networkConfig = {
            chainId: '0x7A69', // 31337 in hex
            chainName: 'BlueTrust Local',
            rpcUrls: ['http://127.0.0.1:8545'],
            nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
            }
        };
    }

    // Initialize blockchain connection
    async initialize() {
        try {
            console.log('🔗 Initializing blockchain connection...');
            
            // Check if Web3 is available
            if (typeof Web3 === 'undefined') {
                throw new Error('Web3 not found. Please include Web3.js library.');
            }

            // Initialize Web3 with MetaMask or local provider
            if (typeof window.ethereum !== 'undefined') {
                this.web3 = new Web3(window.ethereum);
                console.log('📱 Using MetaMask provider');
                
                // Check network
                await this.checkNetwork();
            } else {
                // Fallback to local provider
                this.web3 = new Web3('http://127.0.0.1:8545');
                console.log('🏠 Using local provider');
            }

            // Load contract configuration
            if (typeof CONTRACT_CONFIG !== 'undefined') {
                await this.initializeContract();
            } else {
                console.warn('⚠️ Contract configuration not found');
            }

            this.isInitialized = true;
            console.log('✅ Blockchain connection initialized');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize blockchain:', error);
            this.isInitialized = false;
            return false;
        }
    }

    // Check if we're on the correct network
    async checkNetwork() {
        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== this.networkConfig.chainId) {
                console.log('🔄 Switching to local network...');
                await this.switchToLocalNetwork();
            }
        } catch (error) {
            console.error('❌ Network check failed:', error);
        }
    }

    // Switch to local network
    async switchToLocalNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.networkConfig.chainId }]
            });
        } catch (switchError) {
            // Network not added, try to add it
            if (switchError.code === 4902) {
                await this.addLocalNetwork();
            } else {
                throw switchError;
            }
        }
    }

    // Add local network to MetaMask
    async addLocalNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [this.networkConfig]
            });
            console.log('✅ Local network added to MetaMask');
        } catch (error) {
            console.error('❌ Failed to add local network:', error);
            throw error;
        }
    }

    // Initialize smart contract
    async initializeContract() {
        try {
            if (!CONTRACT_CONFIG.contractAddress || !CONTRACT_CONFIG.contractABI) {
                throw new Error('Contract configuration incomplete');
            }

            this.contract = new this.web3.eth.Contract(
                CONTRACT_CONFIG.contractABI,
                CONTRACT_CONFIG.contractAddress
            );

            console.log('📜 Contract initialized:', CONTRACT_CONFIG.contractAddress);
            return true;
        } catch (error) {
            console.error('❌ Contract initialization failed:', error);
            return false;
        }
    }

    // Get current account
    async getCurrentAccount() {
        try {
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                return accounts[0] || null;
            } else {
                const accounts = await this.web3.eth.getAccounts();
                return accounts[0] || null;
            }
        } catch (error) {
            console.error('❌ Failed to get current account:', error);
            return null;
        }
    }

    // Request account access
    async requestAccounts() {
        try {
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                return accounts;
            } else {
                const accounts = await this.web3.eth.getAccounts();
                return accounts;
            }
        } catch (error) {
            console.error('❌ Failed to request accounts:', error);
            throw error;
        }
    }

    // Get account balance
    async getBalance(account) {
        try {
            if (!account) {
                account = await this.getCurrentAccount();
            }
            
            if (!account) {
                return '0';
            }

            const balance = await this.web3.eth.getBalance(account);
            return this.web3.utils.fromWei(balance, 'ether');
        } catch (error) {
            console.error('❌ Failed to get balance:', error);
            return '0';
        }
    }

    // Get token balance
    async getTokenBalance(account) {
        try {
            if (!this.contract) {
                console.warn('⚠️ Contract not initialized');
                return '0';
            }

            if (!account) {
                account = await this.getCurrentAccount();
            }

            if (!account) {
                return '0';
            }

            const balance = await this.contract.methods.balanceOf(account).call();
            return this.web3.utils.fromWei(balance, 'ether');
        } catch (error) {
            console.error('❌ Failed to get token balance:', error);
            return '0';
        }
    }

    // Register project on blockchain
    async registerProject(projectData) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const account = await this.getCurrentAccount();
            if (!account) {
                throw new Error('No account connected');
            }

            console.log('📝 Registering project on blockchain...');

            const tx = await this.contract.methods.registerProject(
                projectData.id,
                account,
                projectData.name,
                projectData.location.name,
                Math.round(projectData.area * 100), // Convert to integer (area * 100)
                projectData.planted,
                Math.round(projectData.location.lat * 1000000), // Convert to integer
                Math.round(projectData.location.lng * 1000000), // Convert to integer
                projectData.ipfsHash || 'QmPlaceholder'
            ).send({
                from: account,
                gas: 500000
            });

            console.log('✅ Project registered on blockchain:', tx.transactionHash);
            return tx;
        } catch (error) {
            console.error('❌ Blockchain project registration failed:', error);
            throw error;
        }
    }

    // Verify project and mint credits
    async verifyAndMintCredits(projectId, survivalRate) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const account = await this.getCurrentAccount();
            if (!account) {
                throw new Error('No account connected');
            }

            console.log('🔍 Verifying project and minting credits...');

            const tx = await this.contract.methods.verifyAndMintCredits(
                projectId,
                survivalRate
            ).send({
                from: account,
                gas: 500000
            });

            console.log('✅ Credits minted:', tx.transactionHash);
            return tx;
        } catch (error) {
            console.error('❌ Credit minting failed:', error);
            throw error;
        }
    }

    // Purchase credits
    async purchaseCredits(ngoAddress, amount, priceInWei) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const account = await this.getCurrentAccount();
            if (!account) {
                throw new Error('No account connected');
            }

            console.log('💳 Purchasing credits...');

            const totalCost = this.web3.utils.toBN(priceInWei).mul(this.web3.utils.toBN(amount));

            const tx = await this.contract.methods.purchaseCredits(
                ngoAddress,
                amount
            ).send({
                from: account,
                value: totalCost.toString(),
                gas: 300000
            });

            console.log('✅ Credits purchased:', tx.transactionHash);
            return tx;
        } catch (error) {
            console.error('❌ Credit purchase failed:', error);
            throw error;
        }
    }

    // Retire credits
    async retireCredits(amount, reason) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const account = await this.getCurrentAccount();
            if (!account) {
                throw new Error('No account connected');
            }

            console.log('🔥 Retiring credits...');

            const tx = await this.contract.methods.retireCredits(
                amount,
                reason
            ).send({
                from: account,
                gas: 200000
            });

            console.log('✅ Credits retired:', tx.transactionHash);
            return tx;
        } catch (error) {
            console.error('❌ Credit retirement failed:', error);
            throw error;
        }
    }

    // Set credit price
    async setCreditPrice(priceInWei) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const account = await this.getCurrentAccount();
            if (!account) {
                throw new Error('No account connected');
            }

            console.log('💰 Setting credit price...');

            const tx = await this.contract.methods.setCreditPrice(priceInWei).send({
                from: account,
                gas: 100000
            });

            console.log('✅ Credit price set:', tx.transactionHash);
            return tx;
        } catch (error) {
            console.error('❌ Failed to set credit price:', error);
            throw error;
        }
    }

    // Get all projects
    async getAllProjects() {
        try {
            if (!this.contract) {
                console.warn('⚠️ Contract not initialized');
                return [];
            }

            const projectIds = await this.contract.methods.getAllProjectIds().call();
            const projects = [];

            for (const projectId of projectIds) {
                try {
                    const project = await this.contract.methods.getProject(projectId).call();
                    projects.push({
                        id: projectId,
                        ngoAddress: project.ngoAddress,
                        name: project.name,
                        location: project.location,
                        area: parseInt(project.areaHectares) / 100, // Convert back from integer
                        trees: parseInt(project.treesPlanted),
                        survivalRate: parseInt(project.survivalRate),
                        creditsIssued: parseInt(project.creditsIssued),
                        status: ['Registered', 'Under Review', 'Verified', 'Rejected'][project.status],
                        registrationDate: new Date(parseInt(project.registrationDate) * 1000).toISOString().split('T')[0]
                    });
                } catch (error) {
                    console.error(`Failed to load project ${projectId}:`, error);
                }
            }

            return projects;
        } catch (error) {
            console.error('❌ Failed to get projects:', error);
            return [];
        }
    }

    // Get contract statistics
    async getContractStats() {
        try {
            if (!this.contract) {
                console.warn('⚠️ Contract not initialized');
                return null;
            }

            const stats = await this.contract.methods.getContractStats().call();
            return {
                totalProjects: parseInt(stats.totalProjects),
                totalSupply: this.web3.utils.fromWei(stats.totalSupply_, 'ether'),
                totalRetired: parseInt(stats.totalRetired),
                activeProjects: parseInt(stats.activeProjects)
            };
        } catch (error) {
            console.error('❌ Failed to get contract stats:', error);
            return null;
        }
    }

    // Get credit price for NGO
    async getCreditPrice(ngoAddress) {
        try {
            if (!this.contract) {
                console.warn('⚠️ Contract not initialized');
                return '0';
            }

            const price = await this.contract.methods.getCreditPrice(ngoAddress).call();
            return price;
        } catch (error) {
            console.error('❌ Failed to get credit price:', error);
            return '0';
        }
    }

    // Listen to contract events
    listenToEvents(callback) {
        if (!this.contract) {
            console.warn('⚠️ Contract not initialized for event listening');
            return;
        }

        try {
            // Listen to all contract events
            this.contract.events.allEvents()
                .on('data', (event) => {
                    console.log('📡 Contract event:', event);
                    if (callback) callback(event);
                })
                .on('error', (error) => {
                    console.error('❌ Event listening error:', error);
                });

            console.log('👂 Listening to contract events...');
        } catch (error) {
            console.error('❌ Failed to set up event listeners:', error);
        }
    }

    // Utility functions
    weiToEth(wei) {
        return this.web3.utils.fromWei(wei.toString(), 'ether');
    }

    ethToWei(eth) {
        return this.web3.utils.toWei(eth.toString(), 'ether');
    }

    isValidAddress(address) {
        return this.web3.utils.isAddress(address);
    }

    // Format address for display
    formatAddress(address, length = 4) {
        if (!address) return 'Unknown';
        return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
    }

    // Get transaction receipt
    async getTransactionReceipt(txHash) {
        try {
            return await this.web3.eth.getTransactionReceipt(txHash);
        } catch (error) {
            console.error('❌ Failed to get transaction receipt:', error);
            return null;
        }
    }

    // Wait for transaction confirmation
    async waitForTransaction(txHash, confirmations = 1) {
        try {
            console.log('⏳ Waiting for transaction confirmation...');
            
            let receipt = null;
            while (!receipt) {
                receipt = await this.getTransactionReceipt(txHash);
                if (!receipt) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            console.log('✅ Transaction confirmed:', txHash);
            return receipt;
        } catch (error) {
            console.error('❌ Failed to wait for transaction:', error);
            throw error;
        }
    }

    // Check if user is authorized verifier
    async isAuthorizedVerifier(account) {
        try {
            if (!this.contract || !account) return false;
            
            // This would need to be implemented in the smart contract
            // For now, return true for government demo account
            return account.toLowerCase() === CONTRACT_CONFIG?.accounts?.government?.toLowerCase();
        } catch (error) {
            console.error('❌ Failed to check verifier status:', error);
            return false;
        }
    }
}

// Create global instance
window.blockchainUtils = new BlockchainUtils();

// Auto-initialize when Web3 is available
document.addEventListener('DOMContentLoaded', async () => {
    // Wait a bit for other scripts to load
    setTimeout(async () => {
        if (typeof Web3 !== 'undefined') {
            await window.blockchainUtils.initialize();
        } else {
            console.warn('⚠️ Web3 not available, blockchain features disabled');
        }
    }, 1000);
});

console.log('✅ BlueTrust blockchain-local.js loaded successfully');
