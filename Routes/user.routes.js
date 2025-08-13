const express = require("express");
const bcrypt = require("bcrypt");
const userModel = require("../Models/user.model");
const saltRounds = 10;
const myPlaintextPassword = "s0//P4$$w0rD";
const someOtherPlaintextPassword = "not_bacon";
const UserRouter = express.Router();
require("dotenv").config();
var jwt = require("jsonwebtoken");
const passport = require("passport");
const nodemailer = require("nodemailer");
const GitHubStrategy = require("passport-github2");

UserRouter.post("/signup", (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    bcrypt.hash(password, saltRounds, async function (err, hash) {
      // Store hash in your password DB.
      if (err) {
        res.status(500).json({ message: "Something went wrong" });
      } else {
        console.log("converted", password, "to this ===>", hash);
        await userModel.create({ username, email, password: hash, role });
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
      var token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET_KEY
      );
      console.log("Your token ===>", token);
      res.status(200).json({ message: "Successfully Logged In", token });
    } else {
      res.status(401).json({ message: "Wrong Password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(profile);
      return done(profile);
    }
  )
);

UserRouter.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

UserRouter.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/login",
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    // res.redirect("/");
    res.json({ message: "Login Success!!!!!" });
  }
);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GOOGLE_APP_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

UserRouter.get("/sendmail", async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: '"NEMF Course" <NEMF@gmail.com>',
      to: "20013434@niu.edu.in",
      subject: "Email Test through node.js",
      text: "Test 1", // plain‑text body
      html: "<h1>Test 1</h1>", // HTML body
    });

    res.status(201).json({ message: "Email Send", data: info.messageId });
  } catch (error) {
    res.status(400).json({ message: "Error Sending Email" });
  }
});

UserRouter.post("/forget-password", async (req, res) => {
  try {
    let { email } = req.body;
    let user = await userModel.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not Found!" });
    } else {
      let refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: 200 }
      );
      let resetPasswordLink = `http://localhost:3000/user/reset-password?token=${refreshToken}`;
      // const info = await transporter.sendMail({
      //   from: '"NEMF Course" <NEMF@gmail.com>',
      //   to: "",
      //   subject: "Email Test through node.js",
      //   text: "Test 1", // plain‑text body
      //   html: "<h1>Test 1</h1>", // HTML body
      // });
      res.status(201).json({ message: "Email Send", link: resetPasswordLink });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Try again" });
  }
});

UserRouter.post("/reset-password", async (req, res) => {
  try {
    let { token } = req.query;
    let { newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      res.status(403).json({ message: "Incorrect token try again" });
    } else {
      let user = await userModel.findById(decoded.userId);
      // user.password = newPassword;
      // await user.save();
      bcrypt.hash(newPassword, saltRounds, async function (err, hash) {
        // Store hash in your password DB.
        if (err) {
          res.status(500).json({ message: "Something went wrong" });
        } else {
          console.log("converted", newPassword, "to this ===>", hash);
          user.password = hash;
          await user.save();
          res.status(201).json({ message: "Password Updated!" });
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Try again" });
  }
});

module.exports = UserRouter;
