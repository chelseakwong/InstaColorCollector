// Run this server to fetch images from Instagram
// call by "node fetcher.js", open up localhost:3000/authorize_user
// should then begin downloading images
// Chelsea Kwong
const express = require('express');
const Instagram = require('node-instagram').default;

// var app = express();
// var server = http.createServer(app);
var queryig = require("./queryig.js");


// app.configure(function() {
//   // The usual...
// });
// Create a new instance.
const instagram = new Instagram({
  clientId: 'ad3aaf5075ce4464849217a22b43d1ab',
  clientSecret: 'f68f5ad0dd6641a78925d4e5be865b36'
});

// api.use({
//   client_id: '1867c1408b824ad28f3659ca735fca19',
//   client_secret: 'aac2ea75aa304d55ab214d5c142ba3fe'
// });

// redirect to actually parse responses and fetch images
const redirectUri = 'http://localhost:3000/auth/instagram/callback';

// create express server
const app = express();

// Redirect user to instagram oauth
app.get('/auth/instagram', (req, res) => {
  res.redirect(instagram.getAuthorizationUrl(redirectUri, { scope: ['basic', 'public_content'] }));
});

// Handle auth code and get access_token for user
app.get('/auth/instagram/callback', async (req, res) => {
  try {
    console.log(req.query)
    const data = await instagram.authorizeUser(req.query.code, redirectUri);
    queryig.startProcess(data.access_token)
    // access_token in data.access_token
    res.json(data);
  } catch (err) {
    res.json(err);
  }
});

// listen to port 3000
app.listen(3000, () => {
  console.log('app listening on http://localhost:3000');
});

// exports.authorize_user = function(req, res) {
//   res.redirect(api.get_authorization_url(redirect_uri, { scope: ['likes'], state: 'a state' }));
// };

// exports.handleauth = function(req, res) {
//   api.authorize_user(req.query.code, redirect_uri, function(err, result) {
//     if (err) {
//       console.log(err.body);
//       res.send("Didn't work");
//     } else {
//       console.log('Yay! Access token is ' + result.access_token);
//       queryig.startProcess(result.access_token);
//       res.send('You made it!! Fetching images...');
//     }
//   });
// };

// // This is where you would initially send users to authorize
// app.get('/auth/instagram', exports.authorize_user);
// // This is your redirect URI
// app.get('/auth/instagram/callback', exports.handleauth);

// server.listen(3000);
// console.log('Express server started on port %s', server.address().port);

// http.createServer(app).listen(app.get('port'), function(){
//   console.log("Express server listening on port " + app.get('port'));
// });
// app.listen(3000)
// module.exports = app;
