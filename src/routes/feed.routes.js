const { Router } = require('express')
const FeedController = require('../controllers/FeedController')
const apicache = require('apicache')

let cache = apicache.middleware

const router = Router()

router.get('/feed', cache('1 minutes'), FeedController.getFeed)

module.exports = router