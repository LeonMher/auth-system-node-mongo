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
  data.employee_id = userId;
  connection.query('INSERT INTO Shifts SET ?', data, (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      console.log('Dummy data inserted successfully');
      res.status(200).send('Dummy data inserted');
    }
  });
});


app.get('/api/requestshifts', (req, res) => {
  // Query the database to retrieve all records

  const userId = req.params.id;
  connection.query('SELECT * FROM shift_requests;', (error, results) => {
    if (error) {
      console.error('Error retrieving data:', error);
      res.status(500).json({ error: 'Error retrieving data' });
    } else {
      console.log(results, ' requested items')
      res.status(200).json(results); // Send the retrieved data as JSON response
    }
  });
});


//Approve the shifts that are in the wait list
//Curretnly I'm not sure what happens with multiple requests. Can I approve them all by calling this API?
//TODO: Implement rejecting the shifts in the list

app.post('/api/approveandapplyshifts/:request_id', (req, res) => {
  const userId = req.params.request_id;
  connection.query(
    `UPDATE shift_requests SET is_approved=1 WHERE request_id=${userId}`,
    (approveErr, approveResults) => {
      if (approveErr) {
        console.error('Error approving shifts:', approveErr);
        res.status(500).send('Error approving shifts');
      } else {
        console.log('Shift approved successfully');
        
        connection.query(
          `INSERT INTO shifts (title, userName, allDay, notes, startDate, endDate, employee_id)
           SELECT sr.title, sr.userName, sr.allDay, sr.notes, sr.startDate, sr.endDate, sr.employee_id
           FROM shift_requests sr
           WHERE sr.is_approved = TRUE;`,
          (applyErr, applyResults) => {
            if (applyErr) {
              console.error('Error applying shifts:', applyErr);
              res.status(500).send('Error applying shifts');
            } else {

              //We then clean the queue of requests
              connection.query(
                `DELETE FROM shift_requests WHERE is_approved = TRUE;`,
                (applyErr, applyResults) => {
                  if (applyErr) {
                    console.error('Error applying shifts:', applyErr);
                    res.status(500).send('Error applying shifts');
                  } 
                }
              );

              res.status(200).send('Shifts approved and applied successfully');
            }
          }
        );
      }
    }
  );
});


// Create a new request with desired date and information. This is going to go to the shift request list

app.post('/api/request/:id', (req, res) => {
  const data = req.body
  const userId = req.params.id; 
  data.employee_id = userId;
  connection.query('INSERT INTO shift_requests SET ?', data, (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      res.status(200).send('Request sent successfully');
    }
  });
});

//This is for updating the shift. If the user drags the shift to somewhere else, it will be deleted 
//and moved to the shift request list
app.put('/api/request/:id', (req, res) => {
  const data = req.body
  const shiftId = req.params.id; 

  delete data.id;
  connection.query('SELECT * FROM shifts WHERE id = ?', shiftId, (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      if (results.length > 0) {
        delete results[0].id;
      }
      results.startDate = data.startDate
      results.endDate = data.endDate
      // this modifies the object adding additional data so only startDate and endDate are the ones updated
      const ultimateObj={
        userName: data.userName,
        title: results[0].title,
        allDay: results[0].allDay,
        notes: results[0].notes,
        startDate: data.startDate,
        endDate: data.endDate,
        employee_id: results[0].employee_id
      }

      connection.query('INSERT INTO shift_requests SET ?', ultimateObj, (err, results) => {
        if (err) {
          console.error('Error inserting data:', err);
          res.status(500).send('Error inserting data');
        } else {
          console.log('successfully updated request');
          //to delete the shift to void duplication
          deleteItem(shiftId)
        }
      })
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
  connection.query('UPDATE shifts SET ? WHERE id = ?', [updatedData, appointmentId], (err, results) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
    } else {
      if (results.affectedRows === 0) {
        // No appointment with the specified ID found
        res.status(404).send('Appointment not found');
      } else {
        console.log('Data updated successfully');
      }
    }
  });
});




  // Delete the appointment from the database
  function deleteItem(appointmentId){
  connection.query('DELETE FROM Shifts WHERE id = ?', appointmentId, (err, results) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).send('Error deleting data');
    } else {  
      if (results.affectedRows === 0) {
        // No appointment with the specified ID found
        res.status(404).send('Appointment not found');
      } else {
        console.log('Data deleted successfully');
      }
    }
  });
  }



app.get('/api/schedule/:id', (req, res) => {
  // Query the database to retrieve all records

  const userId = req.params.id;
  connection.query('SELECT * FROM Shifts', (error, results) => {
    if (error) {
      console.error('Error retrieving data:', error);
      res.status(500).json({ error: 'Error retrieving data' });
    } else {
      results.map((res)=>{
        return res.title=res.userName
      })
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


