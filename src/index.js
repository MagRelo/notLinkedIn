import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'
import { UserIsAuthenticated } from './util/wrappers.js'


// Initialize web3 and set in Redux.
import getWeb3 from './util/web3/getWeb3'
getWeb3
  .then(() => { console.log('Web3 initialized!') })
  .catch(() => { console.log('Error in web3 initialization.') })

import socket from './socket/connection' 

// Layouts
import App from './App'
import Page404 from  './errors/404'

import ContractList from './contracts/list/contractListContainer'
import ContractCreate from './contracts/create/CreateContractContainer'
import ContractDetail from './contracts/detail/tokenDetailContainer'

// import TourneyHome from './layouts/contractDetail/ContractContainer'


// Redux Store
import store from './store'
const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render((
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={App}>
          <IndexRoute component={ContractList} />

          <Route path="contract/add" component={ContractCreate} />
          <Route path="contract/list" component={ContractList} />
          <Route path="contract/:contractId" component={ContractDetail} />

          <Route path="tourney" component={ContractDetail} />

          <Route path="contracts" component={ContractList} />
          <Route path='*' exact={true} component={Page404} />
        </Route>
      </Router>
    </Provider>
  ),
  document.getElementById('root')
)
