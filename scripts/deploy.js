const hre = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🚀 Deploying BlueTrust Carbon Credit Token to local blockchain...");
    
    const [deployer, ngo, government, company] = await hre.ethers.getSigners();
    
    console.log("📝 Deploying with accounts:");
    console.log("  Owner:", deployer.address);
    console.log("  NGO:", ngo.address);
    console.log("  Government:", government.address);
    console.log("  Company:", company.address);
    
    // Deploy contract
    const CarbonCreditToken = await hre.ethers.getContractFactory("CarbonCreditToken");
    const carbonToken = await CarbonCreditToken.deploy();
    await carbonToken.deployed();
    
    console.log("✅ Contract deployed to:", carbonToken.address);
    
    // Add government as verifier
    await carbonToken.addVerifier(government.address);
    console.log("✅ Government account added as verifier");
    
    // Register sample project
    const projectId = "PRJ001";
    await carbonToken.connect(ngo).registerProject(
        projectId,
        ngo.address,
        "Sundarbans Mangrove Restoration",
        "West Bengal, India",
        5, // 5 hectares
        2500, // 2500 trees
        21949700, // Latitude * 1000000 (21.9497)
        88946800, // Longitude * 1000000 (88.9468)
        "QmSampleIPFSHash123"
    );
    console.log("✅ Sample project registered");
    
    // Add satellite data
    await carbonToken.connect(government).addSatelliteData(
        projectId,
        21949700,
        88946800,
        85 // 85% vegetation index
    );
    console.log("✅ Satellite data added");
    
    // Verify and mint credits
    await carbonToken.connect(government).verifyAndMintCredits(projectId, 85);
    console.log("✅ Project verified and credits minted");
    
    // Set credit price
    const pricePerCredit = hre.ethers.utils.parseEther("0.001"); // 0.001 ETH per credit
    await carbonToken.connect(ngo).setCreditPrice(pricePerCredit);
    console.log("✅ Credit price set to 0.001 ETH per credit");
    
    // Save deployment info
    const deploymentInfo = {
        network: "localhost",
        contractAddress: carbonToken.address,
        contractABI: JSON.parse(carbonToken.interface.format('json')),
        accounts: {
            owner: deployer.address,
            ngo: ngo.address,
            government: government.address,
            company: company.address
        },
        sampleProject: projectId,
        deploymentDate: new Date().toISOString()
    };
    
    if (!fs.existsSync('./frontend/js')) {
        fs.mkdirSync('./frontend/js', { recursive: true });
    }
    
    fs.writeFileSync('./frontend/js/contract-config.js', 
        `// Auto-generated contract configuration
const CONTRACT_CONFIG = ${JSON.stringify(deploymentInfo, null, 2)};`
    );
    
    console.log("📁 Contract configuration saved to frontend/js/contract-config.js");
    console.log("\n🎉 Deployment completed!");
    console.log("🌐 Frontend: http://localhost:3000");
    console.log("⛓️  Blockchain: http://localhost:8545");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
