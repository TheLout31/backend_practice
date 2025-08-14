const express = require("express");
const todoModel = require("../Models/todo.model");
const authMiddleware = require("../MiddleWare/auth.middleware");
const redis = require("../Config/redis.config");

const TodoRouter = express.Router();

TodoRouter.post("/add-todo", authMiddleware("user"), async (req, res) => {
  try {
    let userId = req.user;
    let todo = await todoModel.create({ ...req.body, userId: req.user });
    await redis.del(userId);
    res.status(200).json({ message: "Todo added successfuly", todo });
  } catch (error) {
    res.status(401).json({ message: "Error adding todo", error });
  }
});

TodoRouter.get(
  "/get-todo",
  authMiddleware(["admin", "user"]),
  async (req, res) => {
    try {
      let userId = req.user;
      let cachedData = await redis.get(userId);
      if (!cachedData) {
        let todo = await todoModel.find({ userId: req.user });
        //storing data in redis first time
        redis.set(userId, JSON.stringify(todo), "EX", 30);
        res.status(200).json({ message: "List of todos", todo });
      } else {
        let todos = JSON.parse(cachedData);
        res.status(200).json({ message: "List of todos", todos });
      }
    } catch (error) {
      res.status(401).json({ message: "Error getting todo", error });
    }
  }
);

module.exports = TodoRouter;
