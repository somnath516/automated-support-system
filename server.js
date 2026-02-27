const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Import Ticket Model (ticket.js must be in same folder)
const Ticket = require("./ticket");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 🔹 Replace YOUR_PASSWORD with your real MongoDB password
const MONGO_URI = "mongodb+srv://admin:YOUR_PASSWORD@cluster0.aqbrol6.mongodb.net/ticketDB?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.log("MongoDB Connection Error:", err));

// Test Route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Create Ticket Route
app.post("/create-ticket", async (req, res) => {
  try {
    const newTicket = new Ticket(req.body);
    await newTicket.save();
    res.status(201).json({ message: "Ticket Created", ticket: newTicket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Tickets
app.get("/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});