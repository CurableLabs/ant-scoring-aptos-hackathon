// ====================================
// MAIN APPLICATION LOGIC
// ====================================

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const app = document.getElementById('app');
const cardContainer = document.getElementById('cardContainer');
const passBtn = document.getElementById('passBtn');
const buyBtn = document.getElementById('buyBtn');
const stakeBtn = document.getElementById('stakeBtn');
const menuButton = document.getElementById('menuButton');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const closeBtn = document.getElementById('closeBtn');
const buyModal = document.getElementById('buyModal');
const stakeModal = document.getElementById('stakeModal');
const notificationContainer = document.getElementById('notificationContainer');

let currentCard = null;
let gestureHandler = null;

// Portfolio tracking
let portfolio = {
    investments: [], // { moleculeId, moleculeName, amount, price, timestamp, type: 'buy' }
    stakes: [], // { moleculeId, moleculeName, amount, timestamp, type: 'stake' }
    totalInvested: 0,
    totalStaked: 0
};

// Load portfolio from localStorage if exists
if (localStorage.getItem('matchamole_portfolio')) {
    portfolio = JSON.parse(localStorage.getItem('matchamole_portfolio'));
}

// Save portfolio to localStorage
function savePortfolio() {
    localStorage.setItem('matchamole_portfolio', JSON.stringify(portfolio));
}

// ====================================
// INITIALIZATION
// ====================================

window.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen after 2 seconds
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        app.style.display = 'flex';
        
        // Show first molecule
        showMolecule(getCurrentMolecule());
    }, 2000);
    
    // Setup event listeners
    setupEventListeners();
});

// ====================================
// DISPLAY MOLECULE CARD
// ====================================

function showMolecule(molecule) {
    // Clear existing card
    cardContainer.innerHTML = '';
    
    // Create molecule card
    const card = document.createElement('div');
    card.className = 'molecule-card';
    card.innerHTML = `
        <div class="card-header">
            <div class="molecule-emoji">${molecule.emoji}</div>
            <h2 class="molecule-name">${molecule.name}</h2>
            <p class="molecule-formula">${molecule.formula}</p>
        </div>
        
        <!-- Tab Navigation -->
        <div class="tab-navigation">
            <button class="tab-btn active" data-tab="overview">Overview</button>
            <button class="tab-btn" data-tab="scientific">Scientific</button>
            <button class="tab-btn" data-tab="market">Market</button>
            <button class="tab-btn" data-tab="trials">Trials</button>
            <button class="tab-btn" data-tab="patents">Patents</button>
            <button class="tab-btn" data-tab="impact">Impact</button>
        </div>
        
        <!-- Tab Content Container -->
        <div class="tab-content-container">
            <!-- Overview Tab (Active by default) -->
            <div class="tab-content active" data-tab-content="overview">
                ${generateOverviewTab(molecule)}
            </div>
            
            <!-- Scientific Tab -->
            <div class="tab-content" data-tab-content="scientific">
                ${generateScientificTab(molecule)}
            </div>
            
            <!-- Market Tab -->
            <div class="tab-content" data-tab-content="market">
                ${generateMarketTab(molecule)}
            </div>
            
            <!-- Trials Tab -->
            <div class="tab-content" data-tab-content="trials">
                ${generateTrialsTab(molecule)}
            </div>
            
            <!-- Patents Tab -->
            <div class="tab-content" data-tab-content="patents">
                ${generatePatentsTab(molecule)}
            </div>
            
            <!-- Impact Tab -->
            <div class="tab-content" data-tab-content="impact">
                ${generateImpactTab(molecule)}
            </div>
        </div>
        
    `;
    
    cardContainer.appendChild(card);
    currentCard = card;
    
    // Setup tab switching
    setupTabSwitching(card);
    
    // Setup gesture handling (disable swipe up on mobile)
    const isMobile = window.innerWidth <= 768;
    const gestureCallbacks = {
        onSwipeLeft: handlePass,
        onSwipeRight: handleBuy
    };
    
    // Only add swipe up on desktop
    if (!isMobile) {
        gestureCallbacks.onSwipeUp = handleStake;
    }
    
    gestureHandler = new GestureHandler(card, gestureCallbacks);
}

// ====================================
// TAB CONTENT GENERATORS
// ====================================

function generateOverviewTab(molecule) {
    return `
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Price</div>
                <div class="info-value">${molecule.price}</div>
            </div>
            <div class="info-item">
                <div class="info-label">24h Change</div>
                <div class="info-value" style="color: var(--success-green)">${molecule.change24h}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Volume</div>
                <div class="info-value">${molecule.volume}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Market Cap</div>
                <div class="info-value">${molecule.marketCap || 'N/A'}</div>
            </div>
        </div>
        
        <div class="score-section">
            <div class="score-label">ANT Score</div>
            <div class="score-value">${molecule.antScore}/100</div>
        </div>
        
        <div class="properties">
            <div class="property-item">
                <span class="property-label">Category</span>
                <span class="property-value">${molecule.category}</span>
            </div>
            <div class="property-item">
                <span class="property-label">Target</span>
                <span class="property-value">${molecule.target}</span>
            </div>
            <div class="property-item">
                <span class="property-label">Phase</span>
                <span class="property-value">${molecule.phase}</span>
            </div>
            <div class="property-item">
                <span class="property-label">Indication</span>
                <span class="property-value">${molecule.indication}</span>
            </div>
            <div class="property-item">
                <span class="property-label">CAS Number</span>
                <span class="property-value">${molecule.casNumber}</span>
            </div>
        </div>
    `;
}

