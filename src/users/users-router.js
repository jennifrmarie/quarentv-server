const express = require('express')
const path = require('path')
const UsersService = require('./users-service')
const { requireAuth } = require('../middleware/jwt-auth')
const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
  .post('/', jsonBodyParser, (req, res, next) => {
    const { password, user_name } = req.body

    for (const field of ['user_name', 'password'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body.`
        })


    const passwordError = UsersService.validatePassword(password)

    if (passwordError)
      return res.status(400).json({ error: passwordError })

    UsersService.hasUserWithUserName(
      req.app.get('db'),
      user_name
    )
      .then(hasUserWithUserName => {
        if (hasUserWithUserName)
          return res.status(400).json({ error: `Username already taken` })

        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              user_name,
              password: hashedPassword,
              date: 'now()',
            }

            return UsersService.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(UsersService.serializeUser(user))
              })
          })
      })
      .catch(next)
  })

  usersRouter
  .route('/score')
  .get(requireAuth, (req, res, next) => {
    UsersService.getById(req.app.get('db'),
      req.user.id
    )
      .then(user => {
        console.log(user)
       res.json({
         id: user.id,
         score: user.score,
         badge: user.badge,
    })
      })
      .catch(next)
  })

  .post(jsonBodyParser, requireAuth, (req, res, next) => {
  
    const { score } = req.body
    UsersService.updateScore(
      req.app.get('db'),
      req.user.id, score
    ) .then (data => {
      res.send("score was updated")
    })

  })



module.exports = usersRouter
