import React, { Component } from 'react'
import { Link } from 'react-router'

import ContractList from '../../contracts/list/contractListContainer'
import CreateContractButton from '../../contracts/create/CreateContractContainer'


class Profile extends Component {
  constructor(props, {}) {
    super(props)
    this.state = {}
  }

  render() {
    return(
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1 pure-u-lg-1-6"></div>
          <div className="pure-u-1 pure-u-lg-2-3">

            <h1>Groups</h1>
            <ContractList/>
            
          </div>
        </div>
      </main>
    )
  }
}

export default Profile
