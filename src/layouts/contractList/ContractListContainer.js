import { connect } from 'react-redux'
import ContractList from './ContractList'

import { listContracts } from '../../contracts/ContractActions'


const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

const ContractListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ContractList)

export default ContractListContainer
