const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
const connection = require('./db/db')
const format = require('date-fns/format');


const app = express();

  app.use(cors({
    origin: 'http://localhost:3000', // Adjust this to your React app's URL
    credentials: true
  }));

// middlewares
app.use(bodyParser.json())
app.use(express.json())
app.use(cookieParser());
app.use(routes)

// TODO: Move this to the routes and controllers
app.post('/api/schedule/:id', (req, res) => {
  const data = req.body
  const userId = req.params.id; 

  data.user_id = userId;
  connection.query('INSERT INTO appointment SET ?', data, (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      console.log('Dummy data inserted successfully');
      res.status(200).send('Dummy data inserted');
    }
  });
});

// TODO: make sure this works properly
// The user id might be required but is missing
// Not sure
app.put('/api/update-schedule/:id', (req, res) => {
  const appointmentId = req.params.id;
  const updatedData = req.body;

  // Update the appointment data in the database
  connection.query('UPDATE appointment SET ? WHERE id = ?', [updatedData, appointmentId], (err, results) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
    } else {
      if (results.affectedRows === 0) {
        // No appointment with the specified ID found
        res.status(404).send('Appointment not found');
      } else {
        console.log('Data updated successfully');
        res.status(200).send('Data updated');
      }
    }
  });
});


app.delete('/api/delete-schedule/:id', (req, res) => {
  const appointmentId = req.params.id;

  // Delete the appointment from the database
  connection.query('DELETE FROM appointments WHERE id = ?', appointmentId, (err, results) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).send('Error deleting data');
    } else {  
      if (results.affectedRows === 0) {
        // No appointment with the specified ID found
        res.status(404).send('Appointment not found');
      } else {
        console.log('Data deleted successfully');
        res.status(200).send('Data deleted');
      }
    }
  });
});


app.get('/api/schedule/:id', (req, res) => {
  // Query the database to retrieve all records

  const userId = req.params.id;
  connection.query('SELECT * FROM appointment WHERE user_id = ?', userId, (error, results) => {
    if (error) {
      console.error('Error retrieving data:', error);
      res.status(500).json({ error: 'Error retrieving data' });
    } else {
      res.status(200).json(results); // Send the retrieved data as JSON response
    }
  });
});

app.get('/api/gantt', (req, res) => {
  connection.query('SELECT * FROM gantt', (error, results) => {
    if (error) {
      console.error('Error retrieving data:', error);
      res.status(500).json({ error: 'Error retrieving data' });
    } else {

      const formattedResults = results.map((result) => {
        return {
          ...result, 
          start_date: format(result.start_date, 'yyyy-MM-dd'), // Format start_date
        };
      });


      res.status(200).json(formattedResults); // Send the retrieved data as JSON response
    }
  });
});






const dbUrl = 'mongodb+srv://leonmher:mypass123@cluster0.kc6el.mongodb.net/node-auth'

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => app.listen(3001, () => console.log('listening on port 3001')))
    .catch((err) => console.log(err))


