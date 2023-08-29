const User = require('../models/User');

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

module.exports.signup_post = async(req, res) => {
    const {email,password} = req.body

    try{
        const user = await User.create({email,password})
        res.status(201).json(user)
    }
    catch(err){
        const errors = handleErrors(err)
        res.status(400).json({errors})
    }

   
    
}

module.exports.login_post = (req, res) => {
    console.log('login post')
}