const express = require('express')
const app = express()
const port = 3030
const bodyParser = require('body-parser')
app.use(bodyParser.json())
const jwt = require("jsonwebtoken")
const crypto = require('crypto')
const mongoose = require('mongoose')

const admin = require("firebase-admin")
const serviceAccount = require("./serviceAccountKey.json")
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
})

const notification_options = {
	priority: "high",
}

mongoose
	.connect('mongodb://localhost:27017/test')
	.then(() => {
        console.log("Connected to the database!");
    })
	.catch(err => console.log(err))

const userSchema = new mongoose.Schema(
	{
		phone: String,
		name: String,
		password: String,
		token: String,
	}
)
const User = mongoose.model('User', userSchema)

const messageSchema = new mongoose.Schema(
	{
		message: String,
		from: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
		to: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
		dateTime: Date,
	}
)
const Message = mongoose.model('Message', messageSchema)

app.post('/login', async (req, res) => {
	const phone = req.body.phone
	const password = req.body.password
	if (!(phone && password)) {
		return res.status(400).send({error: "Credentials required", code: 102})
	}

	const encryptedPassword = crypto.createHash('sha256').update(password).digest('hex')

	const user = await User.findOne({ phone })
	if (user) {
		if (user.password == encryptedPassword) {
			res.send({token: user.token})
		} else {
			res.status(400).send({error: "Wrong password", code: 103})
		}
	} else {
		res.status(400).send({error: "User not found", code: 104})
	}
})

app.post('/register', async (req, res) => {
	const phone = req.body.phone
	const password = req.body.password
	if (!(phone && password)) {
		return res.status(400).send({error: "Credentials required", code: 102})
	}

	const encryptedPassword = crypto.createHash('sha256').update(password).digest('hex')
	const token = jwt.sign({phone: phone}, "secret")

	const oldUser = await User.findOne({ phone })
    if (oldUser) {
      return res.status(409).send({error: "User already exists", code: 101})
    }

	const user = await User.create({
		phone: phone,
		password: encryptedPassword,
		token: token,
	})


	res.status(201).json({token: token})
})

app.get('/users', async (req, res) => {
	checkToken(req, res, async (user) => {
		const users = await User.find({})
		res.send(users)
	})
})

app.post('/send_message', async (req, res) => {
	checkToken(req, res, (user) => {
		const message = req.body.message
		const userId = req.body.userId
		User.findOne({_id: userId}, (err, recipient) => {
			if (err) {
				res.status(400).send({error: "User not exists"})
			} else {
				console.log(recipient)
				console.log(user)
				Message.create({
					message: message,
					from: user._id,
					to: recipient._id,
					dateTime: Date()
				})
				res.send()
			}

		})
	})
})

app.get('/messages', async (req, res) => {
	checkToken(req, res, (user) => {
		const id = user._id
		Message.find({ $or: [{ from: id }, { to: id }] }, (err, messages) => {
			res.send(messages)
		})
	})
})

async function checkToken(req, res, callback) {
	const token = req.headers.authorization.replace('Bearer ', '')
	try {
		const decoded = jwt.verify(token, "secret")
		const account = await User.findOne({ phone: decoded.phone })
		if (account) {
			callback(account)
		} else {
			res.code(401).send({error: "Unauthorized", code: 401})
		}
	} catch (e) {
		res.status(400).send({error: "Invalid token", code: 400})
	}
}

app.post('/send_notification', async (req, res) => {
	const token = req.body.firebase_token
	const message = req.body.message
	const s = {
		notification: {
			title: "Title",
			body: message
		}
	}

	await admin.messaging().sendToDevice(token, s, notification_options)
		.then(response => {
			res.send("Notification sent")
		})
		.catch(err => {
			res.status(401).send(err)
		})
})

app.listen(port, () => {
	console.log(`Listen app on port ${port}`)
})
