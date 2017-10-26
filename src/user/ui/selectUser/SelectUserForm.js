
import React, { Component } from 'react'
import {Typeahead}  from 'react-typeahead';


class SelectForm extends Component {
  constructor(props, { authData }) {
    super(props)
    authData = this.props
    this.state = {
      name: ''
    }
  }

  componentDidMount(){
    this.props.getUsers()
  }

  handleInputChange(name) {
    this.setState({name: name })
    this.props.selectUser(name)
  }

  handleSubmit(event, userId) {
    event.preventDefault()
    this.props.selectUser(userId)
  }
  //
  // <Typeahead
  //   name="name"
  //   options={this.userList()}
  //   onOptionSelected={this.handleInputChange.bind(this)}/>
  //
  // <button
  //   type="submit"
  //   className="pure-button pure-button-primary"> Select
  // </button>

  render() {
    return(
      <main className="signup">
        <h2>Select User</h2>
        <form className="pure-form pure-form-stacked " onSubmit={this.handleSubmit.bind(this)}>
          <fieldset>
            {this.props.userList.map(user => {
              return <button
                key={user._id}
                className="pure-button pure-button-primary"
                onClick={(event) => this.handleSubmit(event, user._id)}>{user.name}</button>
            })}
          </fieldset>


        </form>
      </main>
    )
  }
}

export default SelectForm
