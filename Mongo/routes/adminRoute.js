const express = require('express');

const adminRouter = express.Router();
const { Admin, Course } = require('../db/schema');
const { adminAuthenticateMiddleware } = require('../middlewares/adminMiddleware');
const jwt = require('jsonwebtoken');
const { authenticateMiddleware } = require('../middlewares/auth');

adminRouter.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const adminExists = await Admin.findOne({ username });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        const newAdmin = new Admin({ username, password });
        await newAdmin.save();
        res.status(201).json({message : 'Admin registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
})

adminRouter.post('/signin', async (req, res) => {
    try {
        const { username, password } = req?.body
        const admin = await Admin.findOne({ username })
        if (!admin) {
            return res?.status(403).json({ message: 'Username Incorrect' });
        }
        const passwordMatch = await Admin.findOne({ username, password })
        if (!passwordMatch) {
            return res?.status(403).json({ message: 'Password Incorrect' });
        }

        const token = jwt.sign({ username, password, role: 'Admin' }, process.env.JWT_SECRET)
        res.status(200).json({ message: 'Admin logged in successfully', token });


    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
})



adminRouter.post('/courses', authenticateMiddleware , adminAuthenticateMiddleware, async (req, res) => {
    try {
        
        const { title, description, price, imageUrl } = req?.body;
        const newCourse = new Course({ title, description, price, imageUrl });
        await newCourse.save();
        res.status(201).json({ message: 'Course created successfully', courseId: newCourse._id });
    }catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
})

adminRouter.get('/courses',authenticateMiddleware, adminAuthenticateMiddleware, async (req, res) => {
    try {
        const courses = await Course.find({})
        res.status(200).json({ courses });
    } catch (error) { 
        return res.status(500).json({ message: 'Server error' });
    }
})

module.exports = adminRouter;

