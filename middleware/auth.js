const jwt = require("jsonwebtoken")
const User = require('../models/UserModel.js')

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization.replace('Bearer ', '')
    try {
        const decoded = jwt.verify(token, "secret")
        User.findOne({_id: decoded.userId}, (err, user) => {
            if (err) {
                res.status(500).send(err)
            } else if (user) {
                req.user = user
                next()
            } else {
                res.status(401).send({error: "Unauthorized"})
            }
        })
    } catch (e) {
        res.status(400).send({error: "Invalid token"})
    }
}

module.exports = verifyToken
