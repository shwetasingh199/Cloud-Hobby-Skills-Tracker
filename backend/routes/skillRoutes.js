const express = require("express");

const { db } = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");
const {
    serializeDoc,
    serializeSnapshot
} = require("../utils/firestore");

const router = express.Router();

const validLevels = [
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED"
];

const validStatuses = [
    "ACTIVE",
    "PAUSED",
    "COMPLETED"
];

router.get("/", verifyToken, async (req, res) => {
    try {
        const snapshot = await db
            .collection("skills")
            .where("userId", "==", req.user.uid)
            .get();

        const skills = serializeSnapshot(snapshot);

        skills.sort((a, b) =>
            String(b.createdAt || "")
                .localeCompare(String(a.createdAt || ""))
        );

        res.json({
            success: true,
            skills
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch skills"
        });
    }
});

router.post("/", verifyToken, async (req, res) => {
    try {
        const {
            skillName,
            category,
            currentLevel,
            targetLevel,
            startDate,
            targetDate,
            status,
            description
        } = req.body;

        if (!skillName || !category) {
            return res.status(400).json({
                success: false,
                message: "Skill name and category are required"
            });
        }

        if (!validLevels.includes(currentLevel)) {
            return res.status(400).json({
                success: false,
                message: "Invalid current level"
            });
        }

        if (!validLevels.includes(targetLevel)) {
            return res.status(400).json({
                success: false,
                message: "Invalid target level"
            });
        }

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const skillRef = db.collection("skills").doc();

        await skillRef.set({
            userId: req.user.uid,
            skillName: skillName.trim(),
            category: category.trim(),
            currentLevel,
            targetLevel,
            startDate: startDate || "",
            targetDate: targetDate || "",
            status,
            description: description || "",
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const created = await skillRef.get();

        res.status(201).json({
            success: true,
            message: "Skill created successfully",
            skill: serializeDoc(created)
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create skill"
        });
    }
});

router.put("/:id", verifyToken, async (req, res) => {
    try {
        const skillRef = db
            .collection("skills")
            .doc(req.params.id);

        const snapshot = await skillRef.get();

        if (!snapshot.exists) {
            return res.status(404).json({
                success: false,
                message: "Skill not found"
            });
        }

        const skill = snapshot.data();

        if (skill.userId !== req.user.uid) {
            return res.status(403).json({
                success: false,
                message: "You cannot modify this skill"
            });
        }

        const updates = {
            ...req.body,
            updatedAt: new Date()
        };

        delete updates.userId;
        delete updates.createdAt;

        await skillRef.update(updates);

        const updated = await skillRef.get();

        res.json({
            success: true,
            message: "Skill updated successfully",
            skill: serializeDoc(updated)
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update skill"
        });
    }
});

router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const skillRef = db
            .collection("skills")
            .doc(req.params.id);

        const snapshot = await skillRef.get();

        if (!snapshot.exists) {
            return res.status(404).json({
                success: false,
                message: "Skill not found"
            });
        }

        if (snapshot.data().userId !== req.user.uid) {
            return res.status(403).json({
                success: false,
                message: "You cannot delete this skill"
            });
        }

        await skillRef.delete();

        res.json({
            success: true,
            message: "Skill deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete skill"
        });
    }
});

module.exports = router;