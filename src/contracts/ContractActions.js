import {sendEvent} from '../analytics/AnalyticsActions'
import { browserHistory } from 'react-router'
import bluebird from 'bluebird'

const contract = require('truffle-contract')

import ServesaContract from '../../build/contracts/Servesa.json'
import ServesaFactory from '../../build/contracts/ServesaFactory.json'
const deployedFactoryAddress = '0xf25186b5081ff5ce73482ad761db0eb0d25abfbf'

import store from '../store'


export const LIST_UPDATE = 'LIST_UPDATE'
function listUpdated(list) {
  return {
    type: LIST_UPDATE,
    payload: list
  }
}

export const CONTRACT_LOADING = 'CONTRACT_LOADING'
function contractLoading() {
  return {
    type: CONTRACT_LOADING
  }
}

export const CONTRACT_UPDATE = 'CONTRACT_UPDATE'
function contractUpdated(contract) {
  return {
    type: CONTRACT_UPDATE,
    payload: contract
  }
}

export const REQUEST_SENT = 'REQUEST_SENT'
function requestSent() {
  return {
    type: REQUEST_SENT
  }
}


export function sendAnalytics(eventType, eventData) {
  return function(dispatch) {
    dispatch(sendEvent(eventType, eventData))
  }
}



export function searchContracts(term) {
  return function(dispatch) {

    // "loading"
    dispatch(requestSent())

    dispatch(sendEvent('search', {
      term: term
    }))

    return fetch('/api/contract/search',
      {
        method: "POST",
        body: { term: term }
      }
    ).then(rawResponse => {
        if(rawResponse.status !== 200){ throw new Error(rawResponse.text) }
        return rawResponse.json()
      }
    ).then(searchResults => {
        dispatch(listUpdated(searchResults))
      }
    ).catch(error => {
      console.error('action error', error)
      return
    })

  }
}


export function getContract(contractAddress) {
  let web3 = store.getState().web3.web3Instance
  let userAddress = web3.eth.accounts[0]


  // Account Data
  // this.setState({activeAccount: this.props.web3.accounts[0]})
  // this.state.contractInstance.isFunder(this.props.web3.accounts[0],(error, response) => { this.handleGetterCallback(error, response, 'activeAccountisFunder') })
  // this.state.contractInstance.getFunderTokens(this.props.web3.accounts[0],(error, response) => { this.handleGetterCallback(error, response, 'activeAccountTokens') })
  // this.state.contractInstance.getFunderPurchase(this.props.web3.accounts[0],(error, response) => { this.handleGetterCallback(error, response, 'activeAccountPurchse') })


  // map contract getter functions to "this.props" fieldnames for convenience on the other side...
  const getterMap = [
    {getter: 'getContractBalance', state: 'balance'},
    {getter: 'getOwner', state: 'owner'},
    {getter: 'totalCurrentTokens', state: 'tokens'},
    {getter: 'totalCurrentFunders', state: 'funders'},
    {getter: 'maxTokens', state: 'maxTokens'},
    {getter: 'ownerCanBurn', state: 'ownerCanBurn'},
    {getter: 'ownerCanSpend', state: 'ownerCanDrain'},
    {getter: 'tokenPriceLinearDivisor', state: 'tokenPriceLinearDivisor'},
    {getter: 'tokenPriceExponentDivisor', state: 'tokenPriceExponentDivisor'},
    {getter: 'tokenBasePrice', state: 'tokenBasePrice'},
    {getter: 'contractName', state: 'contractName'},
    {getter: 'calculateNextBuyPrice', state: 'buyPrice'},
    {getter: 'calculateNextSellPrice', state: 'sellPrice'}
  ]

  let updateObject = {}

  return function(dispatch) {

    // "loading"
    dispatch(contractLoading())

    const contractInstance = contract({abi: ServesaContract.abi})
    contractInstance.defaults({from: userAddress})
    contractInstance.setProvider(web3.currentProvider)
    contractInstance.at(contractAddress)
      .then(instance => {

        // create array of getter promises
        let promiseArray = []
        getterMap.map(item => {
          promiseArray.push(instance[item.getter]())
        })

        if(userAddress){
          promiseArray.push(instance.getFunderTokens(userAddress))
          promiseArray.push(instance.getFunderPurchase(userAddress))
        }

        // execute all getters at once
        return bluebird.all(promiseArray)
      })
      .then(resultArray => {

        if(userAddress){
          // pop off the last two
          updateObject.activeAccountPurchase = resultArray.splice(-1,1)[0]
          updateObject.activeAccountTokens = resultArray.splice(-1,1)[0]
        }

        // unpack results array into object using getterMap from before
        resultArray.forEach((result, index) => {
          updateObject[getterMap[index].state] = result
        })

        dispatch(contractUpdated(updateObject))
      })
      .catch(error => {
        console.log(error)
      })
  }
}

