// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CarbonCreditToken is ERC20, Ownable, ReentrancyGuard {
    
    struct Project {
        string projectId;
        address ngoAddress;
        string name;
        string location;
        uint256 areaHectares;
        uint256 treesPlanted;
        uint256 survivalRate;
        uint256 creditsIssued;
        uint256 creditsRetired;
        string ipfsHash;
        ProjectStatus status;
        uint256 registrationDate;
        uint256 verificationDate;
        int256 latitude;
        int256 longitude;
    }
    
    struct CreditBatch {
        string projectId;
        uint256 amount;
        uint256 mintDate;
        address verifier;
        bool isRetired;
        string retirementReason;
        uint256 retirementDate;
    }
    
    struct SatelliteData {
        int256 latitude;
        int256 longitude;
        uint256 vegetationIndex;
        uint256 timestamp;
        bool isVerified;
    }
    
    enum ProjectStatus { Registered, UnderReview, Verified, Rejected }
    
    // Events
    event ProjectRegistered(string indexed projectId, address indexed ngoAddress, string name);
    event ProjectVerified(string indexed projectId, address indexed verifier, uint256 creditsIssued);
    event CreditsMinted(string indexed projectId, address indexed to, uint256 amount, uint256 batchId);
    event CreditsRetired(address indexed from, uint256 amount, string reason, uint256 timestamp);
    event SatelliteDataAdded(string indexed projectId, uint256 vegetationIndex);
    event PriceSet(address indexed ngo, uint256 pricePerCreditWei);
    
    // State variables
    mapping(string => Project) public projects;
    mapping(string => bool) public projectExists;
    mapping(address => bool) public authorizedVerifiers;
    mapping(uint256 => CreditBatch) public creditBatches;
    mapping(address => uint256[]) public userCreditBatches;
    mapping(string => SatelliteData[]) public satelliteData;
    mapping(address => uint256) public creditPrices; // Price in wei per credit
    
    string[] public allProjectIds;
    uint256 public nextBatchId;
    uint256 public totalProjectsRegistered;
    uint256 public totalCreditsRetired;
    
    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender] || owner() == msg.sender, "Not authorized verifier");
        _;
    }
    
    modifier projectExists_(string memory projectId) {
        require(projectExists[projectId], "Project does not exist");
        _;
    }
    
    constructor() ERC20("BlueTrust Carbon Credit", "BTCC") {
        authorizedVerifiers[msg.sender] = true;
        nextBatchId = 1;
    }
    
    // Register new project with GPS coordinates
    function registerProject(
        string memory projectId,
        address ngoAddress,
        string memory name,
        string memory location,
        uint256 areaHectares,
        uint256 treesPlanted,
        int256 latitude,
        int256 longitude,
        string memory ipfsHash
    ) external {
        require(!projectExists[projectId], "Project already exists");
        require(ngoAddress != address(0), "Invalid NGO address");
        require(bytes(name).length > 0, "Project name required");
        require(areaHectares > 0, "Area must be greater than 0");
        
        projects[projectId] = Project({
            projectId: projectId,
            ngoAddress: ngoAddress,
            name: name,
            location: location,
            areaHectares: areaHectares,
            treesPlanted: treesPlanted,
            survivalRate: 0,
            creditsIssued: 0,
            creditsRetired: 0,
            ipfsHash: ipfsHash,
            status: ProjectStatus.Registered,
            registrationDate: block.timestamp,
            verificationDate: 0,
            latitude: latitude,
            longitude: longitude
        });
        
        projectExists[projectId] = true;
        allProjectIds.push(projectId);
        totalProjectsRegistered++;
        
        emit ProjectRegistered(projectId, ngoAddress, name);
    }
    
    // Add satellite verification data
    function addSatelliteData(
        string memory projectId,
        int256 latitude,
        int256 longitude,
        uint256 vegetationIndex
    ) external onlyVerifier projectExists_(projectId) {
        require(vegetationIndex <= 100, "Vegetation index must be 0-100");
        
        satelliteData[projectId].push(SatelliteData({
            latitude: latitude,
            longitude: longitude,
            vegetationIndex: vegetationIndex,
            timestamp: block.timestamp,
            isVerified: true
        }));
        
        emit SatelliteDataAdded(projectId, vegetationIndex);
    }
    
    // Verify project and mint credits based on satellite data
    function verifyAndMintCredits(
        string memory projectId,
        uint256 survivalRate
    ) external onlyVerifier projectExists_(projectId) nonReentrant {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Registered || project.status == ProjectStatus.UnderReview, 
                "Project not in verifiable state");
        require(survivalRate <= 100, "Survival rate cannot exceed 100%");
        
        // Calculate credits based on area and survival rate
        // Formula: Credits = Area * 10 * (Survival Rate / 100)
        uint256 creditAmount = (project.areaHectares * 10 * survivalRate) / 100;
        require(creditAmount > 0, "No credits to mint");
        
        // Update project
        project.survivalRate = survivalRate;
        project.status = ProjectStatus.Verified;
        project.verificationDate = block.timestamp;
        project.creditsIssued += creditAmount;
        
        // Create credit batch
        creditBatches[nextBatchId] = CreditBatch({
            projectId: projectId,
            amount: creditAmount,
            mintDate: block.timestamp,
            verifier: msg.sender,
            isRetired: false,
            retirementReason: "",
            retirementDate: 0
        });
        
        userCreditBatches[project.ngoAddress].push(nextBatchId);
        
        // Mint tokens (18 decimals)
        _mint(project.ngoAddress, creditAmount * 10**decimals());
        
        emit ProjectVerified(projectId, msg.sender, creditAmount);
        emit CreditsMinted(projectId, project.ngoAddress, creditAmount, nextBatchId);
        
        nextBatchId++;
    }
    
    // Set credit price (in wei per credit)
    function setCreditPrice(uint256 pricePerCreditWei) external {
        require(pricePerCreditWei > 0, "Price must be greater than 0");
        creditPrices[msg.sender] = pricePerCreditWei;
        emit PriceSet(msg.sender, pricePerCreditWei);
    }
    
    // Purchase credits directly with ETH
    function purchaseCredits(address ngoAddress, uint256 creditAmount) external payable nonReentrant {
        require(creditAmount > 0, "Amount must be greater than 0");
        require(creditPrices[ngoAddress] > 0, "NGO price not set");
        require(balanceOf(ngoAddress) >= creditAmount * 10**decimals(), "Insufficient credits available");
        
        uint256 totalCost = creditAmount * creditPrices[ngoAddress];
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Transfer credits
        _transfer(ngoAddress, msg.sender, creditAmount * 10**decimals());
        
        // Transfer payment to NGO
        payable(ngoAddress).transfer(totalCost);
        
        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
    }
    
    // Retire credits permanently
    function retireCredits(uint256 amount, string memory reason) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount * 10**decimals(), "Insufficient balance");
        require(bytes(reason).length > 0, "Retirement reason required");
        
        _burn(msg.sender, amount * 10**decimals());
        totalCreditsRetired += amount;
        
        emit CreditsRetired(msg.sender, amount, reason, block.timestamp);
    }
    
    // Add/remove verifiers
    function addVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid verifier address");
        authorizedVerifiers[verifier] = true;
    }
    
    function removeVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = false;
    }
    
    // Getter functions
    function getProject(string memory projectId) external view returns (
        address ngoAddress,
        string memory name,
        string memory location,
        uint256 areaHectares,
        uint256 treesPlanted,
        uint256 survivalRate,
        uint256 creditsIssued,
        ProjectStatus status,
        uint256 registrationDate
    ) {
        require(projectExists[projectId], "Project does not exist");
        Project memory project = projects[projectId];
        
        return (
            project.ngoAddress,
            project.name,
            project.location,
            project.areaHectares,
            project.treesPlanted,
            project.survivalRate,
            project.creditsIssued,
            project.status,
            project.registrationDate
        );
    }
    
    function getAllProjectIds() external view returns (string[] memory) {
        return allProjectIds;
    }
    
    function getSatelliteData(string memory projectId) external view returns (SatelliteData[] memory) {
        return satelliteData[projectId];
    }
    
    function getUserCreditBatches(address user) external view returns (uint256[] memory) {
        return userCreditBatches[user];
    }
    
    function getContractStats() external view returns (
        uint256 totalProjects,
        uint256 totalSupply_,
        uint256 totalRetired,
        uint256 activeProjects
    ) {
        uint256 active = 0;
        for (uint256 i = 0; i < allProjectIds.length; i++) {
            if (projects[allProjectIds[i]].status == ProjectStatus.Verified) {
                active++;
            }
        }
        
        return (totalProjectsRegistered, totalSupply(), totalCreditsRetired, active);
    }
    
    // Get credit price for NGO
    function getCreditPrice(address ngoAddress) external view returns (uint256) {
        return creditPrices[ngoAddress];
    }
}
