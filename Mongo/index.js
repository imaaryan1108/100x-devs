const express = require('express');
const app = express();
const adminRouter = require('./routes/adminRoute');
const userRouter = require('./routes/userRoute');

app.use(express.json());
app.use('/admin', adminRouter);
app.use('/users', userRouter);


app.listen(3000, () => {
    console.log('MongoDB server is running on port 3000');
});