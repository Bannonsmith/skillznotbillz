const express = require('express')
const router = express.Router()
const models = require('../models')

const sequelize = require('sequelize')
const Op = sequelize.Op


function isAuthenticated(req,res,next) {
    if (req.session.user) {
      next()
    }
    else {
      res.redirect('/login')
    }
  }

router.get('/home', isAuthenticated, (req, res) => {
    console.log(req.session)
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
  

router.get('/user', isAuthenticated, (req,res) =>{
    // let id = req.params.userId
    //
    res.render('user')
  
  })

router.get("/show-users-skills", (req,res) =>
{
    console.log(req.session)
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
  })
})

router.get('/updatechoice', (req,res) => {
    res.render('updatechoice')
  })
  
router.get('/editchoice/:id',(req,res)=> {
    models.Description.findOne({
        where: {
          id : req.params.id
        }
      }).then((description) => {
        res.render('updatechoice', {description: description})
      })
  })
  
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
  
  router.post('/deletepost',(req,res)=>{
    models.Description.destroy({
        where: {
          id : req.body.postId
        }
      })
      res.redirect('show-users-skills')
  })
  
  router.post ('/add-skill', (req, res) => {
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
        res.redirect("/users/show-users-skills")
    })
    
  })

  router.get('/trade', isAuthenticated, (req, res) =>{
    models.Category.findAll().then(function(categories) {
      res.render('trade', {categories: categories})
    })
  })
  
  router.get('/tradeSkill/:id', (req,res) => {
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

module.exports = router

