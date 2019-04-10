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
// console.log(VIEWS_PATH)

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


app.post('/logout', function(req, res, next) {
 if (req.session) {
   req.session.destroy(function(err) {
     if(err) {
       return next(err);
     } else {
       res.redirect('/login');
       console.log(user)
     }
   });
 }
})

app.get('/logout',(req,res) =>{
 res.render('logout')
})

app.post ('/add-skill', (req, res) => {
  let description = req.body.description
  let categoryid = req.body.category
  let category = req.body.category
  let userId = req.session.user.id

  console.log(userId)
  console.log(category)
  let skill = models.Description.build({
    body: description,
    userId: userId,
    categoryId: categoryid
  })
  skill.save().then((savedDescription) => {
    console.log(savedDescription)
  }).catch(function(err) {
    console.log(err)
  })
  res.redirect("/user")
})


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
          res.redirect('/home')

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


// Trade Page //

app.get('/trade', isAuthenticated, (req, res) =>{
  models.Category.findAll().then(function(categories) {
    res.render('trade', {categories: categories})
  })
})

app.get('/tradeSkill/:id', (req,res) => {
  console.log(req.params, 'parammmms')
  let id = req.params.id

  models.Category.findAll().then(function(categories) {
    models.Description.findAll({
      where : {
        categoryId: id
      }
    })
    .then((descriptions) => {
      let category = categories.filter(function(cat) {
        return cat.dataValues.id == id
      })[0].dataValues.name
      console.log(category)
      res.render('trade', {description: descriptions, categories: categories, category: category } )
    })
  })
})


// ?? //




app.post('/add-category', (req, res) => {
    id = req.body.id
    name = req.body.name

})
app.get('/home', isAuthenticated, (req, res) => {
  models.Category.findAll().then(function(categories) {

  models.User.findOne({
    where: {
      username: req.session.user.username
    }
  }).then(function(user) {

    res.render('home', {user: user, categories: categories})
  })
})
})

app.get('/trade', isAuthenticated, (req,res) => {
  res.render('trade')
})

app.get('/login', (req,res) => {
  res.render('login')
})

//users page

app.get('/user', (req,res) =>{
  // let id = req.params.userId
  //
  // models.Category.findAll().then(function(categories) {
  //   models.Description.findAll(){
  //     where: {
  //       userId: id
  //     }
  //   }
  // })


  res.render('user')

})

app.get('/register', (req,res) => {
  res.render('register')
})

// Listen for server //

app.listen(3000,() => {
console.log("Server is online...")
})
