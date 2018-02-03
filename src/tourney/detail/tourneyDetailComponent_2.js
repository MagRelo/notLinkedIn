import React, { Component } from 'react'
import { Link } from 'react-router'

// sockets
import io from 'socket.io-client';
let gameSocket

// timer
let intervalId = 0

import WrappedModal from '../confirmationModal'

//
import AddProposal from './components/addProposal'
import VoteOnProposal from './components/voteOnProposal'
import RoundResults from './components/roundResults'
import RoundProgress from './components/roundProgress'
import PlayerList from './components/playerList'
import SelectTable from './components/selectTable'


class FormComponent extends Component {
  constructor(props) {
    super(props)

    // connect to game
    gameSocket = io('http://localhost:8080/game');
    gameSocket.on('connect', data =>{
      console.log('Game connected')
      // get game data
      gameSocket.emit('update', {gameId: '5a7251f391b319a1c28e66da'})

    })
    gameSocket.on('update', this.updateGameData.bind(this))
    gameSocket.on('error', this.socketError)


    this.state = {
      modalIsOpen: false,
      timeRemaining: 30,
      items: [
        {
          "id": "bitcoin",
          "name": "Bitcoin",
          "symbol": "BTC",
          "rank": "1",
          "price_usd": "8915.4",
          "price_btc": "1.0",
          "24h_volume_usd": "8789180000.0",
          "market_cap_usd": "150128756435",
          "available_supply": "16839262.0",
          "total_supply": "16839262.0",
          "max_supply": "21000000.0",
          "percent_change_1h": "-1.98",
          "percent_change_24h": "-11.75",
          "percent_change_7d": "-20.96",
          "last_updated": "1517515768"
        },
        {
          "id": "ethereum",
          "name": "Ethereum",
          "symbol": "ETH",
          "rank": "2",
          "price_usd": "1008.73",
          "price_btc": "0.114473",
          "24h_volume_usd": "4649030000.0",
          "market_cap_usd": "98200256287.0",
          "available_supply": "97350387.0",
          "total_supply": "97350387.0",
          "max_supply": null,
          "percent_change_1h": "-3.18",
          "percent_change_24h": "-8.76",
          "percent_change_7d": "-4.75",
          "last_updated": "1517515753"
        },
        {
          "id": "ripple",
          "name": "Ripple",
          "symbol": "XRP",
          "rank": "3",
          "price_usd": "0.942359",
          "price_btc": "0.00010687",
          "24h_volume_usd": "1216350000.0",
          "market_cap_usd": "36779340372.0",
          "available_supply": "39029011631.0",
          "total_supply": "99992725510.0",
          "max_supply": "100000000000",
          "percent_change_1h": "-3.83",
          "percent_change_24h": "-16.12",
          "percent_change_7d": "-28.43",
          "last_updated": "1517516041"
        }
      ],


      status: {},
      playerList: [],
      candidateList: [],
      proposalList: [],
      rounds: [],
    }

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  // lifecycle
  componentDidMount(){
  }
  componentWillUnmount() {
    gameSocket.disconnect()
    clearInterval(intervalId)
  }


  // socket handlers
  updateGameData(data){
    console.log(data)
    this.setState({
      status: data.status,
      timeRemaining: data.status.timeRemaining,
      rounds: data.rounds,
      items: data.itemList,
      playerList: data.playerList,
      candidateList: this.filterCandidates(data.candidateList, this.state.items),
      proposalList: data.proposals.map(proposal => proposal.target)
    })

    // if round in progress, start/update timer
    if(false){
      startCountdown()
    }

  }
  socketError(data){
    console.error(data)
  }


  // Modal functions
  openModal() { this.setState({modalIsOpen: true})}
  afterOpenModal() {}
  closeModal() { this.setState({modalIsOpen: false})}


  // Submit functions
  submitProposal(proposalTarget, proposalAction){
    console.log('Submit proposal: ', proposalTarget);
    gameSocket.emit('proposal', {
      round: 0,
      proposalTarget: proposalTarget,
      proposalAction: proposalAction
    })

  }
  submitVote(){
    gameSocket.emit('vote', {
      target: proposalTarget,
      vote: proposalAction,
    })

  }

  // display functions
  startCountdown(){
    clearInterval(intervalId)
    intervalId = setInterval(this.countDownTimer.bind(this), 1000)
  }
  countDownTimer(){
    let nextTick = this.state.timeRemaining - 1
    this.setState({timeRemaining: nextTick})
    if(nextTick === 0){
      clearInterval(intervalId)
    }
  }
  filterCandidates(baseArray, removeArray){
    const idArray = removeArray.map(item => item.symbol)
    return baseArray.filter(baseItem => !~idArray.indexOf(baseItem.symbol))
  }
  round(value, places){
    places = places || 4
    return +(Math.round(value + "e+" + places)  + "e-" + places);
  }
  displayWei(input){
    let ethereum = ''
    let wei = input
    if(input){
      if(typeof(input) === 'object'){
        wei = wei.toNumber()
      }
      ethereum = this.round(web3.fromWei(wei, 'ether'), 5)
    }
    return 'Ξ' + ethereum + ' ETH ($' +
     this.round(this.state.exchangeRate * web3.fromWei(wei, 'ether')) + ')'
  }
  format(input){
    if(typeof(input) === 'object'){
      input = input.toNumber()
    }
    return input
  }

  toggleActions(){ this.setState({'status': {currentPhase: 'proposals'}}) }
  toggleVote(){ this.setState({'status': {currentPhase: 'votes'}}) }
  toggleResults(){ this.setState({'status': {currentPhase: 'results'}}) }

  render() {
    return(

      <main style={{display: 'flex', flexDirection: 'column'}}>

        <div style={{flex: '1', display: 'flex', flexDirection: 'row'}}>

          <div style={{flex: '4', display: 'flex', flexDirection: 'column'}}>
            <div className="game-panel" style={{flex: '5'}}>

              <time style={{float: 'right', order: 20}}>{this.state.timeRemaining}

                <button onClick={this.toggleActions.bind(this)}>proposals</button>
                <button onClick={this.toggleVote.bind(this)}>vote</button>
                <button onClick={this.toggleResults.bind(this)}>resultsList</button>

              </time>

              {this.state.status.currentPhase === 'proposals' ?
                <AddProposal
                  candidateList={this.state.candidateList}
                  itemList={this.state.items}
                  submitProposal={this.submitProposal}/>
              :null}

              {this.state.status.currentPhase === 'votes' ?
                <VoteOnProposal
                  proposalList={this.state.proposalList}
                  submitVote={this.submitVote.bind(this)}/>
              :null}

              {this.state.status.currentPhase === 'results' ?
                <RoundResults resultsList={this.state.items}/>
              :null}

            </div>
            <div className="game-panel" style={{flex: '2'}}>

              <RoundProgress roundList={this.state.rounds}/>

            </div>
          </div>

          <div style={{flex: '2', display: 'flex', flexDirection: 'column'}}>
            <div className="game-panel" style={{flex: '2'}}>

              <PlayerList playerList={this.state.playerList}/>

            </div>
            <div className="game-panel" style={{flex: '5'}}>

              Chat

            </div>
          </div>

        </div>

        <WrappedModal
          modalIsOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          closeModal={this.closeModal}
          transactionPending={this.props.transactionPending}
          transactionID={this.props.transactionID}/>

      </main>
    )
  }
}


export default FormComponent
