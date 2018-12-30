pragma solidity ^0.4.25;


interface IStatistics {
  function totalPlayCount()
    external
    view
    returns (uint256);
  
  function totalWinCount()
    external
    view
    returns (uint256);

  function totalWinVolume()
    external
    view
    returns (uint256);

  function totalReferralCount()
    external
    view
    returns (uint256);

  function totalReferralVolume()
    external
    view
    returns (uint256);

  function initialize(
    address _registry
  )
    external;

  function incrementTotalPlayCount()
    external;

  function incrementTotalWinCount()
    external;

  function incrementTotalWinVolume(
    uint256 _winAmount
  )
    external;

  function incrementTotalReferralCount()
    external;

  function incrementTotalReferralVolume(
    uint256 _incrementAmount
  )
    external;
}