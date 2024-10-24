const Teacher = require("../models/teacher");
const Token = require("../models/token");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail"); // Email utility for verification

// Register a new teacher
const teacherRegister = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
        return res.status(409).json({ message: "Teacher already exists!" });
    }

    const teacher = new Teacher({ firstName, lastName, email, password });
    await teacher.save();

    // Generate email verification token
    const token = new Token({
        userId: teacher._id,
        token: crypto.randomBytes(32).toString("hex"),
    });
    await token.save();

    // Send verification email
    const url = `${process.env.BASE_URL}teachers/${teacher._id}/verify/${token.token}`;
    await sendEmail(teacher.email, "Verify Your Email", url);

    res.status(201).json({ message: "Teacher registered successfully, please verify your email." });
};

// Teacher login
// Teacher login
const teacherLogin = async (req, res) => {
    const { email, password } = req.body;

    const teacher = await Teacher.findOne({ email });
    if (!teacher || !(await teacher.isPasswordCorrect(password))) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!teacher.verified) {
        return res.status(400).json({ message: "Please verify your email before logging in." });
    }

    const accessToken = teacher.generateAuthToken(); // Generate JWT token
    res.status(200).json({ accessToken }); // Consistently return accessToken
};



// Email verification
const verifyTeacherEmail = async (req, res) => {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
        return res.status(400).send({ message: "Invalid link" });
    }

    const token = await Token.findOne({ userId: teacher._id, token: req.params.token });
    if (!token) {
        return res.status(400).send({ message: "Invalid link" });
    }

    teacher.verified = true;
    await teacher.save();
    
    // Use deleteOne instead of remove
    await Token.deleteOne({ _id: token._id });

    res.status(200).json({ message: "Email verified successfully" });
};

// Fonction de déconnexion pour les enseignants
const teacherLogout = async (req, res) => {
    try {
        // Logique de déconnexion si nécessaire (par exemple, invalider le token côté serveur)
        res.status(200).json({ message: "Teacher logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error logging out", error: error.message });
    }
};

module.exports = { teacherRegister, teacherLogin, verifyTeacherEmail, teacherLogout };
