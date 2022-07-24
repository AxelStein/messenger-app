const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const messageSchema = new Schema(
    {
        text: String,
        fromId: {type: ObjectId, ref: 'User'},
        chatId: {type: ObjectId, ref: 'Chat'},
        isRead: Boolean,
        date: Date,
    }
)
module.exports = mongoose.model('Message', messageSchema)