const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const userSchema = new Schema(
    {
        email: { type: String, unique: true },
        phone: String,
        password: String,
        name: String,
        age: Number,
        about: String,
        interests: [{ type: String }],
        location: { type: ObjectId, ref: 'UserLocation' },
        permissionGroup: String,
        verificationStatus: String,
        matchPreferences: { type: ObjectId, ref: 'MatchPreference' },
        photos: [{ type: ObjectId, ref: 'UserPhoto' }],
        refreshToken: String,
        isOnline: Boolean,
        lastSeen: Date,
    }
)

module.exports = mongoose.model('User', userSchema)
