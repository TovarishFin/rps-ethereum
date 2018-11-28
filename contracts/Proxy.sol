pragma solidity ^0.4.25;

// contracts
import "./Upgradeable.sol";


contract Proxy is Upgradeable {

  // sets initial master contract address
  constructor(
    address _rpsCore,
    address _rpsManagement
  ) 
    public
  {
    require(_rpsCore != address(0));
    require(_rpsManagement != address(0));
    rpsCore = _rpsCore;
    rpsManagement = _rpsManagement;
  }

  // fallback for all proxied functions
  function()
    external
    payable
  {
    assembly {
      // load address from first storage pointer
      let _rpsCore := sload(rpsCore_slot)

      // calldatacopy(t, f, s)
      calldatacopy(
        0x0, // t = mem position to
        0x0, // f = mem position from
        calldatasize // s = size bytes
      )

      // delegatecall(g, a, in, insize, out, outsize) => 0 on error 1 on success
      let success := delegatecall(
        gas, // g = gas 
        _rpsCore, // a = address
        0x0, // in = mem in  mem[in..(in+insize)
        calldatasize, // insize = mem insize  mem[in..(in+insize)
        0x0, // out = mem out  mem[out..(out+outsize)
        0 // outsize = mem outsize  mem[out..(out+outsize)
      )

      // returndatacopy(t, f, s)
      returndatacopy(
        0x0, // t = mem position to
        0x0,  // f = mem position from
        returndatasize // s = size bytes
      )

      // check if call was a success and return if no errors & revert if errors
      if iszero(success) {
        revert(
          0x0, 
          returndatasize
        )
      }
        return(
          0x0, 
          returndatasize
        )
    }
  }
}