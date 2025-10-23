// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ANTScoring {
    // State Variables 
    address public owner;
    uint256 public proposalCounter;
    uint256 public activeProposalCount;
    uint8 public passingThreshold;

    //Structs
    struct ScientificMeritScores {
        uint8 novelty;
        uint8 biologicalPlausibility;
        uint8 priorEvidence;
    }
    struct FeasibilityScores {
        uint8 technicalViability;
        uint8 dataQuality;
        uint8 clarityOfProtocol;
    }
    struct CommunityAlignmentScores {
        uint8 missionFit;
        uint8 daoEngagement;
    }
    struct ResourceEfficiencyScores {
        uint8 costEffectiveness;
        uint8 agenticResourceUse;  
    }
    struct OpenScienceScores {
        uint8 dataProtocolSharing;
        uint8 collaborativePotential;
    }
    struct ProposalScore {
        ScientificMeritScores scientificMerit;
        FeasibilityScores feasibility;
        CommunityAlignmentScores communityAlignment;
        ResourceEfficiencyScores resourceEfficiency;
        OpenScienceScores openScience;
        uint8 finalScore;
        bool isPassing;
        bool isFulfilled;
        uint64 timestamp;
        uint64 scorerCount;
    }
    struct Proposal{
        uint256 id;
        address submitter;
        string title;
        string description;
        string ipfsHash;
        ProposalScore scores;
        address[] scorers;
        bool isActive;
        uint256 submissionTime;
    }

    //Mappings
    mapping(address => bool) public authorizedScorers;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256[]) public userProposals;

    //Constants
    uint8 public constant SCIENTIFIC_MERIT_WEIGHT = 40;
    uint8 public constant FEASIBILITY_WEIGHT = 25;
    uint8 public constant COMMUNITY_ALIGNMENT_WEIGHT = 20;
    uint8 public constant RESOURCE_EFFICIENCY_WEIGHT = 10;
    uint8 public constant OPEN_SCIENCE_WEIGHT = 5;
    uint8 public constant PASSING_THRESHOLD = 80;
    uint256 public constant MAX_SCORE = 100;

    //Events
    event ProposalSubmitted(
        uint256 indexed proposalId,
        address indexed submitter,
        string title,
        uint256 timestamp
    );

    event ProposalScored(
        uint256 indexed proposalId,
        address indexed scorer,
        uint8 finalScore,
        bool isPassing
    );

    event ProposalFulfilled(
        uint256 indexed proposalId,
        address indexed fulfiller,
        uint256 timestamp
    );

    event ScorerAdded(
        address indexed scorer,
        address indexed addedBy
    );

    event ScorerRemoved(
        address indexed scorer,
        address indexed removedBy
    );

    //Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    modifier onlyAuthorizedScorer(){
        require(authorizedScorers[msg.sender], "Only authorized scorers can call this function");
        _;
    }
     
     //Constructor
    constructor(){
        owner = msg.sender;
        proposalCounter = 0;
        activeProposalCount = 0;
        passingThreshold = PASSING_THRESHOLD;
     }
    
    //External Functions
    function submitProposal(string memory title, string memory description, string memory ipfsHash) external{
        address submitter = msg.sender;
        proposalCounter +=1;
        activeProposalCount +=1;
        uint256 proposalId = proposalCounter;
        ProposalScore memory emptyScores = ProposalScore({
            scientificMerit: ScientificMeritScores({novelty:0, biologicalPlausibility:0, priorEvidence:0}),
            feasibility: FeasibilityScores({technicalViability:0, dataQuality:0, clarityOfProtocol:0}),
            communityAlignment: CommunityAlignmentScores({missionFit:0, daoEngagement:0}),
            resourceEfficiency: ResourceEfficiencyScores({costEffectiveness:0, agenticResourceUse:0}),
            openScience: OpenScienceScores({dataProtocolSharing:0, collaborativePotential:0}),
            finalScore:0,
            isPassing:false,
            isFulfilled:false,  
            timestamp: 0,
            scorerCount:0
        });

        Proposal memory newProposal = Proposal({
            id: proposalId,
            submitter:submitter,
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            scores:emptyScores,
            scorers: new address[](0),
            isActive: true,
            submissionTime: block.timestamp
        });

        proposals[proposalId] = newProposal;
        userProposals[submitter].push(proposalId);
        emit ProposalSubmitted(proposalId, submitter, title, block.timestamp);
    }
    function scoreProposal(
        uint256 proposalId,
        ScientificMeritScores memory scientificMerit,
        FeasibilityScores memory feasibility,
        CommunityAlignmentScores memory communityAlignment,
        ResourceEfficiencyScores memory resourceEfficiency,
        OpenScienceScores memory openScience
    ) external onlyAuthorizedScorer {
        address scorer = msg.sender;
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id !=0, "Proposal not found");

}