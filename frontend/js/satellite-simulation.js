// Satellite Data Simulation - No External APIs
class SatelliteSimulator {
    constructor() {
        this.vegetationData = new Map();
        this.initializeSampleData();
    }
    
    // Initialize with sample satellite data for Indian coastal regions
    initializeSampleData() {
        const sampleRegions = [
            {
                name: "Sundarbans, West Bengal",
                lat: 21.9497,
                lng: 88.9468,
                vegetationIndex: 85,
                trend: "increasing"
            },
            {
                name: "Bhitarkanika, Odisha", 
                lat: 20.4500,
                lng: 86.9000,
                vegetationIndex: 78,
                trend: "stable"
            },
            {
                name: "Pichavaram, Tamil Nadu",
                lat: 11.4500,
                lng: 79.7833,
                vegetationIndex: 82,
                trend: "increasing"
            },
            {
                name: "Kori Creek, Gujarat",
                lat: 23.0167,
                lng: 68.9667,
                vegetationIndex: 72,
                trend: "decreasing"
            },
            {
                name: "Godavari Delta, Andhra Pradesh",
                lat: 16.2500,
                lng: 81.7500,
                vegetationIndex: 79,
                trend: "stable"
            }
        ];
        
        sampleRegions.forEach(region => {
            this.vegetationData.set(`${region.lat},${region.lng}`, {
                ...region,
                lastUpdated: new Date(),
                confidence: 0.94
            });
        });
        
        console.log('🛰️ Satellite simulation initialized with sample data');
    }
    
    // Simulate satellite verification for a location
    async verifySatelliteData(latitude, longitude, areaHectares) {
        return new Promise((resolve) => {
            // Simulate API delay
            setTimeout(() => {
                const result = this.generateSatelliteVerification(latitude, longitude, areaHectares);
                console.log('🛰️ Satellite verification completed:', result);
                resolve(result);
            }, 2000); // 2 second delay to simulate real API
        });
    }
    
    generateSatelliteVerification(lat, lng, area) {
        // Find closest known region or generate data
        const key = `${lat},${lng}`;
        let baseData = this.vegetationData.get(key);
        
        if (!baseData) {
            baseData = this.findClosestRegion(lat, lng);
        }
        
        // Generate verification result
        const vegetationIndex = this.calculateVegetationIndex(baseData, area);
        const changeDetection = this.detectChanges(lat, lng);
        
        return {
            success: true,
            coordinates: { latitude: lat, longitude: lng },
            vegetationIndex: vegetationIndex,
            confidence: baseData?.confidence || 0.88,
            areaVerified: area,
            changeDetection: changeDetection,
            timestamp: new Date().toISOString(),
            source: "BlueTrust Satellite Simulation",
            imagery: {
                resolution: "10m",
                cloudCover: Math.random() * 20, // 0-20% cloud cover
                acquisitionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            }
        };
    }
    
    findClosestRegion(targetLat, targetLng) {
        let closest = null;
        let minDistance = Infinity;
        
        this.vegetationData.forEach((data, key) => {
            const distance = this.calculateDistance(targetLat, targetLng, data.lat, data.lng);
            if (distance < minDistance) {
                minDistance = distance;
                closest = data;
            }
        });
        
        return closest || {
            vegetationIndex: 70 + Math.random() * 20, // 70-90%
            trend: "stable",
            confidence: 0.85
        };
    }
    
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    calculateVegetationIndex(baseData, area) {
        let baseIndex = baseData?.vegetationIndex || 75;
        
        // Adjust based on area size (larger areas might have more variation)
        const areaFactor = Math.max(0.9, 1 - (area * 0.02));
        
        // Add some randomness for realism
        const randomFactor = 0.95 + (Math.random() * 0.1);
        
        // Apply trend
        if (baseData?.trend === "increasing") {
            baseIndex += Math.random() * 5;
        } else if (baseData?.trend === "decreasing") {
            baseIndex -= Math.random() * 3;
        }
        
        const finalIndex = Math.round(baseIndex * areaFactor * randomFactor);
        return Math.max(50, Math.min(95, finalIndex)); // Keep within 50-95% range
    }
    
