// BlueTrust - Enhanced Web3 Manager for Local Development
// This file integrates with blockchain-local.js for full functionality

class LocalWeb3Manager {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.currentAccount = null;
        this.isConnected = false;
        this.contractConfig = null;
        
        // Local blockchain configuration
        this.LOCAL_RPC_URL = 'http://localhost:8545';
        this.CHAIN_ID = 31337;
    }
    
    async init() {
        try {
            console.log('🔗 Initializing Web3 Manager...');
            
            // Load contract configuration
            if (typeof CONTRACT_CONFIG !== 'undefined') {
                this.contractConfig = CONTRACT_CONFIG;
                console.log('✅ Contract configuration loaded');
            }
            
            // Use blockchain utils if available
            if (typeof window.blockchainUtils !== 'undefined') {
                await window.blockchainUtils.initialize();
                this.web3 = window.blockchainUtils.web3;
                this.contract = window.blockchainUtils.contract;
                console.log('✅ Using blockchain utils');
            } else {
                await this.initializeWeb3();
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Web3 Manager:', error);
            return false;
        }
    }
    
    async initializeWeb3() {
        try {
            if (typeof window.ethereum !== 'undefined') {
                this.web3 = new Web3(window.ethereum);
                console.log('📱 MetaMask detected');
                
                await this.addLocalNetwork();
            } else {
                this.web3 = new Web3(this.LOCAL_RPC_URL);
                console.log('🔧 Using direct local provider');
            }
            
            if (this.contractConfig) {
                this.contract = new this.web3.eth.Contract(
                    this.contractConfig.contractABI,
                    this.contractConfig.contractAddress
                );
                console.log('📜 Contract initialized');
            }
        } catch (error) {
            console.error('❌ Web3 initialization failed:', error);
            throw error;
        }
    }
    
    async addLocalNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x7A69',
                    chainName: 'BlueTrust Local',
                    nativeCurrency: {
                        name: 'Ethereum',
                        symbol: 'ETH',
                        decimals: 18
                    },
                    rpcUrls: [this.LOCAL_RPC_URL],
                    blockExplorerUrls: null
                }]
            });
            console.log('✅ Local network added');
        } catch (error) {
            if (error.code !== 4902) {
                console.error('❌ Failed to add local network:', error);
            }
        }
    }
    
    async connect() {
        try {
            console.log('🔗 Connecting to wallet...');
            
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                
                if (accounts.length > 0) {
                    this.currentAccount = accounts[0];
                    this.isConnected = true;
                    
                    window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
                    window.ethereum.on('chainChanged', () => window.location.reload());
                    
                    console.log('✅ Connected to MetaMask:', this.currentAccount);
                    this.updateUI();
                    return true;
                }
            } else {
                // Use local account for demo
                if (this.web3) {
                    const accounts = await this.web3.eth.getAccounts();
                    if (accounts.length > 0) {
                        this.currentAccount = accounts[0];
                        this.isConnected = true;
                        console.log('✅ Using local account:', this.currentAccount);
                        this.updateUI();
                        return true;
                    }
                }
            }
            
            throw new Error('No accounts available');
        } catch (error) {
            console.error('❌ Connection failed:', error);
            return false;
        }
    }
    
    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            this.currentAccount = null;
            this.isConnected = false;
        } else {
            this.currentAccount = accounts[0];
        }
        this.updateUI();
        
        if (window.loadDashboardData) {
            window.loadDashboardData();
        }
    }
    
    updateUI() {
        const addressElements = document.querySelectorAll('.wallet-address code, #ngoWalletAddress, #companyWalletAddress');
        addressElements.forEach(element => {
            if (element && this.currentAccount) {
                element.textContent = `${this.currentAccount.slice(0, 6)}...${this.currentAccount.slice(-4)}`;
            }
        });
        
        const connectBtn = document.getElementById('connectWallet');
        if (connectBtn) {
            if (this.isConnected) {
                connectBtn.textContent = '✅ Connected';
                connectBtn.disabled = true;
            } else {
                connectBtn.textContent = '🔗 Connect Wallet';
                connectBtn.disabled = false;
            }
        }
        
        this.updateBalance();
    }
    
    async updateBalance() {
        if (!this.isConnected || !this.contract || !this.currentAccount) return;
        
        try {
            const balance = await this.contract.methods.balanceOf(this.currentAccount).call();
            const balanceFormatted = this.web3.utils.fromWei(balance, 'ether');
            
            const balanceElements = document.querySelectorAll('.wallet-balance, .balance-value, #ngoWalletBalance, #companyWalletBalance, #walletBalanceLarge');
            balanceElements.forEach(element => {
                if (element) {
                    element.textContent = parseFloat(balanceFormatted).toFixed(2);
                }
            });
            
            return balanceFormatted;
        } catch (error) {
            console.error('❌ Failed to update balance:', error);
            return '0';
        }
    }
    
    // Blockchain interaction methods using blockchainUtils
    async registerProject(projectData) {
        if (window.blockchainUtils) {
            return await window.blockchainUtils.registerProject(projectData);
        }
        throw new Error('Blockchain utils not available');
    }
    
    async verifyProject(projectId, survivalRate) {
        if (window.blockchainUtils) {
            return await window.blockchainUtils.verifyAndMintCredits(projectId, survivalRate);
        }
        throw new Error('Blockchain utils not available');
    }
    
    async purchaseCredits(ngoAddress, amount) {
        if (window.blockchainUtils) {
            const priceWei = await window.blockchainUtils.getCreditPrice(ngoAddress);
            return await window.blockchainUtils.purchaseCredits(ngoAddress, amount, priceWei);
        }
        throw new Error('Blockchain utils not available');
    }
    
    async retireCredits(amount, reason) {
        if (window.blockchainUtils) {
            return await window.blockchainUtils.retireCredits(amount, reason);
        }
        throw new Error('Blockchain utils not available');
    }
    
    async setCreditPrice(priceInEth) {
        if (window.blockchainUtils) {
            const priceInWei = this.web3.utils.toWei(priceInEth.toString(), 'ether');
            return await window.blockchainUtils.setCreditPrice(priceInWei);
        }
        throw new Error('Blockchain utils not available');
    }
    
    async getAllProjects() {
        if (window.blockchainUtils) {
            return await window.blockchainUtils.getAllProjects();
        }
        return [];
    }
    
    async getContractStats() {
        if (window.blockchainUtils) {
            return await window.blockchainUtils.getContractStats();
        }
        return null;
    }
}

// Initialize Web3 manager
window.web3Manager = new LocalWeb3Manager();

// Auto-initialize
document.addEventListener('DOMContentLoaded', async () => {
    setTimeout(async () => {
        await window.web3Manager.init();
    }, 500);
});

console.log('✅ BlueTrust web3-local.js enhanced version loaded');
