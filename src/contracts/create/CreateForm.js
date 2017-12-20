import React, { Component } from 'react'
import { Link } from 'react-router'

import Modal from './CreateFormModal'

class CreateContractForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      modalIsOpen: false,
      exchangeRate: 400,
      name: '',
      avatarUrl: '',
      ownerCanBurn: true,
      ownerCanDrain: true,
      pricingOption: 'temp_Pricing_flat',
      tokenBasePrice: 0.001,
      maxTokens: 1000,
      divisor_linear: 1000,
      divisor_exponent: 10000
    }
  }


  componentDidMount(){
    fetch("https://api.coinmarketcap.com/v1/ticker/ethereum/?convert=USD")
      .then(res => {return res.json()})
      .then(data => {
        this.setState({
          exchangeRate: parseInt(data[0].price_usd, 10)
        });
      });
  }

  // Form functions
  handleChange(event) {
    event.preventDefault()
    this.setState({[event.target.name]: event.target.value})
  }

  handleSubmit(event) {
    event.preventDefault()

    this.setState({modalIsOpen: true})

    const contractObj = {
      contractName: this.state.name,
      ownerCanBurn: this.state.ownerCanBurn,
      ownerCanSpend: this.state.ownerCanDrain,
      tokenBasePrice: this.state.tokenBasePrice,
      maxTokens: this.state.maxTokens,
      tokenPriceExponentDivisor: this.state.divisor_exponent,
      tokenPriceLinearDivisor: this.state.divisor_linear,
    }

    // flatten pricing curve, if selected
    if(this.state.pricingOption === 'temp_Pricing_flat'){
      contractObj.tokenPriceExponentDivisor = 1
      contractObj.tokenPriceLinearDivisor = 1
    }

    this.props.createContract(contractObj)
  }

  handleOptionChange(changeEvent) {
    this.setState({ pricingOption: changeEvent.target.value })
  }

  toggleBurn() {
    this.setState({ ownerCanBurn: !this.state.ownerCanBurn })
  }

  toggleDrain() {
    this.setState({ ownerCanDrain: !this.state.ownerCanDrain })
  }

  round(value, places){
    places = places || 4
    return +(Math.round(value + "e+" + places)  + "e-" + places);
  }

  formatEth(ether){
    return 'Ξ' + this.round(ether, 5) + ' ETH ($' +
     this.round(this.state.exchangeRate * ether) + ')'
  }

  calcToken(tokenNumber){

    // check max tokens
    if(tokenNumber > this.state.maxTokens){
      return 'n/a'
    }

    // set pricing option
    if(this.state.pricingOption === 'temp_Pricing_flat'){
      return this.state.tokenBasePrice
    }

    return this.props.calcTokenPrice(
      tokenNumber,
      this.state.tokenBasePrice,
      this.state.divisor_linear,
      this.state.divisor_exponent
    )

  }

  render() {
    return(

      <div>

        <Modal isOpen={this.state.modalIsOpen}/>

        <h2>Create new group</h2>

        <form className="pure-form" onSubmit={this.handleSubmit.bind(this)}>
          <p>Give your group a name and an avatar</p>


          <div className="pure-g">
            <div className="pure-u-1 pad-box">
              <fieldset>

                <label>Group Name</label>
                <input
                  className="pure-input-1"
                  type="text"
                  name="name"
                  value={this.state.name}
                  onChange={this.handleChange.bind(this)}></input>

                <label>Group Avatar (url)</label>
                <input
                  className="pure-input-1"
                  type="url"
                  name="avatarUrl"
                  value={this.state.avatarUrl}
                  onChange={this.handleChange.bind(this)}></input>

                <label>Token Base Price</label>
                <input
                  className="pure-input-1-2"
                  type="number"
                  name="tokenBasePrice"
                  value={this.state.tokenBasePrice}
                  onChange={this.handleChange.bind(this)}></input>
                <span>{this.formatEth(this.state.tokenBasePrice)}</span>


                <label>Max Tokens</label>
                <input
                  className="pure-input-1-2"
                  type="number"
                  name="maxTokens"
                  value={this.state.maxTokens}
                  onChange={this.handleChange.bind(this)}></input>

              </fieldset>
            </div>
          </div>


          <h3>Pledge options</h3>
          <p>Users will pledge value to the contract and get tokens in return. Use the fields below to adjust the pricing of the tokens.</p>

          <div className="pure-g">
            <div className="pure-u-1 pure-u-lg-1-2 pad-box">

              <fieldset>
                <label className="pure-radio">
                  <input
                    type="radio"
                    value="temp_Pricing_flat"
                    checked={this.state.pricingOption === 'temp_Pricing_flat'}
                    onChange={this.handleOptionChange.bind(this)}></input> Flat Pricing (All tokens at the token base price)
                </label>
                <label className="pure-radio">
                  <input
                    type="radio"
                    value="temp_Pricing_exp"
                    checked={this.state.pricingOption === 'temp_Pricing_exp'}
                    onChange={this.handleOptionChange.bind(this)}></input> Curation market pricing
                </label>
                <label>Linear Divisor</label>
                <input
                  className="pure-input-1"
                  type="number"
                  name="divisor_linear"
                  value={this.state.divisor_linear}
                  disabled={this.state.pricingOption !== 'temp_Pricing_exp'}
                  onChange={this.handleChange.bind(this)}></input>
                <label>Exponent Divisor</label>
                <input
                  className="pure-input-1"
                  type="number"
                  name="divisor_exponent"
                  value={this.state.divisor_exponent}
                  disabled={this.state.pricingOption !== 'temp_Pricing_exp'}
                  onChange={this.handleChange.bind(this)}></input>
              </fieldset>

            </div>
            <div className="pure-u-1 pure-u-lg-1-2 pad-box">
              <table className="pure-table pure-table-horizontal table-100">
                <thead>
                  <tr>
                    <td>Token</td>
                    <td>Price</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#1</td><td>{this.formatEth(this.calcToken(1)) }</td>
                  </tr>
                  <tr>
                    <td>#10</td><td>{this.formatEth(this.calcToken(10))}</td>
                  </tr>
                  <tr>
                    <td>#100</td><td>{this.formatEth(this.calcToken(100))}</td>
                  </tr>
                  <tr>
                    <td>#1000</td><td>{this.formatEth(this.calcToken(1000))}</td>
                  </tr>
                  <tr>
                    <td>#10000</td><td>{this.formatEth(this.calcToken(10000))}</td>
                  </tr>
                </tbody>

              </table>

            </div>
          </div>



          <h3>Withdraw options</h3>
          <p>If a user chooses to remove their pledge they can turn in their tokens and claim a share of the escrow balance.</p>
          <fieldset>
            <label className="pure-radio">
              <input type="radio" checked={true}></input> Each token receives equal share
            </label>
            <label className="pure-radio">
              <input type="radio" disabled></input> Custom Pricing Curve (Coming Soon)
            </label>
          </fieldset>

          <h3>Collect options</h3>
          <p>"Collect" allows the owner of the contract to collect on a pledge. This removes tokens without affecting the escrow balance.</p>
          <fieldset>
            <label className="pure-checkbox">
              <input
                type="checkbox"
                checked={this.state.ownerCanBurn}
                onChange={this.toggleBurn.bind(this)}></input> Allow owner to collect pledges
            </label>
          </fieldset>

        <h3>Spend options</h3>
        <p>"Spend" allows the owner of the contract to remove value from the escrow balance. This does not affect the number of tokens.</p>
          <fieldset>
            <label className="pure-checkbox">
              <input
                type="checkbox"
                checked={this.state.ownerCanDrain}
                onChange={this.toggleDrain.bind(this)}></input> Allow owner to spend escrow balance
            </label>
          </fieldset>

          <button
            type="submit"
            className="pure-button pure-button-primary"
            onClick={this.openModal}> + Add contract
          </button>
        </form>

      </div>


    )
  }
}

