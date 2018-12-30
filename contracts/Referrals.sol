pragma solidity ^0.4.25;

import "./Upgradeable.sol";
import "./interfaces/IRegistry.sol";


contract Referrals is Upgradeable {

  IRegistry public registry;
  mapping(address => address) public referredBy;

  modifier onlyGameContract() {
    require(registry.isGameContract(msg.sender));

    _;
  }

  function initialize(
    address _registry
  )
    external
    initOneTimeOnly
  {
    require(_registry != address(0));

    uint256 _code;
    assembly {
      _code := extcodesize(_registry)
    }
    require(_code > 0);

    registry = IRegistry(_registry);
  }

  function setReferral(
    address _referee,
    address _referrer
  )
    external
    onlyGameContract
  {
    referredBy[_referee] = _referrer;
  }

  function getReferral(
    address _referee
  )
    external
    view
    returns (address)
  {
    return referredBy[_referee];
  }
}