const { User } = require("../models/user");
const Token = require("../models/token");

const verifyEmail = async (req, res) => {
  try {
    console.log("Verifying email for user ID:", req.params.id);
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid link" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: "Invalid link" });

    // Update the verified field for the user
    await User.updateOne({ _id: user._id }, { $set: { verified: true } });

    // Delete the token
    await token.deleteOne();  // Correct method for deleting the token

    res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    console.log("Error verifying email:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = { verifyEmail };
