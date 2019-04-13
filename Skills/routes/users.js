const express = require('express')
const router = express.Router()
const models = require('../models')

const sequelize = require('sequelize')
const Op = sequelize.Op

  // Using the session to authenticated each page
function isAuthenticated(req,res,next) {
    if (req.session.user) {
      next()
    }
    else {
      res.redirect('/login')
    }
  }
 // Display the home page ad showing user name and categories
router.get('/home', isAuthenticated, (req, res) => {
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

  // Display the user page
router.get('/user', isAuthenticated, (req,res) =>{

    res.render('user')
  })

    // Adding the categories and descritption to the user page
router.get("/show-users-skills", isAuthenticated, (req,res) => {
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
      let descs = descriptions.map((desc) => {
        return {categoryName: desc.category.name,
           body: desc.body, userId: desc.userId,
           descriptionId: desc.id, categoryId: desc.category.id
          }
      })
      res.render('user',{descriptions: descs})
  })
})
  // Display the update page
router.get('/updatechoice', isAuthenticated, (req,res) => {
    res.render('updatechoice')
  })

  // Update individual skills
router.get('/editchoice/:id', isAuthenticated, (req,res)=> {
    models.Description.findOne({
        where: {
          id : req.params.id
        }
      }).then((description) => {
        res.render('updatechoice', {description: description})
      })
  })
    // Updates the datebase
  router.post('/updatechoice',(req,res)=>{
    models.Description.update({
        body: req.body.descriptionBody
      },{
        where: {
          id: req.body.descriptionId
        }
      })
      res.redirect('show-users-skills')
  })
    // Deletes the skills from the database
  router.post('/deletepost',(req,res)=>{
    models.Description.destroy({
        where: {
          id : req.body.postId
        }
      })
      res.redirect('show-users-skills')
  })
    // Adds the skill to the database and displaying information
  router.post ('/add-skill', (req, res) => {
    models.Category.findAll().then(function(categories) {
      models.User.findOne({
        where: {
          username: req.session.user.username
        }
      }).then(function(user) {
    let description = req.body.description
    let categoryid = req.body.category
    let category = req.body.category
    let userId = req.session.user.id


    let skill = models.Description.build({
      body: description,
      userId: userId,
      categoryId: categoryid
    })
    skill.save().then((savedDescription) => {
    }).catch(function(err) {
    }).then(function(){

    res.render('home', {categories: categories, user: user, message: "You have successfully added a new skill",
     button: "If you would like to see/edit/update what you just submitted click the User Profile button above or if you want to begin trading skills click on the Trade Skills button above."})
    })
  })
})
})
    // Display the trade page with categories
  router.get('/trade', isAuthenticated, (req, res) =>{
    models.Category.findAll().then(function(categories) {
      res.render('trade', {categories: categories})
    })
  })
    // Display the invdidual skills upon clicking the categoties
  router.get('/tradeSkill/:id', isAuthenticated, (req,res) => {
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
    // Connects this route with app.js
module.exports = router
