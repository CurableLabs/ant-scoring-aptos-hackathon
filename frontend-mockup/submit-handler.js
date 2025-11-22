// ============================================
// SUBMIT PROPOSAL - Form Handler
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const proposalForm = document.querySelector('.proposal-form');
    
    if (proposalForm) {
        proposalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Check wallet connection
            if (!web3State.isConnected) {
                alert('⚠️ Please connect your wallet first!');
                await connectWallet();
                return;
            }
            
            // Get form values
            const protocol = document.getElementById('protocol').value.trim();
            const ipfsHash = document.getElementById('ipfs').value.trim();
            
            // Validate protocol
            if (!protocol) {
                alert('❌ Please provide a protocol description!');
                return;
            }
            
            // Get selected scorers
            const checkedScorers = Array.from(
                proposalForm.querySelectorAll('input[name="scorer"]:checked')
            );
            
            // Validate scorer count
            if (checkedScorers.length !== 3) {
                alert(`❌ Please select exactly 3 scorers!\n\nYou've selected: ${checkedScorers.length}`);
                return;
            }
            
            // Get scorer addresses
            const scorerAddresses = checkedScorers.map(input => input.value);
            
            // Confirm submission
            const confirm = window.confirm(
                `📝 Submit Proposal?\n\n` +
                `Protocol: ${protocol.substring(0, 100)}...\n` +
                `IPFS: ${ipfsHash || 'None'}\n` +
                `Scorers: ${scorerAddresses.length}\n\n` +
                `This will create a transaction. Continue?`
            );
            
            if (!confirm) return;
            
            // Submit to blockchain
            const proposalId = await submitProposal(protocol, ipfsHash, scorerAddresses);
            
            if (proposalId) {
                // Success - redirect to profile
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 2000);
            }
        });
    }
});

