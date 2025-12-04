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
        
        <div class="card-body">
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
                    <div class="info-label">CAS #</div>
                    <div class="info-value" style="font-size: 0.875rem">${molecule.casNumber}</div>
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
            </div>
        </div>
        
        <!-- Mobile-only buttons inside card -->
        <div class="card-mobile-buttons">
            <button class="card-btn card-pass-btn" id="cardPassBtn">
                <span class="card-btn-icon">«</span>
                <span class="card-btn-label">Pass</span>
            </button>
            <button class="card-btn card-stake-btn" id="cardStakeBtn">
                <span class="card-btn-label">Stake</span>
                <span class="card-btn-icon">»</span>
            </button>
        </div>
    `;
    
    cardContainer.appendChild(card);
    currentCard = card;
    
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
    
    // Add event listeners for mobile card buttons
    const cardPassBtn = card.querySelector('#cardPassBtn');
    const cardStakeBtn = card.querySelector('#cardStakeBtn');
    
    if (cardPassBtn) {
        cardPassBtn.addEventListener('click', handlePass);
    }
    
    if (cardStakeBtn) {
        cardStakeBtn.addEventListener('click', handleStake);
    }
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
                <span style="font-weight: 700; color: var(--success-green);">${molecule.change24h}</span>
            </div>
        </div>
        
        <div>
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">Amount to invest</label>
            <input type="number" id="buyAmount" placeholder="Enter amount in CURE" 
                   style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); 
                          border: 1px solid var(--glass-border); border-radius: 8px; 
                          color: white; font-size: 1rem;" value="100">
        </div>
    `;
    
    buyModal.classList.add('active');
}

function showStakeModal(molecule) {
    const content = document.getElementById('stakeModalContent');
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 1rem;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">${molecule.emoji}</div>
            <h3 style="margin-bottom: 0.5rem;">${molecule.name}</h3>
            <p style="color: var(--text-secondary);">Stake on molecule success</p>
        </div>
        
        <div style="background: rgba(245,158,11,0.1); padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid rgba(245,158,11,0.2);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: var(--text-secondary);">Potential APY:</span>
                <span style="font-weight: 700; color: var(--warning-orange);">15-25%</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: var(--text-secondary);">Lock Period:</span>
                <span style="font-weight: 700;">90 days</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Risk Level:</span>
                <span style="font-weight: 700; color: var(--warning-orange);">Medium</span>
            </div>
        </div>
        
        <div>
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">Amount to stake</label>
            <input type="number" id="stakeAmount" placeholder="Enter amount in CURE" 
                   style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); 
                          border: 1px solid var(--glass-border); border-radius: 8px; 
                          color: white; font-size: 1rem;" value="50">
        </div>
    `;
    
    stakeModal.classList.add('active');
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
            showNotification(`Navigating to ${section}...`, 'info');
            // TODO: Later we'll add actual section switching
        });
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
    
    // Buy modal
    document.getElementById('closeBuyModal').addEventListener('click', () => {
        buyModal.classList.remove('active');
    });
    
    document.getElementById('cancelBuy').addEventListener('click', () => {
        buyModal.classList.remove('active');
    });
    
    document.getElementById('confirmBuy').addEventListener('click', () => {
        const amount = document.getElementById('buyAmount').value;
        const molecule = getCurrentMolecule();
        
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
        const amount = document.getElementById('stakeAmount').value;
        const molecule = getCurrentMolecule();
        
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
// UTILITY FUNCTIONS
// ====================================

console.log('🧬 MatchAMole Elite loaded successfully!');
console.log('💡 Desktop: Use Arrow Keys - Left (Pass), Right (Buy), Up (Stake)');
console.log('💡 Desktop: Or swipe on the card (including up for stake)');
console.log('📱 Mobile: Swipe left/right or use buttons (no swipe up)');
console.log('📱 Mobile: Use ☰ menu for navigation');

