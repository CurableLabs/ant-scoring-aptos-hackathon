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
    //ANT Scoring weights (multiplied by 100 for precision)
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
         bool hasScored = false;
         for(uint256 i = 0; i < proposal.scorers.length; i++){
            if (proposal.scorers[i] == scorer){
                hasScored = true;
                break;
            }
        }

        require(!hasScored, "Scorer has already scored proposal");
        //Validate Scores
        //Scientific Merit Scores
        require(scientificMerit.novelty <= MAX_SCORE, "Novelty score must be less than or equal to 100");
        require(scientificMerit.biologicalPlausibility <= MAX_SCORE, "Biological plausibility score must be less than or equal to 100");
        require(scientificMerit.priorEvidence <= MAX_SCORE, "Prior evidence score must be less than or equal to 100");
       
        //Feasibility Scores
        require(feasibility.technicalViability <= MAX_SCORE, "Technical viability score must be less than or equal to 100");
        require(feasibility.dataQuality <= MAX_SCORE, "Data quality score must be less than or equal to 100");
        require(feasibility.clarityOfProtocol <= MAX_SCORE, "Clarity of protocol score must be less than or equal to 100");
        
        //Community Alignment Scores
        require(communityAlignment.missionFit <= MAX_SCORE, "Mission fit score must be less than or equal to 100");
        require(communityAlignment.daoEngagement <= MAX_SCORE, "DAO engagement score must be less than or equal to 100");
       
        // Resource Efficiency Scores   
        require(resourceEfficiency.costEffectiveness <= MAX_SCORE, "Cost effectiveness score must be less than or equal to 100");
        require(resourceEfficiency.agenticResourceUse <= MAX_SCORE, "Agentic resource use score must be less than or equal to 100");
      
        //Open Science Scores
        require(openScience.dataProtocolSharing <= MAX_SCORE, "Data protocol sharing score must be less than or equal to 100");
        require(openScience.collaborativePotential <= MAX_SCORE, "Collaborative potential score must be less than or equal to 100");
        
         //Calculate Final weighted scores
         uint8 finalScore = calculateFinalScore(
            scientificMerit,
            feasibility,
            communityAlignment,
            resourceEfficiency,
            openScience
        );

        //Average scores with existing scores
        proposal.scores = averageScores(
            proposal.scores,
            scientificMerit,
            feasibility,
            communityAlignment,
            resourceEfficiency,
            openScience,
            finalScore
        );

        proposal.scores.isPassing = finalScore >= PASSING_THRESHOLD;
        proposal.scorers.push(scorer);
        emit ProposalScored(proposalId, scorer, finalScore, proposal.scores.isPassing);
    } 

    function fulfillProposal(uint256 proposalId) external{
        address fulfiller = msg.sender;
        Proposal storage proposal = proposals[proposalId];
        require(msg.sender == proposal.submitter, "Only submitter can fulfill proposal");
        require(proposal.id !=0, "Proposal not found");
        require(proposal.scores.isPassing, "Proposal not passed the threshold");
        require(!proposal.scores.isFulfilled, "Proposal already fulfilled");
        proposal.scores.isFulfilled = true;
        activeProposalCount -=1;
        emit ProposalFulfilled(proposalId, fulfiller, block.timestamp);
    }

    function addAuthorizedScorer(address newScorer) external onlyOwner{
        require (newScorer != address(0), "Invalid scorer address");
        require(!authorizedScorers[newScorer],"Scorer already authorized");
        authorizedScorers[newScorer] = true;
        emit ScorerAdded(newScorer, msg.sender);
    }
    function removeAuthorizedScorer(address scorer) external onlyOwner{
        require(scorer != address(0), "Invalid scorer address");
        if(authorizedScorers[scorer]){
            authorizedScorers[scorer] = false;
        }
        emit ScorerRemoved(scorer, msg.sender); 
    }
    
    //View Functions
    function getSystemInfo() external view returns (
        address,
        uint256,
        uint256,
        uint8
    ){
        return(owner, proposalCounter, activeProposalCount, passingThreshold);
    }

    function getProposalInfo(uint256 proposalId) external view returns (
        uint256,
        string memory,
        string memory,
        string memory,
        uint8,
        bool,
        bool,
        uint64
    ){
        Proposal storage proposal = proposals[proposalId];
        return(proposal.id, proposal.title, proposal.description, proposal.ipfsHash, proposal.scores.finalScore, proposal.scores.isPassing, proposal.scores.isFulfilled, proposal.scores.scorerCount);
    }
    function isAuthorizedScorer(address scorer) external view returns (bool){
        return authorizedScorers[scorer];
    }

    //Helper Functions 
    //Calculate final score of proposal  
    function calculateFinalScore(
        ScientificMeritScores memory scientificMerit,
        FeasibilityScores memory feasibility,
        CommunityAlignmentScores memory communityAlignment,
        ResourceEfficiencyScores memory resourceEfficiency,
        OpenScienceScores memory openScience
    ) internal pure returns (uint8) {
       uint8 scientificMeritAvg = uint8((uint256(scientificMerit.novelty) + scientificMerit.biologicalPlausibility + scientificMerit.priorEvidence) / 3);
       uint8 feasibilityAvg = uint8((uint256(feasibility.technicalViability) + feasibility.dataQuality + feasibility.clarityOfProtocol) / 3);
       uint8 communityAlignmentAvg = uint8((uint256(communityAlignment.missionFit) + communityAlignment.daoEngagement) / 2);
       uint8 resourceEfficiencyAvg = uint8((uint256(resourceEfficiency.costEffectiveness) + resourceEfficiency.agenticResourceUse) / 2);
       uint8 openScienceAvg = uint8((uint256(openScience.dataProtocolSharing) + openScience.collaborativePotential) / 2);

       uint256 weightedFinal = (uint256(scientificMeritAvg) * SCIENTIFIC_MERIT_WEIGHT + uint256(feasibilityAvg) * FEASIBILITY_WEIGHT + uint256(communityAlignmentAvg) * COMMUNITY_ALIGNMENT_WEIGHT + uint256(resourceEfficiencyAvg) * RESOURCE_EFFICIENCY_WEIGHT + uint256(openScienceAvg) * OPEN_SCIENCE_WEIGHT);
       uint8 finalScore = uint8(weightedFinal / 100);
       return finalScore;
    }

    //Calculate average scores of the proposal
    function averageScores(
        ProposalScore memory existingScores,
        ScientificMeritScores memory newScientificMerit,
        FeasibilityScores memory newFeasibility,
        CommunityAlignmentScores memory newCommunityAlignment,
        ResourceEfficiencyScores memory newResourceEfficiency,
        OpenScienceScores memory newOpenScience,
        uint8 newFinalScore
    ) internal view returns (ProposalScore memory) {
      uint64 currentCount = existingScores.scorerCount;
      uint64 newCount = currentCount + 1;
      ScientificMeritScores memory avgScientificMerit =  ScientificMeritScores({
        novelty: uint8((uint256(existingScores.scientificMerit.novelty) * currentCount + newScientificMerit.novelty) / newCount),
        biologicalPlausibility: uint8((uint256(existingScores.scientificMerit.biologicalPlausibility) * currentCount + newScientificMerit.biologicalPlausibility) / newCount),
        priorEvidence: uint8((uint256(existingScores.scientificMerit.priorEvidence) * currentCount + newScientificMerit.priorEvidence) / newCount)
      });
      FeasibilityScores memory avgFeasibility = FeasibilityScores({
        technicalViability: uint8((uint256(existingScores.feasibility.technicalViability) * currentCount + newFeasibility.technicalViability) / newCount),
        dataQuality: uint8((uint256(existingScores.feasibility.dataQuality) * currentCount + newFeasibility.dataQuality) / newCount),
        clarityOfProtocol: uint8((uint256(existingScores.feasibility.clarityOfProtocol) * currentCount + newFeasibility.clarityOfProtocol) / newCount)
      });
      CommunityAlignmentScores memory avgCommunityAlignment = CommunityAlignmentScores({
        missionFit: uint8((uint256(existingScores.communityAlignment.missionFit) * currentCount + newCommunityAlignment.missionFit) / newCount),
        daoEngagement: uint8((uint256(existingScores.communityAlignment.daoEngagement) * currentCount + newCommunityAlignment.daoEngagement) / newCount)
      });
      ResourceEfficiencyScores memory avgResourceEfficiency = ResourceEfficiencyScores({
        costEffectiveness: uint8((uint256(existingScores.resourceEfficiency.costEffectiveness) * currentCount + newResourceEfficiency.costEffectiveness) / newCount),
        agenticResourceUse: uint8((uint256(existingScores.resourceEfficiency.agenticResourceUse) * currentCount + newResourceEfficiency.agenticResourceUse) / newCount)
      });
      OpenScienceScores memory avgOpenScience = OpenScienceScores({
        dataProtocolSharing: uint8((uint256(existingScores.openScience.dataProtocolSharing) * currentCount + newOpenScience.dataProtocolSharing) / newCount),
        collaborativePotential: uint8((uint256(existingScores.openScience.collaborativePotential) * currentCount + newOpenScience.collaborativePotential) / newCount)
      });
      uint8 avgFinalScore = uint8((uint256(existingScores.finalScore) * currentCount + newFinalScore) / newCount);
      
      return ProposalScore({
        scientificMerit: avgScientificMerit,
        feasibility: avgFeasibility,
        communityAlignment: avgCommunityAlignment,
        resourceEfficiency: avgResourceEfficiency,
        openScience: avgOpenScience,
        finalScore: avgFinalScore,
        scorerCount: newCount,
        timestamp: uint64(block.timestamp),
        isPassing: false,
        isFulfilled: existingScores.isFulfilled
      });
    }
}