export default CreateContractForm


// <fieldset>
//   <p>A simple escrow contract: what you put in you can take out.</p>
//   <button className="pure-button pure-button-primary" name="se" onClick={this.handleSubmit.bind(this)}>Simple escrow</button>
// </fieldset>
// <fieldset>
//   <p>Curation markets introduce an accelerating pricing curve to incentivize early adoptors.</p>
//   <button className="pure-button pure-button-primary" name="cm" onClick={this.handleSubmit.bind(this)}>Curation Market</button>
// </fieldset>
// <fieldset>
//   <p>Hive Commons markets are a curation market that allow the contract owner to withdraw funds from escrow.
//     This can be used to fund a charitable cause or provide on-going support for a project.</p>
//   <button className="pure-button pure-button-primary" name="hm" onClick={this.handleSubmit.bind(this)}>Hive Market</button>
// </fieldset>
// <fieldset>
//   <p>Trust is risk allows the contract owner to delete your tokens. This can be used to prove that you trust the owner.</p>
//   <button className="pure-button pure-button-primary" name="tr" onClick={this.handleSubmit.bind(this)}>Trust is Risk</button>
// </fieldset>
// <fieldset>
//   <p>Curated trust combines a curation market with Trust is Risk: the earlier you trust someone the less it costs.</p>
//   <button className="pure-button pure-button-primary" name="cr" onClick={this.handleSubmit.bind(this)}>Curated Risk</button>
// </fieldset>
