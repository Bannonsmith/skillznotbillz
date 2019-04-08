const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const path = require('path')
var session = require('express-session')
const app = express()
const models = require('./models')

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

//     Users      //


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

  let user = models.User.build({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    city: req.body.city
  })
  user.save().then(function(newUser){
    console.log(newUser)
  })
  res.redirect('/login')
})

app.post('/login', (req, res) => {
  res.redirect('/home')
})

app.get('/home', isAuthenticated, (req,res) => {
  res.render('home')
})

// app.post('/login', (req,res) => {
//   let username = req.body.username
//   let password = req.body.password
//
//   let user = {username: username, password: password, userTrips: []}
//
//     persistedUser = users.find((user) => {
//     return user.username == username && user.password == password
//   })
//
//   if(persistedUser) {
//     if(req.session) {
//       req.session.username = persistedUser.username
//       res.redirect('/**')
//     }
//   } else {
//     res.render('login', {message: 'The User Name or Password is incorrect. Please try again!'})
//   }
// })
//
// app.post('/logout', (req,res) => {
//   req.session.destroy(function(err) {
//     if(err) {
//       console.log(err)
//     } else {
//       res.redirect('/login')
//     }
//   })
// })



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
