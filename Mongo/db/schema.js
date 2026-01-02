const mongoose = require('mongoose');


mongoose.connect("mongodb+srv://aaryan11:J7E9D9HY2HjyxQav@cluster0.3eed2se.mongodb.net/")


const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
})


const courseSchema = new mongoose.Schema({
    id: {type: Number, required: true, unique: true, autoincrement: true, default: 1},
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    imageUrl: { type: String },
})


const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    courses:  [{
        type: Number,
        ref: 'Course'
    }]
})

const Admin = mongoose.model('Admin', adminSchema);
const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);

module.exports = {
    Admin,
    User,
    Course
};
