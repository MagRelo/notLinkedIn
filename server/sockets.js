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
  socket.userId = 123456
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

          // validate action: get from internal array
          // validate target: get from internal array
          // validate round
          if(data.round !== currentRound){
            console.log(data.round, currentRound);
            throw {error: 'wrong round'}
          }

          const proposalIndex = gameDoc.proposals.findIndex(proposal => {return proposal.proposalId === socket.userId + currentRound})
          if (proposalIndex > -1 ) {
            gameDoc.proposals[proposalIndex] = {
              proposalId: socket.userId + currentRound,
              userId: socket.userId,
              currentRound: currentRound,
              action: data.proposalAction,
              target: data.proposalTarget
            }
          } else {
            gameDoc.proposals.push({
              proposalId: socket.userId + currentRound,
              userId: socket.userId,
              currentRound: currentRound,
              action: data.proposalAction,
              target: data.proposalTarget
            })
          }

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


const round = {
  meta: {
    index: 0,
    roundNumber: 1
  },
  proposals: {
    1: {
      id: '123',
      action: 'add',
      item: {}
    },
    2: null,
    3: null,
    4: null
  },
  votes: {
    1: {
      123: 0,
      456: 1,
    },
    2: null,
    3: null,
    4: null
  },
  results: {
    proposalVotes: [],
    playerList: [],
  }
}

const roundTemplate = {
  "meta" : {
    "index" : 2,
    "roundNumber" : 3
  },
  "proposals" : {},
  "votes" : {},
  "results" : {
    "proposalVotes" : [],
    "playerList" : []
  }
}
