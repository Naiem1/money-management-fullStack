const router = require('express').Router();
const { login, register } = require('./../controllers/userController');

// Registration route
// localhost:4000/api/users/register
router.post('/register', register)

// login router
// localhost:4000/aip/users/login
router.post('/login', login)

module.exports = router; 