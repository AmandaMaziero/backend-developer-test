const {Router} = require('express')
const CompanyController = require('../controllers/CompanyController')

const router = Router()
router.get('/companies', CompanyController.index)
router.get('/companies/:id', CompanyController.show)

module.exports = router
