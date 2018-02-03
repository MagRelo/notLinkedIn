'use strict';
var stream = require('getstream-node');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StreamMongoose = stream.mongoose;

var GameSchema = new Schema({
  status: Object,
  proposals: [],
  votes: [],
  rounds: [{
    meta: {
      index: Number,
      roundNumber: Number
    },
    results: {
      proposalVotes: [],
      playerList: [],
    }
  }]
});

GameSchema.methods.publicData = function(roundIndex, roundPhase) {
  const publicProposals = this.rounds.map(round => {

    // proposals: remove plasyer info
    const publicProposals = []
    for (var key in round.proposals) {
    	publicProposals.push(round.proposals[key])
    }

    return
  })


};



// GetStream integration
GameSchema.plugin(stream.mongoose.activity);

module.exports = mongoose.model('Game', GameSchema);
