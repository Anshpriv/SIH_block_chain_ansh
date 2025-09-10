// BlueTrust DApp - Main Application Logic
// This file handles all UI interactions, user authentication, and dashboard management

// Global application state
let currentUser = null;
let currentUserType = null;
let projects = [];
let companies = [];
let ngos = [];
let governmentUsers = [];
let currentModal = null;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🌊 BlueTrust DApp initializing...');
    
    // Initialize sample data
    initializeSampleData();
    
    // Initialize Web3 connection
    if (typeof window.web3Manager !== 'undefined') {
        console.log('✅ Web3 Manager found');
    } else {
        console.warn('⚠️ Web3 Manager not loaded yet');
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Show initial screen
    showScreen('loginScreen');
    
    console.log('✅ BlueTrust DApp initialized successfully');
});

// Initialize sample data for testing
function initializeSampleData() {
    // Sample NGOs
    ngos = [
        {
            id: "NGO001",
            name: "Coastal Conservation Society",
            email: "ngo@demo.com",
            registration: "NG-DEL-12345",
            location: "West Bengal",
            projects: 1,
            total_credits: 52,
            available_credits: 45,
            rating: 4.8,
            credit_price: 2500
        }
    ];
    
    // Sample companies
    companies = [
        {
            id: "CMP001",
            name: "Green Tech Solutions",
            email: "company@demo.com",
            cin: "U12345AB2020PTC123456",
            credits_purchased: 0,
            carbon_footprint: 500,
            offset_percentage: 0
        }
    ];
    
    // Sample government users
    governmentUsers = [
        {
            id: "GOV001",
            name: "Dr. Rajesh Kumar",
            email: "gov@demo.com",
            department: "Ministry of Environment",
            role: "verifier",
            verified_projects: 0
        }
    ];
    
    // Sample projects
    projects = [
        {
            id: "PRJ001",
            name: "Sundarbans Mangrove Restoration",
            ngo: "Coastal Conservation Society",
            ngoId: "NGO001",
            location: {
                name: "West Bengal, India",
                lat: 21.9497,
                lng: 88.9468
            },
            area: 5.2,
            planted: 2600,
            survival_rate: 85,
            carbon_credits: 52,
            status: "verified",
            created_date: "2025-09-01",
            verified_date: "2025-09-08",
            description: "Large-scale mangrove restoration in the Sundarbans delta region focusing on climate resilience and community livelihoods."
        }
    ];
}

// Set up all event listeners
function setupEventListeners() {
    // Connect wallet button
    const connectWalletBtn = document.getElementById('connectWallet');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWallet);
    }
    
    // Form submissions
    const loginForm = document.querySelector('#loginForm form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.querySelector('#registerForm form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
}

// Screen Management Functions
function showScreen(screenId) {
    console.log('Showing screen:', screenId);
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    } else {
        console.error('Screen not found:', screenId);
    }
}

// Tab Management Functions
function showTab(tabName) {
    console.log('Showing tab:', tabName);
    
    // Update login tabs
    document.querySelectorAll('#loginScreen .form-container').forEach(container => {
        container.classList.remove('active');
    });
    
    document.querySelectorAll('#loginScreen .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show target form
    const targetForm = document.getElementById(tabName + 'Form');
    if (targetForm) {
        targetForm.classList.add('active');
    }
    
    // Activate corresponding tab button
    const tabButtons = document.querySelectorAll('#loginScreen .tab-btn');
    tabButtons.forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabName)) {
            btn.classList.add('active');
        }
    });
}

// Demo Account Setup Functions
function setDemoAccount(userType) {
    console.log('Setting demo account for:', userType);
    
    const credentials = {
        'ngo': {
            email: 'ngo@demo.com',
            password: 'demo123',
            type: 'ngo'
        },
        'government': {
            email: 'gov@demo.com',
            password: 'demo123',
            type: 'government'
        },
        'company': {
            email: 'company@demo.com',
            password: 'demo123',
            type: 'company'
        }
    };
    
    const userTypeSelect = document.getElementById('loginUserType');
    const emailInput = document.getElementById('loginId');
    const passwordInput = document.getElementById('loginPassword');
    
    if (userTypeSelect && emailInput && passwordInput && credentials[userType]) {
        userTypeSelect.value = credentials[userType].type;
        emailInput.value = credentials[userType].email;
        passwordInput.value = credentials[userType].password;
        
        // Visual feedback
        emailInput.style.backgroundColor = '#e8f5e8';
        passwordInput.style.backgroundColor = '#e8f5e8';
        
        setTimeout(() => {
            emailInput.style.backgroundColor = '';
            passwordInput.style.backgroundColor = '';
        }, 1000);
        
        console.log('Demo account credentials set');
    }
}

