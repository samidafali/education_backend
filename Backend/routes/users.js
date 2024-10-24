const router = require("express").Router();
const { verifyEmail } = require("../controllers/userController");
const { register,login } = require("../controllers/authController");

// Route pour vérifier l'email
router.get("/:id/verify/:token", verifyEmail);

// Route pour l'inscription (peut aussi être déplacée vers le fichier authRoutes.js)
router.post("/", register);

router.post("/login", login); // User login endpoint
module.exports = router;
