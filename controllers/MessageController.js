const Message = require('../models/MessageModel.js')
const Chat = require('../models/ChatModel.js')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

function isEmpty(input) {
    return !input || !input.trim()
}

function createMessage(req, res, callback) {
    const userId = req.user._id
    const text = req.body.text
    const chatId = req.body.chatId
    
    Message.create({
        text: text,
        fromId: userId,
        chatId: chatId,
        isRead: false,
        date: Date(),
    }, (err, message) => {
        if (message) {
            callback(message)
            // todo notify peer
        } else {
            res.status(400).send({error: "Message not delivered"})
        }
    })
}

const MessageController = {
    send: (req, res) => {
        const userId = req.user._id
        const text = req.body.text
        const chatId = req.body.chatId

        if (isEmpty(text)) {
            return res.status(400).send({error: "text is required"})
        }
        if (isEmpty(chatId)) {
            return res.status(400).send({error: "chatId is required"})
        }

        Chat.findOne({ _id: chatId }, (err, chat) => {
            if (chat) {
                createMessage(req, res, (message) => {
                    chat.lastMessageId = message._id
                    chat.save()

                    res.send(message)
                })
            } else {
                res.status(400).send({error: "Chat not exists"})
            }
        })
    },

    messages: (req, res) => {
        const userId = req.user._id
        const chatId = req.query.chatId
        if (isEmpty(chatId)) {
            return res.status(400).send({error: "parameter chatId is required"})
        }

        Chat.findOne({ _id: chatId }, (err, chat) => {
            if (chat) {
                Message.find({ chatId }, (err, messages) => {
                    if (err) {
                        res.status(400).send({error: "Messages not found"})
                    } else {
                        const result = []
                        messages.forEach(m => {
                            const message = m.toObject()
                            message.isReceived = !userId.equals(message.fromId)
                            result.push(message)
                        })
                        res.send(result)
                    }
                })
            } else {
                res.status(400).send({error: "Chat not exists"})
            }
        })
    },

    read: (req, res) => {
        const userId = req.user._id
        const messageIds = req.body.messageIds
        const objectIds = messageIds.map((id) => { ObjectId(id) })
        Message.updateMany({_id: { $in: objectIds }}, {isRead: true}, (err, result) => {
            if (err) {
                res.status(500).send(err)
            } else {
                res.send()
            }
        })
    },
}

module.exports = MessageController
