const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const chatSchema = new Schema(
    {
        title: String,
        peers: [{type: ObjectId, ref: 'User'}],
        lastMessageId: {type: ObjectId, ref: 'Message'},
    }
)
module.exports = mongoose.model('Chat', chatSchema)