const mongoose = require('mongoose');
const {isEmail} = require('validator');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, ' Email is required'],
        unique: true,
        lowercase: true,
        validate: [isEmail, " Please enter a valid email"]
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password must be at least 6 characters']
    }
})

const User = mongoose.model('user', UserSchema);


module.exports = User