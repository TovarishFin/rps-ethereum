pragma solidity ^0.4.24;

// interfaces
import "./interfaces/IRegistry.sol";
import "./interfaces/IBank.sol";
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
  mapping(uint256 => uint256) public rematchesFrom;
  mapping(uint256 => uint256) public timingOutGames;
  mapping(address => address) referredBy;

  //
  // end game tracking storage
  //

  enum Stage {
    Uninitialized, // 0
    RematchPending, // 1
    Created, // 2
    Cancelled, // 3
    Ready, // 4
    Committed, // 5
    TimingOut, // 6
    TimedOut, // 7
    Tied, // 8
    WinnerDecided, // 9
    Paid // 10
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

  event RematchProposed(
    uint256 gameId,
    uint256 rematchGameId,
    address indexed addressP1,
    address indexed addressP2
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

  modifier canJoinGame(
    uint256 _gameId
  ) {
    Game memory _game = games[_gameId];
    require(_game.addressP1 != address(0));
    require(_game.addressP2 == address(0));

    if (_game.tokenAddress == address(0)) {
      uint256 _tokenBalance = IBank(registry.getEntry("Bank"))
        .tokenBalanceOf(msg.sender, _game.tokenAddress);

      require(_tokenBalance >= _game.bet);
    } else {
      require(msg.value == _game.bet);
    }

    _;
  }

  modifier canStartTimeout(
    uint256 _gameId
  ) {
    require(timingOutGames[_gameId] == 0);
    Game memory _game = games[_gameId];

    if (_game.stage == Stage.Ready) {
      require(_game.choiceSecretP1 == 0x0 || _game.choiceSecretP2 == 0x0);
      require(_game.choiceSecretP1 != 0x0 || _game.choiceSecretP2 != 0x0);
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

  function removeActiveGameOf(
    address _player,
    uint256 _gameId
  )
    internal
  {
    uint256 _index = activeGameIndex[_gameId];

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
    Stage _stage
  ) 
    internal
  {
    games[_gameId].stage = _stage;

    emit StageChanged(_gameId, uint256(_stage));
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

    totalWinCount++;
  }

  function processFee(
    address _feePayer,
    address _tokenAddress,
    uint256 _bet
  )
    internal
    returns (uint256)
  {
    uint256 _betAfterFee;
    uint256 _referralFee;
    uint256 _ownerFee;
    address _referrer = referredBy[_feePayer];
    address _owner = owner();

    if (_referrer == address(0)) {
      _ownerFee = _bet
        .mul(feePerMille)
        .div(1e3);

      _betAfterFee = _bet.sub(_ownerFee);
    } else {
      _referralFee = _bet
        .mul(referralFeePerMille)
        .div(1e3);
      _ownerFee = _bet
        .mul(feePerMille)
        .div(1e3)
        .sub(_referralFee);

      _betAfterFee = _bet
        .sub(_ownerFee)
        .sub(_referralFee);

      totalReferralVolume = totalReferralVolume.add(_referralFee);
    }

    IBank _bank = IBank(registry.getEntry("Bank"));

    if (_tokenAddress == address(0)) {
      _bank.transferAllocatedEtherOf(_feePayer, _owner, _ownerFee);
      _bank.transferAllocatedEtherOf(_feePayer, _referrer, _referralFee);
    } else {
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
        _ownerFee
      );
    }

    return _betAfterFee;
  }

  //
  // end internal helper functions
  //
}