pragma solidity ^0.4.25;

// interfaces
import "./interfaces/IRegistry.sol";
import "./interfaces/IWrappedEther.sol";
// libraries
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

contract Bank {
  using SafeMath for uint256;

  IRegistry public registry;
  IWrappedEther public weth;

  mapping(address => address[]) public tokenUsageOf;
  // userAddress => tokenAddress => value
  mapping(address => mapping(address => uint256)) public tokenUsageIndex;
  mapping(address => mapping(address => uint256)) public tokenBalanceOf;
  mapping(address => mapping(address => uint256)) public allocatedTokensOf;

  event FundsDeposited(
    address indexed depositer,
    address tokenAddress,
    uint256 value
  );

  event FundsAllocated(
    address indexed fundsOwner,
    address tokenAddress,
    uint256 value
  );

  event FundsDeAllocated(
    address indexed fundsOwner,
    address tokenAddress,
    uint256 value
  );

  event FundsTransferred(
    address indexed from,
    address indexed to,
    address tokenAddress,
    uint256 value
  );

  event FundsWithdrawn(
    address indexed fundsOwner,
    address tokenAddress,
    uint256 value
  );

  modifier onlyRps() {
    require(msg.sender == registry.getEntry("RockPaperScissors"));

    _;
  }

  function updateTokenUsage(
    address _fundsOwner,
    address _tokenAddress
  )
    private
  {
    bool _currentlyUsing = tokenBalanceOf[_fundsOwner][_tokenAddress] != 0
      || allocatedTokensOf[_fundsOwner][_tokenAddress] != 0;

    bool _usageTracked = tokenUsageIndex[_fundsOwner][_tokenAddress] != 0;

    if (_currentlyUsing && !_usageTracked) {
      tokenUsageIndex[_fundsOwner][_tokenAddress] = tokenUsageOf[_fundsOwner].length;
      tokenUsageOf[_fundsOwner].push(_tokenAddress);
    }

    if (!_currentlyUsing && _usageTracked) {
      uint256 _index = tokenUsageIndex[_fundsOwner][_tokenAddress];
      tokenUsageOf[_fundsOwner][_index] = tokenUsageOf[_fundsOwner][tokenUsageOf[_fundsOwner].length - 1];
      tokenUsageOf[_fundsOwner].length--;

      tokenUsageIndex[_fundsOwner][_tokenAddress] = 0;
    }
  }

  function isContract(
    address _address
  )
    private
    view
    returns (bool)
  {
    uint256 _size;
    assembly { _size := extcodesize(_address) }
    return _size > 0;
  }

  constructor(
    address _registryAddress,
    address _wethAddress
  )
    public
  {
    require(isContract(_registryAddress));
    require(isContract(_wethAddress));
    weth = IWrappedEther(_wethAddress);
    registry = IRegistry(_registryAddress);
  }

  function depositEtherFor(
    address _recipient
  )
    public
    payable
  {
    require(msg.value > 0);
    weth.deposit.value(msg.value)();
    tokenBalanceOf[_recipient][address(weth)] = tokenBalanceOf[_recipient][address(weth)]
      .add(msg.value);

    emit FundsDeposited(_recipient, address(weth), msg.value);
  }

  function depositEther()
    external
    payable
  {
    depositEtherFor(msg.sender);
  }

  function withdrawEther(
    uint256 _value
  )
    external
  {
    require(_value > 0);
    tokenBalanceOf[msg.sender][address(weth)] = tokenBalanceOf[msg.sender][address(weth)]
      .sub(_value);
    weth.withdraw(_value);
    msg.sender.transfer(_value);

    emit FundsWithdrawn(msg.sender, address(weth), _value);
  }

  function depositTokens(
    address _tokenAddress,
    uint256 _value
  )
    external
  {
    require(_value > 0);

    tokenBalanceOf[msg.sender][_tokenAddress] = tokenBalanceOf[msg.sender][_tokenAddress]
      .add(_value);
    IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _value);

    updateTokenUsage(msg.sender, _tokenAddress);
    
    emit FundsDeposited(msg.sender, _tokenAddress, _value);
  }

  function withdrawTokens(
    address _tokenAddress,
    uint256 _value
  )
    external
  {
    require(_value > 0);

    tokenBalanceOf[msg.sender][_tokenAddress] = tokenBalanceOf[msg.sender][_tokenAddress]
      .sub(_value);
    IERC20(_tokenAddress).transfer(msg.sender, _value);

    emit FundsWithdrawn(msg.sender, _tokenAddress, _value);
  }

  function allocateTokensOf(
    address _fundsOwner,
    address _tokenAddress,
    uint256 _value
  )
    external
    onlyRps
  {
    tokenBalanceOf[_fundsOwner][_tokenAddress] = tokenBalanceOf[_fundsOwner][_tokenAddress]
      .sub(_value);
    allocatedTokensOf[_fundsOwner][_tokenAddress] = allocatedTokensOf[_fundsOwner][_tokenAddress]
      .add(_value);

    emit FundsAllocated(_fundsOwner, _tokenAddress, _value);
  }

  function deAllocateTokensOf(
    address _fundsOwner,
    address _tokenAddress,
    uint256 _value
  )
    external
    onlyRps
  {
    allocatedTokensOf[_fundsOwner][_tokenAddress] = allocatedTokensOf[_fundsOwner][_tokenAddress]
      .sub(_value);
    tokenBalanceOf[_fundsOwner][_tokenAddress] = tokenBalanceOf[_fundsOwner][_tokenAddress]
      .add(_value);

    emit FundsDeAllocated(_fundsOwner, _tokenAddress, _value);
  }

  function transferAllocatedTokensOf(
    address _fundsOwner,
    address _tokenAddress,
    address _recipient,
    uint256 _value
  )
    external
    onlyRps
  {
    allocatedTokensOf[_fundsOwner][_tokenAddress] = allocatedTokensOf[_fundsOwner][_tokenAddress]
      .sub(_value);
    tokenBalanceOf[_recipient][_tokenAddress] = tokenBalanceOf[_recipient][_tokenAddress]
      .add(_value);

    updateTokenUsage(_fundsOwner, _tokenAddress);

    emit FundsTransferred(_fundsOwner, _recipient, _tokenAddress, _value);
  }

  function()
    external
    payable
  {
    if (msg.sender != address(weth)) {
      depositEtherFor(msg.sender);
    }
  }
}