// Registration Functions
function showRegistrationFields() {
    const userType = document.getElementById('regUserType').value;
    
    // Hide all fields first
    document.querySelectorAll('.registration-fields').forEach(field => {
        field.classList.remove('active');
    });
    
    // Show relevant fields
    if (userType === 'ngo') {
        document.getElementById('ngoFields').classList.add('active');
    } else if (userType === 'government') {
        document.getElementById('govFields').classList.add('active');
    } else if (userType === 'company') {
        document.getElementById('companyFields').classList.add('active');
    }
}

// Authentication Functions
async function handleLogin(event) {
    event.preventDefault();
    console.log('Handling login...');
    
    const userType = document.getElementById('loginUserType').value;
    const email = document.getElementById('loginId').value;
    const password = document.getElementById('loginPassword').value;
    
    console.log('Login attempt:', { userType, email });
    
    // Demo authentication
    const demoCredentials = {
        'ngo@demo.com': { 
            type: 'ngo', 
            id: 'NGO001', 
            name: 'Coastal Conservation Society',
            data: ngos.find(n => n.id === 'NGO001')
        },
        'gov@demo.com': { 
            type: 'government', 
            id: 'GOV001', 
            name: 'Dr. Rajesh Kumar',
            data: governmentUsers.find(g => g.id === 'GOV001')
        },
        'company@demo.com': { 
            type: 'company', 
            id: 'CMP001', 
            name: 'Green Tech Solutions',
            data: companies.find(c => c.id === 'CMP001')
        }
    };
    
    const userCredential = demoCredentials[email];
    
    if (userCredential && password === 'demo123' && userCredential.type === userType) {
        currentUser = userCredential;
        currentUserType = userType;
        
        console.log('✅ Login successful');
        
        // Connect wallet
        await connectWallet();
        
        // Show appropriate dashboard
        showDashboard(userType);
        
        return true;
    } else {
        showError('Invalid credentials. Please use demo accounts:\n\nNGO: ngo@demo.com / demo123\nGov: gov@demo.com / demo123\nCompany: company@demo.com / demo123');
        return false;
    }
}

function handleRegistration(event) {
    event.preventDefault();
    showSuccess('Registration Successful', 'Your account has been created successfully. Please login with your credentials.');
    showTab('login');
}

function logout() {
    currentUser = null;
    currentUserType = null;
    showScreen('loginScreen');
    console.log('User logged out');
}

// Wallet Connection Functions
async function connectWallet() {
    console.log('Connecting wallet...');
    
    if (typeof window.web3Manager !== 'undefined') {
        try {
            const connected = await window.web3Manager.connect();
            if (connected) {
                console.log('✅ Wallet connected successfully');
                updateWalletUI();
                return true;
            }
        } catch (error) {
            console.error('❌ Wallet connection failed:', error);
            showError('Failed to connect wallet: ' + error.message);
        }
    } else {
        console.log('📝 Web3Manager not available, using mock connection');
        // Mock connection for testing
        setTimeout(() => {
            document.getElementById('connectWallet').textContent = '✅ Connected (Demo)';
            document.getElementById('connectWallet').disabled = true;
            updateWalletUI();
        }, 1000);
    }
    
    return false;
}

function updateWalletUI() {
    const walletAddress = window.web3Manager?.currentAccount || '0xDemo...Address';
    
    // Update all wallet address displays
    document.querySelectorAll('.wallet-address code, #ngoWalletAddress, #companyWalletAddress').forEach(element => {
        if (element) {
            element.textContent = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
        }
    });
    
    // Update balance displays
    updateWalletBalance();
}

async function updateWalletBalance() {
    let balance = 0;
    
    if (window.web3Manager && window.web3Manager.isConnected) {
        try {
            balance = await window.web3Manager.updateBalance();
        } catch (error) {
            console.error('Failed to get balance:', error);
            balance = 0;
        }
    } else {
        // Mock balance for demo
        if (currentUser && currentUser.data) {
            balance = currentUser.data.available_credits || 0;
        }
    }
    
    // Update balance displays
    document.querySelectorAll('.wallet-balance, .balance-value, #ngoWalletBalance, #companyWalletBalance, #walletBalanceLarge').forEach(element => {
        if (element) {
            element.textContent = parseFloat(balance).toFixed(2);
        }
    });
}

