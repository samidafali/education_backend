const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User ou Teacher
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User ou Teacher
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true }, // Associer au cours
  content: { type: String, required: true }, // Contenu du message
  timestamp: { type: Date, default: Date.now }, // Horodatage du message
  isRead: { type: Boolean, default: false }, // Statut du message (lu ou non)
  pdfUrl: { type: String, default: null }, // URL of attached PDF
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
