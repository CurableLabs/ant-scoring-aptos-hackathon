// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LabBadge.sol";

/**
 * @title RoyaltyDistribution - Automated Royalty Distribution System
 * @notice Distributes royalties to badge holders based on their reputation points
 * @dev Royalties are distributed proportionally based on badge tier points
 */
contract RoyaltyDistribution {
    
    LabBadge public labBadge;
    address public admin;
    
    // Struct to track royalty pools for different IPs/projects
    struct RoyaltyPool {
        string ipId;                           // IP identifier (e.g., "Patent #US12345")
        uint256 totalDeposited;                // Total royalties deposited
        uint256 totalClaimed;                  // Total royalties claimed
        uint256[] eligibleBadges;              // Badge IDs eligible for this royalty
        mapping(uint256 => bool) isBadgeEligible;  // Quick lookup for eligibility
        mapping(uint256 => bool) hasClaimed;   // Track which badges have claimed
        bool isActive;                         // Pool is active
    }
    
    // Mapping from pool ID to RoyaltyPool
    mapping(uint256 => RoyaltyPool) public royaltyPools;
    uint256 public poolCounter;
    
    // Mapping from badge ID to list of pool IDs it's part of
    mapping(uint256 => uint256[]) public badgeRoyaltyPools;
    
    // Events
    event RoyaltyPoolCreated(uint256 indexed poolId, string ipId, uint256[] eligibleBadges);
    event RoyaltiesDeposited(uint256 indexed poolId, uint256 amount, address depositor);
    event RoyaltiesClaimed(uint256 indexed poolId, uint256 indexed badgeId, address claimer, uint256 amount);
    event PoolClosed(uint256 indexed poolId);
    
    // Errors
    error OnlyAdmin();
    error PoolNotFound();
    error PoolNotActive();
    error BadgeNotEligible();
    error AlreadyClaimed();
    error NotBadgeOwner();
    error NoRoyaltiesToClaim();
    error InvalidBadgeList();
    
    modifier onlyAdmin() {
        if (msg.sender != admin) revert OnlyAdmin();
        _;
    }
    
    constructor(address _labBadgeAddress) {
        labBadge = LabBadge(_labBadgeAddress);
        admin = msg.sender;
        poolCounter = 0;
    }
    
    /**
     * @notice Create a new royalty pool for a specific IP/project
     * @param ipId IP identifier (e.g., "Patent #US12345")
     * @param eligibleBadges Array of badge token IDs eligible for royalties
     * @return poolId The ID of the created pool
     */
    function createRoyaltyPool(
        string memory ipId,
        uint256[] memory eligibleBadges
    ) external onlyAdmin returns (uint256) {
        if (eligibleBadges.length == 0) revert InvalidBadgeList();
        
        poolCounter++;
        uint256 poolId = poolCounter;
        
        RoyaltyPool storage pool = royaltyPools[poolId];
        pool.ipId = ipId;
        pool.eligibleBadges = eligibleBadges;
        pool.totalDeposited = 0;
        pool.totalClaimed = 0;
        pool.isActive = true;
        
        // Mark badges as eligible
        for (uint i = 0; i < eligibleBadges.length; i++) {
            pool.isBadgeEligible[eligibleBadges[i]] = true;
            badgeRoyaltyPools[eligibleBadges[i]].push(poolId);
        }
        
        emit RoyaltyPoolCreated(poolId, ipId, eligibleBadges);
        return poolId;
    }
    
    /**
     * @notice Deposit royalties into a pool
     * @param poolId The pool ID to deposit into
     */
    function depositRoyalties(uint256 poolId) external payable {
        RoyaltyPool storage pool = royaltyPools[poolId];
        if (!pool.isActive) revert PoolNotActive();
        
        pool.totalDeposited += msg.value;
        
        emit RoyaltiesDeposited(poolId, msg.value, msg.sender);
    }
    
    /**
     * @notice Claim royalties for a specific badge
     * @param poolId The pool ID to claim from
     * @param badgeId The badge token ID
     * @param claimer The address claiming (for delegated calls)
     */
    function claimRoyalties(uint256 poolId, uint256 badgeId, address claimer) external {
        RoyaltyPool storage pool = royaltyPools[poolId];
        
        // Validations
        if (!pool.isActive) revert PoolNotActive();
        if (!pool.isBadgeEligible[badgeId]) revert BadgeNotEligible();
        if (pool.hasClaimed[badgeId]) revert AlreadyClaimed();
        if (labBadge.ownerOf(badgeId) != claimer) revert NotBadgeOwner();
        
        // Calculate share
        uint256 share = calculateRoyaltyShare(poolId, badgeId);
        if (share == 0) revert NoRoyaltiesToClaim();
        
        // Mark as claimed
        pool.hasClaimed[badgeId] = true;
        pool.totalClaimed += share;
        
        // Transfer royalties
        payable(claimer).transfer(share);
        
        emit RoyaltiesClaimed(poolId, badgeId, claimer, share);
    }
    
    /**
     * @notice Claim royalties from multiple pools at once
     * @param poolIds Array of pool IDs
     * @param badgeIds Array of badge IDs (must match poolIds length)
     * @param claimer The address claiming (for delegated calls)
     */
    function claimMultipleRoyalties(
        uint256[] memory poolIds,
        uint256[] memory badgeIds,
        address claimer
    ) external {
        require(poolIds.length == badgeIds.length, "Array length mismatch");
        
        uint256 totalClaimed = 0;
        
        for (uint i = 0; i < poolIds.length; i++) {
            uint256 poolId = poolIds[i];
            uint256 badgeId = badgeIds[i];
            
            RoyaltyPool storage pool = royaltyPools[poolId];
            
            // Skip if already claimed or not eligible
            if (pool.hasClaimed[badgeId] || !pool.isBadgeEligible[badgeId]) {
                continue;
            }
            
            // Must own the badge
            if (labBadge.ownerOf(badgeId) != claimer) continue;
            
            // Calculate and accumulate share
            uint256 share = calculateRoyaltyShare(poolId, badgeId);
            if (share > 0) {
                pool.hasClaimed[badgeId] = true;
                pool.totalClaimed += share;
                totalClaimed += share;
                
                emit RoyaltiesClaimed(poolId, badgeId, claimer, share);
            }
        }
        
        if (totalClaimed > 0) {
            payable(claimer).transfer(totalClaimed);
        }
    }
    
    /**
     * @notice Calculate royalty share for a specific badge in a pool
     * @param poolId The pool ID
     * @param badgeId The badge token ID
     * @return The royalty amount in wei
     */
    function calculateRoyaltyShare(
        uint256 poolId,
        uint256 badgeId
    ) public view returns (uint256) {
        RoyaltyPool storage pool = royaltyPools[poolId];
        
        if (!pool.isBadgeEligible[badgeId]) return 0;
        if (pool.hasClaimed[badgeId]) return 0;
        
        // Get badge tier points
        LabBadge.BadgeLevel level = labBadge.getBadgeLevel(badgeId);
        uint256 badgePoints = labBadge.getTierPoints(level);
        
        // Calculate total points from all eligible badges
        uint256 totalPoints = 0;
        for (uint i = 0; i < pool.eligibleBadges.length; i++) {
            uint256 eligibleBadgeId = pool.eligibleBadges[i];
            if (!pool.hasClaimed[eligibleBadgeId]) {
                LabBadge.BadgeLevel eligibleLevel = labBadge.getBadgeLevel(eligibleBadgeId);
                totalPoints += labBadge.getTierPoints(eligibleLevel);
            }
        }
        
        if (totalPoints == 0) return 0;
        
        // Calculate proportional share
        uint256 availableRoyalties = pool.totalDeposited - pool.totalClaimed;
        uint256 share = (availableRoyalties * badgePoints) / totalPoints;
        
        return share;
    }
    
    /**
     * @notice Get all unclaimed royalties for a badge across all pools
     * @param badgeId The badge token ID
     * @return Total unclaimed royalties
     */
    function getUnclaimedRoyalties(uint256 badgeId) external view returns (uint256) {
        uint256[] memory pools = badgeRoyaltyPools[badgeId];
        uint256 total = 0;
        
        for (uint i = 0; i < pools.length; i++) {
            uint256 poolId = pools[i];
            total += calculateRoyaltyShare(poolId, badgeId);
        }
        
        return total;
    }
    
    /**
     * @notice Get all pools a badge is eligible for
     * @param badgeId The badge token ID
     * @return Array of pool IDs
     */
    function getBadgePools(uint256 badgeId) external view returns (uint256[] memory) {
        return badgeRoyaltyPools[badgeId];
    }
    
    /**
     * @notice Get pool information
     * @param poolId The pool ID
     * @return ipId IP identifier
     * @return totalDeposited Total royalties deposited
     * @return totalClaimed Total royalties claimed
     * @return availableRoyalties Remaining royalties
     * @return eligibleBadgeCount Number of eligible badges
     */
    function getPoolInfo(uint256 poolId) external view returns (
        string memory ipId,
        uint256 totalDeposited,
        uint256 totalClaimed,
        uint256 availableRoyalties,
        uint256 eligibleBadgeCount
    ) {
        RoyaltyPool storage pool = royaltyPools[poolId];
        return (
            pool.ipId,
            pool.totalDeposited,
            pool.totalClaimed,
            pool.totalDeposited - pool.totalClaimed,
            pool.eligibleBadges.length
        );
    }
    
    /**
     * @notice Get eligible badges for a pool
     * @param poolId The pool ID
     * @return Array of eligible badge IDs
     */
    function getPoolEligibleBadges(uint256 poolId) external view returns (uint256[] memory) {
        return royaltyPools[poolId].eligibleBadges;
    }
    
    /**
     * @notice Check if a badge has claimed from a pool
     * @param poolId The pool ID
     * @param badgeId The badge token ID
     * @return True if claimed
     */
    function hasBadgeClaimed(uint256 poolId, uint256 badgeId) external view returns (bool) {
        return royaltyPools[poolId].hasClaimed[badgeId];
    }
    
    /**
     * @notice Close a royalty pool (admin only)
     * @param poolId The pool ID to close
     * @dev Remaining royalties stay in contract for future claims
     */
    function closePool(uint256 poolId) external onlyAdmin {
        RoyaltyPool storage pool = royaltyPools[poolId];
        pool.isActive = false;
        emit PoolClosed(poolId);
    }
    
    /**
     * @notice Withdraw unclaimed royalties from closed pool (admin emergency function)
     * @param poolId The pool ID
     * @param recipient Address to receive the funds
     */
    function emergencyWithdraw(uint256 poolId, address payable recipient) external onlyAdmin {
        RoyaltyPool storage pool = royaltyPools[poolId];
        require(!pool.isActive, "Pool must be closed first");
        
        uint256 remaining = pool.totalDeposited - pool.totalClaimed;
        if (remaining > 0) {
            pool.totalClaimed = pool.totalDeposited;
            recipient.transfer(remaining);
        }
    }
    
    // Receive function to accept ETH
    receive() external payable {}
}

