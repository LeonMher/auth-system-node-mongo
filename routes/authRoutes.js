const { Router } = require('express');
const authController = require('../controller/authController')


const router = Router();

router.get('/api/signup', authController.signup_get)
router.post('/api/signup', authController.signup_post)
router.post('/api/login', authController.login_post)
router.post('/sms', authController.sendSms)


module.exports = router;