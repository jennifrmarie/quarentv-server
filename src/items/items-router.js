const express = require('express')
const ItemsService = require('./items-service')
const { requireAuth } = require('../middleware/jwt-auth')
const jsonBodyParser = express.json()
const path = require('path')

const itemsRouter = express.Router()

itemsRouter
  .route('/')
  .get(requireAuth, (req, res, next) => {
    ItemsService.getAllItems(req.app.get('db'), req.user.id)
      .then(items => {
        res.json(items.map(ItemsService.serializeItem))
      })
      .catch(next)
  })

  .post(requireAuth,jsonBodyParser, (req, res, next) => {
    const { title, strmservice, date } = req.body
    const newItem = { title, strmservice, date }

    for (const [key, value] of Object.entries(newItem)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    const titleError = ItemsService.validateName(title)

    // if (nameError)
    //   return res.status(400).json({ error: {message:nameError} })

    newItem.user_id = req.user.id

    ItemsService.insertItem(
      req.app.get('db'),
      newItem
    )
      .then(item => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${item.id}`))
          .json(ItemsService.serializeItem(item))
      })
      .catch(next)
  })


itemsRouter
  .route('/:item_id')
  .all(requireAuth)
  .get((req, res) => {
    res.json(ItemsService.serializeItem(res.item))
  })
  .put(requireAuth, jsonBodyParser, (req, res, next) => {
    const { title, strmservice, date } = req.body
    const newItem = { title, strmservice, date }
    newItem.user_id = req.user.id

    ItemsService.updateItem(
      req.app.get('db'),
      req.params.item_id,
      newItem
    )
      .then(item => {
        res
          .status(202)
          .location(path.posix.join(req.originalUrl, `/${item.id}`))
          .json(ItemsService.serializeItem(item))
      })
      .catch(next)
  })
  .get((req, res) => {
    res.json(ItemsService.serializeItem(res.item))
  })
  .delete(requireAuth, jsonBodyParser, (req, res, next) => {
    ItemsService.deleteItem(
      req.app.get('db'),
      req.params.item_id,
    )
      .then(item => {
        res
          .status(200)
          .location(path.posix.join(req.originalUrl, `/${item.id}`))
          .json(ItemsService.serializeItem(item)).end()
      })
      .catch(next)
  })





module.exports = itemsRouter
