/**
 * Main application routes
 */

const userController = require('./controllers/user')
const messageController = require('./controllers/message')

'use strict';
var path = require('path');

module.exports = function(app) {

  // *USERS*
  app.get('/api/user/list', userController.listUsers);
  app.get('/api/user/:name', userController.getUser);
  app.post('/api/user', userController.saveUser);

  // *FOLLOW*
  app.post('/api/follow', userController.followUser);
  app.delete('/api/follow', userController.unFollowUser);

  // * MESSAGES*
  app.get('/api/messages/:userId', messageController.getMessagesByUser);
  app.post('/api/messages', messageController.saveMessage);


  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get((request, response)=>{
     response.status(404).send()
   });

  // All other routes should redirect to the index.html
  app.get('/*', function(req, res){
    res.sendFile('index.html', { root: './build_webpack'});
  });

};
