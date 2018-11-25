pragma solidity ^0.4.24;

// contracts
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract Upgradeable is Ownable {

  // location of code to use for delegatecalls
  address public rpsCore;
  address public rpsManagement;

  // keeps track of whether a proxy has been initialized
  bool public initialized;

  // event notifying that an upgrade has taken place
  event ProxyUpgraded(
    address upgradedFrom, 
    address upgradedTo
  );

  modifier initOneTimeOnly() {
    require(msg.sender == owner());
    require(!initialized);
    initialized = true;

    _;
  }

  // ensures that address has code/is contract
  function isContract(
    address _address
  )
    internal
    view
    returns (bool)
  {
    uint256 _size;
    assembly { _size := extcodesize(_address) }
    return _size > 0;
  }

  function upgradeRockPaperScissorsCore(
    address _rpsCore
  )
    public
    onlyOwner
    returns (bool)
  {
    require(_rpsCore != address(0));
    require(rpsCore != _rpsCore);
    require(isContract(_rpsCore));

    address _oldRpsCore = rpsCore;
    rpsCore = _rpsCore;

    emit ProxyUpgraded(
      _oldRpsCore, 
      _rpsCore
    );
  
    return true;
  }

  function upgradeRockPaperScissorsManagement(
    address _rpsManagement
  )
    public
    onlyOwner
    returns (bool)
  {
    require(_rpsManagement != address(0));
    require(rpsManagement != _rpsManagement);
    require(isContract(_rpsManagement));

    address _oldRpsManagement = rpsManagement;
    rpsManagement = _rpsManagement;

    emit ProxyUpgraded(
      _oldRpsManagement, 
      _rpsManagement
    );
  
    return true;
  }
}