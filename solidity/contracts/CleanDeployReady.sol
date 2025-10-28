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
        string diseaseName;
        address creator;
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
    event SubDAOCreated(uint64 indexed daoId, address indexed creator, string diseaseName, uint256 initialSupply);
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

    


  
