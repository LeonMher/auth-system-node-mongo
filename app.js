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



// Get the current date
const currentDate = new Date();

// Calculate the start date of the next week
const nextWeekStartDate = new Date(currentDate);
nextWeekStartDate.setDate(currentDate.getDate() + (7 - currentDate.getDay())); // Assuming Sunday is the first day of the week

// Calculate the end date of the next week
const nextWeekEndDate = new Date(nextWeekStartDate);
nextWeekEndDate.setDate(nextWeekStartDate.getDate() + 6); // Assuming Sunday is the first day of the week

// Loop through and log all dates between start and end dates, excluding Tuesdays, Thursdays, Saturdays, and Sundays
const dateFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }; // Updated format options
const currentDateIterator = new Date(nextWeekStartDate);
const dates = [];

while (currentDateIterator <= nextWeekEndDate) {
  // Check if the current day is not Tuesday, Thursday, Saturday, or Sunday
  if (currentDateIterator.getDay() !== 2 &&  // Tuesday
      currentDateIterator.getDay() !== 4 &&  // Thursday
      currentDateIterator.getDay() !== 6 &&  // Saturday
      currentDateIterator.getDay() !== 0) { // Sunday
    const year = currentDateIterator.getFullYear();
    const month = (currentDateIterator.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const day = currentDateIterator.getDate().toString().padStart(2, '0');
    const additionalDay = (currentDateIterator.getDate() + 1).toString().padStart(2, '0');
    const formattedDate = {dateStart: `${year}-${month}-${day}`,dateEnd: `${year}-${month}-${additionalDay}`, userNames: null, employeeId: null};
    
  
    dates.push(formattedDate);
  }
  
  // Increment the current date iterator by one day
  currentDateIterator.setDate(currentDateIterator.getDate() + 1);
}





// Assuming you already have the `dates` array containing the formatted dates

app.post('/api/template', (req, res) => {
  // Loop through the dates array and insert each date individually
  const insertQuery = 'INSERT INTO templates (start, end, userNames, employee_id) VALUES (?, ?, ?, ?)';

  const insertPromises = dates.map((formattedDate) => {
  
   return new Promise((resolve, reject) => {
      connection.query(insertQuery, [formattedDate.dateStart, formattedDate.dateEnd, formattedDate.userNames, formattedDate.employeeId], (error, result) => {
        if (error) {
          console.error('Error inserting date:', error);
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  });

  // Execute all insert queries in parallel
  Promise.all(insertPromises)
    .then((results) => {
      console.log(results.length, ' templates inserted');
      res.status(200).json({ message: `${results.length} templates inserted` });
    })
    .catch((error) => {
      console.error('Error inserting dates:', error);
      res.status(500).json({ error: 'Error inserting dates' });
    });


    const insertShiftsQuery = 'INSERT INTO shifts (start, end) SELECT tmp.start, tmp.end FROM templates tmp';

    connection.query(insertShiftsQuery, (error, result) => {
      if (error) {
        console.error('Error inserting shifts:', error);
        res.status(500).json({ error: 'Error inserting shifts' });
      } else {
        console.log(result.affectedRows, ' shifts inserted');
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
          `INSERT INTO shifts (title, userName, allDay, notes, start, end, employee_id)
           SELECT sr.title, sr.userName, sr.allDay, sr.notes, sr.start, sr.end, sr.employee_id
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
      results.start = data.start
      results.end = data.end

     
      // this modifies the object adding additional data so only startDate and endDate are the ones updated
      const ultimateObj={
        userName: data.userName,
        title: results[0].title,
        allDay: results[0].allDay,
        notes: results[0].notes,
        start: data.start,
        end: data.end,
        employee_id: results[0].employee_id
      }

      console.log(data, ' results')
      
      connection.query('INSERT INTO shifts SET ?', ultimateObj, (err, results) => {
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



app.put('/api/requests/:id', (req, res) => {
  const data = req.body
  const shiftId = req.params.id
  const selectedId = data.selectedId
  
  delete data.id;
  connection.query('SELECT * FROM shifts WHERE id = ?', shiftId, (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      if (results.length > 0) {
        delete results[0].id;
      }
      results.start = data.start
      results.end = data.end

    //  console.log(results[0].title, ' whats the title?')
      
      // this modifies the object adding additional data so only startDate and endDate are the ones updated
      const ultimateObj={
        userName: data.userName,
        title: data.title,
        allDay: data.allDay,
        notes: data.notes,
        start: data.start,
        end: data.end,
        employee_id: data.employee_id
      }

      console.log(data, ' results')
      
      connection.query('INSERT INTO shifts SET ?', ultimateObj, (err, results) => {
        if (err) {
          console.error('Error inserting data:', err);
          res.status(500).send('Error inserting data');
        } else {
          console.log('successfully updated request');
          //to delete the shift to void duplication
          deleteItem(selectedId)
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


  app.get('/api/allschedules', (req, res) => {
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


app.get('/api/schedule/:id', (req, res) => {
  // Query the database to retrieve all records

  const userId = req.params.id;
  connection.query('SELECT * FROM Shifts WHERE employee_id = ?', userId, (error, results) => {
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


