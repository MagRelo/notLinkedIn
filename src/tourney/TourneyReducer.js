const initialState = {
  user: {}
}

const tournamentReducer = (state = initialState, action) => {

  if (action.type === 'REQUEST_SENT')
  {
    return Object.assign({}, state, {
      transactionPending: true,
      transactionResult: null
    })
  }
  if (action.type === 'CONTRACT_CREATED')
  {
    return Object.assign({}, state, {
      contract: action.payload
    })
  }
  if (action.type === 'UPDATE_USER')
  {
    return Object.assign({}, state, {
      user: action.payload
    })
  }




  return state
}

export default tournamentReducer
