var io = require('socket.io');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');


const GameSchema = require('./models/game')


var socketAuth = function socketAuth(socket, next){

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
  game.use(socketAuth);
  game.on('connection', (socket) => {

    // "update"
    socket.on('update', data => {
      GameSchema.findById(socket.gameId)
        .then(gameDoc => {
          return Promise.resolve(game.emit('update', gameDoc))
        })
    })

    // "signin"

    // "propose"
    socket.on('proposal', data => {
      GameSchema.findById(socket.gameId).lean()
        .then(gameDoc => {

          if(!gameDoc){throw {error: 'no game'}}
          const currentRound = gameDoc.status.currentRound

          // validate round
          if(data.round !== currentRound){
            console.log(data.round, currentRound);
            throw {error: 'wrong round'}
          }
          // validate action: get from internal array
          // validate target: get from internal array


          const roundData = gameDoc.rounds[currentRound]
          const proposalIndex = roundData.proposals.findIndex(proposal => {return proposal.userId === socket.userId})
          if (proposalIndex > -1 ) {
            roundData.proposals[proposalIndex] = {
              userId: socket.userId,
              round: currentRound,
              action: data.proposalAction,
              target: data.proposalTarget
            }
          } else {
            roundData.proposals.push({
              userId: socket.userId,
              round: currentRound,
              action: data.proposalAction,
              target: data.proposalTarget
            })
          }
          gameDoc.rounds[currentRound] = roundData



          return GameSchema.update({'_id': gameDoc._id}, gameDoc, {new: true})
        })
        .then(updatedGame => {
          return GameSchema.findById(socket.gameId).lean()
        })
        .then(updatedGame => {
          return Promise.resolve(game.emit('update', updatedGame))
        })
        .catch(error => {
          console.log(error)
          return Promise.resolve(game.emit('error', error))
        })
    })

    // "vote"
    socket.on('vote', data => {
      GameSchema.findById(socket.gameId).lean()
        .then(gameDoc => {

          if(!gameDoc){throw {error: 'no game'}}
          const currentRound = gameDoc.status.currentRound

          // validate action: get from internal array
          // validate target: get from internal array

          // validate round
          if(data.round !== currentRound){
            throw {
              error: 'wrong round',
              submitted: data.round,
              current: currentRound
            }
          }


          const roundData = gameDoc.rounds[currentRound]
          const voteIndex = roundData.votes.findIndex(vote => {return vote.userId === socket.userId})
          if (voteIndex > -1 ) {
            roundData.votes[voteIndex] = {
              userId: socket.userId,
              round: currentRound,
              target: data.voteTarget,
              vote: data.vote
            }
          } else {
            roundData.votes.push({
              userId: socket.userId,
              round: currentRound,
              target: data.voteTarget,
              vote: data.vote
            })
          }
          gameDoc.rounds[currentRound] = roundData


          return GameSchema.update({'_id': gameDoc._id}, gameDoc, {new: true})
        })
        .then(updatedGame => {
          return GameSchema.findById(socket.gameId).lean()
        })
        .then(updatedGame => {
          return Promise.resolve(game.emit('update', updatedGame))
        })
        .catch(error => {
          console.log(error)
          return Promise.resolve(game.emit('error', error))
        })
    })

  })

  return io;
};
