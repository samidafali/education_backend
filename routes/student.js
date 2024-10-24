const express = require("express");
const { getAllStudents, updateStudent, deleteStudent ,getStudentById,updateUserInteraction} = require("../controllers/studentController");
const studentAuth = require("../middleware/studentAuth"); 
const router = express.Router();

router.get("/", studentAuth, getAllStudents); // Protect this route with authentication
router.put("/:id", studentAuth, updateStudent); // Update a student
router.delete("/:id", studentAuth, deleteStudent); // Delete a student
// Add this to your studentRoutes.js
router.get("/:id", studentAuth, getStudentById); // Fetch a specific student by ID
module.exports = router;
