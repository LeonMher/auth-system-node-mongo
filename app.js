const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');


const app = express();

// const corsOptions = {
//     // set origin to a specific origin.
//     origin: 'http://localhost:3000',
    
//     // or, set origin to true to reflect the request origin
//     //origin: true,
  
//     credentials: true,
//     optionsSuccessStatus: 200,
//   };

app.use(cors());
app.use(bodyParser.json())
app.use(express.json())
app.use(cookieParser());

app.use(routes)

app.get('/', (req, res) => {

    res.send('worked')
})




const dbUrl = 'mongodb+srv://leonmher:mypass123@cluster0.kc6el.mongodb.net/node-auth'

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => app.listen(3000, () => console.log('listening on port 3000')))
    .catch((err) => console.log(err))