export function createContract(contractOptions) {
  let web3 = store.getState().web3.web3Instance
  let userAddress = web3.eth.accounts[0]

  return function(dispatch) {

    // "loading" display
    dispatch(requestSent())

    // send analytics
    dispatch(sendEvent('create', { 'contractOptions': contractOptions } ))

    if(web3 && userAddress){

      // legacy setting from staketree
      let sunsetWithdrawPeriod = 10000

      const factoryInstance = contract({abi: ServesaFactory.abi})
      factoryInstance.setProvider(web3.currentProvider)
      factoryInstance.defaults({from: userAddress})
      factoryInstance.at(deployedFactoryAddress)
        .then(instance => {

          // Create contract on Ethereum
          return instance.newContract(
            userAddress,
            contractOptions.contractName,
            contractOptions.ownerCanBurn,
            contractOptions.ownerCanSpend,
            contractOptions.maxTokens,
            web3.toWei(contractOptions.tokenBasePrice, 'ether'),
            contractOptions.tokenPriceExponentDivisor,
            contractOptions.tokenPriceLinearDivisor,
            sunsetWithdrawPeriod)

        }).then(result => {

          // Create contract on Servesa search
          console.log('Contract Address:', result.receipt.logs[0].address)

          return fetch('/api/contract/create',{
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              deployedAddress: result.receipt.logs[0].address,
              deployedNetwork: "Testing?",
              contractOptions: contractOptions
            })
          })

        }).then(rawResponse => {
          if(rawResponse.status !== 200){ throw new Error(rawResponse.text) }
          return rawResponse.json()
        }).then(searchResults => {
          // Redirect home.
          return browserHistory.push('/contract/list')
        }).catch(error => {
          console.log(error)
          return browserHistory.push('/contract/list')
        })

    }

  }
}

export function buyTokens(contractAddress, payment) {
  let web3 = store.getState().web3.web3Instance
  let userAddress = web3.eth.accounts[0]

  return function(dispatch) {

    // "loading"
    dispatch(requestSent())
    // analytics
    dispatch(sendEvent('buy', {'payment': payment}))

    const contractInstance = contract({abi: ServesaContract.abi})
    contractInstance.defaults({from: userAddress})
    contractInstance.setProvider(web3.currentProvider)
    contractInstance.at(contractAddress)
      .then(instance => {

        return instance.buy({value: payment})
      })
      .then(resultArray => {

        console.log(updateObject)
        // dispatch(contractUpdated(updateObject))

      })
      .catch(error => {
        console.log(error)
      })

  }
}

export function sellTokens(contractAddress, tokensToSell) {
  let web3 = store.getState().web3.web3Instance
  let userAddress = web3.eth.accounts[0]

  return function(dispatch) {

    // "loading"
    dispatch(requestSent())
    // analytics
    dispatch(sendEvent('sell', {'tokensToSell': tokensToSell}))

    const contractInstance = contract({abi: ServesaContract.abi})
    contractInstance.defaults({from: userAddress})
    contractInstance.setProvider(web3.currentProvider)
    contractInstance.at(contractAddress)
      .then(instance => {

        return instance.sell({tokenCount: tokensToSell})
      })
      .then(resultArray => {
        console.log(updateObject)
        // dispatch(contractUpdated(updateObject))

      })
      .catch(error => {
        console.log(error)
      })

  }
}

export function burnTokens(contractAddress, targetAddress, tokensToBurn ) {
  let web3 = store.getState().web3.web3Instance
  let userAddress = web3.eth.accounts[0]

  return function(dispatch) {

    // "loading"
    dispatch(requestSent())
    // analytics
    dispatch(sendEvent('burn', {'targetAddress': targetAddress, 'tokensToBurn': tokensToBurn}))

    const contractInstance = contract({abi: ServesaContract.abi})
    contractInstance.defaults({from: userAddress})
    contractInstance.setProvider(web3.currentProvider)
    contractInstance.at(contractAddress)
      .then(instance => {

        return instance.burn({'targetAddress': targetAddress, 'tokensToBurn': tokensToBurn})
      })
      .then(resultArray => {
        console.log(updateObject)
        // dispatch(contractUpdated(updateObject))

      })
      .catch(error => {
        console.log(error)
      })


  }
}

export function drainEscrow(contractAddress, amount) {
  let web3 = store.getState().web3.web3Instance
  let userAddress = web3.eth.accounts[0]

  return function(dispatch) {

    // "loading"
    dispatch(requestSent())
    // analytics
    dispatch(sendEvent('drain', { 'amount': amount}))

    const contractInstance = contract({abi: ServesaContract.abi})
    contractInstance.defaults({from: userAddress})
    contractInstance.setProvider(web3.currentProvider)
    contractInstance.at(contractAddress)
      .then(instance => {

        return instance.sell({'amount': amount})
      })
      .then(resultArray => {
        console.log(updateObject)
        // dispatch(contractUpdated(updateObject))

      })
      .catch(error => {
        console.log(error)
      })


  }
}
