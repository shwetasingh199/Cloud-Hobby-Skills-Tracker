const express = require("express");

const { db } = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");
const {
    serializeDoc,
    serializeSnapshot
} = require("../utils/firestore");

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
    try {
        const snapshot = await db
            .collection("practiceSessions")
            .where("userId", "==", req.user.uid)
            .get();

        const sessions = serializeSnapshot(snapshot);

        sessions.sort((a, b) =>
            String(b.practicedAt || "")
                .localeCompare(String(a.practicedAt || ""))
        );

        res.json({
            success: true,
            sessions
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch practice sessions"
        });
    }
});

router.post("/", verifyToken, async (req, res) => {
    try {
        const {
            skillId,
            durationMinutes,
            activity,
            notes,
            practicedAt
        } = req.body;

        if (!skillId || !durationMinutes || !practicedAt) {
            return res.status(400).json({
                success: false,
                message:
                    "Skill, duration and practice date are required"
            });
        }

        const skillRef = db.collection("skills").doc(skillId);
        const skillSnapshot = await skillRef.get();

        if (
            !skillSnapshot.exists ||
            skillSnapshot.data().userId !== req.user.uid
        ) {
            return res.status(403).json({
                success: false,
                message: "Invalid skill"
            });
        }

        const minutes = Number(durationMinutes);

        if (!Number.isFinite(minutes) || minutes <= 0) {
            return res.status(400).json({
                success: false,
                message: "Duration must be greater than zero"
            });
        }

        const practiceRef = db
            .collection("practiceSessions")
            .doc();

        await practiceRef.set({
            userId: req.user.uid,
            skillId,
            durationMinutes: minutes,
            activity: activity || "",
            notes: notes || "",
            practicedAt,
            createdAt: new Date()
        });

        const created = await practiceRef.get();

        res.status(201).json({
            success: true,
            message: "Practice session added",
            session: serializeDoc(created)
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to add practice session"
        });
    }
});

router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const ref = db
            .collection("practiceSessions")
            .doc(req.params.id);

        const snapshot = await ref.get();

        if (!snapshot.exists) {
            return res.status(404).json({
                success: false,
                message: "Practice session not found"
            });
        }

        if (snapshot.data().userId !== req.user.uid) {
            return res.status(403).json({
                success: false,
                message: "You cannot delete this session"
            });
        }

        await ref.delete();

        res.json({
            success: true,
            message: "Practice session deleted"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete practice session"
        });
    }
});

module.exports = router;