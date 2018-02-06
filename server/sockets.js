var io = require('socket.io');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');

const GameController = require('./controllers/game')


var gameAuth = function socketAuth(socket, next){

  var handshakeData = socket.request;
  var parsedCookie = cookie.parse(handshakeData.headers.cookie);

  // Check for valid cookie and session
  if (!parsedCookie.servesaSignedToken){
    // console.log('no signature:', parsedCookie.servesaSignedToken)
    // return next(new Error('Not Authenticated'));
  }

  // This data will be in the cookie
  socket.userId = socket.id
  socket.gameId = '5a7251f391b319a1c28e66da'

  return next();
};

exports.startIo = function startIo(server){
  io = io.listen(server);

  var game = io.of('/game');
  game.use(gameAuth);
  game.on('connection', (socket) => {

    // events
    socket.on('update', data => {GameController.handleUpdate(game, socket, data)})
    socket.on('update', data => {GameController.handleReady(game, socket, data)})
    socket.on('proposal', data => {GameController.handlePropsal(game, socket, data)})
    socket.on('vote', data => {GameController.handleVote(game, socket, data)})

  })

  return io;
};
