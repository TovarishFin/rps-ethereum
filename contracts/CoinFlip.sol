pragma solidity ^0.4.25;

import "./Upgradeable.sol";


contract CoinFlip is Upgradeable {

  mapping(uint256 => Game) public games;
  uint256[] public openGames;
  mapping(uint256 => uint256) public openGameIndex;
  mapping(address => uint256[]) public activeGamesOf;
  mapping(uint256 => uint256) public activeGameOfIndex;
  mapping(uint256 => uint256) public timingOutGames;
  mapping(address => address) public referredBy;

  enum Choice {
    Undecided,
    Heads,
    Tails
  }

  enum Stage {
    Uninitialized
  }

  struct Game {
    address addressP1;
    address addressP2;
    address winner;
    address tokenAddress;
    uint256 bet;
    Choice choiceP1;
    Choice choiceP2;
    bytes32 choiceSecretP1;
    bytes32 choiceSecretP2;
    Stage stage;
  }

  function initialize()
    external
    initOneTimeOnly
  {}

  
}