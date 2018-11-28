pragma solidity ^0.4.25;


interface IRegistry {
  function updateEntry(
    string _name,
    address _address
  )
    external;

  function getEntry(
    string _name
  )
    external
    view
    returns (address);

  function getEntry32(
    bytes32 _name32
  )
    external
    view
    returns (address);
}