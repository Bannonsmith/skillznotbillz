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
// console.log(VIEWS_PATH)
console.log(VIEWS_PATH)

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.engine('mustache', mustacheExpress(VIEWS_PATH + '/partials', '.mustache'))
app.set('views','./views')
app.set('view engine','mustache')



// Functions //

function isAuthenticated(req,res,next) {
  if (req.session.user) {
    next()
  }
  else {
    res.redirect('/login')
  }
}

app.post ('/add-skill', (req, res) => {
  let description = req.body.body
  let userId = req.body.id
  let categoryid = req.body.categoryid

  let skill = models.Description.build({
    body: description,
    userId: userId,
    categoryId: categoryId
  })
  description.save().then((savedDescription) => {
    console.log(savedDescription)
  })
  res.redirect("/user")
})

// Posts //

app.post('/login', (req,res) => {

  // console.log(req.body)
  let username = req.body.username
  let password = req.body.password

  // console.log(username)

  models.User.findOne({
    where: {
      username: username
    }
  }).then(function(user) {
    // console.log(user)
    if (user === null) {
      res.render("login", {message: "Invalid username or password!"})
    }
      else {
        bcrypt.compare(password, user.password,(error,result) => {
          if (result) {
            if (req.session){
              req.session.user = user.dataValues
          }
          res.render('home', {'user' : user})

        } else {
          res.render("login", {message: "Invalid username or password!"})
        }
      })
    }
  })
})

app.post('/registration', (req,res) => {
  bcrypt.hash(req.body.password, saltRounds, function(err,hash) {

  let user = models.User.build({
    username: req.body.username,
    email: req.body.email,
    password: hash,
    city: req.body.city
  })
  user.save().then(function(newUser){
    // console.log(newUser)
  })
  res.redirect('/login')
})
})

app.post('/register',  (req,res) =>{
  res.redirect('/register')

})


// Gets //

app.get('/trade', isAuthenticated, (req, res) =>{
  models.Category.findAll().then(function(categories) {
    console.log(categories)
    res.render('trade', {categories: categories})
  })
})

app.get('/tradeSkill/:id', (req,res) => {
  let id = req.params.id
  models.Category.findAll().then(function(categories) {
    models.Description.findAll({
      where : {
        categoryId: id
      }
    })
    .then((descriptions) => {
      console.log(categories)
      console.log(descriptions)
      res.render('trade', {description: descriptions, categories: categories} )
    })
  })
})


app.post('/add-category', (req, res) => {
    id = req.body.id
    name = req.body.name

})
app.get('/home', isAuthenticated, (req, res) => {
  models.Category.findAll().then(function(categories) {
    console.log(categories)
    res.render('home', {categories: categories})
  })
})
app.get('/home', isAuthenticated, (req,res) => {
  res.render('home')
})
app.get('/trade', isAuthenticated, (req,res) => {
  res.render('trade')
})

app.get('/login', (req,res) => {
  res.render('login')
})
//users page

app.get('/user', (req,res) =>{
        res.render('user')

        })

app.get('/register', (req,res) => {
  res.render('register')
})

// Listen for server //

app.listen(3000,() => {
console.log("Server is online...")
})
