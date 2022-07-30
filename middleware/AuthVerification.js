const jwt = require("jsonwebtoken")
const User = require('../models/UserModel.js')

module.exports = async function(req, res, next) {
    const token = req.headers.authorization.replace('Bearer ', '')
    var decoded = undefined
    try {
        decoded = jwt.verify(token, process.env.TOKEN_KEY)
    } catch (e) {
        return res.status(400).send({ error: "Invalid token" })
    }

    if (decoded.isRefresh) {
        res.status(400).send({ error: "Use the appropriate access token" })
    } else {
        const user = await User.findOne({ _id: decoded.userId })
        if (user) {
            req.user = user
            next()
        } else {
            res.status(401).send({ error: "Unauthorized" })
        }
    }
}
