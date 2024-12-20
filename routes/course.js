const express = require("express");
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  approveCourse,
  addTeacherToCourse,
  addUserToCourse,
  getEnrolledCourses,
  enrollInCourse,
  createCheckoutSession,
  getCourseVideos,
  sendMessage,
  getMessages,
  replyMessage,
  getMessagesForTeacher,
  getMessagesForStudent,
} = require("../controllers/courseController.js");
const adminAuth = require("../middleware/adminMiddleware");
const multer = require("multer");
const studentAuth = require('../middleware/studentAuth'); // Import your studentAuth middleware
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const upload = multer({ dest: "uploads/" }); // Temporary storage in 'uploads/' before processing

const router = express.Router();

// Public Routes
router.get("/", getAllCourses);
router.get("/admin/all", adminAuth, getAllCourses);
router.get("/:id", getCourseById);


// Protected routes for admins and teachers
router.post(
  "/",
  adminAuth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "videos", maxCount: 5 },
    { name: "pdf", maxCount: 1 }, // Ajout du champ pour les fichiers PDF
  ]),
  createCourse
);

router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "videos", maxCount: 5 },
    { name: "pdf", maxCount: 1 }, // Ajout du champ pour les fichiers PDF
  ]),
  updateCourse
);


router.delete("/:id", adminAuth, deleteCourse);
router.put("/:id/addTeacher", adminAuth, addTeacherToCourse);
router.put("/:courseId/enroll", addUserToCourse); // Enroll user route
router.patch("/:id/approve", adminAuth, approveCourse);
router.post('/:courseId/enroll', studentAuth, enrollInCourse); // studentAuth is used here to protect the route
router.post('/:courseId/create-checkout-session', studentAuth, (req, res, next) => {
  console.log("Request received for checkout session with courseId:", req.params.courseId);
  next();
}, createCheckoutSession);
router.get('/:courseId/videos', studentAuth, getCourseVideos);
router.get('/students/:studentId/courses', studentAuth, getEnrolledCourses);

// Envoyer un message
router.post("/messages", studentAuth, sendMessage);

// Récupérer les messages
router.get("/messages/:courseId/:teacherId", studentAuth, getMessages);

// Répondre à un message
router.post(
  "/messages/reply",
  adminAuth,
  upload.single("pdf"), // Handle a single PDF file upload
  replyMessage
);
router.get("/messages/teacher", adminAuth, getMessagesForTeacher);
router.get("/messages/student/:courseId/:teacherId", studentAuth, getMessagesForStudent);
module.exports = router;
