/**
 * Main application routes
 */



const authController = require('./controllers/auth')
const userController = require('./controllers/user')
const messageController = require('./controllers/message')
const contractController = require('./controllers/contract')

const passport = require('passport')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')

var path = require('path');

//setup configuration for twitter login
var passportConfig = require('./config/passport');
passportConfig();

//token handling middleware
var authenticate = expressJwt({
  secret: 'my-secret',
  requestProperty: 'auth',
  getToken: function(req) {
    if (req.headers['x-auth-token']) {
      return req.headers['x-auth-token'];
    }
    return null;
  }
});

var getCurrentUser = function(req, res, next) {
  User.findById(req.auth.id, function(err, user) {
    if (err) {
      next(err);
    } else {
      req.user = user;
      next();
    }
  });
};

var getOne = function (req, res) {
  var user = req.user.toObject();

  delete user['twitterProvider'];
  delete user['__v'];

  res.json(user);
};

var createToken = function(auth) {
  return jwt.sign({
    id: auth.id
  }, 'servesa-secret',
  {
    expiresIn: 60 * 120
  });
};

var generateToken = function (req, res, next) {
  req.token = createToken(req.auth);
  return next();
};

var sendToken = function (req, res) {
  res.setHeader('x-auth-token', req.token);
  return res.status(200).send(JSON.stringify(req.user));
};



module.exports = function(app) {

  // TWITTER LOGIN
  app.post('/api/v1/auth/twitter/reverse', authController.getTwitterRequestToken)
  app.post('/auth/twitter', [
    authController.twitterLogin,
    passport.authenticate('twitter-token', {session: false}),
    function(req, res, next) {
        if (!req.user) { return res.send(401, 'User Not Authenticated'); }
        // prepare token for API
        req.auth = { id: req.user.id }
        return next();
      },
    generateToken,
    sendToken
  ])

  // app.route('/auth/twitter')
  //   .get((req, res, next) => {
  //     request.post({
  //       url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
  //       oauth: {
  //         consumer_key: twitterConfig.consumerKey,
  //         consumer_secret: twitterConfig.consumerSecret,
  //         token: req.query.oauth_token
  //       },
  //       form: { oauth_verifier: req.query.oauth_verifier }
  //     }, function (err, r, body) {
  //       if (err) {
  //         return res.send(500, { message: err.message });
  //       }
  //
  //       console.log(body);
  //       const bodyString = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
  //       const parsedBody = JSON.parse(bodyString);
  //
  //       req.body['oauth_token'] = parsedBody.oauth_token;
  //       req.body['oauth_token_secret'] = parsedBody.oauth_token_secret;
  //       req.body['user_id'] = parsedBody.user_id;
  //
  //       next();
  //     });
  //   }, passport.authenticate('twitter-token', {session: false}), function(req, res, next) {
  //       if (!req.user) {
  //         return res.send(401, 'User Not Authenticated');
  //       }
  //
  //       // prepare token for API
  //       req.auth = {
  //         id: req.user.id
  //       };
  //
  //       return next();
  //     }, generateToken, sendToken);


  // USERS
  app.post('/api/user/list', userController.listUsers);
  app.get('/api/user/:userId', userController.getUser);

  // CONTRACTS
  app.post('/api/contract/create', contractController.createContract);
  app.put('/api/contract/buy', contractController.buyTokens);
  app.put('/api/contract/sell', contractController.sellTokens);
  app.put('/api/contract/burn', contractController.burnTokens);
  app.put('/api/contract/drain', contractController.drainEscrow);

  // *FOLLOW*
  // app.post('/api/follow', userController.purchaseTokens);
  // app.delete('/api/follow', userController.sellTokens);

  // * MESSAGES*
  app.get('/api/messages/:userId', messageController.getMessagesByUser);
  app.get('/api/timeline/:userId', messageController.getTimelineByUser);
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
