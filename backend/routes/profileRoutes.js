const express = require("express");

const { db, auth } = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");
const {
    serializeDoc
} = require("../utils/firestore");

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
    try {
        const uid = req.user.uid;

        const userRef = db.collection("users").doc(uid);
        const snapshot = await userRef.get();

        if (!snapshot.exists) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        res.json({
            success: true,
            profile: serializeDoc(snapshot)
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to get profile"
        });
    }
});

router.put("/", verifyToken, async (req, res) => {
    try {
        const uid = req.user.uid;

        const {
            name,
            bio,
            location
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        const userRef = db.collection("users").doc(uid);

        await userRef.set(
            {
                name: name.trim(),
                bio: bio || "",
                location: location || "",
                updatedAt: new Date()
            },
            { merge: true }
        );

        await auth.updateUser(uid, {
            displayName: name.trim()
        });

        const updated = await userRef.get();

        res.json({
            success: true,
            message: "Profile updated successfully",
            profile: serializeDoc(updated)
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
});

module.exports = router;