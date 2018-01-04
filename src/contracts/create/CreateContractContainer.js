import { connect } from 'react-redux'
import CreateForm from './CreateForm'
import { createContract, getConfig} from '../ContractActions'

const mapStateToProps = (state, ownProps) => {
  return {
    calcTokenPrice: state.contracts.calcTokenPrice
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    createContract: (options) => {
      dispatch(createContract(options))
    },
    loadConfig: ()=>{
      dispatch(getConfig())
    }
  }
}

const CreateContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateForm)

export default CreateContainer
