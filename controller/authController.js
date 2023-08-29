const User = require('../models/User');



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
        console.log(err)
    }

   
    
}

module.exports.login_post = (req, res) => {
    console.log('login post')
}