const registerValidator = require('../validator/registerValidator');
const loginValidator = require('../validator/loginValidator'); 
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { serverError, resourceError } = require('../util/error');

module.exports = {
  login(req, res) {
    let { email, password } = req.body;
    let validator = loginValidator({ email, password });

    if (!validator.isValid) {
      res.status(400).json(validator.error);
    }

    User.findOne(({ email }))
      .then(user => {
        if (!user) {
          return resourceError(res, 'User Not Found');
        }

        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return serverError(res, err);
          }

          if (!result) {
            return resourceError(res, 'Password Doesn\'t Match')
          }

          let token = jwt.sign({ 
            _id: user._id,
            name: user.name,
            email: user.email
          }, 'SECRET', { expiresIn: '2h' })
          
          res.status(200).json({
            message: 'Login Successful',
            token: `Bearer${token}`

          })
        })
      })
      .catch(error => serverError(res, error));

    // Extract Data From requests
    // Validate Data
    // Check for user availability
    // Compare given password
    // Generate Token and Response Back
  },

  register(req, res) {
    console.log(req.body);
    let { name, email, password, confirmPassword } = req.body;
    let validate = registerValidator({ name, email, password, confirmPassword });
    
    if (!validate.isValid) {
      res.status(400).json(validate.error);
    } else {
      console.log(email);
      User.findOne({ email })
        .then(user => {
          if (user) {
            return resourceError(res, 'Email Already Exist')
          }

          bcrypt.hash(password, 11, (err, hash) => {
            if (err) {
              return resourceError(res, 'Server Error Occurred')
            }

            let user = new User({
              name,
              email,
              password: hash
            })

            user.save()
              .then(user => {
                res.status(201).json({
                  message: 'User Created Successfully',
                  user
                })
              })
              .catch(error => serverError(res, error));

          });
        })
        .catch(error => serverError(res, error));

      // res.status(200).json({ message: 'Everything is OK'})
    }
  }
}