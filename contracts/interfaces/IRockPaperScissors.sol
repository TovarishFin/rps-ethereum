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
  // start game tracking storage
  //

  mapping(uint256 => Game) public games;
  uint256[] public openGames;
  mapping(uint256 => uint256) public openGameIndex;
  mapping(address => uint256[]) public activeGamesOf;
  mapping(uint256 => uint256) public activeGameOfIndex;
  mapping(uint256 => uint256) public timingOutGames;

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

  event ProxyUpgraded(
    address upgradedFrom, 
    address upgradedTo
  );

  event Paused();

  event Unpaused();

  event StageChanged(
    uint256 indexed gameId,
    uint256 indexed stage
  );

  event GameCreated(
    uint256 indexed gameId,
    address indexed creator
  );

  event GameCancelled(
    uint256 indexed gameId,
    address indexed cancellor
  );

  event GameJoined(
    uint256 indexed gameId,
    address indexed creator,
    address indexed joiner
  );

  event ChoiceCommitted(
    uint256 indexed gameId,
    address committer
  );

  event ChoiceRevealed(
    uint256 indexed gameId,
    address revealer
  );

  event TimeoutStarted(
    uint256 indexed gameId,
    address indexed initiator,
    address indexed delayer
  );

  event TimedOut(
    uint256 indexed gameId,
    address indexed winner,
    address indexed loser
  );

  event Tied(
    uint256 indexed gameId,
    address indexed player1,
    address indexed player2
  );

  event WinnerDecided(
    uint256 indexed gameId,
    address indexed winner,
    address indexed loser
  );

  event BetSettled(
    uint256 indexed gameId,
    address indexed settler,
    uint256 winnings
  );

  event ReferralSet(
    address indexed referrer,
    address indexed referree
  );

  event ReferralPaid(
    address indexed tokenAddress,
    address referred,
    address indexed referrer,
    uint256 value
  );

  event MinBetUpdated(
    uint256 oldMinBet,
    uint256 newMinBet
  );

  event TimeoutUpdated(
    uint256 oldTimeout,
    uint256 newTimeout
  );

  event ReferralFeeUpdated(
    uint256 oldReferralFee,
    uint256 newReferralFee
  );

  event FeeUpdated(
    uint256 oldFee,
    uint256 newFee
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

  function choiceSecretMatches(
    uint256 _gameId,
    Choice _choice,
    bytes _sig
  )
    internal
    view
    returns (bool);

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


  function allOpenGames()
    external
    view
    returns (uint256[]);

  function openGamesLength()
    external
    view
    returns (uint256);

  function allActiveGamesOf(
    address _address
  )
    external
    view
    returns (uint256[]);

  function allActiveGamesOfLength(
    address _address
  )
    external
    view
    returns (uint256);

  function gameHasTimedOut(
    uint256 _gameId
  )
    external
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