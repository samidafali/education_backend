require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connection = require("./Db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const teacherRoutes = require("./routes/teacher");
const courseRoutes = require("./routes/course");
const studentRoutes = require("./routes/student");
// database connection
connection();

// middlewares
app.use(express.json());
const corsOptions = {
  //origin: 'http://localhost:3000', // The origin you want to allow
  methods: ['GET', 'POST', 'PATCH','PUT', 'DELETE'], // Allow these methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
};

app.use(cors(corsOptions));

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/students", studentRoutes);




const port = process.env.PORT || 8050;
app.listen(port, console.log(`Listening on port ${port}...`));