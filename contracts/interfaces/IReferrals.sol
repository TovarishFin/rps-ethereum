pragma solidity ^0.4.25;


interface IReferrals {
  function referredBy(
    address _referee
  )
    external
    view
    returns (address);

  function initialize(
    address _registry
  )
    external;
  
  function setReferral(
    address _referee,
    address _referrer
  )
    external;

  function getReferral(
    address _referee
  )
    external
    view
    returns (address);
}