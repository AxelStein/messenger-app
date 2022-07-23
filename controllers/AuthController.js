const User = require('../models/UserModel.js')
const crypto = require('crypto')
const jwt = require("jsonwebtoken")

function encryptPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex')
}

function isEmpty(input) {
  return !input || !input.trim()
}

const AuthController = {
    login: (req, res) => {
        const phone = req.body.phone
        const password = req.body.password
        // todo validate phone number
        if (isEmpty(phone) || isEmpty(password)) {
            return res.status(400).send({error: "Credentials required"})
        }

        const encryptedPassword = encryptPassword(password)

        User.findOne({ phone }, (err, user) => {
            if (err) {
                res.status(500).send(err)
            } else if (user) {
                if (user.password == encryptedPassword) {
                    res.send({token: user.token})
                } else {
                    res.status(400).send({error: "Wrong password"})
                }
            } else {
                res.status(400).send({error: "User not exists"})
            }
        })
    },

    register: (req, res) => {
        const phone = req.body.phone
        const password = req.body.password
        if (isEmpty(phone) || isEmpty(password)) {
            return res.status(400).send({error: "Credentials required"})
        }

        const encryptedPassword = encryptPassword(password)
        const token = jwt.sign({phone: phone}, "secret")

        User.findOne({ phone }, (err, user) => {
            if (err) {
                res.status(500).send(err)
            } else if (user) {
                res.status(409).send({error: "User already exists"})
            } else {
                User.create({
                    phone: phone,
                    password: encryptedPassword,
                    token: token,
                })
                res.status(201).send({token: token})
            }
        })
    },
}

module.exports = AuthController