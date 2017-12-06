pragma solidity 0.4.18;
import './Servesa.sol';

contract ServesaFactory {
  uint public contractCount;
  mapping(address => address[]) public contracts;

  function newContract(
    address ownerAddress,
    string contractName,
    bool ownerCanBurn,
    bool ownerCanSpend,
    uint tokenBasePrice,
    uint tokenPriceExponent,
    uint sunsetWithdrawPeriod) public returns (address newAddress) {

    Servesa contractId = new Servesa(
      ownerAddress,
      contractName,
      ownerCanBurn,
      ownerCanSpend,
      tokenBasePrice,
      tokenPriceExponent,
      sunsetWithdrawPeriod
    );

    contracts[msg.sender].push(contractId);
    contractCount += 1;

    return contractId;
  }

  function getContractAddress() public constant returns (address[]) {
    return contracts[msg.sender];
  }
}
