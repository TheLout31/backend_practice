const express = require("express");
const todoModel = require("../Models/todo.model");
const authMiddleware = require("../MiddleWare/auth.middleware");

const TodoRouter = express.Router();

TodoRouter.post("/add-todo", authMiddleware("user"), async (req, res) => {
  try {
    let todo = await todoModel.create({ ...req.body, userId: req.user });
    res.status(200).json({ message: "Todo added successfuly", todo });
  } catch (error) {
    res.status(401).json({ message: "Error adding todo", error });
  }
});

TodoRouter.get("/get-todo", authMiddleware("admin"), async (req, res) => {
  try {
    let todo = await todoModel.find({ userId: req.user });
    res.status(200).json({ message: "List of todos", todo });
  } catch (error) {
     res.status(401).json({ message: "Error getting todo", error });
  }
});

module.exports = TodoRouter;
