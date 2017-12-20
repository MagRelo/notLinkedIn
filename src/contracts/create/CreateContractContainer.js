import { connect } from 'react-redux'
import CreateForm from './CreateForm'
import { createContract, generateWords } from '../ContractActions'

const mapStateToProps = (state, ownProps) => {
  return {
    currentUser: state.user.data,
    calcTokenPrice: state.contracts.calcTokenPrice
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    createContract: (options) => {
      dispatch(createContract(options))
    }
  }
}

const CreateContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateForm)

export default CreateContainer
