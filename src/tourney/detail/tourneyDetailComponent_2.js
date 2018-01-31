import React, { Component } from 'react'
import { Link } from 'react-router'

import WrappedModal from '../confirmationModal'


class FormComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalIsOpen: false,
      rounds: [
        {hash: 1, proposal: true, voting: true, settlement: true},
        {hash: 2, proposal: [
          {hash: 1, name: "Remove NEO"},
          {hash: 2, name: "ADD WAVES"},
          {hash: 3, name: "Add LTC"},
        ], voting: false, settlement: false},
        {hash: 3, proposal: false, voting: false, settlement: false},
      ],
      items: [
        {hash: 1, name: "BTC"},
        {hash: 2, name: "ETH"},
        {hash: 3, name: "NEO"}
      ],
      players: [
        {hash: 1, name: "bill", chipCount: 100},
        {hash: 2, name: "jim", chipCount: 100},
        {hash: 3, name: "ted", chipCount: 100},
        {hash: 4, name: "ted", chipCount: 100},
        {hash: 5, name: "ted", chipCount: 100},
        {hash: 6, name: "ted", chipCount: 100},
        {hash: 7, name: "ted", chipCount: 100},
        {hash: 8, name: "ted", chipCount: 100}
      ],
    }

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  // Modal functions
  openModal() { this.setState({modalIsOpen: true})}
  afterOpenModal() {}
  closeModal() { this.setState({modalIsOpen: false})}

  componentDidMount(){
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

  tokenShare(chipCount, players){

    let chipTotal = players.reduce((count, player) => { return count + player.chipCount }, 0)

    return this.round(100 * (chipCount / chipTotal), 2) + '%'
  }

  render() {
    return(

      <main style={{display: 'flex', flexDirection: 'column'}}>

        <div style={{flex: '1', display: 'flex', flexDirection: 'row'}}>

          <div style={{flex: '4', display: 'flex', flexDirection: 'column'}}>

            <div className="game-panel" style={{flex: '5'}}>

              <h3> Submit a proposal </h3>
              <div style={{display: 'flex', flexDirection: 'row'}}>
                <div style={{flex: '1'}}><button className="pure-button pure-button-primary">Add</button></div>
                <div style={{flex: '1'}}><button className="pure-button pure-button-primary">Remove</button></div>
                <div style={{flex: '1'}}><button className="pure-button pure-button-primary">Pass</button></div>
              </div>

              <h3> Proposals </h3>
              <div style={{marginLeft: '1em'}}>
                <table className="pure-table pure-table-horizontal table-100">
                  <thead>
                    <tr>
                      <td>Name</td>
                    </tr>
                  </thead>
                  <tbody>

                    {this.state.rounds[1].proposal.map( item =>{
                      return <tr key={item.hash}>
                          <td>{item.name}</td>
                      </tr>
                    })}

                  </tbody>
                </table>
              </div>

              <h3> Vote </h3>
              <p> Remove "NEO" </p>
              <div style={{display: 'flex'}}>
                <button style={{flex: '1 1 auto'}} className="pure-button pure-button-primary"> Yes </button>
                <button style={{flex: '1 1 auto'}} className="pure-button pure-button-primary"> No </button>
              </div>
              <button className="pure-button pure-button-primary"> Confirm </button>

              <h3> Results </h3>
              <div style={{marginLeft: '1em'}}>
                <table className="pure-table pure-table-horizontal table-100">
                  <thead>
                    <tr>
                      <td>Proposal</td>
                      <td>Your Vote</td>
                      <td>Results</td>
                      <td>Proposal Payout</td>
                      <td>Voting Payout</td>
                    </tr>
                  </thead>
                  <tbody>

                    {this.state.rounds[1].proposal.map( item =>{
                      return <tr key={item.hash}>
                          <td>{item.name}</td>
                          <td>yes</td>
                          <td>9 / 1</td>
                          <td>0</td>
                          <td>10</td>
                      </tr>
                    })}

                  </tbody>
                </table>
              </div>

            </div>
            <div className="game-panel" style={{flex: '2'}}>
              <h3>Rounds</h3>
              <div style={{marginLeft: '1em'}}>
                <table className="pure-table pure-table-horizontal table-100">
                  <thead>
                    <tr>
                      <td>#</td>
                      <td>Proposal</td>
                      <td>Voting</td>
                    </tr>
                  </thead>
                  <tbody>

                    {this.state.rounds.map( round =>{
                      return <tr key={round.hash}>
                          <td>{round.hash}</td>
                          <td>{round.proposal ? '✔' : '' }</td>
                          <td>{round.voting ? '✔' : '' }</td>
                      </tr>
                    })}

                  </tbody>
                </table>
              </div>

            </div>

          </div>

          <div style={{flex: '2', display: 'flex', flexDirection: 'column'}}>

            <div className="game-panel" style={{flex: '2'}}>

              <h3>Players ({this.state.players.length})</h3>
              <div style={{marginLeft: '1em'}}>
                <table className="pure-table pure-table-horizontal table-100">
                  <thead>
                    <tr>
                      <td>Name</td>
                      <td>Chips</td>
                      <td>Share</td>
                    </tr>
                  </thead>
                  <tbody>

                    {this.state.players.map( player =>{
                      return <tr key={player.hash}>
                          <td>{player.name}</td>
                          <td>{player.chipCount}</td>
                          <td>{this.tokenShare(player.chipCount, this.state.players)}</td>
                      </tr>
                    })}

                  </tbody>
                </table>
              </div>

            </div>
            <div className="game-panel" style={{flex: '5'}}>Chat</div>

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
