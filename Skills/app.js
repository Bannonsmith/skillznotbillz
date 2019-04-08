const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const path = require('path')
var session = require('express-session')
const app = express()
const models = require('./models')
const bcrypt = require('bcrypt')
const saltRounds = 10

const VIEWS_PATH= path.join(__dirname, '/views');
console.log(VIEWS_PATH)

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))


app.use(bodyParser.urlencoded({ extended: false }))
app.engine('mustache', mustacheExpress(VIEWS_PATH + '/partials', '.mustache'))
app.set('views','./views')
app.set('view engine','mustache')


function isAuthenticated(req,res,next) {
  if (req.session.username) {
    next()
  }
  else {
    res.redirect('/login')
  }
}

app.post('/login', (req,res) => {
  models.User.findOne({
    where: {
      username: req.body.username,
      password: req.body.password
    }
  }).then(function(user) {
    if (user){
      req.session.username = user.username
      res.redirect('/home')
    } else {
     res.render('login', {Message: "Invalid Credentials!"})
    }
  })
})

app.post('/registration', (req,res) => {
  bcrypt.hash(req.body.password, saltRounds, function(err,hash) {
    console.log(hash)

  let user = models.User.build({
    username: req.body.username,
    email: req.body.email,
    password: hash,
    city: req.body.city
  })
  user.save().then(function(newUser){
    console.log(newUser)
  })
  res.redirect('/login')
})
})

app.post('/register', (req,res) =>{
  res.redirect('/register')

})

app.get('/home', isAuthenticated, (req,res) => {
  res.render('home')
})

app.get('/login', (req,res) => {
  res.render('login')
})

app.get('/register',(req,res) => {
  res.render('register')
})

// Listen for server //

app.listen(3000,() => {
console.log("Server is online...")
})
