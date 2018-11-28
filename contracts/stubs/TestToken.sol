pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";


contract TestToken is ERC20 {
  string public constant name = "TestToken";
  string public constant symbol = "TST";
  uint256 public constant decimals = 18;

  function mint(
    address _account,
    uint256 _value
  )
    external
  {
    _mint(_account, _value);
  }
}