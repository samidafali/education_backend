const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const teacherSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    isApproved: { type: String, default: "pending" },
    role: { type: String, default: "teacher" } // New role field with default "teacher"
});

// Hash password before saving teacher
teacherSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare passwords
teacherSchema.methods.isPasswordCorrect = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token for authentication
teacherSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id, role: this.role }, process.env.JWTPRIVATEKEY, {
        expiresIn: "7d",
    });
};


// Generate refresh token
teacherSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
        expiresIn: "7d",
    });
};

const Teacher = mongoose.model("Teacher", teacherSchema);
module.exports = Teacher;
