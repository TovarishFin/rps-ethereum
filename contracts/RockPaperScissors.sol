pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./interfaces/IBank.sol";
import "./interfaces/IRegistry.sol";


contract RockPaperScissors is Ownable {
  using SafeMath for uint256;

  IRegistry public registry;

  //
  // start operating params
  //

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

  //
  // end events
  //

  //
  // start modifiers
  //

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

  constructor(
    address _registryAddress,
    uint256 _minBet,
    uint256 _timeoutInSeconds,
    uint256 _referralFeePerMille,
    uint256 _feePerMille
  )
    public
  {
    require(isContract(_registryAddress));
    require(_timeoutInSeconds >= 1 * 60);
    require(_referralFeePerMille <= _feePerMille);
    require(_feePerMille >= _referralFeePerMille);

    registry = IRegistry(_registryAddress);
    minBet = _minBet;
    timeoutInSeconds = _timeoutInSeconds;
    referralFeePerMille = _referralFeePerMille;
    feePerMille = _feePerMille;
  }

  function choiceSecretMatches(
    uint256 _gameId,
    Choice _choice,
    bytes _sig
  )
    public
    view
    returns (bool)
  {
    bytes32 _secret;
    Game memory _game = games[_gameId];

    if (msg.sender == _game.addressP1) {
      _secret = _game.choiceSecretP1;
    }

    if (msg.sender == _game.addressP2) {
      _secret = _game.choiceSecretP2;
    }

    return keccak256(
      abi.encodePacked(
        _gameId,
        uint256(_choice),
        _sig
    )) == _secret;
  }

  //
  // start game actions
  //

  function createGame(
    address _referrer,
    address _tokenAddress,
    uint256 _value
  )
    external
    payable
  {
    require(_value > minBet);

    IBank _bank = IBank(registry.getEntry("Bank"));

    if (_tokenAddress != address(0)) {
      _bank.allocateTokensOf(msg.sender, _tokenAddress, _value);
    } else {
      if (msg.value > 0) {
        _bank.depositEther.value(msg.value)();
      }

      _bank.allocateEtherOf(msg.sender, _value);
    }

    if (_referrer != address(0)) {
      referredBy[msg.sender] = _referrer;

      emit ReferralSet(_referrer, msg.sender);

      totalReferralCount++;
    }

    lastGameId++;
    games[lastGameId] = Game(
      msg.sender,
      address(0),
      address(0),
      _tokenAddress,
      _value,
      Choice(0),
      Choice(0),
      0x0,
      0x0,
      Stage.Created
    );
  }

  function cancelGame(
    uint256 _gameId
  )
    external
    atEitherStage(_gameId, Stage.RematchPending, Stage.Created)
  {
    enterStage(_gameId, Stage.Cancelled);
    Game memory _game = games[_gameId];
    uint256 _refundAfterFees = processFee(_game.addressP1, _game.tokenAddress, _game.bet);
    
    IBank _bank = IBank(registry.getEntry("Bank"));

    if (_game.tokenAddress == address(0)) {
      _bank.deAllocateEtherOf(_game.addressP1, _refundAfterFees);
    } else {
      _bank.deAllocateTokensOf(_game.addressP1, _game.tokenAddress, _refundAfterFees);
    }
  }

  function joinGame(
    address _referrer,
    uint256 _gameId
  )
    external
    payable
    atStage(_gameId, Stage.Created)
    canJoinGame(_gameId)
  {
    Game storage _game = games[_gameId];
    
    if (_game.tokenAddress != address(0)) {
      IBank(registry.getEntry("Bank"))
        .allocateTokensOf(msg.sender, _game.tokenAddress, _game.bet);
    }

    if (_referrer != address(0)) {
      referredBy[msg.sender] = _referrer;

      emit ReferralSet(_referrer, msg.sender);

      totalReferralCount++;
    }

    _game.addressP2 = msg.sender;

    enterStage(_gameId, Stage.Ready);
  }

  function startGameTimeout(
    uint256 _gameId
  )
    external
    atEitherStage(_gameId, Stage.Ready, Stage.Committed)
    onlyGameParticipant(_gameId)
    canStartTimeout(_gameId)
  {
    timingOutGames[_gameId] = block.timestamp;
    enterStage(_gameId, Stage.TimingOut);
  }

  function timeoutGame(
    uint256 _gameId
  )
    external
    atStage(_gameId, Stage.TimingOut)
    onlyGameParticipant(_gameId)
  {
    require(block.timestamp > timingOutGames[_gameId]);
    enterStage(_gameId, Stage.TimedOut);
  }

  function commitChoice(
    uint256 _gameId,
    bytes32 _hash
  )
    external
    atEitherStage(_gameId, Stage.Ready, Stage.TimingOut)
    onlyGameParticipant(_gameId)
  {
    Game storage _game = games[_gameId];
    if (msg.sender == _game.addressP1) {
      _game.choiceSecretP1 = _hash;
    } else {
      _game.choiceSecretP2 = _hash;
    }

    if (_game.choiceSecretP1 != 0x0 && _game.choiceSecretP2 != 0x0) {
      enterStage(_gameId, Stage.Committed);
    }

    emit ChoiceCommitted(_gameId, msg.sender);
  }

  function revealChoice(
    uint256 _gameId,
    Choice _choice,
    bytes _sig
  )
    external
    atStage(_gameId, Stage.Committed)
    onlyGameParticipant(_gameId)
  {
    require(choiceSecretMatches(_gameId, _choice, _sig));

    Game memory _game = games[_gameId];
    if (msg.sender == _game.addressP1) {
      _game.choiceP1 = _choice;
    }

    if (msg.sender == _game.addressP2) {
      _game.choiceP2 = _choice;
    }

    if (_game.choiceP1 != Choice.Undecided && _game.choiceP2 != Choice.Undecided) {
      computeWinner(_gameId);
    }

    totalPlayCount++;

    emit ChoiceRevealed(_gameId, msg.sender);
  }

  function settleBet(
    uint256 _gameId
  )
    external
  {
    Game storage _game = games[_gameId];
    // IMPORTANT: ensure this matches when/if stages are updated!
    // ensure that Stage is any of: TimedOut, Tied, WinnerDecided
    require(uint256(_game.stage) >= 7 && uint256(_game.stage) <= 9);
    uint256 _bet1AfterFees = processFee(_game.addressP1, _game.tokenAddress, _game.bet);
    uint256 _bet2AfterFees = processFee(_game.addressP2, _game.tokenAddress, _game.bet);

    IBank _bank = IBank(registry.getEntry("Bank"));

    if (_game.stage == Stage.WinnerDecided) {
      address _loser = _game.winner == _game.addressP1 ? _game.addressP2 : _game.addressP1;

      if (_game.tokenAddress == address(0)) {
        uint256 _deAllocationAmount = _game.winner == _game.addressP1 ? _bet1AfterFees : _bet2AfterFees;
        uint256 _transferAmount = _loser == _game.addressP1 ? _bet1AfterFees : _bet2AfterFees;
        _bank.deAllocateEtherOf(_game.winner, _deAllocationAmount);
        _bank.transferAllocatedEtherOf(_loser, _game.winner, _transferAmount);
      } else {
        _bank.deAllocateTokensOf(_game.winner, _game.tokenAddress, _deAllocationAmount);
        _bank.transferAllocatedTokensOf(
          _loser, 
          _game.tokenAddress, 
          _game.winner, 
          _transferAmount
        );
      }
    } else if (_game.stage == Stage.Tied) {
      if (_game.tokenAddress == address(0)) {
        _bank.deAllocateEtherOf(_game.addressP1, _bet1AfterFees);
        _bank.deAllocateEtherOf(_game.addressP2, _bet2AfterFees);
      } else {
        _bank.deAllocateTokensOf(_game.addressP1, _game.tokenAddress, _bet1AfterFees);
        _bank.deAllocateTokensOf(_game.addressP2, _game.tokenAddress, _bet2AfterFees);
      }
    } else if (_game.stage == Stage.TimedOut) {
      address _timeoutWinner;
      address _timeoutLoser;

      if (_game.choiceSecretP1 != 0x0 && _game.choiceSecretP2 != 0x0) {
        _timeoutWinner = _game.choiceP1 != Choice.Undecided ? _game.addressP1 : _game.addressP2;
        _timeoutWinner = _game.choiceP1 == Choice.Undecided ? _game.addressP1 : _game.addressP2;
      } else {
        _timeoutWinner = _game.choiceSecretP1 != 0x0 ? _game.addressP1 : _game.addressP2;
        _timeoutLoser = _game.choiceSecretP1 == 0x0 ? _game.addressP1 : _game.addressP2;
      }

      if (_game.tokenAddress == address(0)) {
        uint256 _timeoutDeAllocationAmount = _timeoutWinner == _game.addressP1 ? _bet1AfterFees : _bet2AfterFees;
        uint256 _timeoutTransferAmount = _timeoutLoser == _game.addressP1 ? _bet1AfterFees : _bet2AfterFees;
        _bank.deAllocateEtherOf(_timeoutWinner, _timeoutDeAllocationAmount);
        _bank.transferAllocatedEtherOf(_timeoutLoser, _timeoutWinner, _timeoutTransferAmount);
      } else {
        _bank.deAllocateTokensOf(_timeoutWinner, _game.tokenAddress, _timeoutDeAllocationAmount);
        _bank.transferAllocatedTokensOf(
          _timeoutLoser, 
          _game.tokenAddress, 
          _timeoutWinner, 
          _timeoutTransferAmount
        );
      }
    }

    enterStage(_gameId, Stage.Paid);

    totalWinVolume = totalWinVolume.add(_bet1AfterFees.add(_bet2AfterFees));
  }

  function rematch(
    uint256 _gameId
  )
    external
    payable
    onlyGameParticipant(_gameId)
  {
    IBank _bank = IBank(registry.getEntry("Bank"));

    if (msg.value > 0) {
      _bank.depositEther.value(msg.value)();
    }

    Game memory _game;

    if (rematchesFrom[_gameId] == 0) {
      _game = games[_gameId];
      require(_game.stage == Stage.WinnerDecided || _game.stage == Stage.Paid);
      rematchesFrom[_gameId] = _gameId;

      lastGameId++;
      games[lastGameId] = Game(
        _game.addressP1,
        _game.addressP2,
        address(0),
        _game.tokenAddress,
        _game.bet,
        Choice(0),
        Choice(0),
        0x0,
        0x0,
        Stage.RematchPending
      );

      emit RematchProposed(_gameId, lastGameId, _game.addressP1, _game.addressP2);
    } else {
      _game = games[rematchesFrom[_gameId]];
      require(_game.stage == Stage.RematchPending);
      enterStage(rematchesFrom[_gameId], Stage.Ready);
    }

    if (_game.tokenAddress != address(0)) {
      _bank.allocateTokensOf(msg.sender, _game.tokenAddress, _game.bet);
    } else {
      _bank.allocateEtherOf(msg.sender, _game.bet);
    }
  }

  //
  // end game actions
  //

  //
  // start owner only functions
  //

  function updateMinBet(
    uint256 _newMinBet
  )
    external
    onlyOwner
  {
    minBet = _newMinBet;
  }

  function updateTimeout(
    uint256 _newTimeoutInSeconds
  )
    external
    onlyOwner
  {
    require(_newTimeoutInSeconds >= 1 * 60);

    timeoutInSeconds = _newTimeoutInSeconds;
  }

  function updateReferralFeePerMille(
    uint256 _newReferralFeePerMille
  )
    external
    onlyOwner
  {
    require(_newReferralFeePerMille <= feePerMille);

    referralFeePerMille = _newReferralFeePerMille;
  }

  function updateFeePerMille(
    uint256 _newFeePerMille
  )
    external
    onlyOwner
  {
    require(_newFeePerMille >= referralFeePerMille);

    feePerMille = _newFeePerMille;
  }

  //
  // end owner only functions
  //
}