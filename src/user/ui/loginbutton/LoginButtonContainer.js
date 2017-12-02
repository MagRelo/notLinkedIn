import { connect } from 'react-redux'
import LoginButton from './LoginButton'
import { loginUser } from '../../userActions'

const mapStateToProps = (state, ownProps) => {
  return {
    accounts: state.web3.accounts
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loginSuccess: (user) => {
      dispatch(loginUser(user))
    }
  }
}

const LoginButtonContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginButton)

export default LoginButtonContainer
