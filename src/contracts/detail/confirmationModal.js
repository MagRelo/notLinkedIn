import Modal from 'react-modal';
const customStyles = {
  overlay: {
   backgroundColor   : 'rgba(16, 58, 82, 0.75)'
  },
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-40%',
    transform             : 'translate(-50%, -50%)',
    padding               : 'none'
  }
};

class ComposeMessage extends Component {
  constructor(props, { authData }) {
    super(props)
    authData = this.props

    this.state = {
      modalIsOpen: false,
      text: 'intitial text'
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  // Modal functions
  openModal() { this.setState({modalIsOpen: true})}
  afterOpenModal() {}
  closeModal() { this.setState({modalIsOpen: false})}

  render() {
    return(
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="">

            <div className="compose-container">

              <div className="compose-title-container">
                <span className="title">Trasaction Submitted</span>
              </div>

              <div className="compose-editor-container">

                <p>Your tranaction has been submitted.</p>
              </div>
            </div>
          </Modal>

    )
  }


}
