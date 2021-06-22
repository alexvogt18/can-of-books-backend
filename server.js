'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const app = express();

const client = jwksClient({
  jwksUri: 'https://dev-jjw40wxd.us.auth0.com/.well-known/jwks.json'
});

// comes from jsonwebtoken documentation
function getKey(header, callback){
  client.getSigningKey(header.kid, function(err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});

// database error warnings from the quickstart guide
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('successfully connected to mongo');
});
app.use(cors());

const PORT = process.env.PORT || 3001;

const Book = require('./models/Book');
const { getMaxListeners } = require('./models/Book');

let firstBook = new Book({
  name: 'lord of the rings',
  description: 'fantasy',
  status: 'available',
  email: 'theanthonyjohnson@gmail.com'
});

let secondBook = new Book({
  name: 'hitchhikers guide to the galaxy',
  description: 'sci-fi',
  status: 'available',
  email: 'theanthonyjohnson@gmail.com'
});

let thirdBook = new Book ({
  name: 'harry potter and the sorcers stone',
  description: 'fantasy',
  status: 'available',
  email: 'theanthonyjohnson@gmail.com'
});

app.get('/books', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  // make sure the token was valid
  jwt.verify(token, getKey, {}, function(err, user) {
    if(err) {
      res.status(500).send('invalid token');
    } else {
      let userEmail = user.email;
      Book.find({email: userEmail}, (err, books) => {
        console.log(books);
        res.send(books);
      });
    }
  });
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));
