import { connect } from 'react-redux'
import tokenDetailComponent from './tourneyDetailComponent'

const mapStateToProps = (state, ownProps) => {
  return {
    config: null
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    sendAnalytics: (eventType, eventData) => {
      dispatch(sendAnalytics(eventType, eventData))
    }

  }
}

const tourneyContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(tokenDetailComponent)

export default tourneyContainer
