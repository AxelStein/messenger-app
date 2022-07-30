const express = require('express')
const app = express()
const port = 3030
const bodyParser = require('body-parser')
app.use(bodyParser.json())
const mongoose = require('mongoose')
const authVerification = require('./middleware/AuthVerification.js')
require('dotenv').config()

mongoose
    .connect('mongodb://localhost:27017/app')
    .then(() => {
        console.log("Connected to the database!")
    })
    .catch(err => console.log(err))

const authRouter = require('./routes/AuthRouter.js')
app.use('/auth', authRouter)

const ChatController = require('./controllers/ChatController.js')
app.get('/chat', authVerification, ChatController.chats)
app.post('/chat/create', authVerification, ChatController.create)

const MessageController = require('./controllers/MessageController.js')
app.get('/message', authVerification, MessageController.messages)
app.post('/message/send', authVerification, MessageController.send)

app.listen(port, () => {
    console.log(`Listen app on port ${port}`)
})
