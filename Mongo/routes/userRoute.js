const express = require('express');
const userRouter = express.Router();
const { User} = require('../db/schema');
const { authenticateUserMiddleware } = require('../middlewares/userMiddleware');


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

userRouter.get('/courses',authenticateUserMiddleware, async (req, res) => {
    try {
        const courses = await Course.find({})
        res.status(200).json({ courses });
    }catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
})

userRouter.post('/courses/:courseId',authenticateUserMiddleware,  async (req, res) => {
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

userRouter.get('/purchasedCourses',authenticateUserMiddleware, async (req, res) => {
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