function generateScientificTab(molecule) {
    const sci = molecule.scientificData || {};
    return `
        <div class="tab-section">
            <h3 class="section-title">Mechanism of Action</h3>
            <p class="section-text">${sci.mechanism || 'Data not available'}</p>
        </div>
        
        <div class="tab-section">
            <h3 class="section-title">Binding & Selectivity</h3>
            <div class="property-item">
                <span class="property-label">Affinity</span>
                <span class="property-value">${sci.affinity || 'N/A'}</span>
            </div>
            <div class="property-item">
                <span class="property-label">Selectivity</span>
                <span class="property-value">${sci.selectivity || 'N/A'}</span>
            </div>
        </div>
        
        ${sci.pharmacokinetics ? `
        <div class="tab-section">
            <h3 class="section-title">Pharmacokinetics</h3>
            <div class="property-item">
                <span class="property-label">Absorption</span>
                <span class="property-value">${sci.pharmacokinetics.absorption}</span>
            </div>
            <div class="property-item">
                <span class="property-label">Distribution</span>
                <span class="property-value">${sci.pharmacokinetics.distribution}</span>
            </div>
            <div class="property-item">
                <span class="property-label">Metabolism</span>
                <span class="property-value">${sci.pharmacokinetics.metabolism}</span>
            </div>
            <div class="property-item">
                <span class="property-label">Elimination</span>
                <span class="property-value">${sci.pharmacokinetics.elimination}</span>
            </div>
        </div>
        ` : ''}
    `;
}

function generateMarketTab(molecule) {
    const market = molecule.marketData || {};
    return `
        <div class="market-overview">
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Trend</div>
                    <div class="info-value" style="color: var(--success-green)">${market.trend || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">RSI</div>
                    <div class="info-value">${market.rsi || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Volatility</div>
                    <div class="info-value">${market.volatility || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Beta</div>
                    <div class="info-value">${market.beta || 'N/A'}</div>
                </div>
            </div>
        </div>
        
        <div class="tab-section">
            <h3 class="section-title">Technical Levels</h3>
            <div class="property-item">
                <span class="property-label">Support</span>
                <span class="property-value">${market.support || 'N/A'}</span>
            </div>
            <div class="property-item">
                <span class="property-label">Resistance</span>
                <span class="property-value">${market.resistance || 'N/A'}</span>
            </div>
            ${market.allTimeHigh ? `
            <div class="property-item">
                <span class="property-label">All-Time High</span>
                <span class="property-value">${market.allTimeHigh}</span>
            </div>
            ` : ''}
            ${market.allTimeLow ? `
            <div class="property-item">
                <span class="property-label">All-Time Low</span>
                <span class="property-value">${market.allTimeLow}</span>
            </div>
            ` : ''}
        </div>
    `;
}

