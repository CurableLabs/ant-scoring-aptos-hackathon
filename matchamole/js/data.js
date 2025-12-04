// ====================================
// MOLECULE DATA
// ====================================

const molecules = [
    {
        id: 1,
        name: "Aspirin",
        emoji: "💊",
        formula: "C9H8O4",
        casNumber: "50-78-2",
        price: "$1,250",
        change24h: "+5.2%",
        volume: "$125K",
        marketCap: "$8.5M",
        antScore: 85,
        tgeScore: 78,
        category: "Pain Relief",
        target: "COX-1/COX-2",
        phase: "Market",
        indication: "Pain, Inflammation",
        safetyScore: 92,
        commercialScore: 88,
        innovationScore: 75,
        
        // Scientific Data
        scientificData: {
            mechanism: "Irreversibly inhibits cyclooxygenase-1 and 2 (COX-1 and COX-2) enzymes, preventing prostaglandin synthesis",
            affinity: "Ki = 2.5 μM (COX-1), 15 μM (COX-2)",
            selectivity: "COX-1 selective (6:1 ratio)",
            pharmacokinetics: {
                absorption: "Rapid oral absorption, 80-100% bioavailability",
                distribution: "Vd = 0.15 L/kg, protein binding 80-90%",
                metabolism: "Hepatic, hydrolysis to salicylic acid",
                elimination: "Renal excretion, t½ = 2-3 hours"
            },
            admet: {
                absorption: "High (80-100%)",
                distribution: "Moderate, crosses BBB",
                metabolism: "Hepatic CYP-independent",
                excretion: "Renal (75% as metabolites)",
                toxicity: "GI bleeding risk, Reye's syndrome in children"
            },
            moa: "Inhibits prostaglandin synthesis by acetylating serine residue in COX active site"
        },
        
        // Market Data
        marketData: {
            trend: "Bullish",
            support: "$1,180",
            resistance: "$1,320",
            rsi: 62,
            volatility: "12%",
            beta: 0.85,
            volume24h: "$125K",
            volumeChange: "+18%",
            allTimeHigh: "$1,450",
            allTimeLow: "$890"
        },
        
        // Clinical Trials
        trials: {
            active: 45,
            recruiting: 12,
            completed: 234,
            planned: 8,
            successRate: 78,
            currentStudies: [
                { name: "Cardiovascular Prevention Study", phase: "Phase 4", patients: 2500, status: "Active" },
                { name: "Cancer Prevention Trial", phase: "Phase 3", patients: 1800, status: "Recruiting" },
                { name: "Alzheimer's Prevention", phase: "Phase 2", patients: 450, status: "Active" }
            ],
            milestones: [
                { date: "2024-Q2", event: "Phase 3 Results - Colorectal Cancer Prevention", status: "Completed" },
                { date: "2024-Q4", event: "Phase 4 Interim Analysis - CV Outcomes", status: "Upcoming" },
                { date: "2025-Q1", event: "Phase 2 Completion - Alzheimer's", status: "Planned" }
            ]
        },
        
        // Patent Data
        patentData: {
            patentWhitespace: "Low - original patents expired",
            whitespaceScore: "35/100",
            status: "Generic available",
            expiryDate: "Expired 1917",
            compositionOfMatter: { status: "Expired", year: 1917 },
            methodOfUse: { 
                status: "Active patents for new indications",
                count: 12,
                expiry: "2028-2035"
            },
            formulationPatents: { 
                status: "Active for extended-release",
                count: 8,
                expiry: "2026-2032"
            },
            protectionScore: 45,
            litigationRisk: "Low"
        },
        
        // Patient Impact
        patientImpact: {
            primaryDisease: "Cardiovascular Disease, Pain, Inflammation",
            globallyAffected: "2.5 billion people annually",
            usAffected: "120 million annually",
            annualNewCases: "50 million",
            targetPatientSegment: "Adults with CV risk, chronic pain",
            eligiblePatients: "80% of target population",
            curePotential: "N/A (symptom management)",
            symptomReliefPotential: "High (85% efficacy)",
            qualityOfLifeImprovement: "Moderate to High",
            disabilityReduction: "30-40% in chronic conditions",
            mortalityImpact: "25% reduction in CV events",
            caregiverImpact: "Low burden",
            economicBurden: "$1.2B annually (US)",
            unmetMedicalNeed: "Low (well-established therapy)"
        },
        
        // Research Data
        researchData: {
            publications: 125000,
            citations: 850000,
            patents: 2500,
            leadResearchers: ["Felix Hoffmann (historical)", "John Vane (mechanism)", "Various modern researchers"],
            fundingHistory: "$500M+ in related research",
            recentBreakthroughs: [
                "New cancer prevention mechanisms discovered",
                "Alzheimer's prevention potential identified",
                "Optimized dosing for CV protection"
            ]
        }
    },
    {
        id: 2,
        name: "Ibuprofen",
        emoji: "💉",
        formula: "C13H18O2",
        casNumber: "15687-27-1",
        price: "$980",
        change24h: "+3.8%",
        volume: "$89K",
        marketCap: "$6.2M",
        antScore: 82,
        tgeScore: 76,
        category: "NSAID",
        target: "COX Inhibitor",
        phase: "Market",
        indication: "Pain, Fever",
        safetyScore: 88,
        commercialScore: 90,
        innovationScore: 72,
        
        scientificData: {
            mechanism: "Non-selective COX inhibitor reducing prostaglandin synthesis",
            affinity: "IC50 = 2.1 μM (COX-1), 1.2 μM (COX-2)",
            selectivity: "Relatively non-selective (1.7:1 COX-2/COX-1)",
            pharmacokinetics: {
                absorption: "Rapid absorption, 80% bioavailability",
                distribution: "Vd = 0.14 L/kg, 99% protein bound",
                metabolism: "Hepatic via CYP2C9",
                elimination: "Renal, t½ = 2 hours"
            }
        },
        marketData: {
            trend: "Stable",
            support: "$920",
            resistance: "$1,050",
            rsi: 55,
            volatility: "10%",
            beta: 0.78
        },
        trials: {
            active: 32,
            recruiting: 8,
            completed: 185,
            successRate: 75
        },
        patentData: {
            patentWhitespace: "Low",
            whitespaceScore: "40/100",
            status: "Generic available"
        },
        patientImpact: {
            primaryDisease: "Pain, Inflammation, Fever",
            globallyAffected: "3 billion people annually",
            usAffected: "150 million annually",
            qualityOfLifeImprovement: "Moderate to High"
        }
    },
    {
        id: 3,
        name: "Metformin",
        emoji: "🩺",
        formula: "C4H11N5",
        casNumber: "657-24-9",
        price: "$2,100",
        change24h: "+8.1%",
        volume: "$210K",
        marketCap: "$15.2M",
        antScore: 91,
        tgeScore: 85,
        category: "Diabetes",
        target: "AMPK Activator",
        phase: "Market",
        indication: "Type 2 Diabetes",
        safetyScore: 94,
        commercialScore: 92,
        innovationScore: 88,
        
        // Scientific Data
        scientificData: {
            mechanism: "Activates AMP-activated protein kinase (AMPK), suppressing hepatic glucose production and improving insulin sensitivity",
            affinity: "EC50 = 5 μM (AMPK activation)",
            selectivity: "High selectivity for AMPK pathway",
            pharmacokinetics: {
                absorption: "Oral absorption 50-60%, dose-dependent",
                distribution: "Vd = 654 L, no plasma protein binding",
                metabolism: "Not metabolized, excreted unchanged",
                elimination: "Renal excretion, t½ = 4-8.7 hours"
            },
            admet: {
                absorption: "Moderate (50-60%)",
                distribution: "High volume, concentrates in GI tract",
                metabolism: "None (excreted unchanged)",
                excretion: "Renal (90% unchanged)",
                toxicity: "Lactic acidosis risk (rare), GI side effects"
            },
            moa: "AMPK activation leads to decreased gluconeogenesis, increased glucose uptake in muscle, improved lipid metabolism"
        },
        
        // Market Data
        marketData: {
            trend: "Strong Bullish",
            support: "$1,980",
            resistance: "$2,250",
            rsi: 68,
            volatility: "15%",
            beta: 0.92,
            volume24h: "$210K",
            volumeChange: "+25%",
            allTimeHigh: "$2,450",
            allTimeLow: "$1,250"
        },
        
        // Clinical Trials
        trials: {
            active: 78,
            recruiting: 32,
            completed: 456,
            planned: 24,
            successRate: 82,
            currentStudies: [
                { name: "GRADE Diabetes Study", phase: "Phase 4", patients: 5000, status: "Active" },
                { name: "Longevity Extension Trial", phase: "Phase 3", patients: 3200, status: "Recruiting" },
                { name: "Cancer Prevention Study", phase: "Phase 2", patients: 1500, status: "Active" },
                { name: "PCOS Treatment Trial", phase: "Phase 3", patients: 890, status: "Recruiting" }
            ],
            milestones: [
                { date: "2024-Q3", event: "Anti-Aging Study Results", status: "Completed" },
                { date: "2024-Q4", event: "Cancer Prevention Interim Data", status: "Upcoming" },
                { date: "2025-Q2", event: "PCOS Phase 3 Completion", status: "Planned" }
            ]
        },
        
        // Patent Data
        patentData: {
            patentWhitespace: "Moderate - new formulations and indications",
            whitespaceScore: "65/100",
            status: "Generic available, new patents for extended applications",
            expiryDate: "Original expired, new patents 2028-2038",
            compositionOfMatter: { status: "Expired", year: 1995 },
            methodOfUse: { 
                status: "Active for aging, cancer prevention",
                count: 28,
                expiry: "2028-2038"
            },
            formulationPatents: { 
                status: "Active for extended-release, combinations",
                count: 45,
                expiry: "2026-2035"
            },
            protectionScore: 68,
            litigationRisk: "Low to Moderate"
        },
        
        // Patient Impact
        patientImpact: {
            primaryDisease: "Type 2 Diabetes Mellitus",
            globallyAffected: "537 million people with diabetes globally",
            usAffected: "37 million (11.3% of population)",
            annualNewCases: "1.4 million annually in US",
            targetPatientSegment: "Type 2 diabetes, prediabetes, PCOS",
            eligiblePatients: "90% of Type 2 diabetes patients",
            curePotential: "No cure, but excellent disease management",
            symptomReliefPotential: "Very High (reduces HbA1c by 1-2%)",
            qualityOfLifeImprovement: "High - prevents complications",
            disabilityReduction: "50-60% reduction in diabetes complications",
            mortalityImpact: "30% reduction in cardiovascular mortality",
            caregiverImpact: "Low - oral medication, minimal monitoring",
            economicBurden: "$327B annually (US diabetes costs)",
            unmetMedicalNeed: "Low (first-line therapy, but new applications emerging)"
        },
        
        // Research Data
        researchData: {
            publications: 89000,
            citations: 650000,
            patents: 1800,
            leadResearchers: ["Jean Sterne (discoverer)", "Rena Regazzi", "Giuseppe Remuzzi"],
            fundingHistory: "$2.5B+ in related research",
            recentBreakthroughs: [
                "Anti-aging properties discovered",
                "Cancer prevention potential confirmed",
                "Longevity extension in model organisms",
                "Neuroprotection in Alzheimer's models"
            ]
        }
    },
    {
        id: 4,
        name: "Penicillin",
        emoji: "🧫",
        formula: "C16H18N2O4S",
        casNumber: "61-33-6",
        price: "$1,850",
        change24h: "+4.5%",
        volume: "$156K",
        marketCap: "$11.8M",
        antScore: 95,
        tgeScore: 89,
        category: "Antibiotic",
        target: "Cell Wall Synthesis",
        phase: "Market",
        indication: "Bacterial Infections",
        safetyScore: 90,
        commercialScore: 85,
        innovationScore: 95,
        
        scientificData: {
            mechanism: "Inhibits bacterial cell wall synthesis by binding to penicillin-binding proteins",
            affinity: "High affinity for PBPs",
            selectivity: "Bacterial-specific (no mammalian target)",
            pharmacokinetics: {
                absorption: "Variable oral, 60% for Pen V",
                distribution: "Wide distribution except CNS",
                metabolism: "Minimal hepatic metabolism",
                elimination: "Renal tubular secretion, t½ = 0.5-1 hour"
            }
        },
        marketData: {
            trend: "Stable",
            support: "$1,750",
            resistance: "$1,950",
            rsi: 58,
            volatility: "11%",
            beta: 0.82
        },
        trials: {
            active: 28,
            recruiting: 6,
            completed: 420,
            successRate: 88
        },
        patentData: {
            patentWhitespace: "Very Low",
            whitespaceScore: "25/100",
            status: "All patents expired"
        },
        patientImpact: {
            primaryDisease: "Bacterial Infections",
            globallyAffected: "Billions annually",
            usAffected: "100+ million cases annually",
            qualityOfLifeImprovement: "Life-saving"
        }
    },
    {
        id: 5,
        name: "Rapamycin",
        emoji: "🔬",
        formula: "C51H79NO13",
        casNumber: "53123-88-9",
        price: "$3,500",
        change24h: "+12.3%",
        volume: "$420K",
        marketCap: "$24.5M",
        antScore: 88,
        tgeScore: 82,
        category: "Immunosuppressant",
        target: "mTOR Inhibitor",
        phase: "Phase 3",
        indication: "Organ Rejection, Aging",
        safetyScore: 78,
        commercialScore: 84,
        innovationScore: 92,
        
        scientificData: {
            mechanism: "Inhibits mTOR (mechanistic target of rapamycin), regulating cell growth, proliferation, and autophagy",
            affinity: "Kd = 0.2 nM (FKBP12-rapamycin complex to mTOR)",
            selectivity: "Highly selective for mTORC1",
            pharmacokinetics: {
                absorption: "Oral bioavailability ~15%",
                distribution: "Vd = 12 L/kg, 92% protein bound",
                metabolism: "Extensive hepatic CYP3A4",
                elimination: "Fecal (91%), t½ = 62 hours"
            }
        },
        marketData: {
            trend: "Very Bullish",
            support: "$3,200",
            resistance: "$3,850",
            rsi: 72,
            volatility: "20%",
            beta: 1.15
        },
        trials: {
            active: 156,
            recruiting: 48,
            completed: 89,
            successRate: 72
        },
        patentData: {
            patentWhitespace: "High - new indications emerging",
            whitespaceScore: "82/100",
            status: "Active patents for aging applications"
        },
        patientImpact: {
            primaryDisease: "Organ Transplant Rejection, Aging, Cancer",
            globallyAffected: "Millions (transplant + aging populations)",
            usAffected: "40,000 transplants annually + aging market",
            qualityOfLifeImprovement: "High - life extension potential"
        }
    }
];

// Current molecule index
let currentMoleculeIndex = 0;

// Get current molecule
function getCurrentMolecule() {
    return molecules[currentMoleculeIndex];
}

// Get next molecule
function getNextMolecule() {
    currentMoleculeIndex = (currentMoleculeIndex + 1) % molecules.length;
    return getCurrentMolecule();
}

// Reset to first molecule
function resetMolecules() {
    currentMoleculeIndex = 0;
}


