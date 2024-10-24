const Admin = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const asyncHandler = require("express-async-handler");
const Teacher = require("../models/teacher");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");

// Fonction d'inscription admin
const adminSignUp = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the email already exists
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
        return res.status(409).json({ message: "Admin with given email already exists" });
    }

    // Create new admin and hash the password
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(password, salt);

    const admin = new Admin({ email, password: hashPassword });
    await admin.save();

    // Return the response with the adminId included
    res.status(201).json({ 
        message: "Admin registered successfully", 
        adminId: admin._id // Inclure l'adminId dans la réponse
    });
};

// Fonction de connexion admin
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });

    // Check if admin exists and if the password is correct
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate access token
    const accessToken = jwt.sign(
        { _id: admin._id, role: 'admin' },
        process.env.JWTPRIVATEKEY,
        { expiresIn: '7d' }
    );

    res.status(200).json({ 
        accessToken, 
        adminId: admin._id // Inclure l'adminId dans la réponse
    });
};

// Fonction de déconnexion admin
const adminLogout = async (req, res) => {
    res.status(200).json({ message: "Admin logged out" });
};

// Récupérer tous les enseignants
const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find(); // Récupère tous les enseignants
        if (!teachers || teachers.length === 0) {
            return res.status(404).json({ message: "No teachers found" });
        }
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Approuver ou rejeter un enseignant
const approveTeacher = asyncHandler(async (req, res) => {
    const adminID = req.params.adminID;
    const teacherID = req.params.teacherID;

    // Validation des IDs
    if (!adminID || !teacherID) {
        throw new ApiError(400, "Admin ID and Teacher ID are required");
    }

    // Vérification de l'existence de l'admin
    const loggedAdmin = await Admin.findById(adminID);
    if (!loggedAdmin) {
        throw new ApiError(404, "Admin not found");
    }

    // Vérification de l'existence de l'enseignant
    const teacher = await Teacher.findById(teacherID);
    if (!teacher) {
        throw new ApiError(404, "Teacher not found");
    }

    // Mise à jour du statut de l'enseignant
    const toApprove = req.body.isApproved;
    const remarks = req.body.remarks || null;

    if (!toApprove || (toApprove !== "approved" && toApprove !== "rejected" && toApprove !== "reupload")) {
        throw new ApiError(400, "Invalid approval status. Use 'approved', 'rejected', or 'reupload'");
    }

    teacher.isApproved = toApprove;
    teacher.remarks = remarks;
    await teacher.save();

    // Récupération de l'email de l'enseignant à partir de la base de données
    const email = teacher.email;

    // Envoi de l'email
    await sendEmail(
        email,
        "Document Verification Status",
        `<html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1 style="color: #4CAF50; text-align: center;">Document Verification Status!</h1>
            <p style="font-size: 16px; text-align: center;">We have completed the verification process for the documents you submitted. Your document verification status is: ${toApprove}</p>
            <p style="font-size: 16px;">Remarks: ${remarks}</p>
            <p style="font-size: 16px;">Best regards,</p>
            <p style="font-size: 16px;"><strong>The Education Team</strong></p>
            <p style="font-size: 14px;">&copy; 2024 Education. All rights reserved.</p>
            </body>
        </html>`
    );

    return res.status(200).json(new ApiResponse(200, teacher, `Teacher ${toApprove} successfully`));
});


module.exports = { adminSignUp, adminLogin, adminLogout, approveTeacher, getAllTeachers };
