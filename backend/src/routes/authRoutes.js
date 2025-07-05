import express from 'express';
import jwt from 'jsonwebtoken'; // ✅ Required to generate JWT
import User from '../models/User.js';

const routes = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15d' });
};

routes.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body; // ✅ FIXED

    if (!email || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters long" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "User already exists with this username" });
    }

    const avatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`;

    const newUser = new User({
      email,
      username,
      password,
      profileImage: avatar, // ✅ FIXED
    });

    await newUser.save(); // ✅ FIXED

    const token = generateToken(newUser._id);

    res.status(201).json({
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        profileImage: newUser.profileImage,
      },
      token, // ✅ Send the token
    });

  } catch (error) {
    console.error("Error registering route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

routes.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body; // ✅ FIXED
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    // check if password is correct
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });
    
    // check if password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(400).json({ error: "Invalid email or password" });

    // generate token
    const token = generateToken(user._id);

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage,
      },
      token, // ✅ Send the token
    });

  } catch  (error) {
    console.error("Error logging in route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

routes.get("/login", async (req, res) => {
});

export default routes;
