const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  day: { type: String, required: true },
  starttime: { type: String, required: true },
  endtime: { type: String, required: true }
});

const courseSchema = new mongoose.Schema({
  coursename: { type: String, required: true },
  description: { type: String, required: true },
  schedule: [scheduleSchema], 
  enrolledteacher: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }], 
  enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  isapproved: { type: Boolean, default: false }, 
  imageUrl: { type: String }, 
  videos: [ 
    {
      url: { type: String },
      title: { type: String }
    }
  ],
  pdfUrl: { type: String },
  difficulty: { type: String, enum: ["easy", "meduim", "hard"], required: true }, 
  isFree: { type: Boolean, default: true }, 
  price: { type: Number, default: 0 }, 
  category: { type: String, required: true },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  

});

const Course = mongoose.model("Course", courseSchema);

module.exports = { Course };

