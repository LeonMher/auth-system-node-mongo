const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const accountSid = 'AC673101fcbc0ab08a42956d57d229e32d';
const authToken = '72694c5a3894f21846ae447ef76a201a';
const client = require('twilio')(accountSid, authToken);


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
    
    res.send('signed up')
}

// module.exports.schedule = (req, res) => {
    
//     console.log(req.body)
// }

module.exports.login_get = (req, res) => {
    
    res.cookie('asd', 'qwe')
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
        res.cookie('jwtt', token, {httpOnly: false});
        res.send(user)
    }
    catch(err){
        const errors = handleErrors(err)
        res.status(400).json({errors})
    }
 
}

module.exports.login_post = async (req, res) => {
    const {email, password} = req.body
    

    try {
        const user = await User.findOne({ email });
    
        if (!user) {
            return res.status(404).json({ email: 'User not found' });
        }
    
        const isMatch = await bcrypt.compare(password, user.password);
    
        if (isMatch) {
            const token = createToken(user._id);
            res.cookie('jwtt', token, { httpOnly: false });
            res.send(user);
        } else {
            return res.status(400).json({ password: 'Password incorrect' });
        }
    } catch (error) {
        // Handle any unexpected errors here
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports.sendSms = async (req, res) => {

    const {sms} = req.body
    client.messages
    .create({
        body: sms,
        from: '+14347322928',
        to: '+37499212408'
    })
    .then(message => console.log(message.sid))
    .catch(error => console.log(error));


    res.send('sms sent successfully')
}