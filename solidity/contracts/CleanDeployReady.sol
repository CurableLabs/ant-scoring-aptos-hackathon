// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// CleanDeployReady - Tri-lane tokenomics system for Drug Discovery
// Lane 1: Lab Credits (IP proof)
// Lane 2: CURE Tokens (Funding)
// Lane 3: Sub-DAOs (Marketplaces)
// By Curable Labs Team


contract CleanDeployReady {
    // State Variables
    address public admin;
    uint64 public labCreditsIssued;
    uint256 public cureTotalSupply;
    uint64 public subdaoCount;
    uint64 public stakeLockPeriod;

    // Structs

// Lab Credit - Non-transferable IP Proof 
    struct LabCredit {
        uint64 creditId;
        address inventor;
        string ipTitle;
        uint64 timestamp;
        bool exists;
    }

// CURE Token Holder Information
    struct CUREHolder {
        uint256 balance;
        uint256 staked;
        uint8 phase; // 1 = fixed pricing, 2 = dynamic pricing
    }

// Sub-DAO token for disease-specific research 
    struct SubDAOToken {
        uint64 daoId;
        uint256 tokenSupply;
        bool bondingActive;
     }

  // Mapping

   mapping(address => LabCredit[]) public inventorLabCredits;  // Multiple lab credits per inventor
   mapping(address => CUREHolder) public cureHolders;
   mapping(address => SubDAOToken) public subDAOTokens;
   mapping(uint64 => address) public subDAOById;
   mapping(address => uint64) public stakeUnlockTime;

 // Events 
  
    event LabCreditIssued(uint64 indexed creditId, address indexed inventor, string ipTitle, uint64 timestamp);
    event CURETokensAcquired(address indexed buyer, uint256 amount, uint256 newBalance);
    event CUREStaked(address indexed staker, uint256 amount, uint256 totalStaked);
    event SubDAOCreated(uint64 indexed daoId, address indexed creator, uint256 initialSupply);
    event Phase2Activated(address indexed holder, uint256 timestamp);
    event BondingCurveToggled(uint64 indexed daoId, bool active);
    event CUREUnstaked(address indexed staker, uint256 amount, uint256 remainingStaked);
    event StakeLockPeriodUpdated(uint64 newLockPeriod);


 // Errors

    error NotAdmin(); 
    error InsufficientBalance();
    error InvalidAmount();
    error LabCreditNotFound();
    error CUREHolderNotFound();
    error SubDAONotFound();
    error StakeLocked(uint64 unlockTime);
    error InsufficientStaked();

 // modifiers

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

 // constructor

    constructor() {
        admin = msg.sender;
        labCreditsIssued = 0;
        cureTotalSupply = 0;
        subdaoCount = 0;
        stakeLockPeriod = 365 days;
}

        
// ========================================
// Lane 1: Lab Credit Functions
// ========================================
    
        
       
    // Issue a non-transferable Lab Credit for intellectual property
    // ipTitle = Title/description of the intellectual property
    // Users can issue multiple lab credits for different IPs
    function issueLabCredit(string memory ipTitle) external {
        if(bytes(ipTitle).length == 0) revert InvalidAmount();
        
        labCreditsIssued++;
        
        LabCredit memory newCredit = LabCredit({
            creditId: labCreditsIssued,
            inventor: msg.sender,
            ipTitle: ipTitle,
            timestamp: uint64(block.timestamp),
            exists: true
        });
        
        inventorLabCredits[msg.sender].push(newCredit);
        
        emit LabCreditIssued(labCreditsIssued, msg.sender, ipTitle, uint64(block.timestamp));
    }
    
    
// ========================================
// Lane 2: CURE Token    
// ========================================

        
    // Acquire CURE tokens for community participation
    // amount = Amount of CURE tokens to acquire
    function acquireCURETokens(uint256 amount) external payable {
        if(amount == 0) revert InvalidAmount();
        
        cureTotalSupply += amount;
        
        CUREHolder storage holder = cureHolders[msg.sender];
        holder.balance += amount;
        
        if(holder.phase == 0) {
            holder.phase = 1; // Initialize to Phase 1
        }
        
        emit CURETokensAcquired(msg.sender, amount, holder.balance);
    }


    // Stake CURE tokens on research proposals
    // stakeAmount = Amount of CURE tokens to stake
    function stakeCUREOnResearch(uint256 stakeAmount) external {
        if(stakeAmount == 0) revert InvalidAmount();
        
        CUREHolder storage holder = cureHolders[msg.sender];
        if(holder.balance < stakeAmount) revert InsufficientBalance();
        
        holder.balance -= stakeAmount;
        holder.staked += stakeAmount;
        
        // Set unlock time (first stake or extend existing lock)
        uint64 newUnlockTime = uint64(block.timestamp) + stakeLockPeriod;
        if(newUnlockTime > stakeUnlockTime[msg.sender]) {
            stakeUnlockTime[msg.sender] = newUnlockTime;
        }
        
        emit CUREStaked(msg.sender, stakeAmount, holder.staked);
    }
    
   // unstake CURE tokens after lock period 
   // amount = Amount of CURE tokens to unstake
   function unstakeCURE(uint256 amount) external {
        if(amount == 0) revert InvalidAmount();
        
        // Check if lock period has passed
        if(block.timestamp < stakeUnlockTime[msg.sender]) revert StakeLocked(stakeUnlockTime[msg.sender]);
        
        CUREHolder storage holder = cureHolders[msg.sender];
        if(holder.staked < amount) revert InsufficientStaked();
        
        // Move token from staked back to balance
        holder.staked -= amount;
        holder.balance += amount;
        
        emit CUREUnstaked(msg.sender, amount, holder.staked);
    }
    
    
    // ========================================
    // Lane 3: Sub-DAO Functions
    // ========================================
    
    // Create a disease-specific Sub-DAO with its own token
    // initialSupply = Initial token supply for the Sub-DAO
    function createSubDAO(uint256 initialSupply) external {
        if(initialSupply == 0) revert InvalidAmount();
        
        subdaoCount++;
        
        subDAOTokens[msg.sender] = SubDAOToken({
            daoId: subdaoCount,
            tokenSupply: initialSupply,
            bondingActive: true
        });
        
        subDAOById[subdaoCount] = msg.sender;
        
        emit SubDAOCreated(subdaoCount, msg.sender, initialSupply);
    }

        
    // ========================================
    // Admin Functions
    // ========================================
    
    // Activate Phase 2 (dynamic pricing) for a CURE holder
    // holder = Address of the CURE token holder
    function activatePhase2(address holder) external onlyAdmin {
        CUREHolder storage cureHolder = cureHolders[holder];
        if(cureHolder.phase == 0) revert CUREHolderNotFound();
        
        cureHolder.phase = 2;
        emit Phase2Activated(holder, block.timestamp);
    } 


        
    // Toggle bonding curve status for a Sub-DAO
    // daoCreator = Address of the Sub-DAO creator
    // active = New bonding curve status
    function toggleBondingCurve(address daoCreator, bool active) external onlyAdmin {
        SubDAOToken storage subdao = subDAOTokens[daoCreator];
        if(subdao.daoId == 0) revert SubDAONotFound();
        
        subdao.bondingActive = active;
        emit BondingCurveToggled(subdao.daoId, active);
    }
    // Update stake lock period (admin only)
    // newLockPeriod = New lock period in seconds
function updateStakeLockPeriod(uint64 newLockPeriod) external onlyAdmin {
    stakeLockPeriod = newLockPeriod;
    emit StakeLockPeriodUpdated(newLockPeriod);
}

        
    // ========================================
    // View Functions
    // ========================================
    
    // Get system-wide statistics
    // Returns: lab credits issued, total CURE supply, Sub-DAO count
    function getSystemStats() external view returns (uint64, uint256, uint64) {
        return (labCreditsIssued, cureTotalSupply, subdaoCount);
    }

        
    // Get all Lab Credits for an inventor
    // inventor = Address of the inventor
    // Returns: Array of all Lab Credits issued by this inventor
    function getInventorLabCredits(address inventor) external view returns (LabCredit[] memory) {
        return inventorLabCredits[inventor];
    }

    // Get total number of Lab Credits for an inventor
    // inventor = Address of the inventor
    // Returns: Number of lab credits
    function getInventorLabCreditsCount(address inventor) external view returns (uint256) {
        return inventorLabCredits[inventor].length;
    }

    // Get specific Lab Credit by index for an inventor
    // inventor = Address of the inventor
    // index = Index of the lab credit in the array
    // Returns: Lab Credit information
    function getLabCreditByIndex(address inventor, uint256 index) external view returns (LabCredit memory) {
        if(index >= inventorLabCredits[inventor].length) revert LabCreditNotFound();
        return inventorLabCredits[inventor][index];
    }

        
    // Get CURE token balance and staking info for a holder
    // holder = Address of the CURE holder
    // Returns: balance, staked amount, and phase
    function getCUREBalance(address holder) external view returns (uint256, uint256, uint8) {
        CUREHolder memory holderInfo = cureHolders[holder];
        if(holderInfo.phase == 0) revert CUREHolderNotFound();
        return (holderInfo.balance, holderInfo.staked, holderInfo.phase);
    }

    
    // Get Sub-DAO information
    // creator = Address of the Sub-DAO creator
    // Returns: Sub-DAO details
    function getSubDAOInfo(address creator) external view returns (SubDAOToken memory) {
        if(subDAOTokens[creator].daoId == 0) revert SubDAONotFound();
        return subDAOTokens[creator];
    }

    // check when a user can unstake
    // staker = Address of the staker
   // Returns: Timestamp when unstaking becomes available
   function getUnlockTime(address staker) external view returns (uint64) {
    return stakeUnlockTime[staker];
   }

   // check if a user can currently unstake
   // staker = Address of the staker
   // Returns: True if can unstake now, false if still locked
   function canUnstake(address staker) external view returns (bool) {
    return block.timestamp >= stakeUnlockTime[staker];
   }
  

}