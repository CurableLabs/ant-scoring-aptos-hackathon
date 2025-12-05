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
    },
    {
        id: 6,
        name: "Paxlovid",
        emoji: "🦠",
        formula: "C37H49F3N6O7S2",
        casNumber: "2628280-40-8",
        price: "$4,200",
        change24h: "+18.5%",
        volume: "$680K",
        marketCap: "$32.8M",
        antScore: 92,
        tgeScore: 88,
        category: "Antiviral",
        target: "3CL Protease",
        phase: "Market",
        indication: "COVID-19",
        safetyScore: 85,
        commercialScore: 96,
        innovationScore: 90,
        
        scientificData: {
            mechanism: "Inhibits SARS-CoV-2 3CL protease, preventing viral replication",
            affinity: "Ki = 3.1 nM (3CL protease)",
            selectivity: "High selectivity for coronavirus proteases",
            pharmacokinetics: {
                absorption: "Oral absorption enhanced by ritonavir",
                distribution: "Wide tissue distribution",
                metabolism: "CYP3A4 substrate (ritonavir inhibits)",
                elimination: "Primarily hepatic, t½ = 6.1 hours"
            }
        },
        marketData: {
            trend: "Strong Bullish",
            support: "$3,900",
            resistance: "$4,500",
            rsi: 75,
            volatility: "22%",
            beta: 1.25
        },
        trials: {
            active: 42,
            recruiting: 18,
            completed: 28,
            successRate: 85
        },
        patentData: {
            patentWhitespace: "High - recent approval, strong IP",
            whitespaceScore: "88/100",
            status: "Active patents through 2037"
        },
        patientImpact: {
            primaryDisease: "COVID-19",
            globallyAffected: "Millions during outbreaks",
            usAffected: "Variable based on pandemic waves",
            qualityOfLifeImprovement: "High - reduces severe disease"
        }
    },
    {
        id: 7,
        name: "Ozempic",
        emoji: "💉",
        formula: "C197H295N51O59",
        casNumber: "910463-68-2",
        price: "$5,800",
        change24h: "+22.4%",
        volume: "$920K",
        marketCap: "$48.5M",
        antScore: 94,
        tgeScore: 91,
        category: "GLP-1 Agonist",
        target: "GLP-1 Receptor",
        phase: "Market",
        indication: "Type 2 Diabetes, Weight Loss",
        safetyScore: 88,
        commercialScore: 98,
        innovationScore: 95,
        
        scientificData: {
            mechanism: "GLP-1 receptor agonist enhancing insulin secretion and reducing appetite",
            affinity: "EC50 = 0.3 nM (GLP-1R)",
            selectivity: "Highly selective for GLP-1 receptor",
            pharmacokinetics: {
                absorption: "Subcutaneous injection, slow absorption",
                distribution: "Vd = 12.5 L, 99% protein bound",
                metabolism: "Proteolytic degradation",
                elimination: "Renal and hepatic, t½ = 165 hours (weekly dosing)"
            }
        },
        marketData: {
            trend: "Explosive Bullish",
            support: "$5,400",
            resistance: "$6,200",
            rsi: 82,
            volatility: "25%",
            beta: 1.35
        },
        trials: {
            active: 124,
            recruiting: 56,
            completed: 89,
            successRate: 88
        },
        patentData: {
            patentWhitespace: "Very High - blockbuster drug",
            whitespaceScore: "95/100",
            status: "Active patents through 2032"
        },
        patientImpact: {
            primaryDisease: "Type 2 Diabetes, Obesity",
            globallyAffected: "800+ million with diabetes/obesity",
            usAffected: "130+ million",
            qualityOfLifeImprovement: "Very High - significant weight loss"
        }
    },
    {
        id: 8,
        name: "Humira",
        emoji: "🔬",
        formula: "C6428H9912N1694O1987S46",
        casNumber: "331731-18-1",
        price: "$7,200",
        change24h: "+6.8%",
        volume: "$580K",
        marketCap: "$52.3M",
        antScore: 89,
        tgeScore: 86,
        category: "Monoclonal Antibody",
        target: "TNF-alpha",
        phase: "Market",
        indication: "Rheumatoid Arthritis, Crohn's",
        safetyScore: 82,
        commercialScore: 99,
        innovationScore: 88,
        
        scientificData: {
            mechanism: "Anti-TNF-alpha monoclonal antibody blocking inflammatory cytokine",
            affinity: "Kd = 100 pM (TNF-alpha)",
            selectivity: "Highly selective for TNF-alpha",
            pharmacokinetics: {
                absorption: "Subcutaneous, 64% bioavailability",
                distribution: "Vd = 4.7-6 L",
                metabolism: "Reticuloendothelial system",
                elimination: "t½ = 10-20 days"
            }
        },
        marketData: {
            trend: "Stable",
            support: "$6,800",
            resistance: "$7,500",
            rsi: 58,
            volatility: "12%",
            beta: 0.88
        },
        trials: {
            active: 85,
            recruiting: 24,
            completed: 567,
            successRate: 84
        },
        patentData: {
            patentWhitespace: "Low - biosimilar competition",
            whitespaceScore: "42/100",
            status: "Original patents expired, biosimilars available"
        },
        patientImpact: {
            primaryDisease: "Autoimmune Diseases",
            globallyAffected: "50+ million globally",
            usAffected: "8+ million",
            qualityOfLifeImprovement: "Very High - disease remission"
        }
    },
    {
        id: 9,
        name: "Lipitor",
        emoji: "💊",
        formula: "C33H35FN2O5",
        casNumber: "134523-00-5",
        price: "$1,650",
        change24h: "+4.2%",
        volume: "$195K",
        marketCap: "$12.4M",
        antScore: 87,
        tgeScore: 84,
        category: "Statin",
        target: "HMG-CoA Reductase",
        phase: "Market",
        indication: "High Cholesterol, CVD",
        safetyScore: 91,
        commercialScore: 94,
        innovationScore: 82,
        
        scientificData: {
            mechanism: "Competitive inhibition of HMG-CoA reductase, rate-limiting enzyme in cholesterol synthesis",
            affinity: "IC50 = 8 nM (HMG-CoA reductase)",
            selectivity: "High selectivity for HMG-CoA reductase",
            pharmacokinetics: {
                absorption: "Rapid, 14% bioavailability (first-pass)",
                distribution: "Vd = 381 L, 98% protein bound",
                metabolism: "Extensive hepatic CYP3A4",
                elimination: "Primarily hepatic, t½ = 14 hours"
            }
        },
        marketData: {
            trend: "Stable",
            support: "$1,550",
            resistance: "$1,750",
            rsi: 52,
            volatility: "9%",
            beta: 0.72
        },
        trials: {
            active: 38,
            recruiting: 8,
            completed: 892,
            successRate: 86
        },
        patentData: {
            patentWhitespace: "Very Low - generic competition",
            whitespaceScore: "28/100",
            status: "All patents expired"
        },
        patientImpact: {
            primaryDisease: "Cardiovascular Disease",
            globallyAffected: "500+ million",
            usAffected: "95+ million",
            qualityOfLifeImprovement: "High - prevents heart attacks/strokes"
        }
    },
    {
        id: 10,
        name: "Remdesivir",
        emoji: "🧪",
        formula: "C27H35N6O8P",
        casNumber: "1809249-37-3",
        price: "$3,850",
        change24h: "+15.2%",
        volume: "$445K",
        marketCap: "$28.9M",
        antScore: 79,
        tgeScore: 75,
        category: "Antiviral",
        target: "RNA Polymerase",
        phase: "Market",
        indication: "COVID-19, Ebola",
        safetyScore: 76,
        commercialScore: 82,
        innovationScore: 85,
        
        scientificData: {
            mechanism: "Nucleotide analog inhibitor of viral RNA-dependent RNA polymerase",
            affinity: "Ki = 0.8 μM (RdRp)",
            selectivity: "Broad-spectrum antiviral activity",
            pharmacokinetics: {
                absorption: "IV administration only",
                distribution: "Vd = 0.8 L/kg",
                metabolism: "Intracellular to active triphosphate",
                elimination: "Renal, t½ = 1 hour"
            }
        },
        marketData: {
            trend: "Bullish",
            support: "$3,600",
            resistance: "$4,100",
            rsi: 64,
            volatility: "18%",
            beta: 1.08
        },
        trials: {
            active: 62,
            recruiting: 28,
            completed: 45,
            successRate: 68
        },
        patentData: {
            patentWhitespace: "High - recent development",
            whitespaceScore: "78/100",
            status: "Active patents through 2035"
        },
        patientImpact: {
            primaryDisease: "Viral Infections",
            globallyAffected: "Variable by outbreak",
            usAffected: "Millions during pandemics",
            qualityOfLifeImprovement: "Moderate - reduces hospitalization"
        }
    },
    {
        id: 11,
        name: "Keytruda",
        emoji: "🎗️",
        formula: "C6544H10102N1692O2036S42",
        casNumber: "1374853-91-4",
        price: "$9,500",
        change24h: "+28.7%",
        volume: "$1.2M",
        marketCap: "$78.5M",
        antScore: 96,
        tgeScore: 93,
        category: "Immunotherapy",
        target: "PD-1",
        phase: "Market",
        indication: "Multiple Cancers",
        safetyScore: 80,
        commercialScore: 99,
        innovationScore: 98,
        
        scientificData: {
            mechanism: "Anti-PD-1 monoclonal antibody blocking immune checkpoint, enabling T-cell activation",
            affinity: "Kd = 29 pM (PD-1)",
            selectivity: "Highly selective for PD-1",
            pharmacokinetics: {
                absorption: "IV infusion only",
                distribution: "Vd = 7.5 L",
                metabolism: "Catabolism by reticuloendothelial system",
                elimination: "t½ = 27 days"
            }
        },
        marketData: {
            trend: "Very Bullish",
            support: "$9,000",
            resistance: "$10,200",
            rsi: 78,
            volatility: "28%",
            beta: 1.42
        },
        trials: {
            active: 1842,
            recruiting: 624,
            completed: 378,
            successRate: 72
        },
        patentData: {
            patentWhitespace: "Very High - blockbuster immunotherapy",
            whitespaceScore: "92/100",
            status: "Active patents through 2036"
        },
        patientImpact: {
            primaryDisease: "Various Cancers",
            globallyAffected: "20+ million cancer patients",
            usAffected: "2+ million annually",
            qualityOfLifeImprovement: "Life-saving for many cancer types"
        }
    },
    {
        id: 12,
        name: "Zoloft",
        emoji: "🧠",
        formula: "C17H17Cl2N",
        casNumber: "79617-96-2",
        price: "$1,420",
        change24h: "+3.6%",
        volume: "$142K",
        marketCap: "$9.8M",
        antScore: 83,
        tgeScore: 80,
        category: "Antidepressant",
        target: "SERT",
        phase: "Market",
        indication: "Depression, Anxiety",
        safetyScore: 89,
        commercialScore: 91,
        innovationScore: 76,
        
        scientificData: {
            mechanism: "Selective serotonin reuptake inhibitor (SSRI) increasing synaptic serotonin",
            affinity: "Ki = 0.3 nM (SERT)",
            selectivity: "200-fold selective for SERT vs NET",
            pharmacokinetics: {
                absorption: "Oral, slow absorption",
                distribution: "Vd = 20 L/kg, 98% protein bound",
                metabolism: "Hepatic CYP2B6, CYP2C19",
                elimination: "Renal and fecal, t½ = 26 hours"
            }
        },
        marketData: {
            trend: "Stable",
            support: "$1,350",
            resistance: "$1,520",
            rsi: 48,
            volatility: "8%",
            beta: 0.68
        },
        trials: {
            active: 48,
            recruiting: 12,
            completed: 324,
            successRate: 78
        },
        patentData: {
            patentWhitespace: "Low - generic available",
            whitespaceScore: "35/100",
            status: "Original patents expired"
        },
        patientImpact: {
            primaryDisease: "Major Depressive Disorder",
            globallyAffected: "280+ million globally",
            usAffected: "21+ million",
            qualityOfLifeImprovement: "High - improves mental health"
        }
    },
    {
        id: 13,
        name: "Eliquis",
        emoji: "❤️",
        formula: "C25H25N5O4",
        casNumber: "503612-47-3",
        price: "$4,500",
        change24h: "+9.8%",
        volume: "$512K",
        marketCap: "$38.2M",
        antScore: 90,
        tgeScore: 87,
        category: "Anticoagulant",
        target: "Factor Xa",
        phase: "Market",
        indication: "Stroke Prevention, DVT",
        safetyScore: 86,
        commercialScore: 96,
        innovationScore: 89,
        
        scientificData: {
            mechanism: "Direct oral Factor Xa inhibitor preventing thrombin generation",
            affinity: "Ki = 0.08 nM (Factor Xa)",
            selectivity: "High selectivity for Factor Xa",
            pharmacokinetics: {
                absorption: "Oral, 50% bioavailability",
                distribution: "Vd = 21 L, 87% protein bound",
                metabolism: "CYP3A4/5, CYP1A2, CYP2C8/9/19",
                elimination: "Renal 25%, fecal 56%, t½ = 12 hours"
            }
        },
        marketData: {
            trend: "Bullish",
            support: "$4,200",
            resistance: "$4,850",
            rsi: 66,
            volatility: "16%",
            beta: 1.05
        },
        trials: {
            active: 95,
            recruiting: 32,
            completed: 256,
            successRate: 83
        },
        patentData: {
            patentWhitespace: "Moderate - approaching expiry",
            whitespaceScore: "58/100",
            status: "Patents expire 2026-2031"
        },
        patientImpact: {
            primaryDisease: "Atrial Fibrillation, VTE",
            globallyAffected: "60+ million",
            usAffected: "10+ million",
            qualityOfLifeImprovement: "High - prevents strokes/clots"
        }
    },
    {
        id: 14,
        name: "CAR-T Therapy",
        emoji: "🧬",
        formula: "N/A (Cell Therapy)",
        casNumber: "N/A",
        price: "$12,800",
        change24h: "+32.5%",
        volume: "$1.8M",
        marketCap: "$95.2M",
        antScore: 98,
        tgeScore: 95,
        category: "Cell Therapy",
        target: "CD19/BCMA",
        phase: "Phase 3",
        indication: "Leukemia, Lymphoma, Myeloma",
        safetyScore: 72,
        commercialScore: 88,
        innovationScore: 99,
        
        scientificData: {
            mechanism: "Genetically modified T-cells targeting cancer-specific antigens (CAR-T)",
            affinity: "Engineered high-affinity binding",
            selectivity: "Tumor antigen specific (CD19, BCMA)",
            pharmacokinetics: {
                absorption: "IV infusion of modified cells",
                distribution: "Circulating and tissue-infiltrating T-cells",
                metabolism: "Living cells persist in body",
                elimination: "Variable persistence, months to years"
            }
        },
        marketData: {
            trend: "Explosive Growth",
            support: "$12,000",
            resistance: "$14,500",
            rsi: 85,
            volatility: "35%",
            beta: 1.58
        },
        trials: {
            active: 524,
            recruiting: 218,
            completed: 142,
            successRate: 65
        },
        patentData: {
            patentWhitespace: "Very High - cutting edge technology",
            whitespaceScore: "96/100",
            status: "Active patents through 2040+"
        },
        patientImpact: {
            primaryDisease: "Blood Cancers",
            globallyAffected: "1.2+ million",
            usAffected: "180,000+ annually",
            qualityOfLifeImprovement: "Life-saving - 80%+ remission in some cancers"
        }
    },
    {
        id: 15,
        name: "Nexletol",
        emoji: "💚",
        formula: "C28H32ClNO5S",
        casNumber: "1089283-49-7",
        price: "$2,950",
        change24h: "+14.5%",
        volume: "$325K",
        marketCap: "$22.8M",
        antScore: 86,
        tgeScore: 82,
        category: "Cholesterol",
        target: "ACL Inhibitor",
        phase: "Phase 4",
        indication: "Hypercholesterolemia",
        safetyScore: 88,
        commercialScore: 78,
        innovationScore: 91,
        
        scientificData: {
            mechanism: "ATP citrate lyase (ACL) inhibitor reducing cholesterol synthesis",
            affinity: "Ki = 7 nM (ACL)",
            selectivity: "Highly selective for ACL enzyme",
            pharmacokinetics: {
                absorption: "Oral, 18% bioavailability",
                distribution: "Vd = 44 L, 99% protein bound",
                metabolism: "Glucuronidation, minimal CYP",
                elimination: "Primarily hepatic, t½ = 19 hours"
            }
        },
        marketData: {
            trend: "Bullish",
            support: "$2,750",
            resistance: "$3,200",
            rsi: 70,
            volatility: "19%",
            beta: 1.12
        },
        trials: {
            active: 18,
            recruiting: 6,
            completed: 24,
            successRate: 82
        },
        patentData: {
            patentWhitespace: "Very High - novel mechanism",
            whitespaceScore: "89/100",
            status: "Active patents through 2034"
        },
        patientImpact: {
            primaryDisease: "High Cholesterol",
            globallyAffected: "200+ million",
            usAffected: "95+ million",
            qualityOfLifeImprovement: "High - alternative for statin-intolerant"
        }
    },
    {
        id: 16,
        name: "Leqembi",
        emoji: "🧠",
        formula: "C6470H10012N1726O2018S42",
        casNumber: "1791626-26-2",
        price: "$8,200",
        change24h: "+38.9%",
        volume: "$1.5M",
        marketCap: "$72.4M",
        antScore: 93,
        tgeScore: 89,
        category: "Alzheimer's",
        target: "Amyloid Beta",
        phase: "Phase 3",
        indication: "Alzheimer's Disease",
        safetyScore: 74,
        commercialScore: 92,
        innovationScore: 96,
        
        scientificData: {
            mechanism: "Anti-amyloid beta monoclonal antibody removing brain plaques",
            affinity: "High affinity for amyloid beta protofibrils",
            selectivity: "Specific for soluble amyloid beta aggregates",
            pharmacokinetics: {
                absorption: "IV infusion",
                distribution: "Limited CNS penetration",
                metabolism: "Proteolytic degradation",
                elimination: "t½ = 5-7 days"
            }
        },
        marketData: {
            trend: "Explosive Bullish",
            support: "$7,800",
            resistance: "$9,500",
            rsi: 88,
            volatility: "42%",
            beta: 1.72
        },
        trials: {
            active: 28,
            recruiting: 14,
            completed: 8,
            successRate: 58
        },
        patentData: {
            patentWhitespace: "Very High - breakthrough therapy",
            whitespaceScore: "94/100",
            status: "Active patents through 2042"
        },
        patientImpact: {
            primaryDisease: "Alzheimer's Disease",
            globallyAffected: "55+ million",
            usAffected: "6.7+ million",
            qualityOfLifeImprovement: "Moderate - slows cognitive decline 27%"
        }
    },
    {
        id: 17,
        name: "Dupixent",
        emoji: "🌿",
        formula: "C6404H9912N1716O1988S44",
        casNumber: "1804831-25-7",
        price: "$6,400",
        change24h: "+16.3%",
        volume: "$720K",
        marketCap: "$54.6M",
        antScore: 91,
        tgeScore: 88,
        category: "Monoclonal Antibody",
        target: "IL-4/IL-13",
        phase: "Market",
        indication: "Atopic Dermatitis, Asthma",
        safetyScore: 87,
        commercialScore: 95,
        innovationScore: 90,
        
        scientificData: {
            mechanism: "IL-4 receptor alpha antagonist blocking IL-4 and IL-13 signaling",
            affinity: "Kd = 65 pM (IL-4Rα)",
            selectivity: "Highly selective for IL-4Rα",
            pharmacokinetics: {
                absorption: "Subcutaneous, 61-64% bioavailability",
                distribution: "Vd = 4.3 L",
                metabolism: "Proteolytic degradation",
                elimination: "t½ = 18-21 days"
            }
        },
        marketData: {
            trend: "Strong Bullish",
            support: "$6,000",
            resistance: "$6,900",
            rsi: 72,
            volatility: "21%",
            beta: 1.18
        },
        trials: {
            active: 142,
            recruiting: 48,
            completed: 86,
            successRate: 81
        },
        patentData: {
            patentWhitespace: "Very High",
            whitespaceScore: "90/100",
            status: "Active patents through 2029"
        },
        patientImpact: {
            primaryDisease: "Atopic Dermatitis, Asthma",
            globallyAffected: "300+ million",
            usAffected: "35+ million",
            qualityOfLifeImprovement: "Very High - transformative for severe cases"
        }
    },
    {
        id: 18,
        name: "Trulicity",
        emoji: "💉",
        formula: "C260H398N66O78S2",
        casNumber: "923950-08-7",
        price: "$4,800",
        change24h: "+11.2%",
        volume: "$485K",
        marketCap: "$36.5M",
        antScore: 88,
        tgeScore: 85,
        category: "GLP-1 Agonist",
        target: "GLP-1 Receptor",
        phase: "Market",
        indication: "Type 2 Diabetes",
        safetyScore: 86,
        commercialScore: 93,
        innovationScore: 84,
        
        scientificData: {
            mechanism: "Long-acting GLP-1 receptor agonist enhancing glucose-dependent insulin secretion",
            affinity: "EC50 = 0.6 nM (GLP-1R)",
            selectivity: "Selective for GLP-1 receptor",
            pharmacokinetics: {
                absorption: "Subcutaneous, slow absorption",
                distribution: "Vd = 19 L",
                metabolism: "Proteolytic degradation",
                elimination: "t½ = 5 days (weekly dosing)"
            }
        },
        marketData: {
            trend: "Bullish",
            support: "$4,500",
            resistance: "$5,100",
            rsi: 64,
            volatility: "17%",
            beta: 1.08
        },
        trials: {
            active: 68,
            recruiting: 22,
            completed: 124,
            successRate: 84
        },
        patentData: {
            patentWhitespace: "High",
            whitespaceScore: "76/100",
            status: "Active patents through 2029"
        },
        patientImpact: {
            primaryDisease: "Type 2 Diabetes",
            globallyAffected: "537+ million",
            usAffected: "37+ million",
            qualityOfLifeImprovement: "High - convenient weekly dosing"
        }
    },
    {
        id: 19,
        name: "Rybelsus",
        emoji: "💊",
        formula: "C197H295N51O59",
        casNumber: "1415456-99-3",
        price: "$5,200",
        change24h: "+25.6%",
        volume: "$780K",
        marketCap: "$42.8M",
        antScore: 93,
        tgeScore: 90,
        category: "GLP-1 Agonist",
        target: "GLP-1 Receptor",
        phase: "Market",
        indication: "Type 2 Diabetes",
        safetyScore: 87,
        commercialScore: 94,
        innovationScore: 93,
        
        scientificData: {
            mechanism: "First oral GLP-1 receptor agonist with absorption enhancer technology",
            affinity: "EC50 = 0.3 nM (GLP-1R)",
            selectivity: "Highly selective for GLP-1R",
            pharmacokinetics: {
                absorption: "Oral with SNAC enhancer, 1% bioavailability",
                distribution: "Vd = 12 L, 99% protein bound",
                metabolism: "Proteolytic degradation",
                elimination: "t½ = 165 hours"
            }
        },
        marketData: {
            trend: "Very Bullish",
            support: "$4,900",
            resistance: "$5,650",
            rsi: 76,
            volatility: "23%",
            beta: 1.28
        },
        trials: {
            active: 86,
            recruiting: 38,
            completed: 52,
            successRate: 86
        },
        patentData: {
            patentWhitespace: "Very High - novel oral delivery",
            whitespaceScore: "91/100",
            status: "Active patents through 2032"
        },
        patientImpact: {
            primaryDisease: "Type 2 Diabetes",
            globallyAffected: "537+ million",
            usAffected: "37+ million",
            qualityOfLifeImprovement: "Very High - first oral GLP-1 option"
        }
    },
    {
        id: 20,
        name: "Xarelto",
        emoji: "💉",
        formula: "C19H18ClN3O5S",
        casNumber: "366789-02-8",
        price: "$4,100",
        change24h: "+7.4%",
        volume: "$425K",
        marketCap: "$32.5M",
        antScore: 89,
        tgeScore: 86,
        category: "Anticoagulant",
        target: "Factor Xa",
        phase: "Market",
        indication: "DVT, PE, Stroke Prevention",
        safetyScore: 85,
        commercialScore: 94,
        innovationScore: 87,
        
        scientificData: {
            mechanism: "Direct oral Factor Xa inhibitor preventing thrombosis",
            affinity: "Ki = 0.4 nM (Factor Xa)",
            selectivity: "High selectivity over other coagulation factors",
            pharmacokinetics: {
                absorption: "Oral, 80-100% bioavailability",
                distribution: "Vd = 50 L, 92-95% protein bound",
                metabolism: "CYP3A4, CYP2J2",
                elimination: "Renal 66%, fecal 28%, t½ = 5-9 hours"
            }
        },
        marketData: {
            trend: "Bullish",
            support: "$3,850",
            resistance: "$4,400",
            rsi: 61,
            volatility: "14%",
            beta: 0.98
        },
        trials: {
            active: 78,
            recruiting: 24,
            completed: 342,
            successRate: 85
        },
        patentData: {
            patentWhitespace: "Moderate",
            whitespaceScore: "62/100",
            status: "Patents expire 2024-2028"
        },
        patientImpact: {
            primaryDisease: "Thromboembolism",
            globallyAffected: "50+ million at risk",
            usAffected: "8+ million",
            qualityOfLifeImprovement: "High - prevents life-threatening clots"
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


