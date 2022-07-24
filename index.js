const express = require('express')
const app = express()
const port = 3030
const bodyParser = require('body-parser')
app.use(bodyParser.json())
const mongoose = require('mongoose')
const auth = require('./middleware/auth.js')

mongoose
    .connect('mongodb://localhost:27017/app')
    .then(() => {
        console.log("Connected to the database!")
    })
    .catch(err => console.log(err))

const AuthController = require('./controllers/AuthController.js')
app.post('/auth/login', AuthController.login)
app.post('/auth/register', AuthController.register)

const ChatController = require('./controllers/ChatController.js')
app.get('/chat', auth, ChatController.chats)
app.post('/chat/create', auth, ChatController.create)

const MessageController = require('./controllers/MessageController.js')
app.get('/message', auth, MessageController.messages)
app.post('/message/send', auth, MessageController.send)

app.listen(port, () => {
    console.log(`Listen app on port ${port}`)
})
