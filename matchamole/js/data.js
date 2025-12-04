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
        antScore: 85,
        tgeScore: 78,
        category: "Pain Relief",
        target: "COX-1/COX-2",
        phase: "Market",
        indication: "Pain, Inflammation",
        safetyScore: 92,
        commercialScore: 88,
        innovationScore: 75
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
        antScore: 82,
        tgeScore: 76,
        category: "NSAID",
        target: "COX Inhibitor",
        phase: "Market",
        indication: "Pain, Fever",
        safetyScore: 88,
        commercialScore: 90,
        innovationScore: 72
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
        antScore: 91,
        tgeScore: 85,
        category: "Diabetes",
        target: "AMPK Activator",
        phase: "Market",
        indication: "Type 2 Diabetes",
        safetyScore: 94,
        commercialScore: 92,
        innovationScore: 88
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
        antScore: 95,
        tgeScore: 89,
        category: "Antibiotic",
        target: "Cell Wall Synthesis",
        phase: "Market",
        indication: "Bacterial Infections",
        safetyScore: 90,
        commercialScore: 85,
        innovationScore: 95
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
        antScore: 88,
        tgeScore: 82,
        category: "Immunosuppressant",
        target: "mTOR Inhibitor",
        phase: "Phase 3",
        indication: "Organ Rejection, Aging",
        safetyScore: 78,
        commercialScore: 84,
        innovationScore: 92
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


