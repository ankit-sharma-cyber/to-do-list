const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/todos";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const todoSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  done: { type: Boolean, default: false },
});
const Todo = mongoose.model("Todo", todoSchema);

app.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.find().sort({ _id: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: "Could not load todos" });
  }
});

app.post("/todos", async (req, res) => {
  const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
  if (!text) {
    return res.status(400).json({ error: "Todo text is required" });
  }

  try {
    const todo = await Todo.create({ text });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: "Could not create todo" });
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ error: "Invalid todo id" });
  }
});

async function start() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB at", MONGO_URL);
    app.listen(PORT, () => console.log(`To-do app listening on port ${PORT}`));
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  start();
}

module.exports = { app, start };
