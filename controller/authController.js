const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const accountSid = 'AC673101fcbc0ab08a42956d57d229e32d';
const authToken = '72694c5a3894f21846ae447ef76a201a';
const client = require('twilio')(accountSid, authToken);
const connection = require('../db/db');

const handleErrors = (err) => {
    let errors = {email: '', password: ''}

    //duplicate error handling
    if(err.errno === 1062){
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


module.exports.signup_post = async (req, res) => {
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      connection.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, role],
        (error, results) => {
          if (error) {
            const errors = handleErrors(error);
            console.error('Error inserting user into MySQL:', errors);
            return res.status(500).json({ errors });
          }
  
          const userId = results.insertId;
          const token = createToken(userId);
          res.cookie('jwtt', token, { httpOnly: false });
          res.send({ id: userId, email, role });
        }
      );
    } catch (err) {
      console.log(err, ' what it says');
      const errors = handleErrors(err);
      res.status(400).json({ errors });
      console.log(errors);
    }
  };

module.exports.login_post = (req, res) => {
    const { email, password } = req.body;
  
      connection.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
  
        if (error) {
          console.error('Error querying user from SQL:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ email: 'User not found' });
        }
  
        const user = results[0];
  
        try {
          const isMatch = await bcrypt.compare(password, user.password);
  
          if (isMatch) {
            const token = createToken(user.id);

            // Check the user's role
  if (user.role === 'employee') {
    console.log(`Welcome, employee ${user.username}!`);
  } else if (user.role === 'manager') {
    console.log(`Welcome, manager ${user.username}!`);
  } else {
    console.log(`Welcome, user ${user.username}!`);
  }
            res.cookie('jwtt', token, { httpOnly: false });
            res.cookie('currentUserRole', user.role, { httpOnly: false });
            res.cookie('currentUser', user.username, { httpOnly: false });
            res.send(user);
          } else {
            return res.status(400).json({ password: 'Password incorrect' });
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
  };


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