pragma solidity ^0.4.25;

import "./Upgradeable.sol";
import "./interfaces/IRegistry.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract Statistics is Upgradeable {
  using SafeMath for uint256;

  IRegistry public registry;

  uint256 public totalPlayCount;
  uint256 public totalWinCount;
  uint256 public totalWinVolume;
  uint256 public totalReferralCount;
  uint256 public totalReferralVolume;

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

  function incrementTotalPlayCount()
    external
    onlyGameContract
  {
    totalPlayCount = totalPlayCount.add(1);
  }

  function incrementTotalWinCount()
    external
    onlyGameContract
  {
    totalWinCount = totalWinCount.add(1);
  }

  function incrementTotalWinVolume(
    uint256 _winAmount
  )
    external
    onlyGameContract
  {
    totalWinVolume = totalWinVolume.add(_winAmount);
  }

  function incrementTotalReferralCount()
    external
    onlyGameContract
  {
    totalReferralCount = totalReferralCount.add(1);
  }

  function incrementTotalReferralVolume(
    uint256 _incrementAmount
  )
    external
    onlyGameContract
  {
    totalReferralVolume = totalReferralVolume.add(_incrementAmount);
  }
}