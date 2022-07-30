const User = require('../models/UserModel.js')
const crypto = require('crypto')
const jwt = require("jsonwebtoken")
const PermissionGroup = require('../models/PermissionGroup.js')

function encryptPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex')
}

function isEmpty(input) {
    return !input || !input.trim()
}

function generateAccessToken(user) {
    return jwt.sign(
        { userId: user._id },
        process.env.TOKEN_KEY,
        { expiresIn: "2h" }
    )
}

function generateRefreshToken(user) {
    return jwt.sign(
        { 
            userId: user._id,
            isRefresh: true,
        }, 
        process.env.TOKEN_KEY
    )
}

function checkCredentials(email, password, res) {
    if (isEmpty(email) || isEmpty(password)) {
        res.status(400).send({ error: "Credentials required" })
        return false
    }
    return true
}

exports.login = async function(req, res) {
    const email = req.body.email
    var password = req.body.password
    // todo validate email
    if (!checkCredentials(email, password, res)) {
        return
    }
    password = encryptPassword(password)

    const user = await User.findOne({ email })
    if (user) {
        if (user.password == password) {
            res.send({ token: user.refreshToken })
        } else {
            res.status(400).send({ error: "Wrong password" })
        }
    } else {
        res.status(400).send({ error: "User not exists" })
    }
}

exports.register = async function(req, res) {
    const email = req.body.email
    var password = req.body.password
    // todo validate email
    if (!checkCredentials(email, password, res)) {
        return
    }
    password = encryptPassword(password)

    var user = await User.findOne({ email })
    if (user) {
        res.status(409).send({ error: "User already exists" })
    } else {
        user = await User.create({
            email,
            password,
            permissionGroup: PermissionGroup.DEFAULT,
        })

        if (user) {
            const refreshToken = generateRefreshToken(user)
            await User.updateOne({ _id: user._id }, { refreshToken })
            res.send({ token: refreshToken })
        } else {
            res.status(400).send({ error: "User creation error" })
        }
    }
}

exports.getAccessToken = async function(req, res) {
    var decoded = undefined
    try {
        const token = req.headers.authorization.replace('Bearer ', '')
        decoded = jwt.verify(token, process.env.TOKEN_KEY)
    } catch (e) {
        return res.status(400).send({ error: "Invalid token" })
    }

    if (!decoded.isRefresh) {
        res.status(400).send({ error: "Use the appropriate refresh token" })
    } else {
        const user = await User.findOne({ _id: decoded.userId })
        if (user) {
            res.send({ token: generateAccessToken(user) })
        } else {
            res.status(400).send({ error: "User not found" })
        }
    }
}