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
            .collection("goals")
            .where("userId", "==", req.user.uid)
            .get();

        const goals = serializeSnapshot(snapshot);

        goals.sort((a, b) =>
            String(a.deadline || "")
                .localeCompare(String(b.deadline || ""))
        );

        res.json({
            success: true,
            goals
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch goals"
        });
    }
});

router.post("/", verifyToken, async (req, res) => {
    try {
        const {
            skillId,
            title,
            targetValue,
            currentValue,
            unit,
            deadline,
            status
        } = req.body;

        if (!skillId || !title || !targetValue) {
            return res.status(400).json({
                success: false,
                message:
                    "Skill, title and target value are required"
            });
        }

        const skillSnapshot = await db
            .collection("skills")
            .doc(skillId)
            .get();

        if (
            !skillSnapshot.exists ||
            skillSnapshot.data().userId !== req.user.uid
        ) {
            return res.status(403).json({
                success: false,
                message: "Invalid skill"
            });
        }

        const target = Number(targetValue);
        const current = Number(currentValue || 0);

        if (!Number.isFinite(target) || target <= 0) {
            return res.status(400).json({
                success: false,
                message: "Target must be greater than zero"
            });
        }

        const goalRef = db.collection("goals").doc();

        await goalRef.set({
            userId: req.user.uid,
            skillId,
            title: title.trim(),
            targetValue: target,
            currentValue: Math.max(0, current),
            unit: unit || "",
            deadline: deadline || "",
            status: status || "ACTIVE",
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const created = await goalRef.get();

        res.status(201).json({
            success: true,
            message: "Goal created successfully",
            goal: serializeDoc(created)
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create goal"
        });
    }
});

router.put("/:id", verifyToken, async (req, res) => {
    try {
        const ref = db.collection("goals").doc(req.params.id);

        const snapshot = await ref.get();

        if (!snapshot.exists) {
            return res.status(404).json({
                success: false,
                message: "Goal not found"
            });
        }

        if (snapshot.data().userId !== req.user.uid) {
            return res.status(403).json({
                success: false,
                message: "You cannot modify this goal"
            });
        }

        const updates = {
            ...req.body,
            updatedAt: new Date()
        };

        delete updates.userId;
        delete updates.createdAt;

        if (updates.targetValue !== undefined) {
            updates.targetValue =
                Number(updates.targetValue);
        }

        if (updates.currentValue !== undefined) {
            updates.currentValue =
                Number(updates.currentValue);
        }

        await ref.update(updates);

        const updated = await ref.get();

        res.json({
            success: true,
            message: "Goal updated successfully",
            goal: serializeDoc(updated)
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update goal"
        });
    }
});

router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const ref = db.collection("goals").doc(req.params.id);

        const snapshot = await ref.get();

        if (!snapshot.exists) {
            return res.status(404).json({
                success: false,
                message: "Goal not found"
            });
        }

        if (snapshot.data().userId !== req.user.uid) {
            return res.status(403).json({
                success: false,
                message: "You cannot delete this goal"
            });
        }

        await ref.delete();

        res.json({
            success: true,
            message: "Goal deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete goal"
        });
    }
});

/* MILESTONES */

router.get(
    "/:goalId/milestones",
    verifyToken,
    async (req, res) => {
        try {
            const goalRef = db
                .collection("goals")
                .doc(req.params.goalId);

            const goalSnapshot = await goalRef.get();

            if (
                !goalSnapshot.exists ||
                goalSnapshot.data().userId !== req.user.uid
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Invalid goal"
                });
            }

            const snapshot = await db
                .collection("milestones")
                .where("goalId", "==", req.params.goalId)
                .get();

            res.json({
                success: true,
                milestones: serializeSnapshot(snapshot)
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Failed to fetch milestones"
            });
        }
    }
);

router.post(
    "/:goalId/milestones",
    verifyToken,
    async (req, res) => {
        try {
            const goalRef = db
                .collection("goals")
                .doc(req.params.goalId);

            const goalSnapshot = await goalRef.get();

            if (
                !goalSnapshot.exists ||
                goalSnapshot.data().userId !== req.user.uid
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Invalid goal"
                });
            }

            const {
                title,
                targetValue
            } = req.body;

            if (!title) {
                return res.status(400).json({
                    success: false,
                    message: "Milestone title is required"
                });
            }

            const ref = db
                .collection("milestones")
                .doc();

            await ref.set({
                userId: req.user.uid,
                goalId: req.params.goalId,
                title: title.trim(),
                targetValue: Number(targetValue || 0),
                achieved: false,
                achievedAt: null,
                createdAt: new Date()
            });

            const created = await ref.get();

            res.status(201).json({
                success: true,
                message: "Milestone created",
                milestone: serializeDoc(created)
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Failed to create milestone"
            });
        }
    }
);

router.put(
    "/:goalId/milestones/:milestoneId",
    verifyToken,
    async (req, res) => {
        try {
            const ref = db
                .collection("milestones")
                .doc(req.params.milestoneId);

            const snapshot = await ref.get();

            if (!snapshot.exists) {
                return res.status(404).json({
                    success: false,
                    message: "Milestone not found"
                });
            }

            const data = snapshot.data();

            if (
                data.userId !== req.user.uid ||
                data.goalId !== req.params.goalId
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You cannot modify this milestone"
                });
            }

            const achieved = Boolean(req.body.achieved);

            await ref.update({
                achieved,
                achievedAt: achieved ? new Date() : null
            });

            const updated = await ref.get();

            res.json({
                success: true,
                milestone: serializeDoc(updated)
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Failed to update milestone"
            });
        }
    }
);

module.exports = router;