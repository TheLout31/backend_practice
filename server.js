const express = require("express");
const connectToDB = require("./Config/mongodb.config");
const UserRouter = require("./Routes/user.routes");
const TodoRouter = require("./Routes/todo.routes");
const app = express();
const PORT = 3000;

app.use(express.json());

connectToDB();

app.use("/user", UserRouter);
app.use("/todos", TodoRouter);

app.get("/", (req, res) => {
  res.json("request working successfully!!!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
