pragma solidity ^0.4.25;

// interfaces
import "./interfaces/IRegistry.sol";
import "./interfaces/IBank.sol";
import "./interfaces/IStatistics.sol";
import "./interfaces/IReferrals.sol";
// libraries
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
// contracts
import "./Upgradeable.sol";


contract RockPaperScissorsCommon is Upgradeable {
  using SafeMath for uint256;

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
  // start modifiers
  //

  modifier whenNotPaused() {
    require(!paused);
    _;
  }

  modifier whenPaused() {
    require(paused);
    _;
  }

  modifier atStage(
    uint256 _gameId,
    Stage _stage
  ) {
    require(games[_gameId].stage == _stage);

    _;
  }

  modifier atEitherStage(
    uint256 _gameId,
    Stage _stage,
    Stage _orStage
  ) {
    require(games[_gameId].stage == _stage || games[_gameId].stage == _orStage);

    _;
  }

  modifier timeoutAllowed(
    uint256 _gameId
  ) {
    Game memory _game = games[_gameId];

    if (_game.stage == Stage.Ready) {
      require(_game.choiceSecretP1 == bytes32(0) || _game.choiceSecretP2 == bytes32(0));
      require(_game.choiceSecretP1 != bytes32(0) || _game.choiceSecretP2 != bytes32(0));
    } 
    
    if (_game.stage == Stage.Committed) {
      require(_game.choiceP1 == Choice.Undecided || _game.choiceP2 == Choice.Undecided);
      require(_game.choiceP1 != Choice.Undecided || _game.choiceP2 != Choice.Undecided);
    }

    _;
  }

  modifier onlyGameParticipant(
    uint256 _gameId
  ) {
    Game memory _game = games[_gameId];
    require(msg.sender == _game.addressP1 || msg.sender == _game.addressP2);

    _;
  }

  //
  // end modifiers
  //

  //
  // start internal helper functions
  //

  function getBank()
    internal
    view
    returns (IBank)
  {
    return IBank(registry.getEntry("Bank"));
  }

  function getStatistics()
    internal
    view
    returns (IStatistics)
  {
    return IStatistics(registry.getEntry("Statistics"));
  }

  function getReferrals()
    internal
    view
    returns (IReferrals)
  {
    return IReferrals(registry.getEntry("Referrals"));
  }

  function removeActiveGameOf(
    address _player,
    uint256 _gameId
  )
    internal
  {
    require(activeGamesOf[_player].length > 0);
    uint256 _index = activeGameOfIndex[_gameId];

    activeGamesOf[_player][_index] = activeGamesOf[_player][activeGamesOf[_player].length - 1];

    activeGamesOf[_player].length--;
  }

  function addActiveGameOf(
    address _player,
    uint256 _gameId
  )
    internal
  {
    activeGamesOf[_player].push(_gameId);
  }
  
  function enterStage(
    uint256 _gameId,
    Stage _newStage
  ) 
    internal
  {
    Stage _oldStage = games[_gameId].stage;

    // add gameId to openGames if newly created
    if (_oldStage == Stage.Uninitialized && _newStage == Stage.Created) {
      openGames.push(_gameId);
    }

    // remove gameId from openGames if leaving created status (someone joins/cancels)
    if (_oldStage == Stage.Created && _newStage != Stage.Created) {
      uint256 _operatingIndex = openGameIndex[_gameId];
      uint256 _replacingGameId = openGames[openGames.length.sub(1)];
      openGames[_operatingIndex] = _replacingGameId;
      openGames.length = openGames.length.sub(1);
      openGameIndex[_replacingGameId] = _operatingIndex;
    }

    games[_gameId].stage = _newStage;

    emit StageChanged(_gameId, uint256(_newStage));
  }

  function computeWinner(
    uint256 _gameId
  )
    internal
  {
    Game storage _game = games[_gameId];
    Choice _c1 = _game.choiceP1;
    Choice _c2 = _game.choiceP2;
    address _a1 = _game.addressP1;
    address _a2 = _game.addressP2;

    if (_c1 == _c2) {
      enterStage(_gameId, Stage.Tied);

      emit Tied(_gameId, _a1, _a2);

      return;
    } else if (_c1 == Choice.Rock && _c2 == Choice.Paper) {
      _game.winner = _a2;
    } else if (_c1 == Choice.Rock && _c2 == Choice.Scissors) {
      _game.winner = _a1;
    } else if (_c1 == Choice.Paper && _c2 == Choice.Rock) {
      _game.winner = _a1;
    } else if (_c1 == Choice.Paper && _c2 == Choice.Scissors) {
      _game.winner = _a2;
    } else if (_c1 == Choice.Scissors && _c2 == Choice.Rock) {
      _game.winner = _a2;
    } else if (_c1 == Choice.Scissors && _c2 == Choice.Paper) {
      _game.winner = _a1;
    }

    enterStage(_gameId, Stage.WinnerDecided);

    getStatistics().incrementTotalWinCount();

    address _loser = _game.winner == _a1 ? _a2 : _a1;

    emit WinnerDecided(_gameId, _game.winner, _loser);
  }

  function processFee(
    address _feePayer,
    address _tokenAddress,
    uint256 _bet
  )
    internal
    returns (uint256)
  {
    uint256 _ownerFee = _bet.mul(feePerMille).div(1e3);
    uint256 _betAfterFee = _bet.sub(_ownerFee);
    address _referrer = getReferrals().getReferral(_feePayer);
    address _owner = owner();
    uint256 _referralFee;

    if (_referrer != address(0)) {
      _referralFee = _bet
        .mul(referralFeePerMille)
        .div(1e3);

      _ownerFee = _ownerFee.sub(_referralFee);

      _betAfterFee = _bet
        .sub(_ownerFee)
        .sub(_referralFee);

      getStatistics().incrementTotalReferralVolume(_referralFee);
    }

    IBank _bank = getBank();

    _bank.transferAllocatedTokensOf(
      _feePayer, 
      _tokenAddress, 
      _owner, 
      _ownerFee
    );
    _bank.transferAllocatedTokensOf(
      _feePayer,
      _tokenAddress,
      _referrer,
      _referralFee
    );

    emit ReferralPaid(
      _tokenAddress,
      _feePayer,
      _referrer,
      _referralFee
    );

    return _betAfterFee;
  }

  //
  // end internal helper functions
  //
}