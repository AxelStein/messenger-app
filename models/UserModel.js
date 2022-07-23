const mongoose = require('mongoose')
const userSchema = new mongoose.Schema(
    {
        phone: String,
        name: String,
        password: String,
        token: String,
    }
)

module.exports = mongoose.model('User', userSchema)
