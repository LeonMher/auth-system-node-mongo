const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
const connection = require('./db/db')



const app = express();



  app.use(cors({
    origin: 'http://localhost:3000', // Adjust this to your React app's URL
    credentials: true
  }));


app.use(bodyParser.json())
app.use(express.json())
app.use(cookieParser());

app.use(routes)


app.post('/api/schedule', (req, res) => {
  const dummyData = req.body

  // Insert dummy data into the database
  connection.query('INSERT INTO appointments SET ?', dummyData, (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      console.log('Dummy data inserted successfully');
      res.status(200).send('Dummy data inserted');
    }
  });
});




app.get('/api/schedule', (req, res) => {
  // Query the database to retrieve all records
  connection.query('SELECT * FROM appointments', (error, results) => {
    if (error) {
      console.error('Error retrieving data:', error);
      res.status(500).json({ error: 'Error retrieving data' });
    } else {
      res.status(200).json(results); // Send the retrieved data as JSON response
    }
  });
});




const dbUrl = 'mongodb+srv://leonmher:mypass123@cluster0.kc6el.mongodb.net/node-auth'

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => app.listen(3001, () => console.log('listening on port 3001')))
    .catch((err) => console.log(err))


