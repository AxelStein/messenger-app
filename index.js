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
app.post('/login', AuthController.login)
app.post('/register', AuthController.register)

const MessageController = require('./controllers/MessageController.js')
app.post('/send_message', auth, MessageController.sendMessage)
app.get('/messages', auth, MessageController.messages)

app.listen(port, () => {
    console.log(`Listen app on port ${port}`)
})
