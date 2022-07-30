const express = require('express')
const router = express.Router()
const authController = require('../controllers/AuthController.js')

router.post('/login', authController.login)
router.post('/register', authController.register)
router.get('/access_token', authController.getAccessToken)

module.exports = router