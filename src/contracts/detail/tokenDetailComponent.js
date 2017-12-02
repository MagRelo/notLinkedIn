import React, { Component } from 'react'
import { Link } from 'react-router'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';


import TokenPriceChart from './tokenPriceChart'

// Forms
import BuyForm from './buyForm'
import SellForm from './sellForm'
import BurnForm from './burnForm'
import SpendForm from './spendForm'

import store from '../../store'
import ServesaContract from '../../../build/contracts/Servesa.json'

const insertIntoArray = (arr, value) => {
    return arr.reduce((result, element, index, array) => {
        result.push(element);
        if (index < array.length - 1) {
            result.push(value);
        }
        return result;
    }, []);
};

class FormComponent extends Component {
  constructor(props, { authData }) {
    super(props)
    authData = this.props
    this.state = {
      loading: true,
      exchangeRate: 0,
      network: "Rinkeby",
      balance: 0,
      tokens: 0,
      owner: 0x0,
      ownerCanBurn : false,
      ownerCanDrain: false,
      tokenBasePrice: 0,
      tokenPriceExponent: 0,
      tokenPriceExponentDivisor: 0,
      buyPrice: 0,
      buyPriceRaw: 0,
      sellPrice: 0,
      contractInstanceAddress: '0x40f8Da2C9B078F6693D80BaC02182268E8B1779a',
      contractInstance: null,
      activeAccount: null,
      activeAccountIsOwner: false,
      activeAccountTokens: false,
      burnCount: 0,
      burnAddress: '',
      history: []
    }
  }

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
        this.getContractData(this.props.contractId)
      } else {
        setTimeout(() => {
          this.getContractData(this.props.contractId)
        }, 1500)
      }

      //
  }

  getContractData(contractId){
    let web3 = this.props.web3.web3Instance
    if(web3){

      // load contract data
      const contractInstance = web3.eth.contract(ServesaContract.abi).at(contractId)

      contractInstance.getContractBalance((error, response) => { this.setState({balance: web3.fromWei(response.toNumber(), 'ether')}) })
      contractInstance.totalCurrentTokens((error, response) => { this.setState({tokens: response.toNumber()}) })

      contractInstance.getOwner((error, response) => { this.setState({
        owner: response,
        activeAccountIsOwner: this.props.web3.accounts[0] == response
      }) })

      contractInstance.isFunderTokens(this.props.web3.accounts[0],(error, response) => { this.setState({ activeAccountTokens: response.toNumber() }) })

      contractInstance.ownerCanBurn((error, response) => { this.setState({ownerCanBurn: response}) })
      contractInstance.ownerCanSpend((error, response) => { this.setState({ownerCanDrain: response}) })
      contractInstance.tokenBasePrice((error, response) => { this.setState({tokenBasePrice: web3.fromWei(response.toNumber(), 'ether')}) })
      contractInstance.tokenPriceExponent((error, response) => { this.setState({tokenPriceExponent: response.toNumber() }) })
      contractInstance.tokenPriceExponentDivisor((error, response) => { this.setState({tokenPriceExponentDivisor: response.toNumber() }) })

      contractInstance.calculateNextBuyPrice((error, response) => { this.setState({
        buyPrice: web3.fromWei(response.toNumber(), 'ether'),
        buyPriceRaw: response.toNumber()
      }) })
      contractInstance.calculateNextSellPrice((error, response) => { this.setState({sellPrice: web3.fromWei(response.toNumber(), 'ether')}) })

      this.setState({contractInstance: web3.eth.contract(ServesaContract.abi).at(this.state.contractInstanceAddress)})

      this.setState({loading: !contractInstance})
    } else {
      console.log('Error: No web3')
    }
  }

  round(value, places){
    places = places || 4
    return +(Math.round(value + "e+" + places)  + "e-" + places);
  }

  buyTokens(){
    this.state.contractInstance.buy({
      from: this.props.web3.accounts[0],
      value: this.state.buyPriceRaw
    }, (error, response) => { console.log(error, response)})
  }

  sellTokens(tokenCount){
    this.state.contractInstance.sell({
      from: this.props.web3.accounts[0]
    }, (error, response) => { console.log(error, response)})
  }

  burnTokens(targetUserId, tokenCount){
    this.state.contractInstance.burn({
      from: this.props.web3.accounts[0]
    }, (error, response) => { console.log(error, response)})
  }

  spendEscrow(spendAmount){
    this.state.contractInstance.drain({
      from: this.props.web3.accounts[0]
    }, (error, response) => { console.log(error, response)})
  }

  render() {
    return(

      <main className="">

        {this.state.loading ? <p>loading</p> :

        <div>
          <h3>Contract Details</h3>
          <div style={{marginLeft: '1em'}}>
            <p>balance: {this.state.balance} ETH  ($ {this.round(this.state.exchangeRate * this.state.balance, 2)} USD)</p>
            <p>tokens: {this.state.tokens}</p>
            <p>contract owner: {this.state.owner}</p>
            <p>owner can burn: {this.state.ownerCanBurn ? 'true': 'false'}</p>
            <p>owner can drain: {this.state.ownerCanDrain ? 'true': 'false'}</p>
            <p>base price: {this.state.tokenBasePrice} ETH  (${this.round(this.state.exchangeRate * this.state.tokenBasePrice, 2)} USD)</p>
            <p>exponent: {this.state.tokenPriceExponent}</p>
            <p>divisor: {this.state.tokenPriceExponentDivisor}</p>
            <p>Network: {this.state.network}</p>
            <p>Etherscan: &nbsp;
              <a
                href={"https://rinkeby.etherscan.io/address/" + this.state.contractInstanceAddress}
                target="_blank">{this.state.contractInstanceAddress}
              </a>
            </p>
          </div>


          <h3>Buy</h3>
          <div style={{marginLeft: '1em'}}>
            <p>next buy price: {this.state.buyPrice} ETH  (${this.round(this.state.exchangeRate * this.state.buyPrice, 2)} USD)</p>
            <button
              style={{}}
              className="pure-button pure-button-primary"
              onClick={()=>{this.buyTokens()}}>Buy one token ($ {this.round(this.state.exchangeRate * this.state.buyPrice, 2)} USD)</button>
          </div>

          <h3>Sell</h3>
          <div style={{marginLeft: '1em'}}>
            <p>your token count: {this.state.activeAccountTokens}</p>
            <p>next sell price: {this.state.sellPrice} ETH  (${this.round(this.state.exchangeRate * this.state.sellPrice, 2)} USD)</p>
            <button
              className="pure-button pure-button-primary"
              onClick={()=>{this.sellTokens()}}>Sell one token (${this.round(this.state.exchangeRate * this.state.sellPrice, 2)} USD)</button>
          </div>

          {!this.state.activeAccountIsOwner ? null :
            <div>
              <h3>Owner Functions </h3>
              <div style={{marginLeft: '1em'}}>
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

                  <button className="pure-button pure-button-primary">Burn</button>
                </form>

                <form className="pure-form" onSubmit={this.burnTokens.bind(this)}>

                  <label>Drain Amount</label>
                  <input type="text" className="pure-input-1"
                    type="number"
                    value={this.state.drainAmount}
                    onChange={(event)=>{this.setState({drainAmount: event.target.value})}}></input>

                  <button className="pure-button pure-button-primary">Drain</button>
                </form>
              </div>

            </div>
          }

          <h3>Transactions ({this.state.history.length})</h3>
          <div style={{marginLeft: '1em'}}>
            <table className="pure-table pure-table-horizontal">
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
                      <td>{transaction.value}</td>
                      <td>
                        <a target="_blank" href={"https://rinkeby.etherscan.io/tx/" + transaction.hash}> &rarr; </a>
                      </td>
                  </tr>
                })}

              </tbody>
            </table>            
          </div>
        </div>
        }

      </main>
    )
  }
}


export default FormComponent
