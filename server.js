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
function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/books', { useNewUrlParser: true, useUnifiedTopology: true });

// database error warnings from the quickstart guide
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
  console.log('successfully connected to mongo');
});
app.use(cors());

const PORT = process.env.PORT || 3001;

const Book = require('./models/Book');

let firstBook = new Book({
  name: 'lord of the rings',
  description: 'fantasy',
  status: 'available',
  email: 'alexvogt18@gmail.com'
});
firstBook.save((err, bookFromMongo) => {
  console.log(bookFromMongo);
});
let secondBook = new Book({
  name: 'hitchhikers guide to the galaxy',
  description: 'sci-fi',
  status: 'available',
  email: 'alexvogt18@gmail.com'
});
secondBook.save((err, bookFromMongo) => {
  console.log(bookFromMongo);
});
let thirdBook = new Book({
  name: 'harry potter and the sorcers stone',
  description: 'fantasy',
  status: 'available',
  email: 'alexvogt18@gmail.com'
});
thirdBook.save((err, bookFromMongo) => {
  console.log(bookFromMongo);
});

app.post('/booksTest', (req, res) => {
  console.log('at the test route');
  res.send('you hit the test route, good job');
});

app.post('/books', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  console.log(token);
  jwt.verify(token, getKey, {}, function (err, user) {
    if (err) {
      res.status(500).send('invalid token');
      console.log(user);
    } else {
      const newBook = new Book({
        name: req.body.name,
        description: req.body.description,
        status: req.body.status,
        email: user.email
      });
    }
  });
});

app.get('/bookTest', (req, res) => {
  Book.find({}, (err, bookData) => {
    console.log(bookData);
    res.send(bookData);
  });
});

app.get('/books', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  console.log(token);
  jwt.verify(token, getKey, {}, function (err, user) {
    if (err) {
      res.status(500).send('invalid token');
      console.log(user);
    } else {
      let userEmail = user.email;
      Book.find({ email: userEmail }, (err, books) => {
        console.log(books);
        res.send(books);
      });
    }
  });
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));
