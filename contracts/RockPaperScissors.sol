pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract RockPaperScissors {
  using SafeMath for uint256;

  uint256 public lastGameId;
  uint256 public minimumBet;
  uint256 public timeout;
  uint256 public referralFeePerMille;
  uint256 public ownerFeePerMille;

  mapping(uint256 => Game) public games;
  mapping(address => address) referredBy;

  mapping(address => uint256) public etherBalanceOf;
  mapping(address => uint256) public allocatedEtherOf;

  // tokenAddress => userAddress => deposit
  mapping(address => mapping(address => uint256)) public tokenBalanceOf;
  mapping(address => mapping(address => uint256)) public allocatedTokensOf;

  enum Stage {
    Uninitialized,
    Created,
    Ready,
    Committed,
    Tied,
    WinnerDecided,
    Paid
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

  modifier onlyGameParticipant(
    uint256 _gameId
  ) {
    Game memory _game = games[_gameId];
    require(msg.sender == _game.addressP1 || msg.sender == _game.addressP2);

    _;
  }

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
    } else if(_c1 == Choice.Paper && _c2 == Choice.Rock) {
      _game.winner = _a1;
    } else if(_c1 == Choice.Paper && _c2 == Choice.Scissors) {
      _game.winner = _a2;
    } else if(_c1 == Choice.Scissors && _c2 == Choice.Rock) {
      _game.winner = _a2;
    } else if(_c1 == Choice.Scissors && _c2 == Choice.Paper) {
      _game.winner = _a1;
    }

    enterStage(_gameId, Stage.WinnerDecided);
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

    return keccak256(abi.encodePacked(
      _gameId,
      uint256(_choice),
      _sig
    )) == _secret;
  }

  function depositEther()
    public
    payable
  {
    etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender].add(msg.value);
  }

  function depositTokens(
    address _tokenAddress,
    uint256 _value
  )
    external
    payable
  {
    tokenBalanceOf[msg.sender][_tokenAddress] = tokenBalanceOf[msg.sender][_tokenAddress]
      .add(_value);
  }

  function openGame(
    address _referrer,
    address _tokenAddress,
    uint256 _value
  )
    external
    payable
  {
    require(_value > minimumBet);

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
  }

  function commitChoice(
    uint256 _gameId,
    bytes32 _hash
  )
    external
    atStage(_gameId, Stage.Ready)
    onlyGameParticipant(_gameId)
  {
    Game storage _game = games[_gameId];
    if (msg.sender == _game.addressP1) {
      _game.choiceSecretP1 = _hash;
    } else {
      _game.choiceSecretP2 = _hash;
    }

    if(_game.choiceSecretP1 != 0x0 && _game.choiceSecretP2 != 0x0) {
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
    atEitherStage(_gameId, Stage.WinnerDecided, Stage.Tied)
  {
    Game storage _game = games[_gameId];

    if (_game.stage == Stage.WinnerDecided) {
      address _loser = _game.winner == _game.addressP1 ? _game.addressP2 : _game.addressP1;
      if (_game.tokenAddress == address(0)) {
        deAllocateEtherOf(_game.winner, _game.bet);
        transferAllocatedEtherOf(_loser, _game.winner, _game.bet);
      } else {
        deAllocateTokensOf(_game.winner, _game.tokenAddress, _game.bet);
        transferAllocatedTokensOf(_loser, _game.tokenAddress, _game.winner, _game.bet);
      }
    } else {
      if (_game.tokenAddress == address(0)) {
        deAllocateEtherOf(_game.addressP1, _game.bet);
        deAllocateEtherOf(_game.addressP2, _game.bet);
      } else {
        deAllocateTokensOf(_game.addressP1, _game.tokenAddress, _game.bet);
        deAllocateTokensOf(_game.addressP2, _game.tokenAddress, _game.bet);
      }
    }

    enterStage(_gameId, Stage.Paid);
  }

  // TODO: figure out the math on this!
  function processFees(
    uint256 _gameId
  )
    internal
    returns (uint256, uint256)
  {
    Game memory _game = games[_gameId];
    uint256 _bet = games[_gameId].bet;
    uint256 _referralFee = _bet.mul(referralFeePerMille).div(1e3);
    uint256 _ownerFee = _bet.mul(ownerFeePerMille).div(1e3);


  }
}