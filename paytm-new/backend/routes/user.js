import { Account, User } from "../configs/db.js";
import { userSignupSchema } from "../configs/validation.js";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const userRouter = Router();

userRouter.post("/sign-up", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    userSignupSchema?.parse({
      firstName,
      lastName,
      email,
      password,
    });

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
    });
    // Check if user already exists
    const _isUserPresent = await User.exists({ email });
    if (_isUserPresent) {
      return res.status(400).json({ error: "User already exists" });
    }
    const savedUser = await newUser.save();
    const jwtData = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET);
    const accountData = {
      userId: savedUser._id,
      balance: Math.random() * 10000 + 1, // Random balance between 0 and 10000
    };
    const newAccount = new Account(accountData);
    const savedAccount = await newAccount.save();
    return res.status(201).json({
      message: "User signed up successfully",
      token: jwtData,
      account: savedAccount,
    });
  } catch (e) {
    console.error("Error during user sign-up:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

userRouter.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;
  const _isUserPresent = (await User.findOne({ email })) || {};
  if (Object?.keys(_isUserPresent).length === 0) {
    return res.status(400).json({ error: "User not found" });
  }
  const _isPasswrodCorrect = _isUserPresent?.password === password;
  if (!_isPasswrodCorrect) {
    return res.status(400).json({ error: "Incorrect password" });
  }
  const jwtData = jwt.sign(
    { userId: _isUserPresent._id },
    process.env.JWT_SECRET
  );
  return res.status(200).json({
    message: "User signed in successfully",
    token: jwtData,
  });
});

userRouter.put("/", authMiddleware, async (req, res) => {
  const { firstName, lastName, password } = req.body;
  const userId = req.userId;
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, {
      firstName,
      lastName,
      password,
    });
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({
      message: "User updated successfully",
    });
  } catch (e) {
    console.error("Error during user update:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

userRouter.get("/bulk", async (req, res) => {
  const userName = req?.query?.filter;
  try {
    const filteredUsers =
      (await User.find({
        firstName: userName,
      }).limit(10)) || [];

    return res.status(200).json({
      message: "Users fetched successfully",
      users: filteredUsers,
    });
  } catch (e) {
    console.error("Error fetching users:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default userRouter;

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQ4NzZiZjkwYzE1ZjFhYTBmYTg2NGQiLCJpYXQiOjE3NDk1Nzk5NTB9.-kJhDbohZ590or8sNHhqCQtGq-tIHV-7nuavTkrhTuI
