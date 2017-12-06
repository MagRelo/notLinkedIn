import React, { Component } from 'react'
import { Link } from 'react-router'

import Modal from 'react-modal';
const customStyles = {
  overlay: {
   backgroundColor   : 'rgba(16, 58, 82, 0.75)'
  },
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-40%',
    transform             : 'translate(-50%, -50%)',
    padding               : 'none'
  }
};


import ServesaContract from '../../../build/contracts/Servesa.json'

class FormComponent extends Component {
  constructor(props, { authData }) {
    super(props)
    authData = this.props
    this.state = {
      modalIsOpen: false,
      loading: true,
      exchangeRate: 0,
      balance: 0,
      tokens: 0,
      owner: 0x0,
      maxTokens: 1000,
      ownerCanBurn : false,
      ownerCanDrain: false,
      tokenBasePrice: 0,
      tokenPriceExponent: 0,
      tokenPriceExponentDivisor: 0,
      buyPrice: 0,
      sellPrice: 0,
      contractInstanceAddress: this.props.contractId,
      contractInstance: null,
      activeAccount: null,
      activeAccountIsOwner: false,
      activeAccountTokens: false,
      burnCount: 0,
      burnAddress: '',
      drainAmount: 0,
      tokensToPurchase: 0,
      purchasePrice: 0,
      tokensToSell: 0,
      history: [],
      testIdAddress: ''
    }

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  // Modal functions
  openModal() { this.setState({modalIsOpen: true})}
  afterOpenModal() {}
  closeModal() { this.setState({modalIsOpen: false})}

  componentWillMount(){

    fetch("https://api.coinmarketcap.com/v1/ticker/ethereum/?convert=USD")
      .then(res => {return res.json()})
      .then(data => {
        this.setState({
          exchangeRate: parseInt(data[0].price_usd, 10)
        });
      });

    fetch("https://rinkeby.etherscan.io/api?module=account&action=txlist&address=" + this.props.contractId + "&startblock=0&endblock=99999999&sort=desc&apikey=" + "XFWXCMBMV2HXW3QIMQSUS7NXXRZHVUS6HU")
      .then(res => {return res.json()})
      .then(data => {
        this.setState({
          history: data.result
        });
      });

      if(this.props.web3.web3Instance){
        this.loadContract(this.props.contractId)
      } else {
        setTimeout(() => {
          this.loadContract(this.props.contractId)
        }, 1500)
      }

  }

  loadContract(contractId){
    let web3 = this.props.web3.web3Instance
    if(web3){
      const contractInstance = web3.eth.contract(ServesaContract.abi).at(contractId)
      this.setState({contractInstance: web3.eth.contract(ServesaContract.abi).at(this.state.contractInstanceAddress)})

      // map getter functions to "this.state" fieldnames
      const functionArray = [
        {function: 'getContractBalance', state: 'balance'},
        {function: 'getOwner', state: 'owner'},
        {function: 'totalCurrentTokens', state: 'tokens'},
        {function: 'totalCurrentFunders', state: 'funders'},
        {function: 'maxTokens', state: 'maxTokens'},
        {function: 'ownerCanBurn', state: 'ownerCanBurn'},
        {function: 'ownerCanSpend', state: 'ownerCanDrain'},
        {function: 'tokenPriceExponent', state: 'tokenPriceExponent'},
        {function: 'tokenPriceExponentDivisor', state: 'tokenPriceExponentDivisor'},
        {function: 'tokenBasePrice', state: 'tokenBasePrice'},
        {function: 'contractName', state: 'contractName'},
        {function: 'calculateNextBuyPrice', state: 'buyPrice'},
        {function: 'calculateNextSellPrice', state: 'sellPrice'},
      ]

      // exectute getter fuctions
      functionArray.map(item => {
        this.state.contractInstance[item.function]((error, response) => {this.handleGetterCallback(error, response, item.state)})
      })

      // account data
      this.setState({activeAccount: this.props.web3.accounts[0]})
      this.state.contractInstance.isFunder(this.props.web3.accounts[0],(error, response) => { this.handleGetterCallback(error, response, 'activeAccountisFunder') })
      this.state.contractInstance.getFunderTokens(this.props.web3.accounts[0],(error, response) => { this.handleGetterCallback(error, response, 'activeAccountTokens') })
      this.state.contractInstance.getFunderPurchase(this.props.web3.accounts[0],(error, response) => { this.handleGetterCallback(error, response, 'activeAccountPurchse') })

      contractInstance.getOwner((error, response) => {
        if(error){ return console.log('feildName:', error) }
        if(response){
          this.setState({activeAccountIsOwner: response === this.props.web3.accounts[0]})
        }
      })

      this.setState({loading: false})
    } else {
      console.log('Error: No web3')
    }
  }

  handleGetterCallback(error, response, feildName){
    if(error){
      return console.log('feildName:', error)
    }

    if(response){
      let update = {}

      if(typeof(response) === 'object'){
        update[feildName + '_big'] = response
        update[feildName] = response.toNumber()
      } else {
        update[feildName] = response
      }

      this.setState(update)
    }

  }

  round(value, places){
    places = places || 4
    return +(Math.round(value + "e+" + places)  + "e-" + places);
  }

  displayWei(wei){
    return 'Ξ' + this.round(web3.fromWei(wei, 'ether'), 5) + ' ETH ($' +
     this.round(this.state.exchangeRate * web3.fromWei(wei, 'ether')) + ')'
  }

  fracExp(k,q,n,p){
      let s = 0;
      let N = 1;
      let B = 1;
      for (let i = 0; i < p; ++i){
        s += k * N / B / (q**i);
        N  = N * (n-i);
        B  = B * (i+1);
      }
      return s;
    }

  calcPurchasePrice(tokensToPurchase, maxTokens, tokenSupply, tokenBasePrice, exponent, exponentDivisor){

    tokensToPurchase = tokensToPurchase || 0
    tokensToPurchase = Math.min(tokensToPurchase, maxTokens)

    let totalPurchasePrice = 0
    let linear = 0
    let exp = 0
    let nextTokenPrice = 0
    for(let i=1; i <= tokensToPurchase; i++){
      linear = tokenBasePrice * (tokenSupply + i)/1000
      exp = this.fracExp(tokenBasePrice, exponentDivisor, tokenSupply, 2)
      nextTokenPrice = exp + linear

      totalPurchasePrice += nextTokenPrice
    }

    return totalPurchasePrice
  }

  handleTransactionCallback(error, response, data){
    if(error){
      // launch Modal error
      console.log('error:' ,error)
    } else {

      // launch Modal success
      console.log('success:', data.type, response)

      this.setState({
        transactionType: data.type,
        transactionId: response
      })

      this.openModal()

      // clear state
      this.setState({
        tokensToPurchase: 0,
        purchasePrice: 0,
        tokensToSell: 0,
        sellTotal: 0,
        testIdAddress: '' })
    }
  }

  buyOnChange(event){
    this.setState({
      tokensToPurchase: event.target.value,
      purchasePrice: this.calcPurchasePrice( event.target.value, this.state.maxTokens - this.state.tokens, this.state.tokens, this.state.tokenBasePrice, this.state.tokenPriceExponent, this.state.tokenPriceExponentDivisor )
    })
  }
  buyTokens(event){
    event.preventDefault()
    this.state.contractInstance.buy({
        from: this.props.web3.accounts[0],
        value: Math.ceil(this.state.purchasePrice)
      }, (error, response) => {this.handleTransactionCallback(error, response, {type: 'buy'})})
  }

  sellOnChange(event){
    this.setState({
      tokensToSell: event.target.value,
      sellTotal: (event.target.value * this.state.sellPrice)
    })
  }
  sellTokens(event){
    event.preventDefault()
    this.state.contractInstance.sell(this.state.tokensToSell, {
      from: this.props.web3.accounts[0]
    }, (error, response) => {this.handleTransactionCallback(error, response, {type: 'sell'})})
  }

  testAddress(event){
    event.preventDefault()
    this.state.contractInstance.isFunder(this.state.testIdAddress, {
      from: this.props.web3.accounts[0]
    }, (error, response) => {this.handleTransactionCallback(error, response, {type: 'test'})})
  }

  burnTokens(event){
    event.preventDefault()
    this.state.contractInstance.burn(this.state.targetUserId, this.state.tokenCount, {
      from: this.props.web3.accounts[0]
    }, (error, response) => {this.handleTransactionCallback(error, response, {type: 'burn'})})
  }

  drainEscrow(event){
    event.preventDefault()
    this.state.contractInstance.spend(this.state.drainAmount, {
      from: this.props.web3.accounts[0]
    }, (error, response) => {this.handleTransactionCallback(error, response, {type: 'spend'})})
  }

  render() {
    return(

      <main className="">

        {this.state.loading ?

        <div>
          <p>Loading:</p>
          <ul>
            <li>
              <p>MetaMask detected: {}</p>
            </li>
            <li>
              <p>MetaMask account detected: {}</p>
            </li>
          </ul>
        </div>

          :

        <div>
          <h3>Contract Details</h3>
          <h1>{this.state.contractName}</h1>
          <div>
            <div className="pure-g">
              <div className="pure-u-1 pure-u-md-1-2 pad-box">
                <p>Max tokens: <span>{this.state.maxTokens}</span> </p>
                <p>Tokens issued: <span> {this.state.tokens}</span></p>
                <p>Token holders: <span>{this.state.funders}</span></p>
                <p>Token base price: <span> {this.displayWei(this.state.tokenBasePrice)}</span></p>
                <p>Token pricing exponent: <span>{this.state.tokenPriceExponent}</span></p>
                <p>Token pricing divisor: <span>{this.state.tokenPriceExponentDivisor}</span></p>
                <p>Balance: <span>{this.displayWei(this.state.balance)}</span></p>
              </div>

              <div className="pure-u-1 pure-u-md-1-2  pad-box">
                <hr></hr>
                <p>Contract Owner: &nbsp;
                  <span>
                    <a className="pure-link-primary"
                      href={"https://rinkeby.etherscan.io/address/" + this.state.owner}
                      target="_blank">View Owner Account
                    </a>
                  </span>
                </p>
                <p>Owner can burn: <span>{this.state.ownerCanBurn ? 'Yes': 'No'}</span></p>
                <p>Owner can drain: <span>{this.state.ownerCanDrain ? 'Yes': 'No'}</span></p>
                <hr></hr>
                <p>Etherscan: &nbsp;
                  <span>
                    <a className="pure-link-primary"
                      href={"https://rinkeby.etherscan.io/address/" + this.state.contractInstanceAddress}
                      target="_blank">View Contract
                    </a>
                  </span>
                </p>
                <p>
                <span>
                  <button
                    className="pure-button pure-button-primary"
                    onClick={()=>{this.loadContract(this.state.contractInstanceAddress)}}>Refresh Data</button>
                </span>
                </p>
              </div>
            </div>
          </div>

          <div className="pure-g">
            <div className="pure-u-1 pure-u-md-1-2 pad-box">

              <h3>Buy</h3>
              <p>next token price: <span>{this.displayWei(this.state.buyPrice)}</span></p>
              <form className="pure-form" onSubmit={this.buyTokens.bind(this)}>
                <fieldset>
                  <label>Tokens to purchase (max: {this.state.maxTokens - this.state.tokens})</label>
                  <input
                    className="pure-input-1"
                    type="number"
                    value={this.state.tokensToPurchase}
                    max={this.state.maxTokens - this.state.tokens}
                    min="0"
                    onChange={this.buyOnChange.bind(this)}></input>
                  <p>Total: <span>{this.displayWei(this.state.purchasePrice)} </span></p>
                </fieldset>
                <div style={{textAlign: 'right'}}>
                  <button
                    type="submit"
                    className="pure-button pure-button-primary"
                    disabled={this.state.tokensToPurchase < 1 || !this.state.activeAccount}>Buy
                  </button>
                </div>
              </form>

            </div>
            <div className="pure-u-1 pure-u-md-1-2 pad-box">

              <h3>Sell</h3>
              <p>sell price: <span>{this.displayWei(this.state.sellPrice)}</span></p>
              <form className="pure-form" onSubmit={this.sellTokens.bind(this)}>
                <fieldset>
                  <label>Tokens to sell (Max:{this.state.activeAccountTokens})</label>
                  <input type="text" className="pure-input-1"
                    type="number"
                    value={this.state.tokensToSell}
                    max={this.state.activeAccountTokens}
                    min="0"
                    onChange={this.sellOnChange.bind(this)}></input>
                  <p>Total: <span>{this.displayWei(this.state.sellTotal)} </span></p>
                </fieldset>
                <div style={{textAlign: 'right'}}>
                  <button
                    type="submit"
                    className="pure-button pure-button-primary"
                    disabled={this.state.tokensToSell < 1 || !this.state.activeAccount}>Sell</button>
                </div>
              </form>

            </div>
            <div className="pure-u-1 pure-u-md-1-2 pad-box">

              <h3>Challenge</h3>
              <div style={{marginLeft: '1em'}}>
                <form className="pure-form" onSubmit={this.testAddress.bind(this)}>
                  <fieldset>
                    <label>Address</label>
                    <input
                      className="pure-input-1"
                      type="text"
                      value={this.state.testIdAddress}
                      onChange={(event)=>{this.setState({testIdAddress: event.target.value})}}></input>
                  </fieldset>

                  <div style={{textAlign: 'right'}}>
                    <button
                      className="pure-button pure-button-primary"
                      disabled={this.state.testIdAddress == ''}>Test</button>
                  </div>

                </form>
              </div>

            </div>
          </div>



          {!this.state.activeAccountIsOwner ? null :
          <div className="pure-g">
            <div className="pure-u-1 pure-u-md-1-2 pad-box">

              <h3>Burn </h3>
              <form className="pure-form" onSubmit={this.burnTokens.bind(this)}>

                <label>Burn Address</label>
                <input type="text" className="pure-input-1"
                  type="text"
                  value={this.state.burnAddress}
                  onChange={(event)=>{this.setState({burnAddress: event.target.value})}}></input>
                <label>Burn Count</label>
                <input type="text" className="pure-input-1"
                  type="number"
                  value={this.state.burnCount}
                  onChange={(event)=>{this.setState({burnCount: event.target.value})}}></input>

                <div style={{textAlign: 'right'}}>
                  <button className="pure-button pure-button-primary"
                    disabled={this.state.burnCount < 1}>Burn</button>
                </div>
              </form>
          </div>
          <div className="pure-u-1 pure-u-md-1-2 pad-box">

            <h3>Drain </h3>
            <form className="pure-form" onSubmit={this.drainEscrow.bind(this)}>
              <label>Drain Amount</label>
              <input type="text" className="pure-input-1"
                type="number"
                value={this.state.drainAmount}
                onChange={(event)=>{this.setState({drainAmount: event.target.value})}}></input>

              <div style={{textAlign: 'right'}}>
                <button
                  className="pure-button pure-button-primary"
                  disabled={this.state.drainAmount <= 0}>Drain</button>
              </div>
            </form>

          </div>

        </div>
        }

        <h3>Transactions ({this.state.history.length})</h3>
        <div style={{marginLeft: '1em'}}>
          <table className="pure-table pure-table-horizontal table-100">
            <thead>
              <tr>
                <td>From</td>
                <td>Value</td>
                <td>Link</td>
              </tr>
            </thead>
            <tbody>

              {this.state.history.map((transaction)=>{
                return <tr key={transaction.hash}>

                    <td>{transaction.from}</td>
                    <td>{this.displayWei(transaction.value)}</td>
                    <td>
                      <a className="pure-link-primary" target="_blank" href={"https://rinkeby.etherscan.io/tx/" + transaction.hash}> &rarr; </a>
                    </td>
                </tr>
              })}

            </tbody>
          </table>
        </div>

        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="">

            <div className="confirm-container">

              <div className="confirm-title-container">
                <span className="title">Transaction: {this.state.transactionType} </span>
              </div>

              <div className="confirm-body-container">

                <p>Your transaction has been successfully submitted. Transactions typically take about 45 seconds to be confirmed.</p>
                <p>You can view this transaction on Etherscan: &nbsp;
                  <span>
                    <a className="pure-link-primary"
                      href={"https://rinkeby.etherscan.io/tx/" + this.state.transactionId}
                      target="_blank">View Transaction</a>
                  </span>
                </p>
                <p>After the transaction has been confirmed you can refresh the contract to see the updated contract data.</p>

                <div style={{textAlign: 'right'}}>
                  <button className="pure-button pure-button-primary"
                    onClick={this.closeModal.bind(this)}>OK
                  </button>
                </div>

              </div>
            </div>
          </Modal>

      </div>

      // "loading"
    }

      </main>
    )
  }
}


export default FormComponent
