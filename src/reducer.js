import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import web3Reducer from './util/web3/web3Reducer'

import contractReducer from './contracts/ContractReducer'

const reducer = combineReducers({
  routing: routerReducer,
  contracts: contractReducer,
  web3: web3Reducer
})

export default reducer
