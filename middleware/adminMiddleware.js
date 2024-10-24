const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const Teacher = require("../models/teacher");

const adminAuth = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Extract the Bearer token

    if (!token) {
        return res.status(401).json({ message: 'Access denied, no token provided' });
    }

    try {
        // Verify the token using JWTPRIVATEKEY
        const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
        console.log('Decoded Token:', decoded);

        // Find admin or teacher based on decoded token
        let admin = await Admin.findById(decoded._id);
        if (!admin) {
            const teacher = await Teacher.findById(decoded._id);
            if (!teacher) {
                return res.status(401).json({ message: 'Access denied, admin or teacher not found' });
            }
            req.teacher = teacher; // Set teacher in request
        } else {
            req.admin = admin; // Set admin in request
        }

        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(400).json({ message: 'Invalid token' });
    }
};

module.exports = adminAuth;