    detectChanges(lat, lng) {
        // Simulate change detection analysis
        const changeTypes = ["restoration", "deforestation", "no_change", "seasonal_variation"];
        const weights = [0.4, 0.1, 0.3, 0.2]; // Favor restoration for demo
        
        const randomValue = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < changeTypes.length; i++) {
            cumulativeWeight += weights[i];
            if (randomValue <= cumulativeWeight) {
                return {
                    type: changeTypes[i],
                    confidence: 0.8 + Math.random() * 0.15,
                    area_changed_hectares: Math.random() * 2,
                    description: this.getChangeDescription(changeTypes[i])
                };
            }
        }
        
        return {
            type: "no_change",
            confidence: 0.85,
            area_changed_hectares: 0,
            description: "No significant changes detected"
        };
    }
    
    getChangeDescription(changeType) {
        const descriptions = {
            "restoration": "New vegetation growth detected, consistent with mangrove restoration activities",
            "deforestation": "Vegetation loss detected in monitored area",
            "no_change": "Stable vegetation cover with no significant changes",
            "seasonal_variation": "Changes appear to be seasonal vegetation patterns"
        };
        
        return descriptions[changeType] || "Analysis completed";
    }
    
    // Generate time series data for a project
    generateTimeSeriesData(projectId, months = 12) {
        const data = [];
        const baseIndex = 70 + Math.random() * 15; // 70-85% base
        
        for (let i = 0; i < months; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - (months - i));
            
            // Add growth trend over time
            const growthFactor = i * 0.5; // Gradual improvement
            const seasonalFactor = Math.sin((i / 12) * 2 * Math.PI) * 3; // Seasonal variation
            const randomNoise = (Math.random() - 0.5) * 2; // Random variation
            
            const index = Math.max(50, Math.min(95, 
                baseIndex + growthFactor + seasonalFactor + randomNoise
            ));
            
            data.push({
                date: date.toISOString().split('T')[0],
                vegetationIndex: Math.round(index),
                confidence: 0.85 + Math.random() * 0.1
            });
        }
        
        return data;
    }
    
    // Validate project location against known restoration sites
    validateRestorationSite(latitude, longitude) {
        const knownSites = [
            { name: "Sundarbans Reserve", lat: 21.9497, lng: 88.9468, radius: 50 },
            { name: "Bhitarkanika Sanctuary", lat: 20.4500, lng: 86.9000, radius: 30 },
            { name: "Pichavaram Mangroves", lat: 11.4500, lng: 79.7833, radius: 15 },
            { name: "Coringa Wildlife Sanctuary", lat: 16.75, lng: 82.25, radius: 25 }
        ];
        
        for (const site of knownSites) {
            const distance = this.calculateDistance(latitude, longitude, site.lat, site.lng);
            if (distance <= site.radius) {
                return {
                    valid: true,
                    site: site.name,
                    distance: Math.round(distance * 100) / 100,
                    suitability: "high"
                };
            }
        }
        
        // Check if it's coastal area (simplified)
        const isCoastal = this.isCoastalLocation(latitude, longitude);
        
        return {
            valid: isCoastal,
            site: "Coastal Area",
            distance: 0,
            suitability: isCoastal ? "medium" : "low",
            note: isCoastal ? "Located in coastal region suitable for mangrove restoration" : 
                              "Location may not be suitable for mangrove restoration"
        };
    }
    
    isCoastalLocation(lat, lng) {
        // Simplified check for Indian coastal regions
        const coastalRanges = [
            { latMin: 8, latMax: 23, lngMin: 68, lngMax: 88 }, // West coast
            { latMin: 8, latMax: 22, lngMin: 80, lngMax: 95 }  // East coast
        ];
        
        return coastalRanges.some(range => 
            lat >= range.latMin && lat <= range.latMax &&
            lng >= range.lngMin && lng <= range.lngMax
        );
    }
}

// Initialize satellite simulator
window.satelliteSimulator = new SatelliteSimulator();
