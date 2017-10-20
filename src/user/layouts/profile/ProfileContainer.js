import { connect } from 'react-redux'
import Profile from './Profile'
import getUsers from '../../userActions'


const mapStateToProps = (state, ownProps) => {
  return {
    userList: state.user.userList
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getUsers:()=>{
      dispatch(getUsers())
    }
  }
}

const ProfileContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile)

export default ProfileContainer