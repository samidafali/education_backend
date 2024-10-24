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
  getCourseVideos
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
  adminAuth,
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


module.exports = router;
