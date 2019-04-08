const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const path = require('path')
var session = require('express-session')
const app = express()

const VIEWS_PATH= path.join(__dirname, '/views');
console.log(VIEWS_PATH)

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// tell express to use mustache templating engine
app.engine('mustache', mustacheExpress(VIEWS_PATH + '/partials', '.mustache'))
// the pages are located in views directory
app.set('views','./views')
// extension will be .mustache
app.set('view engine','mustache')

//     Users      //

let users = []
let persistedUser = {}

app.post('/register', (req,res) => {
  let username = req.body.username
  let password = req.body.password

  let user = {username: username, password: password, userTrips: []}
  users.push(user)
  console.log(users)

  res.render('login', {messageA: 'Thank you for registering! Please login below.'})
})

app.post('/login', (req,res) => {
  let username = req.body.username
  let password = req.body.password

  let user = {username: username, password: password, userTrips: []}

    persistedUser = users.find((user) => {
    return user.username == username && user.password == password
  })

  if(persistedUser) {
    if(req.session) {
      req.session.username = persistedUser.username
      res.redirect('/**')
    }
  } else {
    res.render('login', {message: 'The User Name or Password is incorrect. Please try again!'})
  }
})

app.post('/logout', (req,res) => {
  req.session.destroy(function(err) {
    if(err) {
      console.log(err)
    } else {
      res.redirect('/login')
    }
  })
})

app.get('/login', (req,res) => {
  res.render('login')
})


// Listen for server //

app.listen(3000,() => {
console.log("Sever is online...")
})
