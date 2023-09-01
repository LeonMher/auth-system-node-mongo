const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');



const app = express();



  app.use(cors({
    origin: 'http://localhost:3000', // Adjust this to your React app's URL
    credentials: true
  }));


app.use(bodyParser.json())
app.use(express.json())
app.use(cookieParser());

app.use(routes)





const dbUrl = 'mongodb+srv://leonmher:mypass123@cluster0.kc6el.mongodb.net/node-auth'

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => app.listen(3001, () => console.log('listening on port 3001')))
    .catch((err) => console.log(err))


