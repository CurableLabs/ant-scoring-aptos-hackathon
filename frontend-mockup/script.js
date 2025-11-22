// ============================================
// ANT SCORING SYSTEM - FRONTEND MOCKUP SCRIPT
// ============================================

// Current user role state
let currentRole = 'none';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set default role to 'none' (not connected)
    switchRole('none');
    
    // Add event listeners for connect button
    const connectBtn = document.getElementById('connect-btn');
    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            alert('In the real app, this would open MetaMask/WalletConnect to connect your wallet!');
        });
    }
});

/**
 * Switch between different user roles to simulate
 * how the UI changes based on wallet connection and permissions
 */
function switchRole(role) {
    currentRole = role;
    
    // Update role display
    const roleDisplay = document.getElementById('current-role');
    const roleNames = {
        'none': 'Not Connected',
        'researcher': 'Connected as Researcher',
        'scorer': 'Connected as Authorized Scorer',
        'admin': 'Connected as Admin'
    };
    roleDisplay.textContent = `Current: ${roleNames[role]}`;
    
    // Update active button
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event?.target?.classList?.add('active');
    
    // Apply role-based visibility
    applyRoleVisibility(role);
}

/**
 * Show/hide elements based on user role
 */
function applyRoleVisibility(role) {
    // Reset all visibility
    document.querySelectorAll('.researcher-only, .scorer-only, .admin-only, .wallet-only').forEach(el => {
        el.style.display = 'none';
    });
    
    // Hide wallet info, show connect button
    const connectBtn = document.getElementById('connect-btn');
    const walletInfo = document.getElementById('wallet-info');
    if (connectBtn && walletInfo) {
        connectBtn.style.display = 'block';
        walletInfo.style.display = 'none';
    }
    
    // Apply role-specific visibility
    if (role !== 'none') {
        // Show wallet info, hide connect button
        if (connectBtn && walletInfo) {
            connectBtn.style.display = 'none';
            walletInfo.style.display = 'flex';
        }
        
        // Show wallet-only elements
        document.querySelectorAll('.wallet-only').forEach(el => {
            el.style.display = '';
        });
    }
    
    if (role === 'researcher' || role === 'scorer' || role === 'admin') {
        document.querySelectorAll('.researcher-only').forEach(el => {
            el.style.display = '';
        });
    }
    
    if (role === 'scorer' || role === 'admin') {
        document.querySelectorAll('.scorer-only').forEach(el => {
            el.style.display = '';
        });
    }
    
    if (role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = '';
        });
    }
    
    // Page-specific logic
    handlePageSpecificLogic(role);
}

/**
 * Handle page-specific visibility and logic
 */
function handlePageSpecificLogic(role) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // HOME PAGE (index.html)
    if (currentPage === 'index.html' || currentPage === '') {
        handleHomePage(role);
    }
    
    // SUBMIT PAGE (submit.html)
    if (currentPage === 'submit.html') {
        handleSubmitPage(role);
    }
    
    // SCORE PAGE (score.html)
    if (currentPage === 'score.html') {
        handleScorePage(role);
    }
    
    // PROFILE PAGE (profile.html)
    if (currentPage === 'profile.html') {
        handleProfilePage(role);
    }
}

/**
 * Home page specific logic
 */
function handleHomePage(role) {
    // Hide all CTA sections first
    document.querySelectorAll('.cta-section > div').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show appropriate CTA based on role
    const ctaSection = document.querySelector('.cta-section');
    if (ctaSection) {
        if (role === 'none') {
            const notConnected = ctaSection.querySelector('.cta-not-connected');
            if (notConnected) notConnected.style.display = 'block';
        } else if (role === 'researcher') {
            const researcher = ctaSection.querySelector('.cta-researcher');
            if (researcher) researcher.style.display = 'block';
        } else if (role === 'scorer') {
            const scorer = ctaSection.querySelector('.cta-scorer');
            if (scorer) scorer.style.display = 'block';
        } else if (role === 'admin') {
            const admin = ctaSection.querySelector('.cta-admin');
            if (admin) admin.style.display = 'block';
        }
    }
}

/**
 * Submit page specific logic
 */
