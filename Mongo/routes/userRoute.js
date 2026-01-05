const express = require('express');
const userRouter = express.Router();
const { User} = require('../db/schema');
const { authenticateUserMiddleware } = require('../middlewares/userMiddleware');
const jwt = require('jsonwebtoken');
const { authenticateMiddleware } = require('../middlewares/auth');


userRouter.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
    
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    }catch(error) {
        res.status(500).json({ message: 'Server error' });
    }
})

userRouter.post('signin', async (req, res) => {
    try {
        const { username, password } = req?.body
        const user = await User.findOne({ username })
        if(!user) {
            return res?.status(403).json({ message: 'Username Incorrect' });
        }
        const passwordMatch = await User.find({ username, password })
        if(!passwordMatch) {
            return res?.status(403).json({ message: 'Password Incorrect' });
        }

        const token = jwt.sign({ username, password, role: 'User' }, process.env.JWT_SECRET)
        res.status(200).json({ message: 'User logged in successfully', token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
})

userRouter.get('/courses',authenticateMiddleware, authenticateUserMiddleware, async (req, res) => {
    try {
        const courses = await Course.find({})
        res.status(200).json({ courses });
    }catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
})

userRouter.post('/courses/:courseId',authenticateMiddleware,authenticateUserMiddleware,  async (req, res) => {
    try {
        const courseId = req?.params?.courseId
        const course = await Course.findOne({ id: courseId })
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        await User.updateOne({
            username: req?.headers?.username,
        }, {
            $push: { courses: courseId }
        })
        res.status(200).json({ message: 'Course purchased successfully' });
    }catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
})

userRouter.get('/purchasedCourses',authenticateMiddleware, authenticateUserMiddleware, async (req, res) => {
    try {
        const { username, password } = req?.headers;
        const user = await User.find({ username, password })
        const courses = await Course.find({
            id: { $in: user?.courses }
        })
        res.status(200).json({ purchasedCourses: courses });
    }catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
})

module.exports = userRouter;