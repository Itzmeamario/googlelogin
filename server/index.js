// My require libs
const express = require('express');
const morgan = require('morgan');
const parser = require('body-parser');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

//Google auth required libs
const passport = require('passport');
const GoogleStrategy = require( 'passport-google-oauth2').Strategy;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

// My required libs
const router = require('./router');

// Instantiate server
const app = express();


// My middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

// API Access link for creating client ID and secret:
// https://code.google.com/apis/console/
// let GOOGLE_CLIENT_ID = "924355693520-5oa8kplhn59c5jtnkrr300qt5lk7ui8b.apps.googleusercontent.com";
// let GOOGLE_CLIENT_SECRET = "GC4X-K_ToxcwHBmBAo7jBNta";

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  console.log('serialize')
  console.log('user', user.id)
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log('deserialize')
  done(null, id);
});

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  //NOTE :
  //Carefull ! and avoid usage of Private IP, otherwise you will get the device_id device_name issue for Private IP during authentication
  //The workaround is to set up thru the google cloud console a fully qualified domain name such as http://mydomain:3000/ 
  //then edit your /etc/hosts local file to point on your private IP. 
  //Also both sign-in button + callbackURL has to be share the same url, otherwise two cookies will be created and lead to lost your session
  //if you use it.
  // callbackURL: "http://yourdormain:3000/auth/google/callback",
  callbackURL: "http://localhost:3000/auth/google/callback",
  passReqToCallback   : true
},
function(request, accessToken, refreshToken, profile, done) {
  // asynchronous verification, for effect...
  console.log('using strategy')
  process.nextTick(function () {
    
    // To keep the example simple, the user's Google profile is returned to
    // represent the logged-in user.  In a typical application, you would want
    // to associate the Google account with a user record in your database,
    // and return that user instead.
    console.log('should associate user in db with session')
    return done(null, profile);
  });
}
));

// My configuration express
app.set('port', process.env.SERVERPORT);
app.use('/api/post', parser.json());
app.use('/api/post', parser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/dist')));

// Configuration express oauth
// app.set('views', path.join(__dirname, '../views'));
// app.set('view engine', 'ejs');
// app.use( express.static(path.join(__dirname, '/public')));
app.use(cookieParser()); 
// app.use( bodyParser.json());
// app.use( bodyParser.urlencoded({
// 	extended: true
// }));

app.use(session({ 
	secret: 'cookie_secret',
	name: 'kaas',
	store: new RedisStore({
		host: process.env.REDISIP,
		port: process.env.REDISPORT
	}),
	proxy:  true,
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res){
  console.log('going to /');
  // res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  console.log('going to /account');
  // res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  console.log('going to /login');
  // res.render('login', { user: req.user });
});

// app.use(function(req, res) {
//   var router = Router.create({
//     // onAbort: function(options) {...},
//     // onError: function(error) {...},
//     routes: ['/', 'contact', '/login'],
//     location: req.url
//   });
//   router.run(function(Handler) {
//     res.set("Content-Type", "text/html");
//     res.send(React.renderToString(<Handler/>));
//   });
// });

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google', passport.authenticate('google', { scope: [
  'https://www.googleapis.com/auth/plus.login',
  'https://www.googleapis.com/auth/plus.profile.emails.read'] 
}));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback', 
 passport.authenticate('google', { 
   successRedirect: '/',
   failureRedirect: '/login'
}));

app.get('/logout', function(req, res){
  console.log('going to /logout');
  req.logout();
  res.redirect('/');
});

app.use('/api', router);

app.listen(app.get('port'), (error) => {
  if(error) {
    console.error('Error on server', error);
  } else {
    console.log('Listening on port:', app.get('port'))
  }
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  console.log('checking if authenticated');
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}