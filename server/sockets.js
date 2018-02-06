var io = require('socket.io');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
const sigUtil = require('eth-sig-util')

const GameController = require('./controllers/game')


var gameAuth = function socketAuth(socket, next){

  var handshakeData = socket.request;
  var parsedCookie = cookie.parse(handshakeData.headers.cookie);

  // Check for valid cookie and session
  if (!parsedCookie.servesa){
    console.log('no servesa cookie');
  } else {

    // parse JSON
    let cookieObject
    try {
      cookieObject = JSON.parse(parsedCookie.servesa)
    } catch (e) {
      console.log(e);
    }

    // setup recovery
    const msgParams = [{
      name: 'Message',
      type: 'string',
      value: 'You will be logged into game ' + cookieObject.gameId
    }]
    const recovered = sigUtil.recoverTypedSignature({
      data: msgParams,
      sig: cookieObject.signature
    })

    // if it matches then we have a valid cookie.
    if (recovered === cookieObject.userAddress) {
      console.log('Recovered signer: ' + recovered)

      // check session store for this address, and return the games that they should have access to
      // TODO - for testing we'll take their word for it
      socket.userId = cookieObject.userAddress
      socket.gameId = cookieObject.gameId

    } else {
      console.log('Failed to verify signer, got: ' + recovered)
      // box em out
    }
  }

  return next();

};

exports.startIo = function startIo(server){
  io = io.listen(server);

  var game = io.of('/game');
  game.use(gameAuth);
  game.on('connection', (socket) => {

    // events
    socket.on('update', data => {GameController.handleUpdate(game, socket, data)})
    // socket.on('update', data => {GameController.handleReady(game, socket, data)})
    socket.on('proposal', data => {GameController.handlePropsal(game, socket, data)})
    socket.on('vote', data => {GameController.handleVote(game, socket, data)})

  })

  return io;
};
