const mongoose = require('mongoose')
const messageSchema = new mongoose.Schema(
    {
        text: String,
        fromId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        peerId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        readState: Boolean,
        date: Date,
    }
)
module.exports = mongoose.model('Message', messageSchema)