// Dashboard Management Functions
function showDashboard(userType) {
    console.log('Showing dashboard for:', userType);
    
    switch(userType) {
        case 'ngo':
            showScreen('ngoDashboard');
            loadNGODashboard();
            break;
        case 'government':
            showScreen('governmentDashboard');
            loadGovernmentDashboard();
            break;
        case 'company':
            showScreen('companyDashboard');
            loadCompanyDashboard();
            break;
    }
}

// NGO Dashboard Functions
function loadNGODashboard() {
    if (!currentUser || !currentUser.data) return;
    
    const ngo = currentUser.data;
    
    // Update user name
    const userNameElement = document.getElementById('ngoUserName');
    if (userNameElement) {
        userNameElement.textContent = ngo.name;
    }
    
    // Update statistics
    document.getElementById('ngoTotalProjects').textContent = ngo.projects || 0;
    document.getElementById('ngoTotalCredits').textContent = ngo.total_credits || 0;
    document.getElementById('ngoAvailableCredits').textContent = ngo.available_credits || 0;
    document.getElementById('ngoTotalRevenue').textContent = `₹${((ngo.available_credits || 0) * (ngo.credit_price || 0)).toLocaleString()}`;
    
    // Load projects
    loadNGOProjects();
    
    // Update wallet displays
    updateWalletUI();
}

function showNGOTab(tabName) {
    console.log('Showing NGO tab:', tabName);
    
    // Update tab buttons
    document.querySelectorAll('#ngoDashboard .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the correct tab button
    document.querySelectorAll('#ngoDashboard .tab-btn').forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick && onclick.includes(`'${tabName}'`)) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('#ngoDashboard .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const tabContentMap = {
        'overview': 'ngoOverview',
        'projects': 'ngoProjects',
        'wallet': 'ngoWallet',
        'requests': 'ngoRequests',
        'newProject': 'ngoNewProject'
    };
    
    const targetContent = document.getElementById(tabContentMap[tabName]);
    if (targetContent) {
        targetContent.classList.add('active');
        
        // Load specific tab content
        switch(tabName) {
            case 'projects':
                loadNGOProjects();
                break;
            case 'wallet':
                updateWalletBalance();
                break;
        }
    }
}

