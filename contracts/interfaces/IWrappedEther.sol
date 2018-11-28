pragma solidity ^0.4.25;


interface IWrappedEther {
  function name()
    external
    view
    returns (string);

  function symbol()
    external
    view
    returns (string);

  function decimals()
    external
    view
    returns (uint8);

  function balanceOf(
    address _address
  )
    external
    view
    returns (uint256);

  function allowance(
    address _owner,
    address _spender
  )
    external
    view
    returns (uint256);

  function deposit() 
    external 
    payable;
  
  function withdraw(
    uint256 _value
  ) 
    external;

  function totalSupply() 
    external 
    view 
    returns (uint256);
  
  function approve(
    address _spender, 
    uint256 _value
  ) 
    external 
    returns (bool);

  function transfer(
      address _to, 
      uint256 _value
  ) 
    external 
    returns (bool);
    
  function transferFrom(
    address _from, 
    address _to, 
    uint256 _value
  )
    external
    returns (bool);

  function() 
    external 
    payable;
}