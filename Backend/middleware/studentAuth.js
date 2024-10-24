const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const studentAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    console.log("Received token:", token);  // Log the token

    // Decode the JWT and extract the user ID
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
    console.log("Decoded token:", decoded);  // Log the decoded token

    // Find the user in the database using the decoded token
    const student = await User.findOne({ _id: decoded._id, role: 'user' });
    
    if (!student) {
      console.log("Student not found or role mismatch."); 
      return res.status(401).json({ error: "Student not found or role mismatch." });
    }

    // Attach the student to the request object
    req.student = student;
    console.log("Authenticated student:", req.student);  // Log the authenticated student
    next();
  } catch (error) {
    console.log("Authentication failed:", error.message);
    return res.status(401).json({ error: "Please authenticate as a student." });
  }
};

module.exports = studentAuth;
