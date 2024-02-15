const { Router } = require('express')
const JobController = require('../controllers/JobController')

const router = Router()

router.post('/job', JobController.register)
router.put('/job/:job_id/publish', JobController.publish)
router.put('/job/:job_id', JobController.update)
router.put('/job/:job_id/archive', JobController.archive)
router.delete('/job/delete/:job_id', JobController.delete)

module.exports = router