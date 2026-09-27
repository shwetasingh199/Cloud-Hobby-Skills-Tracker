const express = require("express");

const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", verifyToken, async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Authentication successful",
            user: {
                uid: req.user.uid,
                email: req.user.email
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to get user information"
        });
    }
});

module.exports = router;