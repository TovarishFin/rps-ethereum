pragma solidity ^0.4.24;


interface IBank {
  function etherBalanceOf(
    address _fundsOwner
  )
    external
    returns (uint256);
  
  function allocatedEtherOf(
    address _fundsOwner
  )
    external
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
  
  function allocateEtherOf(
    address _fundsOwner,
    uint256 _value
  )
    external;

  function allocateTokensOf(
    address _fundsOwner,
    address _tokenAddress,
    uint256 _value
  )
    external;

  function deAllocateEtherOf(
    address _fundsOwner,
    uint256 _value
  )
    external;

  function deAllocateTokensOf(
    address _fundsOwner,
    address _tokenAddress,
    uint256 _value
  )
    external;

  function transferAllocatedEtherOf(
    address _fundsOwner,
    address _recipient,
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

  function depositEther()
    external
    payable;

  function withdrawEther(
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
}