function handleSubmitPage(role) {
    const notConnectedMsg = document.getElementById('not-connected-message');
    const submitFormContainer = document.getElementById('submit-form-container');
    
    if (role === 'none') {
        // Show "not connected" message
        if (notConnectedMsg) notConnectedMsg.style.display = 'block';
        if (submitFormContainer) submitFormContainer.style.display = 'none';
    } else {
        // Show submit form
        if (notConnectedMsg) notConnectedMsg.style.display = 'none';
        if (submitFormContainer) submitFormContainer.style.display = 'block';
    }
}

/**
 * Score page specific logic
 */
function handleScorePage(role) {
    const notAuthorizedMsg = document.getElementById('not-authorized-message');
    const scoringInterface = document.getElementById('scoring-interface');
    
    if (role === 'scorer' || role === 'admin') {
        // Show scoring interface
        if (notAuthorizedMsg) notAuthorizedMsg.style.display = 'none';
        if (scoringInterface) scoringInterface.style.display = 'block';
    } else {
        // Show "not authorized" message
        if (notAuthorizedMsg) notAuthorizedMsg.style.display = 'block';
        if (scoringInterface) scoringInterface.style.display = 'none';
    }
}

/**
 * Profile page specific logic
 */
function handleProfilePage(role) {
    const notConnectedMsg = document.getElementById('not-connected-message');
    const profileContainer = document.getElementById('profile-container');
    
    if (role === 'none') {
        // Show "not connected" message
        if (notConnectedMsg) notConnectedMsg.style.display = 'block';
        if (profileContainer) profileContainer.style.display = 'none';
    } else {
        // Show profile
        if (notConnectedMsg) notConnectedMsg.style.display = 'none';
        if (profileContainer) profileContainer.style.display = 'block';
    }
}

/**
 * Sync slider and number input for scoring
 */
function updateScoreValue(sliderId, inputId) {
    const slider = document.getElementById(sliderId);
    const input = document.getElementById(inputId);
    if (slider && input) {
        input.value = slider.value;
    }
}

function updateScoreSlider(sliderId, inputId) {
    const slider = document.getElementById(sliderId);
    const input = document.getElementById(inputId);
    if (slider && input) {
        // Ensure value is within bounds
        let value = parseInt(input.value);
        if (value < 0) value = 0;
        if (value > 100) value = 100;
        input.value = value;
        slider.value = value;
    }
}

/**
 * Form submission handlers (simulated)
 */
document.addEventListener('DOMContentLoaded', () => {
    // Submit proposal form
    const proposalForm = document.querySelector('.proposal-form');
    if (proposalForm) {
        proposalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Check if 3 scorers are selected
            const checkedScorers = proposalForm.querySelectorAll('input[name="scorer"]:checked');
            if (checkedScorers.length !== 3) {
                alert('Please select exactly 3 scorers!');
                return;
            }
            
            // Simulate blockchain transaction
            alert('🔄 Transaction submitted to blockchain!\n\n' +
                  'In the real app, MetaMask would pop up here to sign the transaction.\n\n' +
                  '⏳ Waiting for confirmation...\n\n' +
                  '✅ Proposal submitted successfully!\n' +
                  'Proposal ID: #' + Math.floor(Math.random() * 1000 + 1200));
        });
    }
    
    // Score submission buttons
    document.querySelectorAll('.scoring-form .btn-primary').forEach(btn => {
        btn.addEventListener('click', () => {
            const scoreInput = btn.closest('.scoring-form').querySelector('.score-input');
            const score = scoreInput ? scoreInput.value : '85';
            
            alert('🔄 Submitting score to blockchain...\n\n' +
                  'Your Score: ' + score + '/100\n\n' +
                  '⏳ Waiting for confirmation...\n\n' +
                  '✅ Score submitted successfully!');
        });
    });
    
    // Fulfill proposal buttons
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Fulfill')) {
            btn.addEventListener('click', () => {
                alert('🎉 Fulfilling proposal...\n\n' +
                      '⏳ Minting your LAB Badge NFT...\n\n' +
                      '✅ Success!\n\n' +
                      'You\'ve been awarded a Gold Badge!\n' +
                      'Badge ID: #' + Math.floor(Math.random() * 100 + 1300) + '\n\n' +
                      'This soulbound NFT represents your validated research contribution.');
            });
        }
    });
});

// Export for use in HTML onclick handlers
window.switchRole = switchRole;
window.updateScoreValue = updateScoreValue;
window.updateScoreSlider = updateScoreSlider;

