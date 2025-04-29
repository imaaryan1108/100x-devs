const express = require("express");
const zod = require("zod");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
mongoose.connect(
  "mongodb+srv://aaryan11:J7E9D9HY2HjyxQav@cluster0.3eed2se.mongodb.net/user_db"
);

const SECRET_KEY = "your_secret_key";

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const app = express();
app.use(express.json());
const port = 3000;

const User = mongoose.model("user_management", userSchema);

const loginSchema = zod.object({
  email: zod.string().email(),
  password: zod.string().min(8),
  name: zod.string().optional(),
});

const userVerification = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    console.log(token);
    const decoded = jwt.verify(token, SECRET_KEY);
    req.decoded = decoded;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).send("Invalid Token");
  }
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/sign-up", async (req, res) => {
  const userSchema = zod.object({
    name: zod.string().min(1),
    email: zod.string().email(),
    password: zod.string().min(8),
  });

  const user = userSchema.safeParse(req.body);

  if (!user.success) {
    return res.status(400).json(user.error);
  }

  const userData = {
    name: user.data.name,
    email: user.data.email,
    password: user.data.password,
  };
  try {
    const hashedPassowrd = await bcrypt.hash(user.data.password, 10);
    if (hashedPassowrd) {
      userData.password = hashedPassowrd;
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }

  try {
    const existingUser = await User.findOne({ email: userData.email });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newUser = new User(userData);
    await newUser.save();
    return res.status(201).json(newUser);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal server error", details: err });
  }
});

app.post("/login", async (req, res) => {
  const login = loginSchema.safeParse(req.body);
  if (!login.success) {
    return res.status(400).json(login.error);
  }

  const user = await User.findOne({
    email: login.data.email,
  });
  const hashedPassword = await bcrypt.compare(
    login.data.password,
    user.password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  if (!hashedPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  try {
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      SECRET_KEY
    );
    res.status(200).json({ token });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/profile", userVerification, (req, res) => {
  const decoded = req.decoded;

  User.findById(decoded.id).then((user) => {
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  });
});

app.put("/profile", userVerification, async (req, res) => {
  const edit = loginSchema.safeParse(req.body);
  if (!login.success) {
    return res.status(400).json(login.error);
  }
  const decoded = req.decoded;
  const userId = decoded.id;
  const updateFields = {};

  if (req.body.email) {
    updateFields.email = req.body.email;
  }
  if (req.body.password) {
    updateFields.password = req.body.password;
  }
  if (req.body.name) {
    updateFields.name = req.body.name;
  }
  User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user);
    })
    .catch((err) => {
      return res.status(500).json({ error: "Internal server error" });
    });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
