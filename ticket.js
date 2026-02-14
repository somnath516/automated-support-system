const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    required: true
  },
  category: {
    type: String, // Example: Network, Hardware, Software
    required: true
  },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved"],
    default: "Open"
  },
  assignedOperatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Operator"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  slaDeadline: {
    type: Date
  }
});

module.exports = mongoose.model("Ticket", TicketSchema);

