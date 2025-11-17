// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CUREToken - ERC20 Token for Drug Discovery Research
 * @notice CURE token powers the tri-lane tokenomics ecosystem
 * @dev Standard ERC20 with minting capabilities for ecosystem integration
 * 
 * @author Curable Labs Team
 */
contract CUREToken {
    
    // Token Metadata
    string public constant name = "CURE Token";
    string public constant symbol = "CURE";
    uint8 public constant decimals = 18;
    
    // State Variables
    uint256 public totalSupply;
    address public owner;
    bool public paused;
    
    // Mappings
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Events (ERC20 Standard)
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    event Paused(address indexed by);
    event Unpaused(address indexed by);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // Custom Errors
    error InsufficientBalance();
    error InsufficientAllowance();
    error InvalidAddress();
    error InvalidAmount();
    error NotOwner();
    error ContractPaused();
    
    // Modifiers
    modifier onlyOwner() {
        if(msg.sender != owner) revert NotOwner();
        _;
    }
    
    modifier whenNotPaused() {
        if(paused) revert ContractPaused();
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
        paused = false;
        
        // Mint initial supply to deployer (10 million CURE)
        uint256 initialSupply = 10_000_000 * 10**decimals;
        _mint(msg.sender, initialSupply);
    }
    
    // ========================================
    // ERC20 CORE FUNCTIONS
    // ========================================
    
    function transfer(address to, uint256 amount) external whenNotPaused returns (bool) {
        if(to == address(0)) revert InvalidAddress();
        if(amount == 0) revert InvalidAmount();
        if(balanceOf[msg.sender] < amount) revert InsufficientBalance();
        
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        if(spender == address(0)) revert InvalidAddress();
        
        allowance[msg.sender][spender] = amount;
        
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external whenNotPaused returns (bool) {
        if(from == address(0) || to == address(0)) revert InvalidAddress();
        if(amount == 0) revert InvalidAmount();
        if(balanceOf[from] < amount) revert InsufficientBalance();
        if(allowance[from][msg.sender] < amount) revert InsufficientAllowance();
        
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    // ========================================
    // MINTING & BURNING
    // ========================================
    
    function mint(address to, uint256 amount) external onlyOwner {
        if(to == address(0)) revert InvalidAddress();
        if(amount == 0) revert InvalidAmount();
        
        _mint(to, amount);
    }
    
    function burn(uint256 amount) external {
        if(amount == 0) revert InvalidAmount();
        if(balanceOf[msg.sender] < amount) revert InsufficientBalance();
        
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        
        emit Burn(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }
    
    function burnFrom(address from, uint256 amount) external {
        if(from == address(0)) revert InvalidAddress();
        if(amount == 0) revert InvalidAmount();
        if(balanceOf[from] < amount) revert InsufficientBalance();
        if(allowance[from][msg.sender] < amount) revert InsufficientAllowance();
        
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        totalSupply -= amount;
        
        emit Burn(from, amount);
        emit Transfer(from, address(0), amount);
    }
    
    // ========================================
    // ADMIN FUNCTIONS
    // ========================================
    
    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }
    
    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        if(newOwner == address(0)) revert InvalidAddress();
        
        address oldOwner = owner;
        owner = newOwner;
        
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    // ========================================
    // INTERNAL FUNCTIONS
    // ========================================
    
    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balanceOf[to] += amount;
        
        emit Mint(to, amount);
        emit Transfer(address(0), to, amount);
    }
    
    // ========================================
    // VIEW FUNCTIONS
    // ========================================
    
    function getAllowance(address tokenOwner, address spender) external view returns (uint256) {
        return allowance[tokenOwner][spender];
    }
    
    function getBalance(address account) external view returns (uint256) {
        return balanceOf[account];
    }
}
