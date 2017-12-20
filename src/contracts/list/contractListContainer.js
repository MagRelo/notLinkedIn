import { connect } from 'react-redux'
import contractListComponent from './contractListComponent'
import {searchContracts} from '../ContractActions'

const mapStateToProps = (state, ownProps) => {
  return {
    list: state.contracts.list,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadList: ()=>{
      dispatch(searchContracts())
    }
  }
}

const contractListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(contractListComponent)

export default contractListContainer
