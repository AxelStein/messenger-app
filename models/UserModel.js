const mongoose = require('mongoose')
const userSchema = new mongoose.Schema(
    {
        phone: String,
        password: String,
        nickname: String,
    }
)

module.exports = mongoose.model('User', userSchema)