function loadNGOProjects() {
    if (!currentUser) return;
    
    const ngoProjects = projects.filter(p => p.ngoId === currentUser.id);
    const projectsList = document.getElementById('ngoProjectsList');
    
    if (!projectsList) return;
    
    if (ngoProjects.length === 0) {
        projectsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-seedling"></i>
                <h3>No Projects Yet</h3>
                <p>Register your first mangrove restoration project to start earning carbon credits</p>
                <button class="btn btn--primary" onclick="showNGOTab('newProject')">
                    <i class="fas fa-plus"></i> Register Project
                </button>
            </div>
        `;
        return;
    }
    
    projectsList.innerHTML = ngoProjects.map(project => `
        <div class="card">
            <div class="card__header">
                <h3>${project.name}</h3>
                <span class="status-badge ${project.status}">${project.status}</span>
            </div>
            <div class="card__body">
                <div class="project-details">
                    <p><strong>Location:</strong> ${project.location.name}</p>
                    <p><strong>Area:</strong> ${project.area} hectares</p>
                    <p><strong>Trees Planted:</strong> ${project.planted.toLocaleString()}</p>
                    <p><strong>Survival Rate:</strong> ${project.survival_rate}%</p>
                    <p><strong>Carbon Credits:</strong> ${project.carbon_credits} BTCC</p>
                    <p><strong>Status:</strong> ${project.status}</p>
                </div>
                <div class="project-actions">
                    <button class="btn btn--secondary btn--sm" onclick="viewProject('${project.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    ${project.status === 'verified' ? 
                        `<button class="btn btn--primary btn--sm" onclick="viewCredits('${project.id}')">
                            <i class="fas fa-coins"></i> View Credits
                        </button>` : ''
                    }
                </div>
            </div>
        </div>
    `).join('');
}

// Project Registration Functions
async function submitNewProject(event) {
    event.preventDefault();
    console.log('Submitting new project...');
    
    showLoading('Registering project on blockchain...');
    
    try {
        // Get form data
        const formData = new FormData(event.target);
        const projectData = {
            id: `PRJ${Date.now()}`,
            name: formData.get('projectName'),
            location: {
                name: formData.get('location'),
                lat: parseFloat(formData.get('latitude')) || 0,
                lng: parseFloat(formData.get('longitude')) || 0
            },
            area: parseFloat(formData.get('area')),
            planted: parseInt(formData.get('treesPlanted')),
            description: formData.get('description'),
            ngoId: currentUser.id,
            ngo: currentUser.name,
            survival_rate: 0,
            carbon_credits: 0,
            status: 'registered',
            created_date: new Date().toISOString().split('T')[0],
            verified_date: null
        };
        
        // Validate satellite data
        if (window.satelliteSimulator) {
            const satelliteData = await window.satelliteSimulator.verifySatelliteData(
                projectData.location.lat,
                projectData.location.lng,
                projectData.area
            );
            console.log('Satellite verification:', satelliteData);
        }
        
        // Register on blockchain (if available)
        if (window.web3Manager && window.web3Manager.isConnected) {
            const txResult = await window.web3Manager.registerProject(projectData);
            projectData.txHash = txResult.transactionHash;
            console.log('Blockchain registration successful:', txResult);
        }
        
        // Add to local projects
        projects.push(projectData);
        
        hideLoading();
        showSuccess('Project Registered Successfully!', 
            `Your project "${projectData.name}" has been registered on the blockchain and is pending verification.`);
        
        // Reset form and switch to projects tab
        event.target.reset();
        showNGOTab('projects');
        
    } catch (error) {
        hideLoading();
        console.error('Project registration failed:', error);
        showError('Failed to register project: ' + error.message);
    }
}

// Government Dashboard Functions
function loadGovernmentDashboard() {
    if (!currentUser || !currentUser.data) return;
    
    const gov = currentUser.data;
    
    // Update user name
    const userNameElement = document.getElementById('govUserName');
    if (userNameElement) {
        userNameElement.textContent = gov.name;
    }
    
    // Update statistics
    updateGovernmentStats();
    
    showGovTab('overview');
}

function updateGovernmentStats() {
    const totalProjects = projects.length;
    const pendingProjects = projects.filter(p => p.status === 'registered' || p.status === 'under_review').length;
    const totalCredits = projects.reduce((sum, p) => sum + (p.carbon_credits || 0), 0);
    const totalArea = projects.reduce((sum, p) => sum + (p.area || 0), 0);
    
    const elements = {
        'totalRegisteredProjects': totalProjects,
        'pendingVerifications': pendingProjects,
        'totalCreditsMinted': totalCredits,
        'totalAreaRestored': totalArea.toFixed(1)
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

function showGovTab(tabName) {
    console.log('Showing Government tab:', tabName);
    
    // Update tab buttons
    document.querySelectorAll('#governmentDashboard .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the correct tab button
    document.querySelectorAll('#governmentDashboard .tab-btn').forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick && onclick.includes(`'${tabName}'`)) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('#governmentDashboard .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const tabContentMap = {
        'overview': 'govOverview',
        'verification': 'govVerification',
        'analytics': 'govAnalytics',
        'management': 'govManagement'
    };
    
    const targetContent = document.getElementById(tabContentMap[tabName]);
    if (targetContent) {
        targetContent.classList.add('active');
        
        // Load specific tab content
        switch(tabName) {
            case 'verification':
                loadVerificationQueue();
                break;
            case 'analytics':
                loadAnalytics();
                break;
            case 'management':
                loadNGOManagement();
                break;
        }
    }
}

function loadVerificationQueue() {
    const pendingProjects = projects.filter(p => p.status === 'registered' || p.status === 'under_review');
    const queueElement = document.getElementById('verificationQueue');
    
    if (!queueElement) return;
    
    if (pendingProjects.length === 0) {
        queueElement.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No Projects in Queue</h3>
                <p>Projects registered by NGOs will appear here for verification</p>
            </div>
        `;
        return;
    }
    
    queueElement.innerHTML = pendingProjects.map(project => `
        <div class="card verification-item-card">
            <div class="card__header">
                <h3>${project.name}</h3>
                <span class="status-badge ${project.status}">${project.status}</span>
            </div>
            <div class="card__body">
                <div class="verification-data">
                    <div class="data-section">
                        <h4><i class="fas fa-info-circle"></i> Project Details</h4>
                        <p><strong>NGO:</strong> ${project.ngo}</p>
                        <p><strong>Location:</strong> ${project.location.name}</p>
                        <p><strong>Area:</strong> ${project.area} hectares</p>
                        <p><strong>Trees Planted:</strong> ${project.planted.toLocaleString()}</p>
                        <p><strong>Registration Date:</strong> ${project.created_date}</p>
                    </div>
                    <div class="data-section">
                        <h4><i class="fas fa-satellite"></i> Satellite Data</h4>
                        <p><strong>Coordinates:</strong> ${project.location.lat}, ${project.location.lng}</p>
                        <p><strong>Verification:</strong> Pending</p>
                        <p><strong>Expected Credits:</strong> ~${Math.floor(project.area * 10)} BTCC</p>
                    </div>
                </div>
                <div class="verification-actions">
                    <button class="btn btn--secondary" onclick="viewProjectDetails('${project.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn btn--info" onclick="verifySatelliteData('${project.id}')">
                        <i class="fas fa-satellite"></i> Verify Satellite
                    </button>
                    <button class="btn btn--success" onclick="approveProject('${project.id}')">
                        <i class="fas fa-check"></i> Approve & Mint
                    </button>
                    <button class="btn btn--error" onclick="rejectProject('${project.id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Project Verification Functions
async function approveProject(projectId) {
    console.log('Approving project:', projectId);
    
    const project = projects.find(p => p.id === projectId);
    if (!project) {
        showError('Project not found');
        return;
    }
    
    showLoading('Verifying project and minting credits...');
    
    try {
        // Simulate satellite verification
        if (window.satelliteSimulator) {
            const satelliteResult = await window.satelliteSimulator.verifySatelliteData(
                project.location.lat,
                project.location.lng,
                project.area
            );
            
            // Update project with verification data
            project.survival_rate = satelliteResult.vegetationIndex;
            project.carbon_credits = Math.floor(project.area * 10 * (project.survival_rate / 100));
        } else {
            // Default values if satellite simulation not available
            project.survival_rate = 85;
            project.carbon_credits = Math.floor(project.area * 10);
        }
        
        // Mint credits on blockchain (if available)
        if (window.web3Manager && window.web3Manager.isConnected) {
            const txResult = await window.web3Manager.verifyProject(projectId, project.survival_rate);
            project.mintTxHash = txResult.transactionHash;
            console.log('Credits minted on blockchain:', txResult);
        }
        
        // Update project status
        project.status = 'verified';
        project.verified_date = new Date().toISOString().split('T')[0];
        
        // Update NGO's credit balance
        const ngo = ngos.find(n => n.id === project.ngoId);
        if (ngo) {
            ngo.total_credits += project.carbon_credits;
            ngo.available_credits += project.carbon_credits;
        }
        
        hideLoading();
        showSuccess('Project Approved!', 
            `Project "${project.name}" has been verified and ${project.carbon_credits} carbon credits have been minted.`);
        
        // Refresh verification queue
        loadVerificationQueue();
        updateGovernmentStats();
        
    } catch (error) {
        hideLoading();
        console.error('Project approval failed:', error);
        showError('Failed to approve project: ' + error.message);
    }
}

async function verifySatelliteData(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    showLoading('Analyzing satellite data...');
    
    try {
        if (window.satelliteSimulator) {
            const result = await window.satelliteSimulator.verifySatelliteData(
                project.location.lat,
                project.location.lng,
                project.area
            );
            
            hideLoading();
            showInfo('Satellite Verification Complete', 
                `Vegetation Index: ${result.vegetationIndex}%\nConfidence: ${(result.confidence * 100).toFixed(1)}%\nChange Detection: ${result.changeDetection.description}`);
        } else {
            hideLoading();
            showInfo('Satellite Data', 'Satellite simulation not available. Using default verification.');
        }
    } catch (error) {
        hideLoading();
        showError('Satellite verification failed: ' + error.message);
    }
}

function rejectProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    if (confirm(`Are you sure you want to reject the project "${project.name}"?`)) {
        project.status = 'rejected';
        loadVerificationQueue();
        showInfo('Project Rejected', `Project "${project.name}" has been rejected.`);
    }
}

// Company Dashboard Functions
function loadCompanyDashboard() {
    if (!currentUser || !currentUser.data) return;
    
    const company = currentUser.data;
    
    // Update user name
    const userNameElement = document.getElementById('companyUserName');
    if (userNameElement) {
        userNameElement.textContent = company.name;
    }
    
    // Update statistics
    updateCompanyStats();
    
    showCompanyTab('overview');
}

function updateCompanyStats() {
    if (!currentUser || !currentUser.data) return;
    
    const company = currentUser.data;
    const offsetProgress = (company.credits_purchased / company.carbon_footprint) * 100;
    
    // Update displays
    document.getElementById('companyCreditsOwned').textContent = company.credits_purchased || 0;
    document.getElementById('offsetPercentage').textContent = `${offsetProgress.toFixed(1)}%`;
    document.getElementById('offsetProgressText').textContent = `${company.credits_purchased || 0} / ${company.carbon_footprint} tCO₂e`;
    
    // Update progress bar
    const progressBar = document.getElementById('offsetProgress');
    if (progressBar) {
        progressBar.style.width = `${Math.min(offsetProgress, 100)}%`;
    }
}

function showCompanyTab(tabName) {
    console.log('Showing Company tab:', tabName);
    
    // Update tab buttons
    document.querySelectorAll('#companyDashboard .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the correct tab button
    document.querySelectorAll('#companyDashboard .tab-btn').forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick && onclick.includes(`'${tabName}'`)) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('#companyDashboard .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const tabContentMap = {
        'overview': 'companyOverview',
        'marketplace': 'companyMarketplace',
        'portfolio': 'companyPortfolio',
        'reporting': 'companyReporting'
    };
    
    const targetContent = document.getElementById(tabContentMap[tabName]);
    if (targetContent) {
        targetContent.classList.add('active');
        
        // Load specific tab content
        switch(tabName) {
            case 'marketplace':
                loadMarketplace();
                break;
            case 'portfolio':
                loadPortfolio();
                break;
            case 'reporting':
                loadReporting();
                break;
        }
    }
}

function loadMarketplace() {
    const marketplace = document.getElementById('creditMarketplace');
    if (!marketplace) return;
    
    const availableNGOs = ngos.filter(ngo => ngo.available_credits > 0);
    
    if (availableNGOs.length === 0) {
        marketplace.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-store"></i>
                <h3>No Credits Available</h3>
                <p>Verified projects will list their carbon credits here for purchase</p>
            </div>
        `;
        return;
    }
    
    marketplace.innerHTML = availableNGOs.map(ngo => `
        <div class="card credit-listing">
            <div class="card__header">
                <h3>${ngo.name}</h3>
                <div class="rating">
                    <span class="rating-stars">${'★'.repeat(Math.floor(ngo.rating))}${'☆'.repeat(5 - Math.floor(ngo.rating))}</span>
                    <span class="rating-value">${ngo.rating}</span>
                </div>
            </div>
            <div class="card__body">
                <div class="listing-details">
                    <p><strong>Location:</strong> ${ngo.location}</p>
                    <p><strong>Available Credits:</strong> ${ngo.available_credits} BTCC</p>
                    <p><strong>Price per Credit:</strong> ₹${ngo.credit_price.toLocaleString()}</p>
                    <p><strong>Total Projects:</strong> ${ngo.projects}</p>
                    <p><strong>Registration:</strong> ${ngo.registration}</p>
                </div>
                <div class="listing-actions">
                    <input type="number" class="form-control quantity-input" id="quantity_${ngo.id}" 
                           min="1" max="${ngo.available_credits}" value="1" placeholder="Quantity">
                    <button class="btn btn--primary" onclick="purchaseCredits('${ngo.id}')">
                        <i class="fas fa-shopping-cart"></i> Purchase Credits
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function purchaseCredits(ngoId) {
    const ngo = ngos.find(n => n.id === ngoId);
    if (!ngo) return;
    
    const quantityInput = document.getElementById(`quantity_${ngoId}`);
    const quantity = parseInt(quantityInput.value);
    
    if (!quantity || quantity <= 0 || quantity > ngo.available_credits) {
        showError('Please enter a valid quantity');
        return;
    }
    
    const totalCost = quantity * ngo.credit_price;
    
    if (!confirm(`Purchase ${quantity} credits for ₹${totalCost.toLocaleString()}?`)) {
        return;
    }
    
    showLoading('Processing credit purchase...');
    
    try {
        // Purchase on blockchain (if available)
        if (window.web3Manager && window.web3Manager.isConnected) {
            // Convert INR price to ETH (mock conversion)
            const ethPrice = totalCost * 0.000001; // Mock conversion rate
            const txResult = await window.web3Manager.purchaseCredits(ngo.id, quantity);
            console.log('Credits purchased on blockchain:', txResult);
        }
        
        // Update balances
        ngo.available_credits -= quantity;
        currentUser.data.credits_purchased += quantity;
        
        hideLoading();
        showSuccess('Purchase Successful!', 
            `You have successfully purchased ${quantity} carbon credits for ₹${totalCost.toLocaleString()}.`);
        
        // Refresh displays
        loadMarketplace();
        updateCompanyStats();
        
    } catch (error) {
        hideLoading();
        console.error('Purchase failed:', error);
        showError('Failed to purchase credits: ' + error.message);
    }
}

// Utility Functions
function updateCreditPrice() {
    const priceInput = document.getElementById('creditPriceInput');
    if (!priceInput || !currentUser) return;
    
    const newPrice = parseInt(priceInput.value);
    if (newPrice < 1000 || newPrice > 10000) {
        showError('Price must be between ₹1,000 and ₹10,000');
        return;
    }
    
    // Update NGO's credit price
    if (currentUser.data) {
        currentUser.data.credit_price = newPrice;
        const ngo = ngos.find(n => n.id === currentUser.id);
        if (ngo) {
            ngo.credit_price = newPrice;
        }
    }
    
    showSuccess('Price Updated', `Credit price updated to ₹${newPrice.toLocaleString()} per credit`);
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const text = element.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showInfo('Copied', 'Address copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Loading and Modal Functions
function showLoading(message = 'Processing...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');
    
    if (text) text.textContent = message;
    if (overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('hidden');
}

function showSuccess(title, message) {
    const modal = document.getElementById('successModal');
    const titleElement = document.getElementById('successTitle');
    const messageElement = document.getElementById('successMessage');
    
    if (titleElement) titleElement.textContent = title;
    if (messageElement) messageElement.textContent = message;
    if (modal) {
        modal.classList.remove('hidden');
        currentModal = 'successModal';
    }
}

function showError(message) {
    const modal = document.getElementById('errorModal');
    const messageElement = document.getElementById('errorMessage');
    
    if (messageElement) messageElement.textContent = message;
    if (modal) {
        modal.classList.remove('hidden');
        currentModal = 'errorModal';
    }
}

function showInfo(title, message) {
    // Use success modal for info messages
    showSuccess(title, message);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        currentModal = null;
    }
}

// Placeholder functions for missing features
function loadAnalytics() {
    console.log('Loading analytics...');
}

function loadNGOManagement() {
    console.log('Loading NGO management...');
}

function loadPortfolio() {
    console.log('Loading portfolio...');
}

function loadReporting() {
    console.log('Loading reporting...');
}

function viewProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        showInfo('Project Details', `Project: ${project.name}\nLocation: ${project.location.name}\nArea: ${project.area} hectares\nStatus: ${project.status}`);
    }
}

function viewCredits(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        showInfo('Carbon Credits', `Project: ${project.name}\nCredits Earned: ${project.carbon_credits} BTCC\nCurrent Value: ₹${(project.carbon_credits * 2500).toLocaleString()}`);
    }
}

function viewProjectDetails(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        showInfo('Project Details', `${project.name}\n\nNGO: ${project.ngo}\nLocation: ${project.location.name}\nArea: ${project.area} hectares\nTrees: ${project.planted.toLocaleString()}\nStatus: ${project.status}\n\nDescription: ${project.description}`);
    }
}

function refreshVerificationQueue() {
    loadVerificationQueue();
    showInfo('Refreshed', 'Verification queue has been refreshed');
}

function filterVerifications() {
    loadVerificationQueue();
}

function refreshMarketplace() {
    loadMarketplace();
    showInfo('Refreshed', 'Marketplace has been refreshed');
}

function filterMarketplace() {
    loadMarketplace();
}

function generateReport() {
    showInfo('Report Generated', 'ESG report has been generated successfully');
}

function downloadReport() {
    showInfo('Download Started', 'Report download will begin shortly');
}

console.log('✅ BlueTrust app.js loaded successfully');
