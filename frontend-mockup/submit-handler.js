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
            const title = document.getElementById('title')?.value.trim() || 'Research Proposal';
            const protocol = document.getElementById('protocol').value.trim();
            const ipfsHash = document.getElementById('ipfs').value.trim();
            
            // Validate protocol
            if (!protocol) {
                alert('❌ Please provide a protocol description!');
                return;
            }
            
            // Confirm submission
            const confirm = window.confirm(
                `📝 Submit Proposal?\n\n` +
                `Title: ${title}\n` +
                `Protocol: ${protocol.substring(0, 100)}${protocol.length > 100 ? '...' : ''}\n` +
                `IPFS: ${ipfsHash || 'None'}\n\n` +
                `This will create a transaction. Continue?`
            );
            
            if (!confirm) return;
            
            // Submit to blockchain (title, description, ipfsHash)
            const proposalId = await submitProposal(title, protocol, ipfsHash);
            
            if (proposalId) {
                // Success - redirect to profile
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 2000);
            }
        });
    }
});

