const express = require('express');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const { ImapFlow } = require('imapflow');
const userDetails = require('../config.prod');
var client

const authTokens = {}
var mailsToOrganize;
var app = express();

// To support URL-encoded bodies
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('webapp/public'));


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
  next();
  // if (req.user) {
  //   next();
  // } else {
  //   res.redirect('/login');
  // }
};

app.get('/', requireAuth, (req, res) => {
  res.redirect('/organizer');
});

app.get('/organizer', requireAuth, (req,res) => {
  res.render('home');
});

app.post('/mailToIndex', requireAuth, async (req,res) => {
  console.log(req.body.mailIndex)
  if (req.body.mailIndex === 0) {
    client = new ImapFlow({
      host: userDetails.mailConfig.host,
      port: userDetails.mailConfig.port,
      secure: true,
      auth:{
        user: userDetails.mailConfig.username,
        pass: userDetails.mailConfig.password
      },
      logger: {}
    });
    // fetch mails for the first time
    console.log('Connecting to client')
    await client.connect();
    console.log("Client connected");
    console.log('Opening inbox')
    let mailbox = await client.mailboxOpen('Inbox');
    console.log('Inbox opened');
    try{
      console.log('Fetching all inbox mail');
      mailsToOrganize = await client.fetch('1:*', {envelope: true});
      mailToReturn = await mailsToOrganize.next();
      if (mailToReturn.value) {
        fromAddress = mailToReturn.value.envelope.from[0].address;
        subject = mailToReturn.value.envelope.subject;
        res.json({result: "ok", fromAddress: fromAddress, subject: subject});
      } else {
        res.json({result: "nomail"})
      }
    } catch (err){
      console.log(err);
      res.json({result: "Not ok"});
    } finally {
      await client.logout();
      console.log('Client logged out');
      console.log('\nClosing mailbox');
      await client.mailboxClose();
      console.log('Mailbox closed');
    }
  } else {
    mailToReturn = await mailsToOrganize.next();
    if (mailToReturn.value) {
      fromAddress = mailToReturn.value.envelope.from[0].address;
      subject = mailToReturn.value.envelope.subject;
      res.json({result: "ok", fromAddress: fromAddress, subject: subject});
    } else {
      res.json({result: "nomail"})
    }
  }
});

app.post('/bucketMail', (req,res) => {
  const {bucket, fromAddress} = req.body;
  console.log(`Sending mail from ${fromAddress} to ${bucket} bucket`);
  res.json({result: "ok"})
});

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