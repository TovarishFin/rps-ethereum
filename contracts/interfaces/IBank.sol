pragma solidity ^0.4.25;


interface IBank {

  function tokenUsageOf(
    uint256 _index
  )
    external
    view 
    returns (address);

  function tokenUsageIndex(
    address _userAddress,
    address _tokenAddress
  )
    external
    view
    returns (uint256);

  function tokenBalanceOf(
    address _fundsOwner,
    address _tokenAddress
  )
    external
    returns (uint256);

  function allocatedTokensOf(
    address _fundsOwner,
    address _tokenAddress
  )
    external
    returns (uint256);

  function depositEtherFor(
    address _recipient
  )
    external
    payable;

  function depositEther()
    external
    payable;

  function withdrawEther(
    uint256 _value
  )
    external;

  function depositTokensFor(
    address _recipient,
    address _tokenAddress,
    uint256 _value
  )
    external;

  function depositTokens(
    address _tokenAddress,
    uint256 _value
  )
    external;

  function withdrawTokens(
    address _tokenAddress,
    uint256 _value
  )
    external;

  function allocateTokensOf(
    address _fundsOwner,
    address _tokenAddress,
    uint256 _value
  )
    external;

  function deAllocateTokensOf(
    address _fundsOwner,
    address _tokenAddress,
    uint256 _value
  )
    external;

  function transferAllocatedTokensOf(
    address _fundsOwner,
    address _tokenAddress,
    address _recipient,
    uint256 _value
  )
    external;
}