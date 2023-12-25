import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true,
    },

    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    },
    gender: {
        type: String,
    },
    image: String

}, {
    timestamps: true
});


export default mongoose.model('user', userSchema)

