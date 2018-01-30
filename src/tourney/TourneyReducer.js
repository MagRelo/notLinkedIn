const initialState = {
  config: null
}

const contractReducer = (state = initialState, action) => {

  if (action.type === 'REQUEST_SENT')
  {
    return Object.assign({}, state, {
      transactionPending: true,
      transactionResult: null
    })
  }

  return state
}

export default contractReducer
