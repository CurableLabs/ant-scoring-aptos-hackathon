// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LabBadge - NFT Badge System for Research Contributions
 * @notice Replaces fungible LAB Coins with NFT badges containing embedded credentials
 * @dev Soulbound (non-transferable) NFTs that store contributor credentials and IP attribution
 * @author Curable Labs Team
 */
contract LabBadge is ERC721, Ownable {

     enum BadgeLevel {
        BRONZE,    // 10 points - Basic contribution
        SILVER,    // 50 points - Significant contribution
        GOLD,      // 100 points - Major contribution
        PLATINUM,  // 500 points - Breakthrough contribution
        DIAMOND    // 1000 points - Transformational contribution
    }

     // Mapping from address to array of token IDs they own
    mapping(address => uint256[]) private _contributorBadges;
    
    // ADD THESE NEW MAPPINGS
    // Mapping from token ID to badge tier
    mapping(uint256 => BadgeLevel) private _badgeLevel;
    
    // Mapping to track points value for each tier
    mapping(BadgeLevel => uint256) private _tierPoints;
    

    // State Variables
    uint256 private _tokenIdCounter;
    
    // Mapping from token ID to credential data
    mapping(uint256 => bytes) private _credentials;
    
    
    // Events
    event BadgeMinted(
        uint256 indexed tokenId, 
        address indexed contributor, 
        bytes credentials
    );
    
    event CredentialsUpdated(
        uint256 indexed tokenId, 
        bytes oldCredentials, 
        bytes newCredentials
    );
    
    // Errors
    error BadgeNotFound();
    error NotBadgeOwner();
    error TransferNotAllowed();
    error InvalidCredentials();
    
    /**
     * @dev Constructor sets the NFT name and symbol
     */
    constructor() ERC721("LAB Research Badge", "LAB") Ownable(msg.sender) {
        _tokenIdCounter = 0;

          // Initialize tier points
    _tierPoints[BadgeLevel.BRONZE] = 10;
    _tierPoints[BadgeLevel.SILVER] = 50;
    _tierPoints[BadgeLevel.GOLD] = 100;
    _tierPoints[BadgeLevel.PLATINUM] = 500;
    _tierPoints[BadgeLevel.DIAMOND] = 1000;

    }
    
    /**
     * @notice Mints a new LAB Badge NFT to a contributor
     * @param to Address of the contributor receiving the badge
     * @param credentials (contributor ID, contribution type, timestamp) Encoded
     * @return tokenId The ID of the newly minted badge
     * 
     * @dev Credentials structure (encoded as bytes):
     *      - Contributor identity (address)
     *      - Contribution type (string: "compound_validation", "literature_review", etc.)
     *      - Timestamp (uint256)
     *      - IP attribution (initially empty, updated later)
     */
    function mintBadge(
    address to, 
    bytes memory credentials,
    BadgeLevel level  
) 
    external 
    onlyOwner 
    returns (uint256) 
{
    if(credentials.length == 0) revert InvalidCredentials();
    if(to == address(0)) revert InvalidCredentials();
    
    _tokenIdCounter++;
    uint256 newTokenId = _tokenIdCounter;
    
    // Mint the NFT
    _safeMint(to, newTokenId);
    
    // Store credentials
    _credentials[newTokenId] = credentials;
    
    // Store badge tier (ADD THIS LINE)
    _badgeLevel[newTokenId] = level;
    
    // Track badge for contributor
    _contributorBadges[to].push(newTokenId);
    
    emit BadgeMinted(newTokenId, to, credentials);
    
    return newTokenId;
}
    
    /**
     * @notice Updates the credentials of an existing badge (e.g., adds IP attribution)
     * @param tokenId The ID of the badge to update
     * @param newCredentials Updated credential data including IP attribution
     * 
     * @dev Called when IP is commercialized/licensed to add attribution data
     *      Enables royalty distribution and recognition tracking
     */
    function updateCredentials(uint256 tokenId, bytes memory newCredentials) 
        external 
        onlyOwner 
    {
        if(_ownerOf(tokenId) == address(0)) revert BadgeNotFound();
        if(newCredentials.length == 0) revert InvalidCredentials();
        
        bytes memory oldCredentials = _credentials[tokenId];
        _credentials[tokenId] = newCredentials;
        
        emit CredentialsUpdated(tokenId, oldCredentials, newCredentials);
    }
    
    /**
     * @notice Retrieves the credentials stored in a badge
     * @param tokenId The ID of the badge
     * @return credentials The credential data as bytes
     * 
     * @dev Returns encoded credentials containing:
     *      - Contributor identity
     *      - Contribution type & timestamp
     *      - IP attribution (if IP has been commercialized)
     */
    function getCredentials(uint256 tokenId) 
        external 
        view 
        returns (bytes memory) 
    {
        if(_ownerOf(tokenId) == address(0)) revert BadgeNotFound();
        return _credentials[tokenId];
    }
    
    /**
     * @notice Get all badge IDs owned by a contributor
     * @param contributor Address of the contributor
     * @return Array of token IDs
     */
    function getContributorBadges(address contributor) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return _contributorBadges[contributor];
    }
    
    /**
     * @notice Get the total number of badges minted
     * @return Total supply of badges
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Override transfer functions to make badges SOULBOUND (non-transferable)
     *      Badges are tied to the contributor's identity and cannot be sold or transferred
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) and burning (to == address(0))
        // Block all transfers between addresses
        if (from != address(0) && to != address(0)) {
            revert TransferNotAllowed();
        }
        
        return super._update(to, tokenId, auth);
    }

        /**
     * @notice Get the tier level of a badge
     * @param tokenId The badge token ID
     * @return The badge tier (BRONZE, SILVER, GOLD, PLATINUM, DIAMOND)
     */
    function getBadgeLevel(uint256 tokenId) 
        external 
        view 
        returns (BadgeLevel) 
    {
        if(_ownerOf(tokenId) == address(0)) revert BadgeNotFound();
        return _badgeLevel[tokenId];
    }
    
    /**
     * @notice Get the point value of a badge tier
     * @param level The badge tier
     * @return The points for that tier
     */
    function getTierPoints(BadgeLevel level) 
        external 
        view 
        returns (uint256) 
    {
        return _tierPoints[level];
    }
    
    /**
     * @notice Get total points for a contributor based on all their badges
     * @param contributor The contributor's address
     * @return Total reputation points
     */
    function getContributorPoints(address contributor) 
        external 
        view 
        returns (uint256) 
    {
        uint256[] memory badges = _contributorBadges[contributor];
        uint256 totalPoints = 0;
        
        for (uint i = 0; i < badges.length; i++) {
            totalPoints += _tierPoints[_badgeLevel[badges[i]]];
        }
        
        return totalPoints;
    }
    
    /**
     * @notice Get badge count by tier for a contributor
     * @param contributor The contributor's address
     * @param level The tier to count
     * @return Number of badges at that tier
     */
    function getBadgeCountByTier(address contributor, BadgeLevel level) 
        external 
        view 
        returns (uint256) 
    {
        uint256[] memory badges = _contributorBadges[contributor];
        uint256 count = 0;
        
        for (uint i = 0; i < badges.length; i++) {
            if (_badgeLevel[badges[i]] == level) {
                count++;
            }
        }
        
        return count;
    }
    
    /**
     * @notice Check if a token exists
     * @param tokenId The token ID to check
     * @return bool True if the token exists
     */
    function exists(uint256 tokenId) external view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}

