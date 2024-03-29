var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose')
const cors = require('cors')

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(cors({
  origin: 'http://localhost:3000'
}));

// MONGODB CONNECTION
const connectionString = 'mongodb+srv://quinntoye04:mongoquinntoye123@anonymitywebapp.hs3qlpt.mongodb.net/db_anonymity_web_app?retryWrites=true&w=majority&appName=AnonymityWebApp'
mongoose.connect(connectionString)
mongoose.connection.once("open", () => {
    console.log("Connected to Database!");
});
mongoose.connection.on("error", (err) => {
  console.error(err);
  console.log(
    "MongoDB connection error. Please make sure MongoDB is running."
  );
  process.exit();
});

// SESSION ALTERATIONS (Create/Destroy/Check)

const jwt = require('jsonwebtoken');

function isLoggedIn(req) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, 'thisisthesecretkey');
      return decoded; // Return user data if valid
    }
  } catch (error) {
    console.error('JWT verification error:', error);
  }
  return null; // Not logged in
}

app.post('/is-logged-in', (req, res) => {
  const isUserLoggedIn = isLoggedIn(req);
  if (isUserLoggedIn) {
    const userID = isUserLoggedIn.payload;
    res.json({ isLoggedIn: true,  userID }); // Send user data if logged in
  } else {
    res.json({ isLoggedIn: false }); // Send status if not logged in
  }
});

// IMPORTING MONGODB CONTROLLERS
const user = require('./controllers/user')
const group = require('./controllers/group')
// GET/POST REQUESTS (Database functions)
app.post('/create-account', user.createAccount);
app.post('/sign-in', user.signIn)
app.post('/create-group', group.createGroup)
app.post('/retrieve-user-groups', group.retrieveUserGroups)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
