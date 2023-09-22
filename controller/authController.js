const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const accountSid = 'AC673101fcbc0ab08a42956d57d229e32d';
const authToken = 'd379580015f90c215d62472f0aca599d';
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

// Create JWTs
// TODO: refactor
// Try to find a better way implementing all these seperate functions into one single function
const createToken = (id) => {
    return jwt.sign({id}, '99percent', {
        expiresIn: '1h'
    })
}

const createRole = (role) => {
  return jwt.sign({role}, '99percent', {
      expiresIn: '1h'
  })
}

const createUserId = (employeeId) => {
  return jwt.sign({employeeId}, '99percent', {
      expiresIn: '1h'
  })
}

module.exports.signup_post = async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      connection.query(
        'INSERT INTO employees (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        (error, results) => {
          if (error) {
            const errors = handleErrors(error);
            console.error('Error inserting user into MySQL:', errors);
            return res.status(500).json({ errors });
          }
          
          const userId = results.insertId;
          const token = createToken(userId);
          // TODO: make sure to change the JWT settings for production
          res.cookie('jwtt', token, { httpOnly: false });
          // TODO: make sure it is necessary to send all the data
          res.send({ id: userId, email });
        }
      );
    } catch (err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
      console.log(errors);
    }
  };


module.exports.send_users = (req, res)=>{
  connection.query('SELECT * FROM employees', async (error, results) => {
  
    if (error) {
      console.error('Error querying user from SQL:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ email: 'User not found' });
    }

    const user = results.map((user)=> user);
    console.log(results, ' the USER in backend')

    try {   
        res.send(user);
      
    
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}

module.exports.login_post = (req, res) => {
    const { email, password } = req.body;
  
      connection.query('SELECT * FROM employees WHERE email = ?', [email], async (error, results) => {
  
        if (error) {
          console.error('Error querying user from SQL:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ email: 'User not found' });
        }
  
        const user = results[0];
        console.log(results, ' the USER in backend')
  
        try {
          const isMatch = await bcrypt.compare(password, user.password);
  
          if (isMatch) {
            const token = createToken(user.id);
            // const userRole = createRole(user.role)
            const employeeId = createUserId(user.employee_id)


            // TODO: find better solution
            res.cookie('jwtt', token, { httpOnly: false });
            // res.cookie('jwtrole', userRole, { httpOnly: false });
            res.cookie('jwtuserid', employeeId, { httpOnly: false });
           
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