function generateTrialsTab(molecule) {
    const trials = molecule.trials || {};
    return `
        <div class="trials-overview">
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Active</div>
                    <div class="info-value">${trials.active || 0}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Recruiting</div>
                    <div class="info-value">${trials.recruiting || 0}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Completed</div>
                    <div class="info-value">${trials.completed || 0}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Success Rate</div>
                    <div class="info-value" style="color: var(--success-green)">${trials.successRate || 0}%</div>
                </div>
            </div>
        </div>
        
        ${trials.currentStudies && trials.currentStudies.length > 0 ? `
        <div class="tab-section">
            <h3 class="section-title">Current Studies</h3>
            ${trials.currentStudies.map(study => `
                <div class="study-item">
                    <div class="study-name">${study.name}</div>
                    <div class="study-details">
                        <span class="study-phase">${study.phase}</span>
                        <span class="study-patients">${study.patients} patients</span>
                        <span class="study-status">${study.status}</span>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${trials.milestones && trials.milestones.length > 0 ? `
        <div class="tab-section">
            <h3 class="section-title">Upcoming Milestones</h3>
            ${trials.milestones.map(milestone => `
                <div class="milestone-item">
                    <div class="milestone-date">${milestone.date}</div>
                    <div class="milestone-event">${milestone.event}</div>
                    <div class="milestone-status">${milestone.status}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}
    `;
}

function generatePatentsTab(molecule) {
    const patents = molecule.patentData || {};
    return `
        <div class="patent-overview">
            <div class="info-item" style="background: rgba(59, 130, 246, 0.1); padding: 1rem; border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.2); margin-bottom: 1rem;">
                <div class="info-label">Patent Whitespace Score</div>
                <div class="info-value" style="font-size: 2rem; color: var(--primary-blue)">${patents.whitespaceScore || 'N/A'}</div>
            </div>
            
            <div class="property-item">
                <span class="property-label">Status</span>
                <span class="property-value">${patents.status || 'N/A'}</span>
            </div>
            <div class="property-item">
                <span class="property-label">Whitespace Assessment</span>
                <span class="property-value">${patents.patentWhitespace || 'N/A'}</span>
            </div>
            ${patents.expiryDate ? `
            <div class="property-item">
                <span class="property-label">Expiry Date</span>
                <span class="property-value">${patents.expiryDate}</span>
            </div>
            ` : ''}
            ${patents.protectionScore ? `
            <div class="property-item">
                <span class="property-label">Protection Score</span>
                <span class="property-value">${patents.protectionScore}/100</span>
            </div>
            ` : ''}
            ${patents.litigationRisk ? `
            <div class="property-item">
                <span class="property-label">Litigation Risk</span>
                <span class="property-value">${patents.litigationRisk}</span>
            </div>
            ` : ''}
        </div>
        
        ${patents.methodOfUse ? `
        <div class="tab-section">
            <h3 class="section-title">Method of Use Patents</h3>
            <div class="property-item">
                <span class="property-label">Status</span>
                <span class="property-value">${patents.methodOfUse.status}</span>
            </div>
            ${patents.methodOfUse.count ? `
            <div class="property-item">
                <span class="property-label">Active Patents</span>
                <span class="property-value">${patents.methodOfUse.count}</span>
            </div>
            ` : ''}
            ${patents.methodOfUse.expiry ? `
            <div class="property-item">
                <span class="property-label">Expiry Range</span>
                <span class="property-value">${patents.methodOfUse.expiry}</span>
            </div>
            ` : ''}
        </div>
        ` : ''}
    `;
}

function generateImpactTab(molecule) {
    const impact = molecule.patientImpact || {};
    return `
        <div class="tab-section">
            <h3 class="section-title">Disease Burden</h3>
            <div class="property-item">
                <span class="property-label">Primary Disease</span>
                <span class="property-value">${impact.primaryDisease || 'N/A'}</span>
            </div>
            <div class="property-item">
                <span class="property-label">Globally Affected</span>
                <span class="property-value">${impact.globallyAffected || 'N/A'}</span>
            </div>
            <div class="property-item">
                <span class="property-label">US Affected</span>
                <span class="property-value">${impact.usAffected || 'N/A'}</span>
            </div>
            ${impact.annualNewCases ? `
            <div class="property-item">
                <span class="property-label">Annual New Cases</span>
                <span class="property-value">${impact.annualNewCases}</span>
            </div>
            ` : ''}
        </div>
        
        <div class="tab-section">
            <h3 class="section-title">Patient Outcomes</h3>
            ${impact.curePotential ? `
            <div class="property-item">
                <span class="property-label">Cure Potential</span>
                <span class="property-value">${impact.curePotential}</span>
            </div>
            ` : ''}
            ${impact.symptomReliefPotential ? `
            <div class="property-item">
                <span class="property-label">Symptom Relief</span>
                <span class="property-value">${impact.symptomReliefPotential}</span>
            </div>
            ` : ''}
            <div class="property-item">
                <span class="property-label">Quality of Life</span>
                <span class="property-value">${impact.qualityOfLifeImprovement || 'N/A'}</span>
            </div>
            ${impact.mortalityImpact ? `
            <div class="property-item">
                <span class="property-label">Mortality Impact</span>
                <span class="property-value">${impact.mortalityImpact}</span>
            </div>
            ` : ''}
        </div>
        
        ${impact.economicBurden ? `
        <div class="tab-section">
            <h3 class="section-title">Economic Impact</h3>
            <div class="property-item">
                <span class="property-label">Economic Burden</span>
                <span class="property-value">${impact.economicBurden}</span>
            </div>
            ${impact.unmetMedicalNeed ? `
            <div class="property-item">
                <span class="property-label">Unmet Medical Need</span>
                <span class="property-value">${impact.unmetMedicalNeed}</span>
            </div>
            ` : ''}
        </div>
        ` : ''}
    `;
}

// Tab Switching Function
function setupTabSwitching(card) {
    const tabButtons = card.querySelectorAll('.tab-btn');
    const tabContents = card.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Remove active from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active to clicked button and corresponding content
            button.classList.add('active');
            const targetContent = card.querySelector(`[data-tab-content="${targetTab}"]`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// ====================================
// ACTION HANDLERS
// ====================================

function handlePass() {
    animateCardExit('left');
    showNotification('Passed on ' + getCurrentMolecule().name, 'info');
    
    setTimeout(() => {
        const nextMolecule = getNextMolecule();
        showMolecule(nextMolecule);
    }, 300);
}

function handleBuy() {
    const molecule = getCurrentMolecule();
    showBuyModal(molecule);
}

function handleStake() {
    const molecule = getCurrentMolecule();
    showStakeModal(molecule);
}

// ====================================
// CARD ANIMATIONS
// ====================================

function animateCardExit(direction) {
    if (!currentCard) return;
    
    const distance = direction === 'left' ? -1000 : direction === 'right' ? 1000 : 0;
    const rotation = direction === 'left' ? -45 : direction === 'right' ? 45 : 0;
    
    currentCard.style.transition = 'all 0.3s ease-out';
    currentCard.style.transform = `translateX(${distance}px) rotate(${rotation}deg)`;
    currentCard.style.opacity = '0';
}

// ====================================
// MODALS
// ====================================

function showBuyModal(molecule) {
    const content = document.getElementById('buyModalContent');
    const priceNum = parseFloat(molecule.price.replace(/[$,]/g, ''));
    
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 1rem;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">${molecule.emoji}</div>
            <h3 style="margin-bottom: 0.5rem;">${molecule.name}</h3>
            <p style="color: var(--text-secondary);">${molecule.formula}</p>
        </div>
        
        <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: var(--text-secondary);">Price per token:</span>
                <span style="font-weight: 700;">${molecule.price}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: var(--text-secondary);">ANT Score:</span>
                <span style="font-weight: 700; color: var(--success-green);">${molecule.antScore}/100</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">24h Change:</span>
                <span style="font-weight: 700; color: ${molecule.change24h.startsWith('+') ? 'var(--success-green)' : 'var(--danger-red)'};">${molecule.change24h}</span>
            </div>
        </div>
        
        <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-weight: 600;">Amount to invest (CURE)</label>
            <input type="number" id="buyAmount" placeholder="Enter amount" min="1" step="1"
                   style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); 
                          border: 2px solid var(--glass-border); border-radius: 8px; 
                          color: white; font-size: 1.1rem; font-weight: 600;" value="100">
            <div id="buyError" style="color: var(--danger-red); font-size: 0.85rem; margin-top: 0.5rem; display: none;"></div>
        </div>
        
        <div id="buyCalculation" style="background: rgba(59,130,246,0.1); padding: 1rem; border-radius: 12px; border: 1px solid rgba(59,130,246,0.2);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: var(--text-secondary);">You will receive:</span>
                <span id="tokensReceived" style="font-weight: 700; color: var(--accent-blue); font-size: 1.1rem;">~0 tokens</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Estimated value:</span>
                <span id="estimatedValue" style="font-weight: 700;">$0</span>
            </div>
        </div>
    `;
    
    // Add input validation and calculation
    const buyInput = document.getElementById('buyAmount');
    const confirmBtn = document.getElementById('confirmBuy');
    const errorDiv = document.getElementById('buyError');
    
    function validateAndCalculate() {
        const amount = parseFloat(buyInput.value);
        const tokensReceived = document.getElementById('tokensReceived');
        const estimatedValue = document.getElementById('estimatedValue');
        
        // Reset error
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
        
        // Validation
        if (!buyInput.value || buyInput.value.trim() === '') {
            errorDiv.textContent = 'Please enter an amount';
            errorDiv.style.display = 'block';
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.5';
            confirmBtn.style.cursor = 'not-allowed';
            tokensReceived.textContent = '~0 tokens';
            estimatedValue.textContent = '$0';
            return false;
        }
        
        if (isNaN(amount) || amount <= 0) {
            errorDiv.textContent = 'Amount must be greater than 0';
            errorDiv.style.display = 'block';
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.5';
            confirmBtn.style.cursor = 'not-allowed';
            tokensReceived.textContent = '~0 tokens';
            estimatedValue.textContent = '$0';
            return false;
        }
        
        if (amount > 100000) {
            errorDiv.textContent = 'Maximum investment is 100,000 CURE';
            errorDiv.style.display = 'block';
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.5';
            confirmBtn.style.cursor = 'not-allowed';
            return false;
        }
        
        // Calculate tokens
        const tokens = (amount / priceNum).toFixed(2);
        const value = (amount * 1).toFixed(2); // Assuming 1 CURE = $1
        
        tokensReceived.textContent = `~${tokens} tokens`;
        estimatedValue.textContent = `$${value}`;
        
        // Enable button
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = '1';
        confirmBtn.style.cursor = 'pointer';
        
        return true;
    }
    
    // Initial calculation
    validateAndCalculate();
    
    // Add event listeners
    buyInput.addEventListener('input', validateAndCalculate);
    buyInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' && !confirmBtn.disabled) {
            confirmBtn.click();
        }
    });
    
    buyModal.classList.add('active');
    
    // Focus input
    setTimeout(() => buyInput.select(), 100);
}

function showStakeModal(molecule) {
    const content = document.getElementById('stakeModalContent');
    const apy = 15 + (molecule.antScore / 100) * 15; // 15-30% based on ANT score
    const minApy = apy.toFixed(1);
    const maxApy = (apy + 5).toFixed(1);
    
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 1rem;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">${molecule.emoji}</div>
            <h3 style="margin-bottom: 0.5rem;">${molecule.name}</h3>
            <p style="color: var(--text-secondary);">Stake on molecule success</p>
        </div>
        
        <div style="background: rgba(245,158,11,0.1); padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid rgba(245,158,11,0.2);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: var(--text-secondary);">Potential APY:</span>
                <span style="font-weight: 700; color: var(--warning-orange);">${minApy}-${maxApy}%</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: var(--text-secondary);">Lock Period:</span>
                <span style="font-weight: 700;">90 days</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Risk Level:</span>
                <span style="font-weight: 700; color: var(--warning-orange);">${molecule.antScore >= 85 ? 'Low-Medium' : 'Medium-High'}</span>
            </div>
        </div>
        
        <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-weight: 600;">Amount to stake (CURE)</label>
            <input type="number" id="stakeAmount" placeholder="Enter amount" min="1" step="1"
                   style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); 
                          border: 2px solid var(--glass-border); border-radius: 8px; 
                          color: white; font-size: 1.1rem; font-weight: 600;" value="50">
            <div id="stakeError" style="color: var(--danger-red); font-size: 0.85rem; margin-top: 0.5rem; display: none;"></div>
        </div>
        
        <div id="stakeCalculation" style="background: rgba(245,158,11,0.1); padding: 1rem; border-radius: 12px; border: 1px solid rgba(245,158,11,0.2);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: var(--text-secondary);">Estimated rewards (90d):</span>
                <span id="estimatedRewards" style="font-weight: 700; color: var(--warning-orange); font-size: 1.1rem;">~0 CURE</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: var(--text-secondary);">Total after period:</span>
                <span id="totalAfterStake" style="font-weight: 700;">0 CURE</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Unlock date:</span>
                <span id="unlockDate" style="font-weight: 700; font-size: 0.9rem;">-</span>
            </div>
        </div>
    `;
    
    // Add input validation and calculation
    const stakeInput = document.getElementById('stakeAmount');
    const confirmBtn = document.getElementById('confirmStake');
    const errorDiv = document.getElementById('stakeError');
    
    function validateAndCalculate() {
        const amount = parseFloat(stakeInput.value);
        const estimatedRewards = document.getElementById('estimatedRewards');
        const totalAfterStake = document.getElementById('totalAfterStake');
        const unlockDate = document.getElementById('unlockDate');
        
        // Reset error
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
        
        // Validation
        if (!stakeInput.value || stakeInput.value.trim() === '') {
            errorDiv.textContent = 'Please enter an amount';
            errorDiv.style.display = 'block';
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.5';
            confirmBtn.style.cursor = 'not-allowed';
            estimatedRewards.textContent = '~0 CURE';
            totalAfterStake.textContent = '0 CURE';
            unlockDate.textContent = '-';
            return false;
        }
        
        if (isNaN(amount) || amount <= 0) {
            errorDiv.textContent = 'Amount must be greater than 0';
            errorDiv.style.display = 'block';
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.5';
            confirmBtn.style.cursor = 'not-allowed';
            estimatedRewards.textContent = '~0 CURE';
            totalAfterStake.textContent = '0 CURE';
            unlockDate.textContent = '-';
            return false;
        }
        
        if (amount < 10) {
            errorDiv.textContent = 'Minimum stake is 10 CURE';
            errorDiv.style.display = 'block';
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.5';
            confirmBtn.style.cursor = 'not-allowed';
            return false;
        }
        
        if (amount > 50000) {
            errorDiv.textContent = 'Maximum stake is 50,000 CURE';
            errorDiv.style.display = 'block';
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.5';
            confirmBtn.style.cursor = 'not-allowed';
            return false;
        }
        
        // Calculate rewards (90 days APY)
        const dailyRate = apy / 100 / 365;
        const rewards = (amount * dailyRate * 90).toFixed(2);
        const total = (amount + parseFloat(rewards)).toFixed(2);
        
        // Calculate unlock date
        const unlock = new Date();
        unlock.setDate(unlock.getDate() + 90);
        const unlockStr = unlock.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        estimatedRewards.textContent = `~${rewards} CURE`;
        totalAfterStake.textContent = `${total} CURE`;
        unlockDate.textContent = unlockStr;
        
        // Enable button
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = '1';
        confirmBtn.style.cursor = 'pointer';
        
        return true;
    }
    
    // Initial calculation
    validateAndCalculate();
    
    // Add event listeners
    stakeInput.addEventListener('input', validateAndCalculate);
    stakeInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' && !confirmBtn.disabled) {
            confirmBtn.click();
        }
    });
    
    stakeModal.classList.add('active');
    
    // Focus input
    setTimeout(() => stakeInput.select(), 100);
}

// ====================================
// NOTIFICATIONS
// ====================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notificationContainer.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ====================================
// SECTION SWITCHING
// ====================================

// Make switchSection globally accessible
window.switchSection = function(sectionName) {
    // Hide all sections
    document.querySelectorAll('.app-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const sectionMap = {
        'molecules': 'moleculesSection',
        'dashboard': 'dashboardSection',
        'research': 'researchSection',
        'portfolio': 'portfolioSection',
        'settings': 'settingsSection'
    };
    
    const sectionId = sectionMap[sectionName];
    if (sectionId) {
        document.getElementById(sectionId).classList.add('active');
        
        // Clear back button if navigating to molecules normally
        if (sectionName === 'molecules') {
            clearPreviousSection();
        }
        
        // Render dashboard if navigating to it
        if (sectionName === 'dashboard') {
            renderDashboard();
        }
        
        // Render research if navigating to it
        if (sectionName === 'research') {
            renderResearch();
        }
        
        // Render portfolio if navigating to it
        if (sectionName === 'portfolio') {
            renderPortfolio();
        }
    }
}

// ====================================
// DASHBOARD RENDERING
// ====================================

function renderDashboard() {
    const container = document.querySelector('.dashboard-container');
    
    // Calculate portfolio stats
    const totalMolecules = new Set([...portfolio.investments.map(i => i.moleculeId)]).size;
    const totalValue = portfolio.totalInvested * 1.15; // Simulated 15% gain
    const totalProfit = totalValue - portfolio.totalInvested;
    const profitPercent = portfolio.totalInvested > 0 ? ((totalProfit / portfolio.totalInvested) * 100).toFixed(2) : 0;
    
    // Get recent activity (last 5)
    const allActivity = [...portfolio.investments, ...portfolio.stakes]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
    
    // Get top molecules by investment
    const moleculeInvestments = {};
    portfolio.investments.forEach(inv => {
        if (!moleculeInvestments[inv.moleculeId]) {
            moleculeInvestments[inv.moleculeId] = {
                name: inv.moleculeName,
                emoji: inv.moleculeEmoji,
                total: 0
            };
        }
        moleculeInvestments[inv.moleculeId].total += inv.amount;
    });
    
    const topMolecules = Object.values(moleculeInvestments)
        .sort((a, b) => b.total - a.total)
        .slice(0, 3);
    
    container.innerHTML = `
        <div class="dashboard-header">
            <h1 class="dashboard-title">📊 Dashboard</h1>
            <button class="back-to-molecules-btn" onclick="switchSection('molecules')">
                ← Back to Molecules
            </button>
        </div>
        
        <!-- Stats Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Portfolio Value</div>
                <div class="stat-value">${totalValue.toFixed(2)} CURE</div>
                <div class="stat-change positive">+${profitPercent}%</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">Total Invested</div>
                <div class="stat-value">${portfolio.totalInvested.toFixed(2)} CURE</div>
                <div class="stat-subtitle">${portfolio.investments.length} transactions</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">Molecules Owned</div>
                <div class="stat-value">${totalMolecules}</div>
                <div class="stat-subtitle">Unique compounds</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">Total Staked</div>
                <div class="stat-value">${portfolio.totalStaked.toFixed(2)} CURE</div>
                <div class="stat-subtitle">${portfolio.stakes.length} positions</div>
            </div>
        </div>
        
        <!-- Top Molecules -->
        ${topMolecules.length > 0 ? `
        <div class="dashboard-section">
            <h2 class="section-title">🏆 Top Holdings</h2>
            <div class="top-molecules-list">
                ${topMolecules.map(mol => `
                    <div class="top-molecule-item">
                        <div class="molecule-info">
                            <span class="molecule-emoji-small">${mol.emoji}</span>
                            <span class="molecule-name-small">${mol.name}</span>
                        </div>
                        <div class="molecule-amount">${mol.total.toFixed(2)} CURE</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <!-- Recent Activity -->
        ${allActivity.length > 0 ? `
        <div class="dashboard-section">
            <h2 class="section-title">📋 Recent Activity</h2>
            <div class="activity-list">
                ${allActivity.map(activity => `
                    <div class="activity-item">
                        <div class="activity-icon ${activity.type}">${activity.type === 'buy' ? '💰' : '⭐'}</div>
                        <div class="activity-details">
                            <div class="activity-molecule">${activity.moleculeEmoji} ${activity.moleculeName}</div>
                            <div class="activity-time">${formatTimeAgo(activity.timestamp)}</div>
                        </div>
                        <div class="activity-amount">${activity.amount} CURE</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : `
        <div class="dashboard-section">
            <div class="empty-state">
                <div class="empty-icon">💼</div>
                <h3>No Activity Yet</h3>
                <p>Start investing in molecules to see your portfolio grow!</p>
                <button class="btn-primary" onclick="switchSection('molecules')" style="margin-top: 1rem; padding: 0.75rem 1.5rem; border: none; border-radius: 12px; background: linear-gradient(135deg, var(--primary-blue), var(--success-green)); color: white; font-weight: 600; cursor: pointer;">
                    Browse Molecules
                </button>
            </div>
        </div>
        `}
    `;
}

// Helper function to format time ago
function formatTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

// ====================================
// PORTFOLIO RENDERING
// ====================================

function renderPortfolio() {
    const container = document.querySelector('#portfolioSection .section-placeholder');
    
    // Group investments by molecule
    const holdingsByMolecule = {};
    portfolio.investments.forEach(inv => {
        if (!holdingsByMolecule[inv.moleculeId]) {
            holdingsByMolecule[inv.moleculeId] = {
                name: inv.moleculeName,
                emoji: inv.moleculeEmoji,
                totalAmount: 0,
                transactions: []
            };
        }
        holdingsByMolecule[inv.moleculeId].totalAmount += inv.amount;
        holdingsByMolecule[inv.moleculeId].transactions.push(inv);
    });
    
    const holdings = Object.values(holdingsByMolecule);
    
    // All transactions sorted by time
    const allTransactions = [...portfolio.investments, ...portfolio.stakes]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    container.innerHTML = `
        <div class="portfolio-container">
            <div class="portfolio-header">
                <h1 class="portfolio-title">💼 Portfolio</h1>
                <button class="back-to-molecules-btn" onclick="switchSection('molecules')">
                    ← Back to Molecules
                </button>
            </div>
            
            ${holdings.length > 0 ? `
            <!-- Holdings Section -->
            <div class="portfolio-section">
                <h2 class="section-title">📦 Your Holdings</h2>
                <div class="holdings-table">
                    <div class="table-header">
                        <div class="table-cell">Molecule</div>
                        <div class="table-cell">Amount</div>
                        <div class="table-cell">Transactions</div>
                    </div>
                    ${holdings.map(holding => `
                        <div class="table-row">
                            <div class="table-cell">
                                <span class="molecule-emoji-small">${holding.emoji}</span>
                                <span class="molecule-name-small">${holding.name}</span>
                            </div>
                            <div class="table-cell">
                                <span class="amount-value">${holding.totalAmount.toFixed(2)} CURE</span>
                            </div>
                            <div class="table-cell">
                                <span class="transaction-count">${holding.transactions.length}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${portfolio.stakes.length > 0 ? `
            <!-- Stakes Section -->
            <div class="portfolio-section">
                <h2 class="section-title">⭐ Active Stakes</h2>
                <div class="stakes-table">
                    <div class="table-header">
                        <div class="table-cell">Molecule</div>
                        <div class="table-cell">Amount</div>
                        <div class="table-cell">Date</div>
                    </div>
                    ${portfolio.stakes.map(stake => `
                        <div class="table-row">
                            <div class="table-cell">
                                <span class="molecule-emoji-small">${stake.moleculeEmoji}</span>
                                <span class="molecule-name-small">${stake.moleculeName}</span>
                            </div>
                            <div class="table-cell">
                                <span class="amount-value">${stake.amount.toFixed(2)} CURE</span>
                            </div>
                            <div class="table-cell">
                                <span class="date-value">${new Date(stake.timestamp).toLocaleDateString()}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${allTransactions.length > 0 ? `
            <!-- Transaction History -->
            <div class="portfolio-section">
                <h2 class="section-title">📋 Transaction History</h2>
                <div class="transaction-history">
                    ${allTransactions.map(tx => `
                        <div class="transaction-item">
                            <div class="transaction-icon ${tx.type}">
                                ${tx.type === 'buy' ? '💰' : '⭐'}
                            </div>
                            <div class="transaction-details">
                                <div class="transaction-molecule">${tx.moleculeEmoji} ${tx.moleculeName}</div>
                                <div class="transaction-date">${new Date(tx.timestamp).toLocaleString()}</div>
                            </div>
                            <div class="transaction-info">
                                <div class="transaction-type">${tx.type === 'buy' ? 'Buy' : 'Stake'}</div>
                                <div class="transaction-amount">${tx.amount} CURE</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : `
            <div class="empty-state">
                <div class="empty-icon">💼</div>
                <h3>No Transactions Yet</h3>
                <p>Start investing in molecules to build your portfolio!</p>
                <button class="btn-primary" onclick="switchSection('molecules')" style="margin-top: 1rem; padding: 0.75rem 1.5rem; border: none; border-radius: 12px; background: linear-gradient(135deg, var(--primary-blue), var(--success-green)); color: white; font-weight: 600; cursor: pointer;">
                    Browse Molecules
                </button>
            </div>
            `}
        </div>
    `;
}

// ====================================
// EVENT LISTENERS
// ====================================

function setupEventListeners() {
    // Action buttons
    passBtn.addEventListener('click', handlePass);
    buyBtn.addEventListener('click', handleBuy);
    stakeBtn.addEventListener('click', handleStake);
    
    // Keyboard shortcuts (disable up arrow on mobile)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') handlePass();
        if (e.key === 'ArrowRight') handleBuy();
        
        // Only allow up arrow on desktop
        const isMobile = window.innerWidth <= 768;
        if (e.key === 'ArrowUp' && !isMobile) handleStake();
    });
    
    // Desktop sidebar navigation
    const desktopMenuItems = document.querySelectorAll('.desktop-sidebar .menu-item');
    desktopMenuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active from all
            desktopMenuItems.forEach(i => i.classList.remove('active'));
            // Add active to clicked
            item.classList.add('active');
            
            const section = item.dataset.section;
            switchSection(section);
        });
    });
    
    // Desktop sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const desktopSidebar = document.querySelector('.desktop-sidebar');
    
    sidebarToggle.addEventListener('click', () => {
        desktopSidebar.classList.toggle('collapsed');
    });
    
    // Sidebar (Mobile menu)
    menuButton.addEventListener('click', () => {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('visible');
    });
    
    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('visible');
    });
    
    // Close sidebar when clicking overlay
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('visible');
    });
    
    // Mobile sidebar navigation
    const mobileMenuItems = document.querySelectorAll('.sidebar .menu-item');
    mobileMenuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active from all
            mobileMenuItems.forEach(i => i.classList.remove('active'));
            // Add active to clicked
            item.classList.add('active');
            
            // Close mobile sidebar
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('visible');
            
            // Get section from href
            const href = item.getAttribute('href');
            if (href === '#' || !href) return;
            
            const section = href.replace('#', '');
            switchSection(section);
        });
    });
    
    // Buy modal
    document.getElementById('closeBuyModal').addEventListener('click', () => {
        buyModal.classList.remove('active');
    });
    
    document.getElementById('cancelBuy').addEventListener('click', () => {
        buyModal.classList.remove('active');
    });
    
    document.getElementById('confirmBuy').addEventListener('click', () => {
        const amount = parseFloat(document.getElementById('buyAmount').value) || 0;
        const molecule = getCurrentMolecule();
        
        // Track investment
        portfolio.investments.push({
            moleculeId: molecule.id,
            moleculeName: molecule.name,
            moleculeEmoji: molecule.emoji,
            amount: amount,
            price: molecule.price,
            timestamp: new Date().toISOString(),
            type: 'buy'
        });
        portfolio.totalInvested += amount;
        savePortfolio();
        
        buyModal.classList.remove('active');
        animateCardExit('right');
        showNotification(`Bought ${molecule.name} for ${amount} CURE!`, 'success');
        
        setTimeout(() => {
            const nextMolecule = getNextMolecule();
            showMolecule(nextMolecule);
        }, 300);
    });
    
    // Stake modal
    document.getElementById('closeStakeModal').addEventListener('click', () => {
        stakeModal.classList.remove('active');
    });
    
    document.getElementById('cancelStake').addEventListener('click', () => {
        stakeModal.classList.remove('active');
    });
    
    document.getElementById('confirmStake').addEventListener('click', () => {
        const amount = parseFloat(document.getElementById('stakeAmount').value) || 0;
        const molecule = getCurrentMolecule();
        
        // Track stake
        portfolio.stakes.push({
            moleculeId: molecule.id,
            moleculeName: molecule.name,
            moleculeEmoji: molecule.emoji,
            amount: amount,
            timestamp: new Date().toISOString(),
            type: 'stake'
        });
        portfolio.totalStaked += amount;
        savePortfolio();
        
        stakeModal.classList.remove('active');
        animateCardExit('up');
        showNotification(`Staked ${amount} CURE on ${molecule.name}!`, 'success');
        
        setTimeout(() => {
            const nextMolecule = getNextMolecule();
            showMolecule(nextMolecule);
        }, 300);
    });
    
    // Close modals on overlay click
    buyModal.addEventListener('click', (e) => {
        if (e.target === buyModal) {
            buyModal.classList.remove('active');
        }
    });
    
    stakeModal.addEventListener('click', (e) => {
        if (e.target === stakeModal) {
            stakeModal.classList.remove('active');
        }
    });
}

