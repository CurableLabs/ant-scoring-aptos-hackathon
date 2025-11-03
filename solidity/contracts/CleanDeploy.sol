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
}


