const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const handleErrors = (err) => {
    let errors = {email: '', password: ''}

    //duplicate error handling

    if(err.code === 11000){
        errors.email = 'That email is already registered';

        return errors
    }


   
    //validation error handling

    if(err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message
        })
    }   

    return errors
}

module.exports.signup_get = (req, res) => {
    console.log('signup')
    res.send('signed up')
}

module.exports.login_get = (req, res) => {
    console.log('login')
}

const createToken = (id) => {
    return jwt.sign({id}, '99percent', {
        expiresIn: '1h'
    })
}


module.exports.signup_post = async(req, res) => {
    const {email,password} = req.body

    try{
        const user = await User.create({email,password})
        const token = createToken(user._id)
        res.cookie('jwtt', token, { domain: 'http://localhost:3001',sameSite: 'None', path: '/', secure: false });
        res.status(201).json({user: user._id})
    }
    catch(err){
        const errors = handleErrors(err)
        res.status(400).json({errors})
    }
 
}

module.exports.login_post = (req, res) => {
    const {email, password} = req.body
    res.cookie('asdasd')

    User.findOne({email}).then(user => {
        if(!user){
            return res.status(404).json({email: 'User not found'})
        }
        bcrypt.compare(password, user.password).then(isMatch => {
            if(isMatch){
                

                res.json({ message: 'Login successful' });
            }
            else{
                return res.status(400).json({password: 'Password incorrect'})
            }
        })

        res.cookie('authToken', 'user.id', { httpOnly: true, secure: false });
        res.setHeader('authToken', 'user.id');
    })
}