pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/*
  TODO: 
  allow retries?
  events

  statistics:
    referrals
    wins 
    etc
*/
contract RockPaperScissors is Ownable {
  using SafeMath for uint256;

  uint256 public lastGameId;
  uint256 public minBet;
  uint256 public timeoutInSeconds;
  uint256 public referralFeePerMille;
  uint256 public feePerMille;

  mapping(uint256 => Game) public games;
  mapping(uint256 => uint256) public timingOutGames;
  mapping(address => address) referredBy;

  mapping(address => uint256) public etherBalanceOf;
  mapping(address => uint256) public allocatedEtherOf;

  // tokenAddress => userAddress => deposit
  mapping(address => mapping(address => uint256)) public tokenBalanceOf;
  mapping(address => mapping(address => uint256)) public allocatedTokensOf;

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
      require(tokenBalanceOf[msg.sender][_game.tokenAddress] >= _game.bet);
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

  constructor(
    uint256 _minBet,
    uint256 _timeoutInSeconds,
    uint256 _referralFeePerMille,
    uint256 _feePerMille
  )
    public
  {
    require(_timeoutInSeconds >= 1 * 60);
    require(_referralFeePerMille <= _feePerMille);
    require(_feePerMille >= _referralFeePerMille);

    minBet = _minBet;
    timeoutInSeconds = _timeoutInSeconds;
    referralFeePerMille = _referralFeePerMille;
    feePerMille = _feePerMille;
  }

  //
  // start internal helper functions
  //
  
  function enterStage(
    uint256 _gameId,
    Stage _stage
  ) 
    internal
  {
    games[_gameId].stage = _stage;
  }

  function allocateEtherOf(
    address _fundsOwner,
    uint256 _value
  )
    internal
  {
    etherBalanceOf[_fundsOwner] = etherBalanceOf[_fundsOwner]
      .sub(_value);
    allocatedEtherOf[_fundsOwner] = allocatedEtherOf[_fundsOwner]
      .add(_value);
  }

  function allocateTokensOf(
    address _fundsOwner,
    address _tokenAddress,
    uint256 _value
  )
    internal
  {
    tokenBalanceOf[_fundsOwner][_tokenAddress] = tokenBalanceOf[_fundsOwner][_tokenAddress]
      .sub(_value);
    allocatedTokensOf[_fundsOwner][_tokenAddress] = allocatedTokensOf[_fundsOwner][_tokenAddress]
      .add(_value);
  }

  function deAllocateEtherOf(
    address _fundsOwner,
    uint256 _value
  )
    internal
  {
    allocatedEtherOf[_fundsOwner] = allocatedEtherOf[_fundsOwner]
      .sub(_value);
    etherBalanceOf[_fundsOwner] = etherBalanceOf[_fundsOwner]
      .add(_value);
  }

  function deAllocateTokensOf(
    address _fundsOwner,
    address _tokenAddress,
    uint256 _value
  )
    internal
  {
    allocatedTokensOf[_fundsOwner][_tokenAddress] = allocatedTokensOf[_fundsOwner][_tokenAddress]
      .sub(_value);
    tokenBalanceOf[_fundsOwner][_tokenAddress] = tokenBalanceOf[_fundsOwner][_tokenAddress]
      .add(_value);
  }

  function transferAllocatedEtherOf(
    address _fundsOwner,
    address _recipient,
    uint256 _value
  )
    internal
  {
    allocatedEtherOf[_fundsOwner] = allocatedEtherOf[_fundsOwner].sub(_value);
    etherBalanceOf[_recipient] = etherBalanceOf[_recipient].add(_value);
  }

  function transferAllocatedTokensOf(
    address _fundsOwner,
    address _tokenAddress,
    address _recipient,
    uint256 _value
  )
    internal
  {
    allocatedTokensOf[_fundsOwner][_tokenAddress] = allocatedTokensOf[_fundsOwner][_tokenAddress]
      .sub(_value);
    tokenBalanceOf[_recipient][_tokenAddress] = tokenBalanceOf[_recipient][_tokenAddress]
      .add(_value);
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
    }

    if (_tokenAddress == address(0)) {
      transferAllocatedEtherOf(_feePayer, _owner, _ownerFee);
      transferAllocatedEtherOf(_feePayer, _referrer, _referralFee);
    } else {
      transferAllocatedTokensOf(
        _feePayer, 
        _tokenAddress, 
        _owner, 
        _ownerFee
      );
      transferAllocatedTokensOf(
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
  // start token/eth deposit/withdrawal functions
  //

  function depositEther()
    public
    payable
  {
    require(msg.value > 0);

    etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender].add(msg.value);
  }

  function withdrawEther(
    uint256 _value
  )
    public
    payable
  {
    require(_value > 0);

    etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender].sub(_value);
    msg.sender.transfer(_value);
  }

  function depositTokens(
    address _tokenAddress,
    uint256 _value
  )
    external
  {
    require(_value > 0);

    tokenBalanceOf[msg.sender][_tokenAddress] = tokenBalanceOf[msg.sender][_tokenAddress]
      .add(_value);
    IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _value);
  }

  function withdrawTokens(
    address _tokenAddress,
    uint256 _value
  )
    external
  {
    require(_value > 0);

    tokenBalanceOf[msg.sender][_tokenAddress] = tokenBalanceOf[msg.sender][_tokenAddress]
      .sub(_value);
    IERC20(_tokenAddress).transfer(msg.sender, _value);
  }

  //
  // end token/eth deposit/withdrawal functions
  //

  function openGame(
    address _referrer,
    address _tokenAddress,
    uint256 _value
  )
    external
    payable
  {
    require(_value > minBet);

    if (_tokenAddress != address(0)) {
      allocateTokensOf(msg.sender, _tokenAddress, _value);
    } else {
      if (msg.value > 0) {
        depositEther();
      }

      allocateEtherOf(msg.sender, _value);
    }

    if (_referrer != address(0)) {
      referredBy[msg.sender] = _referrer;
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
    atStage(_gameId, Stage.Created)
  {
    enterStage(_gameId, Stage.Cancelled);
    Game memory _game = games[_gameId];
    uint256 _refundAfterFees = processFee(_game.addressP1, _game.tokenAddress, _game.bet);
    
    if (_game.tokenAddress == address(0)) {
      deAllocateEtherOf(_game.addressP1, _refundAfterFees);
    } else {
      deAllocateTokensOf(_game.addressP1, _game.tokenAddress, _refundAfterFees);
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
      allocateTokensOf(msg.sender, _game.tokenAddress, _game.bet);
    }

    if (_referrer != address(0)) {
      referredBy[msg.sender] = _referrer;
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
  }

  function settleBet(
    uint256 _gameId
  )
    external
  {
    Game storage _game = games[_gameId];
    // ensure that Stage is any of: TimedOut, Tied, WinnerDecided
    require(uint256(_game.stage) >= 6 && uint256(_game.stage) <= 8);
    uint256 _bet1AfterFees = processFee(_game.addressP1, _game.tokenAddress, _game.bet);
    uint256 _bet2AfterFees = processFee(_game.addressP2, _game.tokenAddress, _game.bet);

    if (_game.stage == Stage.WinnerDecided) {
      address _loser = _game.winner == _game.addressP1 ? _game.addressP2 : _game.addressP1;

      if (_game.tokenAddress == address(0)) {
        uint256 _deAllocationAmount = _game.winner == _game.addressP1 ? _bet1AfterFees : _bet2AfterFees;
        uint256 _transferAmount = _loser == _game.addressP1 ? _bet1AfterFees : _bet2AfterFees;
        deAllocateEtherOf(_game.winner, _deAllocationAmount);
        transferAllocatedEtherOf(_loser, _game.winner, _transferAmount);
      } else {
        deAllocateTokensOf(_game.winner, _game.tokenAddress, _deAllocationAmount);
        transferAllocatedTokensOf(
          _loser, 
          _game.tokenAddress, 
          _game.winner, 
          _transferAmount
        );
      }
    } else if (_game.stage == Stage.Tied) {
      if (_game.tokenAddress == address(0)) {
        deAllocateEtherOf(_game.addressP1, _bet1AfterFees);
        deAllocateEtherOf(_game.addressP2, _bet2AfterFees);
      } else {
        deAllocateTokensOf(_game.addressP1, _game.tokenAddress, _bet1AfterFees);
        deAllocateTokensOf(_game.addressP2, _game.tokenAddress, _bet2AfterFees);
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
        deAllocateEtherOf(_timeoutWinner, _timeoutDeAllocationAmount);
        transferAllocatedEtherOf(_timeoutLoser, _timeoutWinner, _timeoutTransferAmount);
      } else {
        deAllocateTokensOf(_timeoutWinner, _game.tokenAddress, _timeoutDeAllocationAmount);
        transferAllocatedTokensOf(
          _timeoutLoser, 
          _game.tokenAddress, 
          _timeoutWinner, 
          _timeoutTransferAmount
        );
      }
    }

    enterStage(_gameId, Stage.Paid);
  }

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