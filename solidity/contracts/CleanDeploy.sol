// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LabBadge.sol";
import "./RoyaltyDistribution.sol";

contract TriLaneSystem{
    //Structs
    // Lab Badge credentials are now stored in LabBadge NFT contract
    // No need for LabCredit struct anymore

    //CURE Token holder info
    struct CUREHolder{
        uint256 balance;
        uint256 staked;
        uint8 phase; // 1 = fixed, 2 = dynamic
        uint256 stakedTimestamp; // Track when they last staked
    }

    //Sub-DAO token
    struct SubDAOToken{
        uint256 daoId;
        uint256 tokenSupply;
        bool bondingActive;
    }
    
    //State Variables
    LabBadge public labBadge;  // NFT Badge contract
    RoyaltyDistribution public royaltyDistribution;  // Royalty distribution contract
    uint256 public cureTotalSupply;
    uint256 public subdaoCounter;
    address public admin;
    
    // Authorized badge issuers (e.g., ANTScoring contract)
    mapping(address => bool) public authorizedIssuers;
    
    // Authorized royalty pool creators (e.g., ANTScoring contract)
    mapping(address => bool) public authorizedPoolCreators;
    
    //CURE token mapping - single holder info
    mapping(address => CUREHolder) public cureHolders;

    //Sub-DAO token mappings - multiple tokens per creator
    mapping(uint256 => SubDAOToken) public subdaoTokens;
    mapping(address => uint256[]) public creatorSubdaoTokens;

    //Error Codes
    string constant E_NOT_ADMIN = "Only admin can perform this action";
    string constant E_INSUFFICIENT_BALANCE = "Insufficient balance";
    string constant E_INVALID_AMOUNT = "Invalid amount";

    //Events
    event LabBadgeMinted(uint256 indexed tokenId, address indexed contributor, string contributionType);
    event CURETokensAcquired(address indexed holder, uint256 amount, uint256 timestamp);
    event CURETokensStaked(address indexed staker, uint256 amount, uint256 timestamp);
    event CURETokensUnstaked(address indexed unstaker, uint256 amount, uint256 timestamp);
    event SubDAOCreated(address indexed creator,uint256 indexed daoId, uint256 tokenSupply, bool bondingActive);
    event Phase2Activated(address indexed holder, uint256 timestamp);
    event BondingCurveToggled(uint256 indexed daoId, bool bondingActive);

    //Modifiers
    modifier onlyOwner() {
        require(msg.sender == admin, E_NOT_ADMIN);
        _;
    }
    
    modifier onlyOwnerOrAuthorized() {
        require(msg.sender == admin || authorizedIssuers[msg.sender], "Not authorized to issue badges");
        _;
    }
    
    modifier onlyOwnerOrPoolCreator() {
        require(msg.sender == admin || authorizedPoolCreators[msg.sender], "Not authorized to create pools");
        _;
    }

    //Constructor
    constructor(){
     admin = msg.sender;
     labBadge = new LabBadge();  // Deploy LAB Badge NFT contract
     royaltyDistribution = new RoyaltyDistribution(address(labBadge));  // Deploy Royalty Distribution contract
     cureTotalSupply = 0;
     subdaoCounter = 0;
    }

    // External Functions
    // Function to Issue LAB Badge NFT (Lane 1)
    /**
     * @notice Admin or authorized contract issues LAB Badge NFT to contributor with specified tier
     * @param contributor Address receiving the badge
     * @param contributionType Type of contribution (e.g., "compound_validation", "literature_review")
     * @param tier Badge tier (BRONZE=0, SILVER=1, GOLD=2, PLATINUM=3, DIAMOND=4)
     * @return tokenId The ID of the minted badge
     */
    function issueLabBadge(
        address contributor,
        string memory contributionType,
        LabBadge.BadgeLevel tier
    ) external onlyOwnerOrAuthorized returns (uint256) {
        require(contributor != address(0), "Invalid contributor address");
        require(bytes(contributionType).length > 0, "Invalid contribution type");
        
        // Encode credentials: contributor address, contribution type, timestamp
        // IP attribution will be added later when IP is commercialized
        bytes memory credentials = abi.encode(
            contributor,          // Contributor identity
            contributionType,     // Contribution type
            block.timestamp,      // Timestamp
            ""                    // IP attribution (empty initially)
        );
        
        // Mint LAB Badge NFT to contributor with tier
        uint256 tokenId = labBadge.mintBadge(contributor, credentials, tier);
        
        emit LabBadgeMinted(tokenId, contributor, contributionType);
        
        return tokenId;
    }
    
    /**
     * @notice Updates badge credentials when IP is commercialized/licensed
     * @param tokenId The badge token ID
     * @param ipAttribution IP attribution data for royalty distribution
     */
    function updateBadgeWithIPAttribution(uint256 tokenId, string memory ipAttribution) external onlyOwner {
        // Get existing credentials
        bytes memory oldCredentials = labBadge.getCredentials(tokenId);
        (address contributor, string memory contributionType, uint256 timestamp, ) = abi.decode(
            oldCredentials,
            (address, string, uint256, string)
        );
        
        // Add IP attribution
        bytes memory newCredentials = abi.encode(
            contributor,
            contributionType,
            timestamp,
            ipAttribution  // Now includes IP data
        );
        
        // Update badge credentials
        labBadge.updateCredentials(tokenId, newCredentials);
    }
    
    /**
     * @notice Get LAB Badge credentials
     * @param tokenId The badge token ID
     * @return contributor The contributor's address
     * @return contributionType The type of contribution
     * @return timestamp When the badge was issued
     * @return ipAttribution IP attribution data (if any)
     */
    function getLabBadgeInfo(uint256 tokenId) external view returns (
        address contributor,
        string memory contributionType,
        uint256 timestamp,
        string memory ipAttribution
    ) {
        bytes memory credentials = labBadge.getCredentials(tokenId);
        return abi.decode(credentials, (address, string, uint256, string));
    }
    
    /**
     * @notice Get all badge IDs for a contributor
     * @param contributor Address of the contributor
     * @return Array of token IDs
     */
    function getContributorBadges(address contributor) external view returns (uint256[] memory) {
        return labBadge.getContributorBadges(contributor);
    }

    // Function to Acquire CURE tokens (Lane 2)
    function acquireCURETokens(uint256 amount) external{
        require(amount > 0, E_INVALID_AMOUNT);

        cureTotalSupply += amount;

        if(cureHolders[msg.sender].phase == 0){
            cureHolders[msg.sender] = CUREHolder({
                balance: amount,
                staked: 0,
                phase: 1,
                stakedTimestamp: 0
            });
        } else {
            cureHolders[msg.sender].balance += amount;
        }
        emit CURETokensAcquired(msg.sender, amount, block.timestamp);
    }

    //Function to Stake CURE tokens(Lane 2)
    function stakeCURETokens(uint256 amount) external{
        require (amount > 0, E_INVALID_AMOUNT);
        require (cureHolders[msg.sender].balance >= amount, E_INSUFFICIENT_BALANCE);
        require (cureHolders[msg.sender].phase >=1, "CURE tokens must be in phase 1 to be staked");
        cureHolders[msg.sender].balance -= amount;
        cureHolders[msg.sender].staked += amount;
        cureHolders[msg.sender].stakedTimestamp = block.timestamp;
        emit CURETokensStaked(msg.sender, amount, block.timestamp);
    }

    //Function to unstake CURE tokens(Lane 2)
    function unstakeCURETokens(uint256 amount) external{
        require(amount > 0, E_INVALID_AMOUNT);
        require(cureHolders[msg.sender].staked >= amount, "Insufficient staked balance");
        require(block.timestamp >= cureHolders[msg.sender].stakedTimestamp + 365 days, "Must wait 365 days before unstaking");
        
        cureHolders[msg.sender].staked -= amount;
        cureHolders[msg.sender].balance += amount;
        emit CURETokensUnstaked(msg.sender, amount, block.timestamp);
    }

    //Function to create Sub-DAO(Lane 3)
    function createSubDAO(uint256 initialSupply) external{
        require(initialSupply > 0, E_INVALID_AMOUNT);
        subdaoCounter += 1;
        subdaoTokens[subdaoCounter] = SubDAOToken({
            daoId: subdaoCounter,
            tokenSupply: initialSupply,
            bondingActive: true
        });
        creatorSubdaoTokens[msg.sender].push(subdaoCounter);
        emit SubDAOCreated(msg.sender, subdaoCounter, initialSupply, true);
    }

    //Admin Functions
    //Function to activate Phase 2(Lane 2)
    function activatePhase2(address holder) external onlyOwner{
        require(cureHolders[holder].phase == 1, "CURE tokens must be in phase 1 to be activated");
        cureHolders[holder].phase = 2;
        emit Phase2Activated(holder, block.timestamp);
    }

    //Function to toggle bonding curve(Lane 3)
    function toggleBondingCurve(uint256 daoId, bool bondingActive) external onlyOwner{
        require(subdaoTokens[daoId].bondingActive != bondingActive, "Bonding curve already in this state");
        subdaoTokens[daoId].bondingActive = bondingActive;
        emit BondingCurveToggled(daoId, bondingActive);
    }
    
    /**
     * @notice Authorize a contract to issue badges (e.g., ANTScoring)
     * @param issuer Address of the authorized issuer
     */
    function authorizeBadgeIssuer(address issuer) external onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        authorizedIssuers[issuer] = true;
    }
    
    /**
     * @notice Revoke badge issuance authorization
     * @param issuer Address to revoke
     */
    function revokeBadgeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
    }
    
    /**
     * @notice Authorize a contract to create royalty pools
     * @param creator Address to authorize (e.g., ANTScoring contract)
     */
    function authorizePoolCreator(address creator) external onlyOwner {
        require(creator != address(0), "Invalid creator address");
        authorizedPoolCreators[creator] = true;
    }
    
    /**
     * @notice Revoke royalty pool creation authorization
     * @param creator Address to revoke
     */
    function revokePoolCreator(address creator) external onlyOwner {
        authorizedPoolCreators[creator] = false;
    }

    //Public View Functions
    //Function to get system stats
    function getSystemStats() external view returns (uint256, uint256, uint256){
        return(labBadge.totalSupply(), cureTotalSupply, subdaoCounter);
    }

    //Function to get cure holder info
    function getCUREHolder(address holder) external view returns (uint256, uint256, uint8){
        return(cureHolders[holder].balance, cureHolders[holder].staked, cureHolders[holder].phase);
    }

    //Function to get subdao info
    function getSubDAO(uint256 daoId) external view returns (uint256, uint256, bool){
        return(subdaoTokens[daoId].daoId, subdaoTokens[daoId].tokenSupply, subdaoTokens[daoId].bondingActive);
    }

    // ========================================
    // TIERED BADGE SYSTEM FUNCTIONS
    // ========================================
    
    /**
     * @notice Get the tier level of a specific badge
     * @param tokenId The badge token ID
     * @return The badge tier (BRONZE, SILVER, GOLD, PLATINUM, DIAMOND)
     */
    function getBadgeLevel(uint256 tokenId) external view returns (LabBadge.BadgeLevel) {
        return labBadge.getBadgeLevel(tokenId);
    }
    
    /**
     * @notice Get point value for a specific tier
     * @param level The badge tier
     * @return Points for that tier
     */
    function getTierPoints(LabBadge.BadgeLevel level) external view returns (uint256) {
        return labBadge.getTierPoints(level);
    }
    
    /**
     * @notice Get contributor's total reputation points from all badges
     * @param contributor The contributor's address
     * @return Total points from all badges
     */
    function getContributorReputation(address contributor) 
        external 
        view 
        returns (uint256) 
    {
        return labBadge.getContributorPoints(contributor);
    }
    
    /**
     * @notice Get count of badges at specific tier for a contributor
     * @param contributor The contributor's address
     * @param level The tier to count
     * @return Number of badges at that tier
     */
    function getContributorBadgesByTier(
        address contributor, 
        LabBadge.BadgeLevel level
    ) 
        external 
        view 
        returns (uint256) 
    {
        return labBadge.getBadgeCountByTier(contributor, level);
    }
    
    /**
     * @notice Get detailed badge statistics for a contributor
     * @param contributor The contributor's address
     * @return totalBadges Total number of badges
     * @return totalPoints Total reputation points
     * @return bronzeCount Number of BRONZE badges
     * @return silverCount Number of SILVER badges
     * @return goldCount Number of GOLD badges
     * @return platinumCount Number of PLATINUM badges
     * @return diamondCount Number of DIAMOND badges
     */
    function getContributorStats(address contributor) 
        external 
        view 
        returns (
            uint256 totalBadges,
            uint256 totalPoints,
            uint256 bronzeCount,
            uint256 silverCount,
            uint256 goldCount,
            uint256 platinumCount,
            uint256 diamondCount
        ) 
    {
        totalBadges = labBadge.getContributorBadges(contributor).length;
        totalPoints = labBadge.getContributorPoints(contributor);
        bronzeCount = labBadge.getBadgeCountByTier(contributor, LabBadge.BadgeLevel.BRONZE);
        silverCount = labBadge.getBadgeCountByTier(contributor, LabBadge.BadgeLevel.SILVER);
        goldCount = labBadge.getBadgeCountByTier(contributor, LabBadge.BadgeLevel.GOLD);
        platinumCount = labBadge.getBadgeCountByTier(contributor, LabBadge.BadgeLevel.PLATINUM);
        diamondCount = labBadge.getBadgeCountByTier(contributor, LabBadge.BadgeLevel.DIAMOND);
    }
    
    /**
     * @notice Create a leaderboard of contributors sorted by reputation
     * @param contributors Array of addresses to rank
     * @return addresses Sorted array (highest reputation first)
     * @return points Corresponding reputation points
     * @dev For production, consider using off-chain indexing for large datasets
     */
    function getLeaderboard(address[] memory contributors) 
        external 
        view 
        returns (address[] memory addresses, uint256[] memory points) 
    {
        uint256 length = contributors.length;
        addresses = new address[](length);
        points = new uint256[](length);
        
        // Get points for each contributor
        for (uint i = 0; i < length; i++) {
            addresses[i] = contributors[i];
            points[i] = labBadge.getContributorPoints(contributors[i]);
        }
        
        // Simple bubble sort (only suitable for small arrays!)
        // For production with many users, use off-chain sorting
        for (uint i = 0; i < length - 1; i++) {
            for (uint j = 0; j < length - i - 1; j++) {
                if (points[j] < points[j + 1]) {
                    // Swap points
                    (points[j], points[j + 1]) = (points[j + 1], points[j]);
                    // Swap addresses
                    (addresses[j], addresses[j + 1]) = (addresses[j + 1], addresses[j]);
                }
            }
        }
        
        return (addresses, points);
    }
    
    // ========================================
    // ROYALTY DISTRIBUTION FUNCTIONS
    // ========================================
    
    /**
     * @notice Create a new royalty pool for specific IP/project
     * @param ipId IP identifier (e.g., "Patent #US12345")
     * @param eligibleBadges Array of badge IDs that contributed to this IP
     * @return poolId The created pool ID
     */
    function createRoyaltyPool(
        string memory ipId,
        uint256[] memory eligibleBadges
    ) external onlyOwnerOrPoolCreator returns (uint256) {
        return royaltyDistribution.createRoyaltyPool(ipId, eligibleBadges);
    }
    
    /**
     * @notice Deposit royalties into a pool
     * @param poolId The pool to deposit into
     */
    function depositRoyalties(uint256 poolId) external payable {
        royaltyDistribution.depositRoyalties{value: msg.value}(poolId);
    }
    
    /**
     * @notice Claim royalties for a badge
     * @param poolId The pool to claim from
     * @param badgeId The badge ID
     */
    function claimRoyalties(uint256 poolId, uint256 badgeId) external {
        royaltyDistribution.claimRoyalties(poolId, badgeId, msg.sender);
    }
    
    /**
     * @notice Claim royalties from multiple pools at once
     * @param poolIds Array of pool IDs
     * @param badgeIds Array of badge IDs
     */
    function claimMultipleRoyalties(
        uint256[] memory poolIds,
        uint256[] memory badgeIds
    ) external {
        royaltyDistribution.claimMultipleRoyalties(poolIds, badgeIds, msg.sender);
    }
    
    /**
     * @notice Calculate royalty share for a badge
     * @param poolId The pool ID
     * @param badgeId The badge ID
     * @return The royalty amount
     */
    function calculateRoyaltyShare(
        uint256 poolId,
        uint256 badgeId
    ) external view returns (uint256) {
        return royaltyDistribution.calculateRoyaltyShare(poolId, badgeId);
    }
    
    /**
     * @notice Get all unclaimed royalties for a badge
     * @param badgeId The badge ID
     * @return Total unclaimed amount
     */
    function getUnclaimedRoyalties(uint256 badgeId) external view returns (uint256) {
        return royaltyDistribution.getUnclaimedRoyalties(badgeId);
    }
    
    /**
     * @notice Get pools a badge is eligible for
     * @param badgeId The badge ID
     * @return Array of pool IDs
     */
    function getBadgeRoyaltyPools(uint256 badgeId) external view returns (uint256[] memory) {
        return royaltyDistribution.getBadgePools(badgeId);
    }
    
    /**
     * @notice Get royalty pool information
     * @param poolId The pool ID
     * @return ipId IP identifier
     * @return totalDeposited Total deposited
     * @return totalClaimed Total claimed
     * @return availableRoyalties Remaining royalties
     * @return eligibleBadgeCount Number of eligible badges
     */
    function getRoyaltyPoolInfo(uint256 poolId) external view returns (
        string memory ipId,
        uint256 totalDeposited,
        uint256 totalClaimed,
        uint256 availableRoyalties,
        uint256 eligibleBadgeCount
    ) {
        return royaltyDistribution.getPoolInfo(poolId);
    }
    
    /**
     * @notice Get contributor's total unclaimed royalties across all their badges
     * @param contributor The contributor's address
     * @return Total unclaimed royalties
     */
    function getContributorUnclaimedRoyalties(address contributor) 
        external 
        view 
        returns (uint256) 
    {
        uint256[] memory badges = labBadge.getContributorBadges(contributor);
        uint256 total = 0;
        
        for (uint i = 0; i < badges.length; i++) {
            total += royaltyDistribution.getUnclaimedRoyalties(badges[i]);
        }
        
        return total;
    }

}


