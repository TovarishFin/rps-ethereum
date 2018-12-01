pragma solidity ^0.4.25;

import "./RockPaperScissorsCommon.sol";


contract RockPaperScissorsManagement is RockPaperScissorsCommon {

  //
  // start owner only functions
  //

  function pause()
    external
    onlyOwner 
    whenNotPaused 
  {
    paused = true;
    emit Paused();
  }

  function unpause()
    external 
    onlyOwner 
    whenPaused 
  {
    paused = false;
    emit Unpaused();
  }

  function updateMinBet(
    uint256 _newMinBet
  )
    external
    onlyOwner
  {
    uint256 _oldMinBet = minBet;
    minBet = _newMinBet;

    emit MinBetUpdated(_oldMinBet, _newMinBet);
  }

  function updateTimeout(
    uint256 _newTimeoutInSeconds
  )
    external
    onlyOwner
  {
    require(_newTimeoutInSeconds >= 1 * 60);

    uint256 _oldTimeoutInSeconds = timeoutInSeconds;
    timeoutInSeconds = _newTimeoutInSeconds;

    emit TimeoutUpdated(_oldTimeoutInSeconds, _newTimeoutInSeconds);
  }

  function updateReferralFeePerMille(
    uint256 _newReferralFeePerMille
  )
    external
    onlyOwner
  {
    require(_newReferralFeePerMille <= feePerMille);

    uint256 _oldReferralFeePerMille = referralFeePerMille;
    referralFeePerMille = _newReferralFeePerMille;

    emit ReferralFeeUpdated(_oldReferralFeePerMille, _newReferralFeePerMille);
  }

  function updateFeePerMille(
    uint256 _newFeePerMille
  )
    external
    onlyOwner
  {
    require(_newFeePerMille >= referralFeePerMille);

    uint256 _oldFeePerMille = feePerMille;
    feePerMille = _newFeePerMille;

    emit FeeUpdated(_oldFeePerMille, _newFeePerMille);
  }

  //
  // end owner only functions
  //

  //
  // start game management functions
  //

  function startGameTimeout(
    uint256 _gameId
  )
    external
    whenNotPaused
    atEitherStage(_gameId, Stage.Ready, Stage.Committed)
    onlyGameParticipant(_gameId)
    timeoutAllowed(_gameId)
  {
    timingOutGames[_gameId] = block.timestamp.add(timeoutInSeconds);
    enterStage(_gameId, Stage.TimingOut);
  }

  function timeoutGame(
    uint256 _gameId
  )
    external
    whenNotPaused
    atStage(_gameId, Stage.TimingOut)
    onlyGameParticipant(_gameId)
    timeoutAllowed(_gameId)
  {
    require(block.timestamp >= timingOutGames[_gameId]);
    Game storage _game = games[_gameId];
    
    if (_game.choiceSecretP1 == 0x0 || _game.choiceSecretP2 == 0x0) {
      _game.winner = _game.choiceSecretP1 == 0x0 
        ? _game.addressP2 
        : _game.addressP1;
    } else if (_game.choiceP1 == Choice.Undecided || _game.choiceP2 == Choice.Undecided) {
      _game.winner = _game.choiceP1 == Choice.Undecided
        ? _game.addressP2
        : _game.addressP1;
    }

    enterStage(_gameId, Stage.TimedOut);
  }

  function settleWinner(
    Game memory _game,
    uint256 _bet1AfterFees,
    uint256 _bet2AfterFees
  )
    internal
  {
    IBank _bank = getBank();
    address _loser = _game.winner == _game.addressP1 ? _game.addressP2 : _game.addressP1;
    uint256 _deAllocationAmount = _game.winner == _game.addressP1 ? _bet1AfterFees : _bet2AfterFees;
    uint256 _transferAmount = _loser == _game.addressP1 ? _bet1AfterFees : _bet2AfterFees;
    _bank.deAllocateTokensOf(_game.winner, _game.tokenAddress, _deAllocationAmount);
    _bank.transferAllocatedTokensOf(
      _loser, 
      _game.tokenAddress, 
      _game.winner, 
      _transferAmount
    );
  }

  function settleTied(
    Game memory _game,
    uint256 _bet1AfterFees,
    uint256 _bet2AfterFees
  )
    internal
  {
    IBank _bank = getBank();
    _bank.deAllocateTokensOf(_game.addressP1, _game.tokenAddress, _bet1AfterFees);
    _bank.deAllocateTokensOf(_game.addressP2, _game.tokenAddress, _bet2AfterFees);
  }

  function settleBet(
    uint256 _gameId
  )
    external
    whenNotPaused
  {
    Game memory _game = games[_gameId];
    // IMPORTANT: ensure this matches when/if stages are updated!
    // ensure that Stage is any of: TimedOut, Tied, WinnerDecided
    require(uint256(_game.stage) >= 7 && uint256(_game.stage) <= 9);
    uint256 _bet1AfterFees = processFee(_game.addressP1, _game.tokenAddress, _game.bet);
    uint256 _bet2AfterFees = processFee(_game.addressP2, _game.tokenAddress, _game.bet);

    if (_game.stage == Stage.WinnerDecided) {
      settleWinner(_game, _bet1AfterFees, _bet2AfterFees);
    } else if (_game.stage == Stage.Tied) {
      settleTied(_game, _bet1AfterFees, _bet2AfterFees);
    } else if (_game.stage == Stage.TimedOut) {
      settleWinner(_game, _bet1AfterFees, _bet2AfterFees);
    }

    enterStage(_gameId, Stage.Paid);

    totalWinVolume = totalWinVolume.add(_bet1AfterFees.add(_bet2AfterFees));
  }

  //
  // end game management functions
  //
}