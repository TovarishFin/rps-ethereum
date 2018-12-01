pragma solidity ^0.4.24;

import "./IRegistry.sol";


contract IRockPaperScissors {

  //
  // start proxy related storage
  //

  address public rpsCore;
  address public rpsManagement;
  bool public initialized;

  //
  // end proxy related storage
  //

  IRegistry public registry;

  //
  // start operating params
  //

  bool public paused;
  uint256 public lastGameId;
  uint256 public minBet;
  uint256 public timeoutInSeconds;
  uint256 public referralFeePerMille;
  uint256 public feePerMille;

  //
  // end operating params
  //

  //
  // start stats
  //

  uint256 public totalPlayCount;
  uint256 public totalWinCount;
  uint256 public totalWinVolume;
  uint256 public totalReferralCount;
  uint256 public totalReferralVolume;

  //
  // end stats
  //

  //
  // start game tracking storage
  //

  mapping(uint256 => Game) public games;
  mapping(address => uint256[]) public activeGamesOf;
  mapping(uint256 => uint256) public activeGameIndex;
  mapping(uint256 => uint256) public timingOutGames;
  mapping(address => address) public referredBy;

  //
  // end game tracking storage
  //

  enum Stage {
    Uninitialized, // 0
    Created, // 1
    Cancelled, // 2
    Ready, // 3
    Committed, // 4
    TimingOut, // 5
    TimedOut, // 6
    Tied, // 7
    WinnerDecided, // 8
    Paid // 9
  }

  enum Choice {
    Undecided,
    Rock,
    Paper,
    Scissors
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

  //
  // start events
  //

  event Pause();

  event Unpause();

  event ProxyUpgraded(
    address upgradedFrom, 
    address upgradedTo
  );

  event StageChanged(
    uint256 indexed gameId,
    uint256 indexed stage
  );

  event ChoiceCommitted(
    uint256 indexed gameId,
    address committer
  );

  event ChoiceRevealed(
    uint256 indexed gameId,
    address committer
  );

  event ReferralSet(
    address indexed referrer,
    address indexed referree
  );

  //
  // end events
  //

  //
  // start internal helper functions
  //

  function removeActiveGameOf(
    address _player,
    uint256 _gameId
  )
    internal;

  function addActiveGameOf(
    address _player,
    uint256 _gameId
  )
    internal;
  
  function enterStage(
    uint256 _gameId,
    Stage _stage
  ) 
    internal;

  function computeWinner(
    uint256 _gameId
  )
    internal;

  function processFee(
    address _feePayer,
    address _tokenAddress,
    uint256 _bet
  )
    internal
    returns (uint256);

  //
  // end internal helper functions
  //

  function initialize(
    address _registryAddress,
    uint256 _minBet,
    uint256 _timeoutInSeconds,
    uint256 _referralFeePerMille,
    uint256 _feePerMille
  )
    external;

  function choiceSecretMatches(
    uint256 _gameId,
    Choice _choice,
    bytes _sig
  )
    public
    view
    returns (bool);

  //
  // start game actions
  //

  function createGame(
    address _referrer,
    address _tokenAddress,
    uint256 _value
  )
    external
    payable;

  function cancelGame(
    uint256 _gameId
  )
    external;

  function joinGame(
    address _referrer,
    uint256 _gameId
  )
    external
    payable;

  function commitChoice(
    uint256 _gameId,
    bytes32 _hash
  )
    external;

  function revealChoice(
    uint256 _gameId,
    Choice _choice,
    bytes _sig
  )
    external;

  //
  // end game actions
  //

  //
  // start owner only functions
  //


  function pause()
    external;

  function unpause()
    external;

  function updateMinBet(
    uint256 _newMinBet
  )
    external;

  function updateTimeout(
    uint256 _newTimeoutInSeconds
  )
    external;

  function updateReferralFeePerMille(
    uint256 _newReferralFeePerMille
  )
    external;

  function updateFeePerMille(
    uint256 _newFeePerMille
  )
    external;

  //
  // end owner only functions
  //

  //
  // start game management functions
  //

  function startGameTimeout(
    uint256 _gameId
  )
    external;

  function timeoutGame(
    uint256 _gameId
  )
    external;

  function settleBet(
    uint256 _gameId
  )
    external;

  //
  // end game management functions
  //
}