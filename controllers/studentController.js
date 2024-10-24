const { User } = require("../models/user");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const asyncHandler = require("express-async-handler");

// Fetch all students
const getAllStudents = asyncHandler(async (req, res) => {
    const students = await User.find(); // Fetch all users
    if (!students || students.length === 0) {
        return res.status(404).json(new ApiResponse(404, null, "No students found"));
    }
    res.status(200).json(new ApiResponse(200, students, "Students retrieved successfully"));
});

// Update student information
const updateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params; // Student ID from URL parameters

    // Check if the student ID matches the logged-in user
    if (req.student._id.toString() !== id) {
        return res.status(403).json({ message: "You are not authorized to update this profile" });
    }

    const { firstName, lastName, email } = req.body; // Assuming these fields are to be updated

    const student = await User.findByIdAndUpdate(
        id,
        { firstName, lastName, email },
        { new: true }
    );

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    res.status(200).json(new ApiResponse(200, student, "Student updated successfully"));
});

// Delete a student
const deleteStudent = asyncHandler(async (req, res) => {
    const { id } = req.params; // Student ID from URL parameters

    // Check if the student ID matches the logged-in user
    if (req.student._id.toString() !== id) {
        return res.status(403).json({ message: "You are not authorized to delete this profile" });
    }

    const student = await User.findByIdAndDelete(id);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    res.status(200).json(new ApiResponse(200, null, "Student deleted successfully"));
});

// Fetch a specific student by ID
const getStudentById = asyncHandler(async (req, res) => {
    const { id } = req.params; // Student ID from URL parameters
    const student = await User.findById(id);

    if (!student) {
        return res.status(404).json(new ApiResponse(404, null, "Student not found"));
    }
    res.status(200).json(new ApiResponse(200, student, "Student retrieved successfully"));
});

const updateUserInteraction = asyncHandler(async (req, res) => {
    const { userId, courseId, timeSpent, videoId } = req.body; // Supposons que tu reçois ces informations

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const interaction = user.interactions.find(interaction => interaction.courseId.toString() === courseId);
    if (interaction) {
        interaction.timeSpent += timeSpent; // Update time spent
        if (videoId) {
            interaction.viewedVideos.push(videoId); // Add viewed video if provided
        }
    } else {
        // Create new interaction record if it doesn't exist
        user.interactions.push({ courseId, timeSpent, viewedVideos: videoId ? [videoId] : [] });
    }

    await user.save();

    return res.status(200).json({ message: "User interaction updated successfully" });
});


module.exports = {
    getAllStudents,
    updateStudent,
    deleteStudent,
    getStudentById,
    updateUserInteraction
};
