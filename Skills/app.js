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
const sequelize = require('sequelize')
const Op = sequelize.Op

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


app.get("/show-users-skills", (req,res) =>
{
  models.Description.findAll({
    where: {
      userId: req.session.user.id
    },
    include: [
      {
        model: models.Category,
        as: 'category'
      }
    ]
  }).then((descriptions) => {

      // console.log(descriptions)

      let descs = descriptions.map((desc) => {
        return {categoryName: desc.category.name,
           body: desc.body, userId: desc.userId,
           descriptionId: desc.id, categoryId: desc.category.id
          }
      })

      console.log(descs)

      res.render('user',{descriptions: descs})
      /*
      descriptions.forEach((desc) => {

        let description = desc.dataValues
        let category = desc.dataValues.category.dataValues

        res.render("user", {description: description, categories: category})

    }) */
  })
})

// // console.log(desc.dataValues)
// // console.log("breakr")
// // console.log(desc.dataValues.category.dataValues)
// // console.log(desc.category.dataValues.category.dataValues.name)
// // let categoryName = desc.map((d) => {
// //   return d.name
// // })
// // console.log(categoryName)
// /*
// })
// // desc.map((scrip) => {
// //   conosole.log(scrip)
// // })
//
//
//
//
// models.Category.findAll().then(function(categories) {
// models.Description.findAll({
// where: {
//   userId: req.session.user.id
// }
// }).then((description) => {
//
// let categoryNames = categories.map((category) => {
//   return category.name
// })
// console.log("CATEGORY NAMES")
// console.log(categoryNames)
//
// // console.log(categories)
// function loop(loo) {
//   for(let i = 0; i < loo.length; i++) {
//     let loo = loo[i]
//     return loo.dataValues
//    }
// console.log(loop(categories))
// }
// res.render("user", {description: description, categories: categoryNames})
// })
// }) */


app.post('/logout', function(req, res, next) {
 if (req.session) {
   req.session.destroy(function(err) {
     if(err) {
       return next(err);
     } else {
       res.redirect('/login');
       // console.log(user)
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

  // console.log(userId)
  // console.log(category)
  let skill = models.Description.build({
    body: description,
    userId: userId,
    categoryId: categoryid
  })
  skill.save().then((savedDescription) => {
    // console.log(savedDescription)
  }).catch(function(err) {
    // console.log(err)
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
  models.User.findOne({
     where: {username : req.body.username}
   }).then(function (result) {
         if (null != result) {
           console.log("USERNAME ALREADY EXISTS:", result.username);
         }
         else {
           user.save().then(function(newUser){
   })}
   res.redirect('/login')
  })
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
  let id = req.params.id

  models.Category.findAll().then(function(categories) {
    models.Description.findAll({
      where : {
        categoryId: id,
        userId: {
         [Op.ne]: req.session.user.id
       }
      },
      include: [{model: models.User, as: "Users"}]
    })
    .then((descriptions) => {
      descriptions.forEach((desc) => {
        console.log(desc.dataValues.Users.dataValues.email)
      })

      let descriptionArray = descriptions.map((desc) => {
        return {
          id: desc.dataValues.id,
          body: desc.dataValues.body,
          categoryId: desc.dataValues.categoryId,
          user: {
            id: desc.dataValues.Users.dataValues.id,
            username: desc.dataValues.Users.dataValues.username,
            email: desc.dataValues.Users.dataValues.email
          }
        }
      })
      let category = categories[id -1].dataValues.name

    res.render('trade', {descriptions: descriptionArray, categories: categories, category: category})

    })
  })
})

// user page
app.get('/updatechoice', (req,res) => {
  res.render('updatechoice')
})

app.get('/editchoice/:id',(req,res)=> {
  console.log(req.params, 'it clicked')
  models.Description.findOne({
      where: {
        id : req.params.id
      }
    }).then((description) => {
      res.render('updatechoice', {description: description})
    })
})

app.post('/updatechoice',(req,res)=>{
  models.Description.update({
      body: req.body.descriptionBody
    },{
      where: {
        id: req.body.descriptionId
      }
    })
    res.redirect('/user')
})

app.post('/deletepost',(req,res)=>{
  models.Description.destroy({
      where: {
        id : req.body.postId
      }
    })
    res.redirect('/home')
})




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

app.get('/user', isAuthenticated, (req,res) =>{
  // let id = req.params.userId
  //
  res.render('user')

})

app.get('/register', (req,res) => {
  res.render('register')
})

app.get('/exchange', (req,res) => {
  res.render('exchange')
})

// Listen for server //

app.listen(3000,() => {
console.log("Server is online...")
})
