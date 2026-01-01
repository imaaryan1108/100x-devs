const express = require('express');

const app = express();


const isAllowedMiddleware = (req, res, next) => {
    const age = req?.query?.age;
    if(age && age >= 18) {
        next();
    } else {
        res.status(403).send('Access denied. You must be at least 18 years old.');
    }
}

// app.use(isAllowedMiddleware); for global middleware application, as it is on top of all routes


app.get('/ride1', isAllowedMiddleware, (req, res) => {
    res.send('Welcome to Ride 1!');ß
})

// app.use(isAllowedMiddleware); for specific route group, will be applied to all routes defined after this line

app.get('/ride2', isAllowedMiddleware, (req, res) => {
    res.send('Welcome to Ride 2!');
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});