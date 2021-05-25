const express = require('express');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const userDetails = require('../config.prod');

const authTokens = {}
var app = express();

// To support URL-encoded bodies
app.use(express.urlencoded({extended: true}));
app.use(express.json());


// To parse cookies from the HTTP Request
app.use(cookieParser());

app.engine('hbs', exphbs({
  extname: '.hbs'
}));


app.set('view engine', 'hbs');
app.set('views', 'webapp/views');

app.use((req, res, next) => {
  const authToken = req.cookies['AuthToken'];
  req.user = authTokens[authToken];
  next();
});

const requireAuth = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.get('/', requireAuth, (req, res) => {
  res.redirect('/organizer');
});

app.get('/organizer', requireAuth, (req,res) => {
  res.render('home');
});

app.get('/mailToIndex', requireAuth, (req,res) => {
  console.log(req.body)
})

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === userDetails.appUser && password === userDetails.appPassword) {
    const authToken = crypto.randomBytes(30).toString('hex');
    authTokens[authToken] = username;
    res.cookie('AuthToken', authToken);
    res.redirect('/');
  } else {
    res.render('login', { message: 'Invalid credentials' });
  }
});

console.log('Starting server');
app.listen(3000);