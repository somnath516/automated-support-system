const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));

// ================= ROOT ROUTE =================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "login.html"));
});

// Explicit dashboard routes (prevents Cannot GET errors)
app.get("/operatordashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "operatordashboard.html"));
});

app.get("/admindashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "admindashboard.html"));
});

// ================= USERS =================
let users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "operator", password: "operator123", role: "operator" }
];

// ================= TICKETS =================
let tickets = [];
let ticketCounter = 1;

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
app.post("/api/tickets", (req, res) => {
  const ticket = req.body;

  // Assign to available operator (basic logic)
  const operators = users.filter(u => u.role === "operator");
  const assignedOperator = operators[0]?.username || "operator";

  ticket.id = ticketCounter++;
  ticket.assignedTo = assignedOperator;
  ticket.status = "Assigned";
  ticket.createdAt = new Date();

  tickets.push(ticket);

  res.status(201).json({
    message: "Ticket created and assigned successfully",
    ticket
  });

  io.emit("newTicket", ticket);
});

// ================= GET ALL TICKETS (ADMIN) =================
app.get("/api/tickets", (req, res) => {
  res.json(tickets);
});

// ================= GET OPERATOR TICKETS =================
app.get("/api/operator/:name", (req, res) => {
  const operatorName = req.params.name;

  const assignedTickets = tickets.filter(
    ticket => ticket.assignedTo === operatorName
  );

  res.json(assignedTickets);
});

// ================= UPDATE TICKET STATUS =================
app.put("/api/tickets/:id/status", (req, res) => {
  const ticketId = parseInt(req.params.id);
  const { status } = req.body;

  const ticket = tickets.find(t => t.id === ticketId);

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  ticket.status = status;

  res.json({
    message: "Ticket status updated successfully",
    ticket
  });

  io.emit("ticketStatusUpdated", ticket);
});

// ================= SERVER START =================
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
