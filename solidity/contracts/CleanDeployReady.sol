// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
* @title CleanDeployReady
* @dev Tri-lane tokenomics system for Drug Discovery
* @notice lane 1: Lab Credits (IP proof) / Lane 2: CURE Tokens (Funding) / Lane 3: Sub-DAOs (Marketplaces)
* @author Curable Labs Team
*/


contract CleanDeployReady {
    // State Variables
    address public admin;
    uint64 public labCreditsIssued;
    uint256 public cureTotalSupply;
    uint64 public subdaoCount; 

    // Structs

/// @dev Lab Credit - Non-transferable IP Proof 
    struct LabCredit {
        uint64 creditId;
        address inventor;
        string ipTitle;
        uint64 timestamp;
        bool exists;
    }

/// @dev CURE Token Holder Information
    struct CUREHolder {
        uint256 balance;
        uint256 staked;
        uint8 phase; // 1 = fixed pricing, 2 = dynamic pricing
    }

/// @dev Sub-DAO token for disease-specific research 
    struct SubDAOToken {
        uint64 daoId;
        uint256 tokenSupply;
        bool bondingActive;
     }

  // Mapping

   mapping(address => LabCredit) public labCredits;
   mapping(address => CUREHolder) public cureHolders;
   mapping(address => SubDAOToken) public subDAOTokens;
   mapping(uint64 => address) public subDAOById;

 // Events 
  
    event LabCreditIssued(uint64 indexed creditId, address indexed inventor, string ipTitle, uint64 timestamp);
    event CURETokensAcquired(address indexed buyer, uint256 amount, uint256 newBalance);
    event CUREStaked(address indexed staker, uint256 amount, uint256 totalStaked);
    event SubDAOCreated(uint64 indexed daoId, address indexed creator, uint256 initialSupply);
    event Phase2Activated(address indexed holder, uint256 timestamp);
    event BondingCurveToggled(uint64 indexed daoId, bool active);

 // Errors

    error NotAdmin();
    error InsufficientBalance();
    error InvalidAmount();
    error LabCreditAlreadyExists();
    error LabCreditNotFound();
    error CUREHolderNotFound();
    error SubDAONotFound();

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
    }

        
// ========================================
// Lane 1: Lab Credit Functions
// ========================================
    
        
       
    /**
     * @notice Issue a non-transferable Lab Credit for intellectual property
     * @param ipTitle Title/description of the intellectual property
     */
    function issueLabCredit(string memory ipTitle) external {
        if(labCredits[msg.sender].exists) revert LabCreditAlreadyExists();
        if(bytes(ipTitle).length == 0) revert InvalidAmount();
        
        labCreditsIssued++;
        
        labCredits[msg.sender] = LabCredit({
            creditId: labCreditsIssued,
            inventor: msg.sender,
            ipTitle: ipTitle,
            timestamp: uint64(block.timestamp),
            exists: true
        });
        
        emit LabCreditIssued(labCreditsIssued, msg.sender, ipTitle, uint64(block.timestamp));
    }
    
    
// ========================================
// Lane 2: CURE Token    
// ========================================

        
    /**
     * @notice Acquire CURE tokens for community participation
     * @param amount Amount of CURE tokens to acquire
     */
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



    /**
     * @notice Stake CURE tokens on research proposals
     * @param stakeAmount Amount of CURE tokens to stake
     */
    function stakeCUREOnResearch(uint256 stakeAmount) external {
        if(stakeAmount == 0) revert InvalidAmount();
        
        CUREHolder storage holder = cureHolders[msg.sender];
        if(holder.balance < stakeAmount) revert InsufficientBalance();
        
        holder.balance -= stakeAmount;
        holder.staked += stakeAmount;
        
        emit CUREStaked(msg.sender, stakeAmount, holder.staked);
    }
    
    // ========================================
    // Lane 3: Sub-DAO Functions
    // ========================================
    
    /**
     * @notice Create a disease-specific Sub-DAO with its own token
     * @param initialSupply Initial token supply for the Sub-DAO
     */
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
    
    /**
     * @notice Activate Phase 2 (dynamic pricing) for a CURE holder
     * @param holder Address of the CURE token holder
     */
    function activatePhase2(address holder) external onlyAdmin {
        CUREHolder storage cureHolder = cureHolders[holder];
        if(cureHolder.phase == 0) revert CUREHolderNotFound();
        
        cureHolder.phase = 2;
        emit Phase2Activated(holder, block.timestamp);
    } 


        
    /**
     * @notice Toggle bonding curve status for a Sub-DAO
     * @param daoCreator Address of the Sub-DAO creator
     * @param active New bonding curve status
     */
    function toggleBondingCurve(address daoCreator, bool active) external onlyAdmin {
        SubDAOToken storage subdao = subDAOTokens[daoCreator];
        if(subdao.daoId == 0) revert SubDAONotFound();
        
        subdao.bondingActive = active;
        emit BondingCurveToggled(subdao.daoId, active);
    }

        
    // ========================================
    // View Functions
    // ========================================
    
    /**
     * @notice Get system-wide statistics
     * @return Number of lab credits, total CURE supply, and number of Sub-DAOs
     */
    function getSystemStats() external view returns (uint64, uint256, uint64) {
        return (labCreditsIssued, cureTotalSupply, subdaoCount);
    }

        
    /**
     * @notice Get Lab Credit details for an inventor
     * @param inventor Address of the inventor
     * @return Lab Credit information
     */
    function getLabCredit(address inventor) external view returns (LabCredit memory) {
        if(!labCredits[inventor].exists) revert LabCreditNotFound();
        return labCredits[inventor];
    }

        
    /**
     * @notice Get CURE token balance and staking info for a holder
     * @param holder Address of the CURE holder
     * @return Balance, staked amount, and phase
     */
    function getCUREBalance(address holder) external view returns (uint256, uint256, uint8) {
        CUREHolder memory holderInfo = cureHolders[holder];
        if(holderInfo.phase == 0) revert CUREHolderNotFound();
        return (holderInfo.balance, holderInfo.staked, holderInfo.phase);
    }

    
    /**
     * @notice Get Sub-DAO information
     * @param creator Address of the Sub-DAO creator
     * @return Sub-DAO details
     */
    function getSubDAOInfo(address creator) external view returns (SubDAOToken memory) {
        if(subDAOTokens[creator].daoId == 0) revert SubDAONotFound();
        return subDAOTokens[creator];
    }
}