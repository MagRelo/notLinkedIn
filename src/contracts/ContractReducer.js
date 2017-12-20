const initialState = {
  list: [],
  contractLoading: true,
  contract: {},
  transactionLoading: false,
  transactionError: false,
  calcTokenPrice(tokenNumber, tokenBasePrice, linearDivisor, exponentDivisor){

    function fracExp(k,q,n,p){
      let s = 0;
      let N = 1;
      let B = 1;
      for (let i = 0; i < p; ++i){
        s += k * N / B / (q**i);
        N  = N * (n-i);
        B  = B * (i+1);
      }
      return s;
    }

    if(linearDivisor === 1){
      return tokenBasePrice
    }

    let linear = tokenBasePrice * tokenNumber/linearDivisor
    let exp = fracExp(tokenBasePrice, exponentDivisor, tokenNumber, 2)
    let nextTokenPrice = exp + linear

    return nextTokenPrice
  },
  calcPurchasePrice(tokensToPurchase, maxTokens, tokenSupply, tokenBasePrice, linearDivisor, exponentDivisor){

    function fracExp(k,q,n,p){
      let s = 0;
      let N = 1;
      let B = 1;
      for (let i = 0; i < p; ++i){
        s += k * N / B / (q**i);
        N  = N * (n-i);
        B  = B * (i+1);
      }
      return s;
    }

    tokensToPurchase = tokensToPurchase || 0
    tokensToPurchase = Math.min(tokensToPurchase, maxTokens)

    let totalPurchasePrice = 0
    let linear = 0
    let exp = 0
    let nextTokenPrice = 0
    for(let i=1; i <= tokensToPurchase; i++){
      linear = tokenBasePrice * (tokenSupply + i)/linearDivisor
      exp = fracExp(tokenBasePrice, exponentDivisor, tokenSupply, 2)
      nextTokenPrice = exp + linear

      totalPurchasePrice += nextTokenPrice
    }

    return totalPurchasePrice
  }
}

const contractReducer = (state = initialState, action) => {

  if (action.type === 'REQUEST_SENT')
  {
    return Object.assign({}, state, {
      transactionLoading: true
    })
  }
  if (action.type === 'LIST_UPDATE')
  {
    return Object.assign({}, state, {
      contract: null,
      contractLoading: false,
      list: action.payload
    })
  }
  if (action.type === 'CONTRACT_UPDATE')
  {
    return Object.assign({}, state, {
      contractLoading: false,
      contract: action.payload
    })
  }
  if (action.type === 'CONTRACT_LOADING')
  {
    return Object.assign({}, state, {
      contractLoading: true,
    })
  }


  return state
}

export default contractReducer
