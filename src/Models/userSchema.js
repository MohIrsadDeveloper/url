const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    phone: Number,
    role: String
})

const UserModel = mongoose.model("Users", userSchema);

module.exports = {
    UserModel
}