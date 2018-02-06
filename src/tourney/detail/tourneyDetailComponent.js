import React, { Component } from 'react'
import { Link } from 'react-router'

// sockets
import io from 'socket.io-client';
let gameSocket

// timer
let intervalId = 0

import LoginButton from '../signin/signinContainer'
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

    // gameSocket.on('error', this.socketError)
    // gameSocket.on('disconnect', this.socketError)
    // gameSocket.on('connect_failed', this.socketError)
    // gameSocket.on('reconnect_failed', this.socketError)

    gameSocket.on('reconnecting', this.socketError)
    gameSocket.on('connect', data =>{
      console.log('Game connected, fetching data...')
      gameSocket.emit('update', {gameId: '5a7251f391b319a1c28e66da'})
    })
    gameSocket.on('update', this.updateGameData.bind(this))

    this.state = {
      modalIsOpen: false,
      timeRemaining: 30,
      status: {
        progress: {
          currentRound: 0,
          currentPhase: ''
        }
      },
      items: [],
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

    // check gameState
    if(data.status.gameReady){
      this.setState({ })
    }


    if(data.status.gameInProgress){
      this.setState({
        status: data.status,
        timeRemaining: data.status.timeRemaining,
        rounds: data.rounds,
        items: data.itemList,
        playerList: data.playerList,
        candidateList: this.filterCandidates(data.candidateList, data.itemList),
        proposalList: data.rounds[data.status.currentRound].proposals.map(proposal => proposal.target)
      })

      // show counter display
      this.startCountdown()
    }

    //
    if(data.status.gameComplete){
      this.setState({rounds: data.rounds})
    }

  }
  socketError(data){
    console.log('Reconnecting... Attempts:', data)
  }


  // Modal functions
  openModal() { this.setState({modalIsOpen: true})}
  afterOpenModal() {}
  closeModal() { this.setState({modalIsOpen: false})}


  // Submit functions
  submitProposal(proposalTarget, proposalAction){
    console.log('Submit proposal: ', proposalTarget);
    gameSocket.emit('proposal', {
      round: this.status.currentRound,
      proposalTarget: proposalTarget,
      proposalAction: proposalAction
    })

  }
  submitVote(proposalTarget, vote){
    console.log('Submit vote: ', proposalTarget.name);
    gameSocket.emit('vote', {
      round: this.status.currentRound,
      target: proposalTarget,
      vote: vote,
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
      gameSocket.emit('update', {gameId: '5a7251f391b319a1c28e66da'})
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

  render() {
    return(

      <main style={{display: 'flex', flexDirection: 'column'}}>

        <div style={{flex: '1'}}>
          <LoginButton tournamentId={this.props.params.tournamentId}/>
        </div>

        <div style={{flex: '9', display: 'flex', flexDirection: 'row'}}>

          <div style={{flex: '4', display: 'flex', flexDirection: 'column'}}>
            <div className="game-panel" style={{flex: '5'}}>

              <time style={{float: 'right', order: 20}}>{this.state.timeRemaining}
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