// ====================================
// RESEARCH SECTION
// ====================================

let currentView = 'grid'; // 'grid' or 'list'
let filteredMolecules = [];

// Render Research Section
function renderResearch() {
    const moleculeGrid = document.getElementById('moleculeGrid');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!moleculeGrid) return;

    // Apply filters and sorting
    applyFiltersAndSort();

    if (filteredMolecules.length === 0) {
        moleculeGrid.innerHTML = `
            <div class="empty-research-state">
                <div class="empty-icon">🔍</div>
                <h3>No molecules found</h3>
                <p>Try adjusting your filters or search criteria</p>
            </div>
        `;
        resultsCount.textContent = 'No molecules found';
        return;
    }

    // Update results count
    resultsCount.textContent = `Showing ${filteredMolecules.length} molecule${filteredMolecules.length !== 1 ? 's' : ''}`;

    // Render molecule cards
    moleculeGrid.innerHTML = filteredMolecules.map(mol => {
        // Parse price for sorting
        const priceNum = parseFloat(mol.price.replace(/[$,]/g, ''));
        
        return `
            <div class="molecule-card-research" data-molecule-id="${mol.id}">
                <div class="molecule-card-header">
                    <div class="molecule-info-left">
                        <div class="molecule-emoji">${mol.emoji}</div>
                        <h3 class="molecule-name">${mol.name}</h3>
                        <span class="molecule-category">${mol.category}</span>
                    </div>
                    <div class="molecule-score-badge">
                        <div class="ant-score-large">${mol.antScore}</div>
                        <div class="score-label">ANT Score</div>
                    </div>
                </div>

                <div class="molecule-details">
                    <div class="detail-item">
                        <span class="detail-label">Phase</span>
                        <span class="detail-value">${mol.phase}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Price</span>
                        <span class="detail-value">${mol.price}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">24h Change</span>
                        <span class="detail-value ${mol.change24h.startsWith('+') ? 'positive' : 'negative'}">${mol.change24h}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Volume</span>
                        <span class="detail-value">${mol.volume}</span>
                    </div>
                </div>

                <div class="molecule-footer">
                    <span class="molecule-market-cap">Market Cap: ${mol.marketCap}</span>
                    <button class="view-details-btn">View Details</button>
                </div>
            </div>
        `;
    }).join('');

    // Add click event listeners
    document.querySelectorAll('.molecule-card-research').forEach(card => {
        card.addEventListener('click', (e) => {
            const moleculeId = parseInt(card.dataset.moleculeId);
            viewMoleculeDetails(moleculeId);
        });
    });
}

