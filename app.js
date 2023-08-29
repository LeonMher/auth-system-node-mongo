const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/authRoutes');

const app = express();

app.use(express.json())
app.use(routes)

app.get('/', (req, res) => {
    res.send('worked')
})



const dbUrl = 'mongodb+srv://leonmher:mypass123@cluster0.kc6el.mongodb.net/node-auth'

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => app.listen(3000, () => console.log('listening on port 3000')))
    .catch((err) => console.log(err))


