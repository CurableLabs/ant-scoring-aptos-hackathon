// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TriLaneSystem{
    //Structs
    //Lab Credit - Non-transferable IP proof  
    struct LabCredit{
        uint256 creditId;
        address inventor;
        string ipTitle;
        uint256 timestamp;
    }

    //CURE Token holder info
    struct CUREHolder{
        uint256 balance;
        uint256 staked;
        uint8 phase; // 1 = fixed, 2 = dynamic
    }

    //Sub-DAO token
    struct SubDAOToken{
        uint256 daoId;
        uint256 tokenSupply;
        bool bondingActive;
    }
    
    //State Variables
    uint256 public labCreditCounter;
    uint256 public cureTotalSupply;
    uint256 public subdaoCounter;
    address public admin;

    //Mappings
    //Lab Credit mappings - multiple credits per inventor
    mapping(uint256 => LabCredit) public labCredits;
    mapping(address => uint256[]) public inventorCredits;
    
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
    event LabCreditIssued(uint256 indexed creditId, address indexed inventor, string ipTitle, uint256 timestamp);
    event CURETokensAcquired(address indexed holder, uint256 amount, uint256 timestamp);
    event CURETokensStaked(address indexed staker, uint256 amount, uint256 timestamp);
    event SubDAOCreated(address indexed creator,uint256 indexed daoId, uint256 tokenSupply, bool bondingActive);
    event Phase2Activated(address indexed holder, uint256 timestamp);
    event BondingCurveToggled(uint256 indexed daoId, bool bondingActive);

    //Modifiers
    modifier onlyOwner() {
        require(msg.sender == admin, E_NOT_ADMIN);
        _;
    }

    //Constructor
    constructor(){
     admin = msg.sender;
     labCreditCounter = 0;
     cureTotalSupply = 0;
     subdaoCounter = 0;
    }

    // External Functions
    // Function to Issue Lab Credit (Lane 1)
    function issueLabCredit(string memory ipTitle) external {
        require(msg.sender != address(0), "Invalid inventor address");
        labCreditCounter += 1;
        labCredits[labCreditCounter] = LabCredit({
            creditId: labCreditCounter,
            inventor: msg.sender,
            ipTitle: ipTitle,
            timestamp: block.timestamp
        });
        inventorCredits[msg.sender].push(labCreditCounter);
        emit LabCreditIssued(labCreditCounter, msg.sender, ipTitle, block.timestamp);
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
        emit CURETokensStaked(msg.sender, amount, block.timestamp);
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

    //Public View Functions
    //Function to get system stats
    function getSystemStats() external view returns (uint256, uint256, uint256){
        return(labCreditCounter, cureTotalSupply, subdaoCounter);
    }

    //Function to get lab credit info
    function getLabCredit(uint256 creditId) external view returns (uint256, address, string memory, uint256){
        return(labCredits[creditId].creditId, labCredits[creditId].inventor, labCredits[creditId].ipTitle, labCredits[creditId].timestamp);
    }

    //Function to get cure holder info
    function getCUREHolder(address holder) external view returns (uint256, uint256, uint8){
        return(cureHolders[holder].balance, cureHolders[holder].staked, cureHolders[holder].phase);
    }

    //Function to get subdao info
    function getSubDAO(uint256 daoId) external view returns (uint256, uint256, bool){
        return(subdaoTokens[daoId].daoId, subdaoTokens[daoId].tokenSupply, subdaoTokens[daoId].bondingActive);
    }

}


