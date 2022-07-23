const Message = require('../models/MessageModel.js')
const User = require('../models/UserModel.js')

function isEmpty(input) {
    return !input || !input.trim()
}

const MessageController = {
    sendMessage: (req, res) => {
        const id = req.user._id
        const text = req.body.text
        const peerId = req.body.peerId

        if (isEmpty(text)) {
            return res.status(400).send({error: "Text is empty"})
        }
        if (isEmpty(peerId)) {
            return res.status(400).send({error: "PeerId is empty"})
        }

        User.findOne({_id: peerId}, (err, peer) => {
            if (err) {
                res.status(500).send(err)
            } else if (peer) {
                Message.create({
                    text: message,
                    fromId: id,
                    peerId: peer._id,
                    dateTime: Date(),
                }, (err, message) => {
                    if (err) {
                        res.status(500).send(err)
                    } else if (message) {
                        res.send(message)
                        // todo notify peer
                    } else {
                        res.status(500).send({error: "Message not delivered"})
                    }
                })
            } else {
                res.status(400).send({error: "Peer not exists"})
            }
        })
    },

    messages: (req, res) => {
        const id = req.user._id
        Message.find({ $or: [{ from: id }, { to: id }] }, (err, messages) => {
            if (err) {
                res.status(400).send(err)
            } else {
                for (var i = messages.length - 1; i >= 0; i--) {
                    const message = messages[i]
                    message.isReceived = id == message.peerId
                }
                res.send(messages)
            }
        })
    },
}

module.exports = MessageController
