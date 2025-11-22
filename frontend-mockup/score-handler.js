// ============================================
// SCORE PROPOSALS - Form Handler
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners to all score submission buttons
    const scoreButtons = document.querySelectorAll('.scoring-form .btn-primary');
    
    scoreButtons.forEach((button, index) => {
        button.addEventListener('click', async () => {
            // Check wallet connection
            if (!web3State.isConnected) {
                alert('⚠️ Please connect your wallet first!');
                await connectWallet();
                return;
            }
            
            // Check if authorized scorer
            if (!web3State.isScorer && !web3State.isAdmin) {
                alert('❌ You are not an authorized scorer!\n\nContact the system administrator to get authorized.');
                return;
            }
            
            // Get the scoring form
            const scoringForm = button.closest('.scoring-form');
            const scoreCard = button.closest('.score-card');
            
            // Get proposal ID from the card
            const proposalIdElement = scoreCard.querySelector('.proposal-id');
            const proposalIdText = proposalIdElement ? proposalIdElement.textContent : '';
            const proposalId = proposalIdText.replace('#', '').trim();
            
            if (!proposalId || proposalId === '') {
                alert('❌ Could not determine proposal ID');
                return;
            }
            
            // Get score value
            const scoreInput = scoringForm.querySelector('.score-input');
            const score = scoreInput ? parseInt(scoreInput.value) : 0;
            
            // Validate score
            if (score < 0 || score > 100) {
                alert('❌ Score must be between 0 and 100!');
                return;
            }
            
            // Get comments (optional)
            const commentsTextarea = scoringForm.querySelector('textarea');
            const comments = commentsTextarea ? commentsTextarea.value.trim() : '';
            
            // Confirm submission
            const confirmMsg = 
                `📊 Submit Score?\n\n` +
                `Proposal ID: #${proposalId}\n` +
                `Your Score: ${score}/100\n` +
                (comments ? `Comments: ${comments.substring(0, 50)}...\n` : '') +
                `\nThis will create a blockchain transaction. Continue?`;
            
            const confirmed = window.confirm(confirmMsg);
            if (!confirmed) return;
            
            // Submit score to blockchain
            const success = await scoreProposal(proposalId, score);
            
            if (success) {
                // Reload page to show updated scores
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        });
    });
});

