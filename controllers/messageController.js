const Message = require("../models/message");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const Course = require("../models/course");

// Envoyer un message
const sendMessage = asyncHandler(async (req, res) => {
  const { courseId, teacherId, content } = req.body;
  const user = req.student;

  if (!user || !teacherId || !courseId || !content) {
    throw new ApiError(400, "Tous les champs sont requis.");
  }

  const course = await Course.findById(courseId);
  if (!course || !course.enrolledUsers.includes(user._id)) {
    throw new ApiError(403, "Vous n'êtes pas inscrit à ce cours.");
  }

  if (!course.enrolledteacher.includes(teacherId)) {
    throw new ApiError(404, "Enseignant non trouvé dans ce cours.");
  }

  const message = await Message.create({
    sender: user._id,
    receiver: teacherId,
    course: courseId,
    content,
  });

  res.status(201).json({ message: "Message envoyé avec succès.", data: message });
});

// Récupérer les messages entre un utilisateur et un enseignant
const getMessages = asyncHandler(async (req, res) => {
  const { courseId, teacherId } = req.params;
  const user = req.student;

  if (!user || !teacherId || !courseId) {
    throw new ApiError(400, "Tous les champs sont requis.");
  }

  const course = await Course.findById(courseId);
  if (!course || !course.enrolledUsers.includes(user._id)) {
    throw new ApiError(403, "Vous n'êtes pas inscrit à ce cours.");
  }

  const messages = await Message.find({
    course: courseId,
    $or: [
      { sender: user._id, receiver: teacherId },
      { sender: teacherId, receiver: user._id },
    ],
  }).sort({ timestamp: 1 });

  res.status(200).json({ messages });
});

// Répondre à un message
const replyMessage = asyncHandler(async (req, res) => {
  const { messageId, content } = req.body;
  const teacher = req.teacher;

  if (!teacher || !messageId || !content) {
    throw new ApiError(400, "Tous les champs sont requis.");
  }

  const originalMessage = await Message.findById(messageId);
  if (!originalMessage) {
    throw new ApiError(404, "Message non trouvé.");
  }

  const reply = await Message.create({
    sender: teacher._id,
    receiver: originalMessage.sender,
    course: originalMessage.course,
    content,
  });

  res.status(201).json({ message: "Réponse envoyée avec succès.", data: reply });
});

module.exports = { sendMessage, getMessages, replyMessage };