// Apply Filters and Sorting
function applyFiltersAndSort() {
    const searchTerm = document.getElementById('moleculeSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    const phaseFilter = document.getElementById('phaseFilter')?.value || 'all';
    const scoreFilter = document.getElementById('scoreFilter')?.value || 'all';
    const sortBy = document.getElementById('sortBy')?.value || 'antScore';

    // Start with all molecules
    filteredMolecules = molecules.filter(mol => {
        // Search filter
        if (searchTerm && !mol.name.toLowerCase().includes(searchTerm)) {
            return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && mol.category !== categoryFilter) {
            return false;
        }

        // Phase filter
        if (phaseFilter !== 'all' && mol.phase !== phaseFilter) {
            return false;
        }

        // Score filter
        if (scoreFilter !== 'all') {
            const score = mol.antScore;
            if (scoreFilter === '90+' && score < 90) return false;
            if (scoreFilter === '80-89' && (score < 80 || score >= 90)) return false;
            if (scoreFilter === '70-79' && (score < 70 || score >= 80)) return false;
            if (scoreFilter === '60-69' && (score < 60 || score >= 70)) return false;
        }

        return true;
    });

    // Sort molecules
    filteredMolecules.sort((a, b) => {
        switch (sortBy) {
            case 'antScore':
                return b.antScore - a.antScore;
            case 'antScoreAsc':
                return a.antScore - b.antScore;
            case 'price':
                const priceA = parseFloat(a.price.replace(/[$,]/g, ''));
                const priceB = parseFloat(b.price.replace(/[$,]/g, ''));
                return priceB - priceA;
            case 'priceAsc':
                const priceA2 = parseFloat(a.price.replace(/[$,]/g, ''));
                const priceB2 = parseFloat(b.price.replace(/[$,]/g, ''));
                return priceA2 - priceB2;
            case 'name':
                return a.name.localeCompare(b.name);
            case 'marketCap':
                const capA = parseFloat(a.marketCap.replace(/[$M,]/g, ''));
                const capB = parseFloat(b.marketCap.replace(/[$M,]/g, ''));
                return capB - capA;
            default:
                return 0;
        }
    });
}

// Track previous section for back navigation
let previousSection = null;

// View Molecule Details (Go back to molecules section and show specific molecule)
function viewMoleculeDetails(moleculeId) {
    // Find the molecule index
    const index = molecules.findIndex(m => m.id === moleculeId);
    if (index === -1) return;

    // Track that we came from research
    previousSection = 'research';

    // Set current molecule index
    currentMoleculeIndex = index;

    // Show molecules section
    showSection('molecules');

    // Display the molecule
    showMolecule(getCurrentMolecule());
    
    // Show back to research button
    showBackButton();
}

// Show back to previous section button
function showBackButton() {
    // Remove existing back button if any
    const existingBtn = document.getElementById('backToSectionBtn');
    if (existingBtn) existingBtn.remove();
    
    if (previousSection === 'research') {
        const mainWorkspace = document.querySelector('.main-workspace');
        const moleculesSection = document.getElementById('moleculesSection');
        
        const backBtn = document.createElement('button');
        backBtn.id = 'backToSectionBtn';
        backBtn.className = 'back-to-research-btn';
        backBtn.innerHTML = '← Back to Research';
        backBtn.onclick = () => {
            previousSection = null;
            showSection('research');
            backBtn.remove();
        };
        
        // Insert at the beginning of molecules section
        if (moleculesSection && moleculesSection.firstChild) {
            moleculesSection.insertBefore(backBtn, moleculesSection.firstChild);
        }
    }
}

// Clear previous section when navigating normally
function clearPreviousSection() {
    previousSection = null;
    const existingBtn = document.getElementById('backToSectionBtn');
    if (existingBtn) existingBtn.remove();
}

// Toggle View (Grid/List)
function toggleView(view) {
    currentView = view;
    const moleculeGrid = document.getElementById('moleculeGrid');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');

    if (!moleculeGrid) return;

    if (view === 'list') {
        moleculeGrid.classList.add('list-view');
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    } else {
        moleculeGrid.classList.remove('list-view');
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    }
}

// Reset Filters
function resetFilters() {
    document.getElementById('moleculeSearch').value = '';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('phaseFilter').value = 'all';
    document.getElementById('scoreFilter').value = 'all';
    document.getElementById('sortBy').value = 'antScore';
    renderResearch();
}

// Setup Research Event Listeners
function setupResearchListeners() {
    // Search input
    const searchInput = document.getElementById('moleculeSearch');
    if (searchInput) {
        searchInput.addEventListener('input', renderResearch);
    }

    // Filter selects
    const filters = ['categoryFilter', 'phaseFilter', 'scoreFilter', 'sortBy'];
    filters.forEach(filterId => {
        const filterElement = document.getElementById(filterId);
        if (filterElement) {
            filterElement.addEventListener('change', renderResearch);
        }
    });

    // View toggle buttons
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    
    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', () => toggleView('grid'));
    }
    
    if (listViewBtn) {
        listViewBtn.addEventListener('click', () => toggleView('list'));
    }

    // Reset filters button
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
}

