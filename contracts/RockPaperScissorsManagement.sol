pragma solidity ^0.4.24;

import "./RockPaperScissorsCommon.sol";


contract RockPaperScissorsManagement is RockPaperScissorsCommon {
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

  //
  // start game management functions
  //

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

  //
  // end game management functions
  //
}