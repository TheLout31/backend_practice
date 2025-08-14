const express = require("express");
const connectToDB = require("./Config/mongodb.config");
const UserRouter = require("./Routes/user.routes");
const TodoRouter = require("./Routes/todo.routes");
const app = express();
const cors = require("cors");
const redis = require("./Config/redis.config");
const PORT = 3000;

app.use(cors());
app.use(express.json());

connectToDB();

redis.set("mykey", "myValue from nodejs")

app.use("/user", UserRouter);
app.use("/todos", TodoRouter);

app.get("/test", (req, res) => {
  res.json("Request working successfully!!!");
});

app.get("/login", (req, res) => {
  res.json("Please try to login again.");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
