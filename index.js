const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("./models/User"); // Adjust path as needed


const app = express();

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
mongoose
  .connect('mongodb+srv://sriramkv1409:sriramkv2005@cluster0.gbsuknc.mongodb.net/cibofind')
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

  
  // Signup route
  app.post(
    "/signup",
    [
      body("email").isEmail().withMessage("Enter a valid email"),
      body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
  
        // Create and save user
        const user = new User({ name: req.body.name, email: req.body.email, password: hashedPassword });
        await user.save();
  
        res.status(201).send("User registered successfully");
      } catch (err) {
        console.error(err);
        res.status(500).send("Error signing up");
      }
    }
  );
  
  app.post("/login",
    [
      body("email").isEmail().withMessage("Enter a valid email"),
      body("password").not().isEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
      try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).send("Invalid email or password");
        console.log(user.password)
        // Compare passwords
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) return res.status(400).send("Invalid email or password");
        
        // Generate a JWT
        const token = jwt.sign({ id: user._id }, "your-secret-key", { expiresIn: "1h" });
        res.json({ token });
      } catch (err) {
        console.error(err);
        res.status(500).send("Error logging in");
      }
    }
  );
  
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
