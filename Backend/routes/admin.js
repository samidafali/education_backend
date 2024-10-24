// Routes pour les fonctionnalités de l'admin
const express = require("express");
const router = express.Router();
const { adminSignUp, adminLogin, adminLogout, getAllTeachers, approveTeacher } = require("../controllers/adminController");
const adminAuth = require("../middleware/adminMiddleware");

// Route pour s'inscrire en tant qu'admin
router.post("/signup", adminSignUp);

// Route pour se connecter en tant qu'admin
router.post("/login", adminLogin);

// Route pour se déconnecter en tant qu'admin
router.post("/logout", adminAuth, adminLogout);

// Route pour récupérer tous les enseignants, protégée par le middleware adminAuth
router.get("/teachers", adminAuth, getAllTeachers);

// Route pour approuver ou rejeter un enseignant
router.put("/approve-teacher/:adminID/:teacherID",adminAuth, approveTeacher);

module.exports = router;
