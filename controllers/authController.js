const { User } = require("../models/user");
const Token = require("../models/token");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const sendEmail = require("../utils/sendEmail");

// Function for registration
const register = async (req, res) => {
    try {
        // Validation of incoming data
        const { error } = validateRegistration(req.body);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }

        // Check if user already exists
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            // If user exists, return 409 Conflict and stop further execution
            return res.status(409).send({ message: "User with given email already exists!" });
        }

        // Create a new user
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        user = new User({ ...req.body, password: hashPassword });
        await user.save(); // Save the user

        // Generate a verification token
        const token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
        }).save();

        // Send verification email
        const url = `${process.env.BASE_URL}users/${user._id}/verify/${token.token}`;
        await sendEmail(user.email, "Verify Email", url);

        return res.status(201).send({ message: "An Email sent to your account, please verify" });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};


// Function for login
const login = async (req, res) => {
    try {
        const { error } = validateLogin(req.body);
        if (error) return res.status(400).send({ message: error.details[0].message });

        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(401).send({ message: "Invalid Email or Password" });

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(401).send({ message: "Invalid Email or Password" });

        if (!user.verified) {
            let token = await Token.findOne({ userId: user._id });
            if (!token) {
                token = await new Token({
                    userId: user._id,
                    token: crypto.randomBytes(32).toString("hex"),
                }).save();
                const url = `${process.env.BASE_URL}users/${user._id}/verify/${token.token}`;
                await sendEmail(user.email, "Verify Email", url);
            }
            return res.status(400).send({ message: "An Email sent to your account, please verify" });
        }

        // Generate the token after successful login
        const token = user.generateAuthToken(); // Make sure this function exists in your User model
        // Send the token in the response
        res.status(200).send({ 
            data: token, 
            studentId: user._id,
            role: user.role,
            message: "Logged in successfully" 
        });
        
        // Optionally store the token in local storage on the frontend (not server-side code)
        // This would be done in your frontend code where you handle the response from this login route.
        
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

// Validation for registration
const validateRegistration = (data) => {
    const schema = Joi.object({
        firstName: Joi.string().required().label("First Name"),
        lastName: Joi.string().required().label("Last Name"),
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
        role: Joi.string().valid('user', 'admin', 'teacher').required().label("Role") // Validate role
    });
    return schema.validate(data);
};

// Validation for login
const validateLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
    });
    return schema.validate(data);
};

module.exports = { register, login };
