'use strict';
var stream = require('getstream-node');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const moment = require('moment')

var StreamMongoose = stream.mongoose;

var GameSchema = new Schema({
  config: {
    rounds: Number,
    phaseTimerLength: Number,
    tournamentStart: Date,
    lengthOfPhase: Number
  },
  playerList: [],
  candidateList: [],
  itemList: [],
  status: {
    currentRound: Number,
    currentPhase: String,
    phaseStartTime: Date,
    timeRemaining: Number,
    gameReady: Boolean,
    gameInProgress: Boolean,
    gameComplete: Boolean
  },
  rounds: [{
    meta: Object,
    proposals: [],
    votes: [],
    results: {}
  }],
  public: {
    status: {},
    itemList: [],
    candidateList: [],
    playerList: [],
    rounds: []
  }
});

function buildRounds(config){

  let rounds = []
  const numberOfRounds = config.rounds

  // build rounds
  while (rounds.length < rounds, index){
    rounds.push({
      meta: {
        index: index,
        roundNumber: index + 1,
        startTime: null
      },
      proposals: [],
      votes: [],
      results: {
        proposalVotes: [],
        playerList: [],
      }
    })
  }

  return rounds
}


GameSchema.methods.addProposal = function(userId, data){

  const roundData = gameDoc.rounds[currentRound]
  const existingProposalIndex = roundData.proposals.findIndex(proposal => {return proposal.symbol === data.proposalTarget.symbol})
  if (existingProposalIndex > -1 ) {
    roundData.proposals[proposalIndex] = {
      //  merge in userId
      users: [userId, ...roundData.proposals[proposalIndex].users],
      round: currentRound,
      action: data.proposalAction,
      target: data.proposalTarget
    }
  } else {
    roundData.proposals.push({
      users: [userId],
      round: currentRound,
      action: data.proposalAction,
      target: data.proposalTarget
    })
  }
  gameDoc.rounds[currentRound] = roundData
  return GameSchema.update({'_id': gameDoc._id}, gameDoc, {new: true})

  return this.save()
}

GameSchema.methods.addVote = function(userId, data){

  const roundData = gameDoc.rounds[currentRound]
  const existingProposalIndex = roundData.vote.findIndex(proposal => {return proposal.userId === userId})
  if (existingProposalIndex > -1 ) {
    roundData.proposals[proposalIndex] = {
      userId: userId,
      round: currentRound,
      action: data.proposalAction,
      target: data.proposalTarget
    }
  } else {
    roundData.proposals.push({
      userId: userId,
      round: currentRound,
      action: data.proposalAction,
      target: data.proposalTarget
    })
  }
  gameDoc.rounds[currentRound] = roundData

  return this.save()
}


GameSchema.statics.updateAndFetch = function(gameId) {

  return this.findOne({_id: gameId})
    .then(gameDoc => {

      // STATUS
      if(gameDoc.status.gameInProgress){
        gameDoc.status = buildStatus(gameDoc.status, gameDoc.config)
      }

      // ROUNDS
      // if (gameDoc.status.closeRound){
      //   gameDoc.rounds[gameDoc.status.currentRound - 1] = completeRound(gameDoc.status.currentRound - 1)
      //   gameDoc.status.closeRound = false
      // }

      // PUBLIC
      gameDoc.public.status = gameDoc.status
      gameDoc.public.itemList = gameDoc.itemList
      gameDoc.public.candidateList = gameDoc.candidateList
      gameDoc.public.playerList = gameDoc.playerList
      gameDoc.public.rounds = gameDoc.rounds.map(round => {

        // proposals: remove player info
        round.proposals = round.proposals
          .filter(proposal => proposal.action !== 'pass')
          .map(proposal => {
            delete proposal.userId
            return proposal
          })

        round.votes = round.votes
          .filter(proposal => proposal.action !== 'pass')
          .map(proposal => {
            delete proposal.userId
            return proposal
          })

        return round
      })

      return gameDoc.save()
    })
    // .then(savedDoc => {
    //   return this.findOne({_id: gameId}, {public: 1})
    // })

};



// GetStream integration
GameSchema.plugin(stream.mongoose.activity);
module.exports = mongoose.model('Game', GameSchema);


function transitionStatus(currentStatus, lengthOfPhase){

  const newStartTime = new Date()
  let currentPhase = ''
  let currentRound = currentStatus.currentRound
  let closeRound = false

  if(currentStatus.currentPhase === 'proposals'){ currentPhase = 'votes' }
  if(currentStatus.currentPhase === 'votes'){ currentPhase = 'results' }
  if(currentStatus.currentPhase === 'results'){
    currentPhase = 'proposals'
    currentRound =  parseInt(currentRound, 10) + 1
    closeRound = true
  }

  return {
    closeRound: closeRound,
    "currentPhase": currentPhase,
    "currentRound": currentRound,
    "phaseStartTime": newStartTime.toISOString(),
    "timeRemaining" : lengthOfPhase,
    "gameInProgress": true
  }
}


function buildStatus(currentStatus, config){
  const phaseStart = moment(currentStatus.phaseStartTime)
  const secondsElapsed = moment().diff(phaseStart, 'seconds')
  const timeRemaining = config.lengthOfPhase - secondsElapsed
  const lengthOfPhase = config.lengthOfPhase

  // default to current phase
  let status = {
    "currentRound" : currentStatus.currentRound,
    "currentPhase" : currentStatus.currentPhase,
    "phaseStartTime": currentStatus.phaseStartTime,
    "timeRemaining" : timeRemaining,
    "gameInProgress": true
  }

  // end game
  if(timeRemaining <= 0
    && currentStatus.currentPhase === 'results'
    && currentStatus.currentRound + 1 >= config.rounds){
    console.log('Game Over:', currentStatus.currentRound + 1, '>', config.rounds);
    status.gameInProgress = false
  }

  // transition to next phase
  if(timeRemaining <= 0
    && status.gameInProgress){
    console.log('transition from: ', currentStatus.currentRound,'-', currentStatus.currentPhase);
    status = transitionStatus(currentStatus, config.lengthOfPhase)
  }

  return status
}

function completeRound(round){

  console.log('complete Round:', round);
  return true

}
