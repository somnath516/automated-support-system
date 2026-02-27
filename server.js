const express = require("express");
const path = require("path");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ================= MONGODB CONNECTION =================
mongoose.connect("mongodb+srv://admin:admin123@cluster0.aqbrol6.mongodb.net/helpdesk?retryWrites=true&w=majority");

mongoose.connection.once("open", () => {
  console.log("MongoDB connected");
});

// ================= MODELS =================
const Ticket = require("./models/ticket");

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));

// ================= ROOT ROUTE =================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "role.html"));
});

// ================= USERS (Still In-Memory for Login) =================
let users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "operator", password: "operator123", role: "operator" }
];

// ================= LOGIN =================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid login credentials" });
  }

  res.json({
    message: "Login successful",
    role: user.role,
    username: user.username
  });
});

// ================= CREATE TICKET =================
app.post("/api/tickets", async (req, res) => {
  try {
    const operators = users.filter(u => u.role === "operator");
    const assignedOperator = operators[0]?.username || "operator";

    const ticket = new Ticket({
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      category: req.body.category,
      assignedTo: assignedOperator
    });

    await ticket.save();

    res.status(201).json({
      message: "Ticket created successfully",
      ticket
    });

    io.emit("newTicket", ticket);

  } catch (error) {
    res.status(500).json({ message: "Error creating ticket" });
  }
});

// ================= GET ALL TICKETS (ADMIN) =================
app.get("/api/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tickets" });
  }
});

// ================= GET OPERATOR TICKETS =================
app.get("/api/operator/:name", async (req, res) => {
  try {
    const operatorName = req.params.name;

    const tickets = await Ticket.find({
      assignedTo: operatorName
    }).sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching operator tickets" });
  }
});

// ================= UPDATE TICKET STATUS =================
app.put("/api/tickets/:id/status", async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json({
      message: "Ticket status updated successfully",
      ticket
    });

    io.emit("ticketStatusUpdated", ticket);

  } catch (error) {
    res.status(500).json({ message: "Error updating ticket" });
  }
});

// ================= SERVER START =================
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});