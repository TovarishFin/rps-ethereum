pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract Registry is Ownable {
  mapping(bytes32 => address) private entries;

  event EntryUpdated(
    string name,
    address indexed entry
  );

  function updateEntry(
    string _name,
    address _address
  )
    external
  {
    bytes32 _name32 = keccak256(abi.encodePacked(_name));
    require(_address != entries[_name32]);

    entries[_name32] = _address;

    emit EntryUpdated(_name, _address);
  }

  function getEntry(
    string _name
  )
    external
    view
    returns (address)
  {
    bytes32 _name32 = keccak256(abi.encodePacked(_name));
    require(entries[_name32] != address(0));

    return entries[_name32];
  }

  function getEntry32(
    bytes32 _name32
  )
    external
    view
    returns (address)
  {
    require(entries[_name32] != address(0));

    return entries[_name32];
  }
}