// Initialize Research Section
setupResearchListeners();

// ====================================
// SETTINGS SECTION
// ====================================

// User mode selection
let currentUserMode = localStorage.getItem('userMode') || 'investor';

// Setup settings event listeners
function setupSettingsListeners() {
    // Connect Wallet button
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', () => {
            showNotification('Wallet connection coming soon! 🔗', 'info');
        });
    }

    // Mode selector buttons
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            setUserMode(mode);
        });
    });

    // Preferences toggles
    const preferences = ['showTutorial', 'soundEffects', 'emailNotifications', 'autoRefresh'];
    preferences.forEach(prefId => {
        const toggle = document.getElementById(prefId);
        if (toggle) {
            // Load saved preference
            const saved = localStorage.getItem(prefId);
            if (saved !== null) {
                toggle.checked = saved === 'true';
            }

            // Save on change
            toggle.addEventListener('change', () => {
                localStorage.setItem(prefId, toggle.checked);
                showNotification(`Preference updated: ${prefId}`, 'success');
            });
        }
    });

    // Action buttons
    const actionButtons = document.querySelectorAll('.action-btn-setting');
    actionButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (index === 0) {
                // Reset Portfolio
                if (confirm('Are you sure you want to reset your portfolio? This cannot be undone.')) {
                    localStorage.removeItem('portfolio');
                    localStorage.removeItem('transactions');
                    portfolio.length = 0;
                    transactions.length = 0;
                    showNotification('Portfolio reset successfully! 🔄', 'success');
                    renderDashboard();
                    renderPortfolio();
                }
            } else if (index === 1) {
                // Export Data
                const data = {
                    portfolio: portfolio,
                    transactions: transactions,
                    preferences: {
                        userMode: currentUserMode,
                        showTutorial: document.getElementById('showTutorial')?.checked,
                        soundEffects: document.getElementById('soundEffects')?.checked,
                        emailNotifications: document.getElementById('emailNotifications')?.checked,
                        autoRefresh: document.getElementById('autoRefresh')?.checked
                    }
                };
                const dataStr = JSON.stringify(data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `matchamole-data-${Date.now()}.json`;
                a.click();
                showNotification('Data exported successfully! 📥', 'success');
            } else if (index === 2) {
                // Disconnect Account
                if (confirm('Are you sure you want to disconnect? Your data will be preserved locally.')) {
                    showNotification('Account disconnected. Data saved locally. 🚪', 'info');
                }
            }
        });
    });
}

// Set user mode
function setUserMode(mode) {
    currentUserMode = mode;
    localStorage.setItem('userMode', mode);

    // Update UI
    document.querySelectorAll('.mode-btn').forEach(btn => {
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    showNotification(`User mode set to: ${mode.charAt(0).toUpperCase() + mode.slice(1)} 🎯`, 'success');
}

// Initialize settings on load
setupSettingsListeners();

// Load saved user mode on page load
document.querySelectorAll('.mode-btn').forEach(btn => {
    if (btn.dataset.mode === currentUserMode) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
});

// ====================================
// UTILITY FUNCTIONS
// ====================================

console.log('🧬 MatchAMole Elite loaded successfully!');
console.log('💡 Desktop: Use Arrow Keys - Left (Pass), Right (Buy), Up (Stake)');
console.log('💡 Desktop: Or swipe on the card (including up for stake)');
console.log('📱 Mobile: Swipe left/right or use buttons (no swipe up)');
console.log('📱 Mobile: Use ☰ menu for navigation');

