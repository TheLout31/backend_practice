const express = require("express");
const bcrypt = require("bcrypt");
const userModel = require("../Models/user.model");
const saltRounds = 10;
const myPlaintextPassword = "s0//P4$$w0rD";
const someOtherPlaintextPassword = "not_bacon";
const UserRouter = express.Router();
require("dotenv").config();
var jwt = require("jsonwebtoken");

UserRouter.post("/signup", (req, res) => {
  const { username, email, password } = req.body;
  try {
    bcrypt.hash(password, saltRounds, async function (err, hash) {
      // Store hash in your password DB.
      if (err) {
        res.status(500).json({ message: "Something went wrong" });
      } else {
        console.log("converted", password, "to this ===>", hash);
        await userModel.create({ username, email, password: hash });
        res.status(201).json({ message: "SigUp Successfull" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
});

UserRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Try signing up." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      var token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY);
      console.log("Your token ===>", token)
      res.status(200).json({ message: "Successfully Logged In", token });
    } else {
      res.status(401).json({ message: "Wrong Password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
});

module.exports = UserRouter;
