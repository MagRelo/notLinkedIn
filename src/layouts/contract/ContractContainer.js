import { connect } from 'react-redux'
import Contract from './Contract'

import { getContract } from '../../contracts/ContractActions'


const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

const ContractContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Contract)

export default ContractContainer
