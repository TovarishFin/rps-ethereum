pragma solidity ^0.4.25;

// contracts
import "./RockPaperScissorsCommon.sol";


contract RockPaperScissorsCore is RockPaperScissorsCommon {

  function choiceSecretMatches(
    uint256 _gameId,
    Choice _choice,
    bytes _sig
  )
    internal
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

  function initialize(
    address _registryAddress,
    uint256 _minBet,
    uint256 _timeoutInSeconds,
    uint256 _referralFeePerMille,
    uint256 _feePerMille
  )
    external
    initOneTimeOnly
  {
    require(isContract(_registryAddress));
    require(_timeoutInSeconds >= 5);
    require(_referralFeePerMille <= _feePerMille);
    require(_feePerMille >= _referralFeePerMille);

    registry = IRegistry(_registryAddress);
    minBet = _minBet;
    timeoutInSeconds = _timeoutInSeconds;
    referralFeePerMille = _referralFeePerMille;
    feePerMille = _feePerMille;
  }

  function allOpenGames()
    external
    view
    returns (uint256[])
  {
    return openGames;
  }

  function openGamesLength()
    external
    view
    returns (uint256)
  {
    return openGames.length;
  }

  function allActiveGamesOf(
    address _address
  )
    external
    view
    returns (uint256[])
  {
    return activeGamesOf[_address];
  }

  function allActiveGamesOfLength(
    address _address
  )
    external
    view
    returns (uint256)
  {
    return activeGamesOf[_address].length;
  }

  function gameHasTimedOut(
    uint256 _gameId
  )
    external
    view
    returns (bool)
  {
    return block.timestamp >= timingOutGames[_gameId] && timingOutGames[_gameId] != 0;
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
    whenNotPaused
  {
    require(_tokenAddress != address(0));
    require(_value >= minBet);

    IBank _bank = getBank();

    if (msg.value > 0) {
      _bank.depositEtherFor.value(msg.value)(msg.sender);
    }

    _bank.allocateTokensOf(msg.sender, _tokenAddress, _value);

    if (_referrer != address(0)) {
      getReferrals().setReferral(msg.sender, _referrer);

      emit ReferralSet(_referrer, msg.sender);

      getStatistics().incrementTotalReferralCount();
    }

    lastGameId++;

    Game storage _newGame = games[lastGameId];
    _newGame.addressP1 = msg.sender;
    _newGame.tokenAddress = _tokenAddress;
    _newGame.bet = _value;

    enterStage(lastGameId, Stage.Created);

    addActiveGameOf(msg.sender, lastGameId);

    emit GameCreated(lastGameId, msg.sender);
  }

  function cancelGame(
    uint256 _gameId
  )
    external
    onlyGameParticipant(_gameId)
    atStage(_gameId, Stage.Created)
    whenNotPaused
  {
    enterStage(_gameId, Stage.Cancelled);
    Game memory _game = games[_gameId];
    uint256 _refundAfterFees = processFee(_game.addressP1, _game.tokenAddress, _game.bet);

    getBank().deAllocateTokensOf(_game.addressP1, _game.tokenAddress, _refundAfterFees);

    removeActiveGameOf(msg.sender, _gameId);

    emit GameCancelled(_gameId, msg.sender);
  }

  function joinGame(
    address _referrer,
    uint256 _gameId
  )
    external
    payable
    atStage(_gameId, Stage.Created)
    whenNotPaused
  {
    IBank _bank = getBank();
    Game storage _game = games[_gameId];

    require(_game.addressP1 != address(0));
    require(msg.sender != _game.addressP1);
    require(_game.addressP2 == address(0));

    if (msg.value > 0) {
      _bank.depositEtherFor.value(msg.value)(msg.sender);
    }
    
    _bank.allocateTokensOf(msg.sender, _game.tokenAddress, _game.bet);

    if (_referrer != address(0)) {
      getReferrals().setReferral(msg.sender, _referrer);

      emit ReferralSet(_referrer, msg.sender);

      getStatistics().incrementTotalReferralCount();
    }

    _game.addressP2 = msg.sender;

    enterStage(_gameId, Stage.Ready);

    addActiveGameOf(msg.sender, _gameId);

    emit GameJoined(_gameId, _game.addressP1, msg.sender);
  }

  function commitChoice(
    uint256 _gameId,
    bytes32 _hash
  )
    external
    atEitherStage(_gameId, Stage.Ready, Stage.TimingOut)
    onlyGameParticipant(_gameId)
    whenNotPaused
  {
    Game storage _game = games[_gameId];
    if (msg.sender == _game.addressP1) {
      require(_game.choiceSecretP1 == bytes32(0));
      _game.choiceSecretP1 = _hash;
    } else {
      require(_game.choiceSecretP2 == bytes32(0));
      _game.choiceSecretP2 = _hash;
    }

    emit ChoiceCommitted(_gameId, msg.sender);

    if (_game.choiceSecretP1 != bytes32(0) && _game.choiceSecretP2 != bytes32(0)) {
      enterStage(_gameId, Stage.Committed);
    }
  }

  function revealChoice(
    uint256 _gameId,
    Choice _choice,
    bytes _sig
  )
    external
    atEitherStage(_gameId, Stage.Committed, Stage.TimingOut)
    onlyGameParticipant(_gameId)
    whenNotPaused
  {
    Game storage _game = games[_gameId];
    require(_game.choiceSecretP1 != bytes32(0));
    require(_game.choiceSecretP2 != bytes32(0));
    require(choiceSecretMatches(_gameId, _choice, _sig));

    if (msg.sender == _game.addressP1) {
      require(_game.choiceP1 == Choice.Undecided);
      _game.choiceP1 = _choice;
    } else {
      require(_game.choiceP2 == Choice.Undecided);
      _game.choiceP2 = _choice;
    }

    emit ChoiceRevealed(_gameId, msg.sender);

    getStatistics().incrementTotalPlayCount();

    if (_game.choiceP1 != Choice.Undecided && _game.choiceP2 != Choice.Undecided) {
      computeWinner(_gameId);
    }
  }

  //
  // end game actions
  //

  function()
    external
    payable
  {
    assembly {
      // load value using *_slot suffix
      let rpsManagement := sload(rpsManagement_slot)
      // calldatacopy(t, f, s)
      calldatacopy(
        0x0, // t = mem position to
        0x0, // f = mem position from
        calldatasize // s = size bytes
      )

      // delegatecall(g, a, in, insize, out, outsize) => 0 on error 1 on success
      let result := delegatecall(
        gas, // g = gas
        rpsManagement, // a = address
        0x0, // in = mem in  mem[in..(in+insize)
        calldatasize, // insize = mem insize  mem[in..(in+insize)
        0x0, // out = mem out  mem[out..(out+outsize)
        0 // outsize = mem outsize  mem[out..(out+outsize)
      )

      // check if call was a success and return if no errors & revert if errors
      if iszero(result) {
        revert(0, 0)
      }

      // returndatacopy(t, f, s)
      returndatacopy(
        0x0, // t = mem position to
        0x0,  // f = mem position from
        returndatasize // s = size bytes
      )

      return(
        0x0,
        returndatasize
      )
    }
  }
}