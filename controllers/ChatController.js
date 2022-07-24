const Chat = require('../models/ChatModel.js')
const User = require('../models/UserModel.js')

function createChat(req, res) {
    const userId = req.user._id
    const peerId = req.body.peerId

    Chat.findOne({peers: [userId, peerId]}, (err, chat) => {
        if (!chat) {
            Chat.create({peers: [userId, peerId]}, (err, chat) => {
                if (err) {
                    return res.status(400).send(err)
                }
                res.send(chat)
            })
        } else {
            res.status(400).send({error: "Chat exists"})
        }
    })
}

const ChatController = {
    chats: (req, res) => {
        const userId = req.user._id

        Chat.find({peers: { $in: [userId] } }, (err, chats) => {
            if (err) {
                res.status(400).send(err)
            } else {
                res.send(chats)
            }
        })
    },

    create: (req, res) => {
        const userId = req.user._id
        const peerId = req.body.peerId

        if (!peerId) {
            return res.status(400).send("peerId is required")
        }

        User.findOne({_id: peerId}, (err, peer) => {
            if (peer) {
                createChat(req, res)
            } else {
                res.status(400).send({error: "Peer not exists"})
            }
        })
    }
}

module.exports = ChatController