# Servesa contracts
Influence group dynamics by programatically adjusting incentives in response to the behavior of the group.

## Contract structure
### contract setup data
- contract owner
- contract meta info 
  - name
  - avatar
- tokenBasePrice
- pledge curve equation (quasilinear enter preference?)
- withdraw curve equation (quasilinear leave preference?)

### live contract data
- escrow balance
- token ledger

### standard functions
- pledge (deposit Eth, get tokens)
- withdraw (redeem tokens for Eth)

### optional functions
- challenge (test an id for token ownership)
- collect (owner can burn a depositor’s tokens, removing thier claim to the escrow balance)
- spend (owner can move funds from the contract escrow to the owner’s personal account)
