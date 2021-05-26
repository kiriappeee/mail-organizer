const express = require('express');
const fs = require('fs');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const { ImapFlow } = require('imapflow');
const userDetails = require('../config.prod');

const authTokens = {}
var mailsToOrganize;
var ignoreMail = {};
let sortedMailConfig = JSON.parse(fs.readFileSync('sorted-mail.json'));
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
  // next();
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

app.post('/mailToIndex', requireAuth, async (req,res) => {
  console.log(req.body.mailIndex)
  if (req.body.mailIndex === 0) {
    sortedMailConfig = JSON.parse(fs.readFileSync('sorted-mail.json'));
    ignoreMail = {}
    const client = new ImapFlow({
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
    // console.log("Client connected");
    console.log('Opening inbox')
    let mailbox = await client.mailboxOpen('Inbox');
    console.log('Inbox opened');
    try{
      console.log('Fetching all inbox mail');
      mailsToOrganize = await client.fetch('1:*', {envelope: true});
      while (true) {
        mailToReturn = await mailsToOrganize.next();
        if (mailToReturn.value) {
          fromAddress = mailToReturn.value.envelope.from[0].address;
          subject = mailToReturn.value.envelope.subject;
          uid = mailToReturn.value.uid;
          if (sortedMailConfig[fromAddress] === undefined && ignoreMail[fromAddress] === undefined){
            res.json({result: "ok", fromAddress: fromAddress, subject: subject, uid: uid});
            break;
          } else {
            if (sortedMailConfig[fromAddress]) {
              sortMail(uid, sortedMailConfig[fromAddress]);
              console.log(`Sorting mail with subject ${subject} from ${fromAddress} and option ${sortedMailConfig[fromAddress]}`);
            }
          }
        } else {
          res.json({result: "nomail"})
          break;
        }
      }
    } catch (err){
      console.log(err);
      res.json({result: "Not ok"});
    } finally {
      console.log('Closing mailbox');
      await client.mailboxClose();
      console.log('Mailbox closed');
      console.log('Logging client out');
      await client.logout();
      console.log('Client logged out');
    }
  } else {
    while (true){
      mailToReturn = await mailsToOrganize.next();
      if (mailToReturn.value) {
        fromAddress = mailToReturn.value.envelope.from[0].address;
        subject = mailToReturn.value.envelope.subject;
        uid = mailToReturn.value.uid;
        if (sortedMailConfig[fromAddress] === undefined && ignoreMail[fromAddress] === undefined){
          res.json({result: "ok", fromAddress: fromAddress, subject: subject, uid: uid});
          break;
        } else {
          if (sortedMailConfig[fromAddress]) {
            sortMail(uid, sortedMailConfig[fromAddress]);
            console.log(`Sorting mail with subject ${subject} from ${fromAddress} and option ${sortedMailConfig[fromAddress]}`);
          }
        }
      } else {
        res.json({result: "nomail"})
        break;
      }
    }
  }
});

const sortMail = async (uid, sortConfig) => {
  const client = new ImapFlow({
    host: userDetails.mailConfig.host,
    port: userDetails.mailConfig.port,
    secure: true,
    auth:{
      user: userDetails.mailConfig.username,
      pass: userDetails.mailConfig.password
    },
    logger: {}
  });
  try {
    console.log('Connecting to client');
    await client.connect();
    console.log('Opening inbox');
    await client.mailboxOpen('Inbox');
    console.log('Inbox opened');
    console.log("Client connected");
    if (sortConfig === 'o'){
      console.log('Screened out');
      console.log(uid);
      console.log('Marking message as read');
      await client.messageFlagsAdd(uid,
      ['\\Seen'],
      {uid:true});
      console.log('Moving message to Screened out folder');
      await client.messageMove(uid,
      'Screened out',
      {uid: true});
    } else if (sortConfig === 'f'){
      console.log('To the feed');
      console.log('Marking message as read');
      await client.messageFlagsAdd(uid,
      ['\\Seen'],
      {uid:true});
      console.log('Moving message to feed folder');
      await client.messageMove(uid,
      'Feed',
      {uid: true});
    } else if (sortConfig === 'p'){
      console.log('To the paper trail');
      console.log('Marking message as read');
      await client.messageFlagsAdd(uid,
      ['\\Seen'],
      {uid:true});
      console.log('Moving message to paper trail folder');
      await client.messageMove(uid,
      'Paper Trail',
      {uid: true});
    } else if (sortConfig === 'c'){
      console.log('To conversations');
      console.log('Moving message to conversations folder');
      await client.messageMove(uid,
      'Conversations',
      {uid: true});
    }
  }catch(err) {
    console.log(err)
  } finally {
    console.log('Closing mailbox');
    await client.mailboxClose();
    console.log('Mailbox closed');
    console.log('Logging client out');
    await client.logout();
    console.log('Client logged out');
  }
}
app.post('/bucketMail', requireAuth, (req,res) => {
  const {bucket, fromAddress, uid} = req.body;
  console.log(`Sending mail from ${fromAddress} to ${bucket} bucket`);
  if (bucket !== 'i') {
    sortedMailConfig[fromAddress] = bucket;
    sortMail(uid, sortedMailConfig[fromAddress]);
    console.log(`Sorting mail from ${fromAddress} and option ${sortedMailConfig[fromAddress]}`);
  } else {
    ignoreMail[fromAddress] = bucket;
  }
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