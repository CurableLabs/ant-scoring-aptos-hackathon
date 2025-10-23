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

    //Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
     //Todo: Add more modifiers as needed
}