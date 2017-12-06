import React from 'react'

import TwitterLogin from 'react-twitter-auth'


const LoginButton = ({ accounts }) => {

  function format(accountId, length){
    let string = ''
    accountId.split('').some((element)=>{
      string += element
      return string.length === length
    })

    return string + '...'
  }

  return(
    <div className="accountNavText">Account: {format(accounts[0] || '', 7)}</div>
  )
}

export default LoginButton
